# Manual de Catalina

Manual de usuario de la extensión **Catalina** para VS Code, adaptada para la Diputación de Badajoz. El manual se redacta en Markdown por secciones y se convierte a `.docx` con pandoc usando una plantilla corporativa.

## Estructura

```
manual/
├── README.md                  Este archivo.
├── Template.docx              Plantilla corporativa de estilos (referencia de pandoc).
├── build/
│   ├── build-docx.sh          Script de generación del .docx.
│   └── postprocess-docx.py    Ajustes de espaciado y actualización de campos.
├── catalina/
│   └── sections/              Secciones del manual de Catalina (NN-nombre.md).
└── dist/                      Salida generada (.docx). No versionada.
```

### Secciones

Cada sección es un archivo Markdown numerado `NN-nombre.md` dentro de `catalina/sections/`. Se concatenan en orden de nombre de archivo, con un salto de página entre cada una.

| Archivo | Contenido |
| --- | --- |
| `00-introduccion.md` | Qué es Catalina, a quién va dirigido, conceptos básicos y requisitos. |
| `01-instalacion-y-primer-uso.md` | Instalación del `.vsix` y primeros pasos. |
| `02-configurar-clave-api.md` | Configuración del proveedor, la clave de API y el modelo. |
| `03-interfaz-y-navegacion.md` | Barra de navegación, campo de entrada y áreas del panel. |
| `04-flujo-de-trabajo-plan-y-accion.md` | Modos Plan y Acción y aprobación de pasos. |
| `05-anadir-archivos-al-chat.md` | Añadir archivos desde el explorador, con `@` y arrastrando. |
| `06-servidores-mcp.md` | Vista de servidores MCP y sus pestañas. |
| `07-historial.md` | Reanudar y revisar tareas anteriores. |
| `08-ajustes.md` | Pestañas de ajustes y opciones disponibles. |
| `09-atajos-de-teclado.md` | Atajos de teclado y acciones sin atajo. |

## Cómo construir el .docx

Requisitos: `pandoc` (>= 3.0) y `python3`.

Desde el directorio `build/`:

```
./build-docx.sh catalina
```

El script concatena las secciones de `catalina/sections/`, las convierte a `.docx` aplicando los estilos de `Template.docx` (índice con profundidad 4 y salto de página entre secciones) y aplica el postprocesado. El resultado se genera en `dist/catalina.docx`.

## Principios de redacción

- **Idioma**: español de España (es-ES).
- **Tono**: técnico-neutral. Sin emojis, sin frases motivacionales.
- **Pasos**: trato impersonal/infinitivo («Abrir…», «Pulsar…», «Seleccionar…»).
- **Producto**: se denomina Catalina y se trata en tercera persona («Catalina puede…»).
- **Jerarquía de encabezados** dentro de cada `.md`:
  - `##` = título del capítulo o sección (uno al inicio de cada archivo).
  - `###` = subsección.
  - `####` = bloque.
  - No se usa `#` (reservado para el título global del documento).
- **Formato**: preferir tablas y listas de pasos cortas. Procedimientos como pasos numerados; opciones y atajos en tablas.
- **Alcance**: documentar solo lo que la persona usuaria ve y hace en el producto actual. No inventar funciones; ante la duda, omitir.
