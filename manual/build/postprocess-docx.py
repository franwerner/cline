#!/usr/bin/env python3
"""
Post-procesa el manual.docx generado por Pandoc:

1. Mejora el espaciado de los Heading 2-5, que vienen muy pegados
   al contenido anterior por defecto del template.
   Modifica word/styles.xml:
   - Heading 2 (capítulo):     w:before = 720 (36pt), w:after = 240 (12pt)
   - Heading 3 (sección X.Y):  w:before = 480 (24pt), w:after = 120 (6pt)
   - Heading 4 (subsección):   w:before = 320 (16pt), w:after = 80 (4pt)
   - Heading 5 (sub-bloque):   w:before = 200 (10pt), w:after = 60 (3pt)
   - Heading 1: se respeta el valor del template (queda libre para que
     el doc final lo use como título global del manual).

2. Activa la actualización automática de campos al abrir el docx.
   Sin esto, el campo TOC inicial no rendea los hyperlinks: solo
   muestra el texto. Modifica word/settings.xml insertando:
   <w:updateFields w:val="true"/>
   Word va a refrescar el TOC (y otros campos) al abrir el doc, lo
   que genera los hipervínculos clickeables a cada heading.

No toca el template original (Manual de usuario.docx).
"""
import os
import re
import shutil
import sys
import tempfile
import zipfile
from pathlib import Path


# Configuración: (style_id, before_twentieths, after_twentieths)
# 20 twentieths = 1pt
SPACING_TARGETS = [
    ("Heading2", 720, 240),  # Capítulo
    ("Heading3", 480, 120),  # Sección X.Y
    ("Heading4", 320, 80),   # Subsección X.Y.Z
    ("Heading5", 200, 60),   # Sub-bloque
]


def patch_spacing(xml: str, style_id: str, before: int, after: int) -> str:
    """Inyecta o reemplaza w:spacing dentro del bloque <w:style ... Heading?>."""
    pattern = re.compile(
        r'(<w:style[^>]*w:styleId="' + re.escape(style_id) + r'"[^>]*>)(.*?)(</w:style>)',
        re.DOTALL,
    )

    def repl(m: re.Match) -> str:
        head, body, tail = m.group(1), m.group(2), m.group(3)
        new_spacing = (
            f'<w:spacing w:before="{before}" w:after="{after}" '
            f'w:line="240" w:lineRule="auto"/>'
        )
        # Si ya hay un w:spacing, lo reemplazamos preservando otros atributos.
        existing = re.search(r"<w:spacing[^/]*/>", body)
        if existing:
            new_body = body.replace(existing.group(0), new_spacing)
        else:
            # Sin w:spacing previo: lo insertamos al inicio del <w:pPr>.
            ppr = re.search(r"<w:pPr>(.*?)</w:pPr>", body, re.DOTALL)
            if ppr:
                new_ppr = f"<w:pPr>{new_spacing}{ppr.group(1)}</w:pPr>"
                new_body = body.replace(ppr.group(0), new_ppr)
            else:
                # Sin <w:pPr>: lo creamos.
                new_body = f"<w:pPr>{new_spacing}</w:pPr>" + body

        return head + new_body + tail

    return pattern.sub(repl, xml)


# Explicit black color (not "auto") and per-cell borders: Google Docs/Gmail
# ignore table-level borders with color="auto", so cell borders are needed too.
TBL_BORDERS = (
    "<w:tblBorders>"
    '<w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/>'
    '<w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/>'
    '<w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/>'
    '<w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/>'
    '<w:insideH w:val="single" w:sz="4" w:space="0" w:color="000000"/>'
    '<w:insideV w:val="single" w:sz="4" w:space="0" w:color="000000"/>'
    "</w:tblBorders>"
)

TC_BORDERS = (
    "<w:tcBorders>"
    '<w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/>'
    '<w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/>'
    '<w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/>'
    '<w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/>'
    "</w:tcBorders>"
)


def patch_cell_borders(document_xml: str) -> str:
    """Inyecta bordes en cada celda (<w:tcPr>) con color explícito. Necesario
    para que Google Docs / la vista previa de Gmail muestren las líneas, ya que
    ignoran los bordes a nivel de tabla. Respeta el orden del esquema: tcBorders
    va antes de shd/tcMar/vAlign/noWrap."""
    # Normalizar tcPr vacío self-closing.
    document_xml = re.sub(r"<w:tcPr\s*/>", "<w:tcPr></w:tcPr>", document_xml)

    def repl(m: re.Match) -> str:
        inner = m.group(1)
        if "<w:tcBorders" in inner:
            return m.group(0)
        for tag in ("<w:shd", "<w:tcMar", "<w:vAlign", "<w:noWrap", "<w:textDirection"):
            if tag in inner:
                return "<w:tcPr>" + inner.replace(tag, TC_BORDERS + tag, 1) + "</w:tcPr>"
        return "<w:tcPr>" + inner + TC_BORDERS + "</w:tcPr>"

    return re.sub(r"<w:tcPr>(.*?)</w:tcPr>", repl, document_xml, flags=re.DOTALL)


def patch_table_borders(document_xml: str) -> str:
    """Inyecta bordes simples en cada tabla del documento. El template
    corporativo no define líneas en el estilo de tabla, así que las tablas
    salen sin separación. Se insertan bordes directos en cada <w:tblPr>
    (respetando el orden del esquema: antes de <w:tblLook>)."""

    def repl(m: re.Match) -> str:
        inner = m.group(1)
        if "<w:tblBorders" in inner:
            return m.group(0)
        # tblBorders must appear before shd/tblLayout/tblCellMar/tblLook in the
        # OOXML schema, otherwise Word discards it. Insert it right after tblW.
        tblw = re.search(r"<w:tblW\b[^>]*/>", inner)
        if tblw:
            new_inner = inner.replace(tblw.group(0), tblw.group(0) + TBL_BORDERS, 1)
        elif "<w:tblLayout" in inner:
            new_inner = inner.replace("<w:tblLayout", TBL_BORDERS + "<w:tblLayout", 1)
        elif "<w:tblLook" in inner:
            new_inner = inner.replace("<w:tblLook", TBL_BORDERS + "<w:tblLook", 1)
        else:
            new_inner = inner + TBL_BORDERS
        return "<w:tblPr>" + new_inner + "</w:tblPr>"

    return re.sub(r"<w:tblPr>(.*?)</w:tblPr>", repl, document_xml, flags=re.DOTALL)


def patch_settings_update_fields(settings_xml: str) -> str:
    """Inyecta <w:updateFields w:val='true'/> en word/settings.xml para que
    Word actualice automáticamente los campos (incluido el TOC) al abrir
    el documento. Esto es lo que da clicabilidad al índice."""
    # Si ya existe, dejarlo como está.
    if re.search(r"<w:updateFields\b", settings_xml):
        return settings_xml

    # Insertar como primer hijo de <w:settings>.
    new_tag = '<w:updateFields w:val="true"/>'
    return re.sub(
        r"(<w:settings[^>]*>)",
        r"\1" + new_tag,
        settings_xml,
        count=1,
    )


def main():
    if len(sys.argv) != 2:
        print(f"Uso: {sys.argv[0]} <ruta-al-docx>", file=sys.stderr)
        sys.exit(1)

    docx_path = Path(sys.argv[1]).resolve()
    if not docx_path.is_file():
        print(f"ERROR: no existe {docx_path}", file=sys.stderr)
        sys.exit(1)

    with tempfile.TemporaryDirectory() as tmp:
        tmp_dir = Path(tmp)

        # Descomprimir
        with zipfile.ZipFile(docx_path, "r") as z:
            z.extractall(tmp_dir)

        styles_path = tmp_dir / "word" / "styles.xml"
        if not styles_path.is_file():
            print("ERROR: no se encuentra word/styles.xml", file=sys.stderr)
            sys.exit(1)

        # Patch de espaciado
        xml = styles_path.read_text(encoding="utf-8")
        for style_id, before, after in SPACING_TARGETS:
            xml = patch_spacing(xml, style_id, before, after)
        styles_path.write_text(xml, encoding="utf-8")

        # Patch de bordes de tabla (el template no define líneas)
        document_path = tmp_dir / "word" / "document.xml"
        if document_path.is_file():
            d_xml = document_path.read_text(encoding="utf-8")
            new_d_xml = patch_table_borders(d_xml)
            new_d_xml = patch_cell_borders(new_d_xml)
            if new_d_xml != d_xml:
                document_path.write_text(new_d_xml, encoding="utf-8")

        # Patch de updateFields (clicabilidad del TOC al abrir)
        settings_path = tmp_dir / "word" / "settings.xml"
        if settings_path.is_file():
            s_xml = settings_path.read_text(encoding="utf-8")
            new_s_xml = patch_settings_update_fields(s_xml)
            if new_s_xml != s_xml:
                settings_path.write_text(new_s_xml, encoding="utf-8")

        # Recomprimir (preservando estructura interna del docx)
        out_tmp = docx_path.with_suffix(".docx.tmp")
        with zipfile.ZipFile(out_tmp, "w", zipfile.ZIP_DEFLATED) as z:
            for root, _, files in os.walk(tmp_dir):
                for name in files:
                    full = Path(root) / name
                    arcname = full.relative_to(tmp_dir)
                    z.write(full, arcname.as_posix())

        out_tmp.replace(docx_path)

    print(f"✓ Espaciado y updateFields aplicados en {docx_path.name}")


if __name__ == "__main__":
    main()
