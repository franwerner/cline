#!/usr/bin/env bash
# =============================================================
# build-docx.sh — Genera el manual de un caso de uso en .docx
# usando el template corporativo como referencia de estilos.
#
# Uso:
#   ./build-docx.sh [<caso-de-uso>]
#   Por defecto: use-case-6
#
# Pipeline:
#   1. Concatena los sections/*.md del caso de uso en un archivo temporal.
#   2. Pandoc convierte el .md a .docx aplicando los estilos del template.
#   3. postprocess-docx.py ajusta espaciado de headings y activa
#      la actualización de campos al abrir.
#   4. Salida: ../dist/<caso-de-uso>.docx
#
# Requisitos:
#   - pandoc (>=3.0)
#   - python3
# =============================================================
set -euo pipefail

cd "$(dirname "$0")"

CASE="${1:-use-case-6}"
SECTIONS_DIR="../${CASE}/sections"
TEMPLATE="../Template.docx"
DIST_DIR="../dist"
OUT="$DIST_DIR/${CASE}.docx"

mkdir -p "$DIST_DIR"

if ! command -v pandoc >/dev/null 2>&1; then
  echo "ERROR: pandoc no está instalado." >&2
  exit 1
fi

if [[ ! -d "$SECTIONS_DIR" ]]; then
  echo "ERROR: no se encuentra el directorio de secciones '$SECTIONS_DIR'." >&2
  exit 1
fi

if [[ ! -f "$TEMPLATE" ]]; then
  echo "ERROR: no se encuentra el template '$TEMPLATE'." >&2
  exit 1
fi

TMP_MD="$(mktemp --suffix=.md)"
trap 'rm -f "$TMP_MD"' EXIT

echo "→ Concatenando secciones de ${CASE}..."
FIRST=1
for f in "$SECTIONS_DIR"/*.md; do
  if [[ $FIRST -eq 0 ]]; then
    # Insertar page break antes de cada sección (excepto la primera)
    printf '\n```{=openxml}\n<w:p><w:r><w:br w:type="page"/></w:r></w:p>\n```\n\n' >> "$TMP_MD"
  fi
  cat "$f" >> "$TMP_MD"
  echo >> "$TMP_MD"
  echo "    + $(basename "$f")"
  FIRST=0
done

echo "→ Generando .docx con estilos del template..."
pandoc "$TMP_MD" \
  -f markdown-auto_identifiers \
  -o "$OUT" \
  --toc \
  --toc-depth=4 \
  --reference-doc="$TEMPLATE"

echo "→ Ajustando espaciado de subsecciones..."
python3 ./postprocess-docx.py "$OUT"

echo "✓ Manual generado: $(realpath "$OUT")"
