## Introducción

Catalina es un asistente de inteligencia artificial para programación que se integra dentro del editor de código (VS Code). Su función es ayudar a planificar y ejecutar tareas de desarrollo: crear y editar archivos, ejecutar comandos en el terminal y, cuando procede, utilizar el navegador. Esta versión está adaptada para la Diputación de Badajoz.

Catalina trabaja en colaboración con la persona usuaria. No actúa de forma autónoma sin control: antes de cada acción que modifique el proyecto o el entorno (escribir un archivo, ejecutar un comando, abrir el navegador), Catalina solicita aprobación. La persona usuaria conserva el control en todo momento y decide qué pasos se llevan a cabo.

### A quién va dirigido este manual

Este manual está dirigido a las personas que utilizan Catalina dentro del editor. Describe únicamente lo que se ve y se hace en el producto: la instalación, la configuración de la clave de API, la interfaz, el flujo de trabajo y las distintas funciones disponibles. No cubre aspectos de desarrollo interno de la extensión ni tareas de administración avanzada.

### Qué puede hacer Catalina

| Capacidad | Descripción |
| --- | --- |
| Planificar tareas | Analiza la petición y propone un plan antes de actuar (modo Plan). |
| Crear y editar archivos | Genera archivos nuevos o modifica los existentes, siempre con aprobación. |
| Ejecutar comandos | Ejecuta comandos en el terminal como parte de una tarea, con aprobación. |
| Usar el navegador | Cuando está permitido, abre y consulta páginas para completar la tarea. |
| Reanudar trabajo previo | Recupera conversaciones y tareas anteriores desde el historial. |
| Ampliar sus herramientas | Incorpora capacidades adicionales mediante servidores MCP. |

### Conceptos básicos

- **Tarea**: una conversación con un objetivo de trabajo concreto. Cada tarea se guarda y puede reanudarse más adelante.
- **Modo Plan / modo Acción**: dos formas de trabajar. En modo Plan, Catalina razona y propone; en modo Acción, ejecuta los cambios.
- **Aprobación**: confirmación que solicita Catalina antes de aplicar un cambio o ejecutar un comando.
- **Mención** (`@`): referencia a un archivo, una carpeta u otro contexto que se añade al mensaje.

### Requisitos

Para utilizar Catalina se necesita:

- El editor VS Code instalado.
- El archivo de instalación de Catalina (`.vsix`).
- Una clave de API de un proveedor de modelos de IA (ver el capítulo correspondiente).
