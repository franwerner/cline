## Reglas y habilidades

Catalina permite personalizar y ampliar su comportamiento mediante **reglas**, **flujos de trabajo** y **habilidades**. Todo se gestiona desde el botón **«Gestionar reglas y flujos de trabajo de Catalina»**, situado junto al campo de entrada del chat.

El panel se organiza en pestañas: **Reglas**, **Flujos de trabajo**, **Hooks** y **Habilidades**. En cada una, los elementos aparecen separados en **globales** (disponibles en todos los proyectos) y del **espacio de trabajo** (solo el proyecto actual), y se activan o desactivan con un interruptor. Lo importante es que la extensión soporta estos mecanismos y permite activarlos, crearlos y combinarlos según el proyecto o de forma global.

### Reglas

Las reglas son instrucciones permanentes que Catalina tiene en cuenta en cada tarea: convenciones de código, idioma de las respuestas, restricciones del proyecto, estilo, etc.

Cómo crearlas:

1. Abrir el panel desde el botón **«Gestionar reglas y flujos de trabajo de Catalina»** y seleccionar la pestaña **Reglas**.
2. Pulsar **Nuevo archivo**, indicar un nombre y editar el contenido de la regla.
3. Activar o desactivar cada regla con su interruptor (global o del espacio de trabajo).

De forma alternativa, las reglas del proyecto se pueden crear manualmente como un archivo `.clinerules` (o una carpeta `.clinerules/` con varios archivos) en la raíz del espacio de trabajo.

Referencia: <https://docs.cline.bot/customization/cline-rules>

### Habilidades

Las habilidades (*skills*) son capacidades reutilizables que Catalina puede invocar durante una tarea. Se listan en la pestaña **Habilidades** (globales y del espacio de trabajo) y se activan o desactivan con su interruptor.

Para crear una habilidad nueva, usar la opción **Crear skill** del panel y definir su contenido. Una vez activada, queda disponible para que Catalina la utilice cuando corresponda.

Referencia (creación de habilidades personalizadas): <https://support.claude.com/es/articles/12512198-como-crear-habilidades-personalizadas>

### Flujos de trabajo

Los flujos de trabajo son secuencias de instrucciones guardadas que se invocan como **comandos de barra** en el chat: al escribir `/` aparece la lista de flujos disponibles y, al elegir uno (o escribir `/nombre`), se ejecuta. Resultan útiles para tareas repetitivas (por ejemplo, preparar un commit o generar un informe).

Cómo crearlos:

1. En el panel, abrir la pestaña **Flujos de trabajo**, pulsar **Nuevo archivo**, indicar un nombre y escribir las instrucciones del flujo.
2. Activarlo con su interruptor (global o del espacio de trabajo).

De forma alternativa, crear un archivo `.md` en `.clinerules/workflows/` dentro del proyecto. El nombre del archivo es el del comando: `eco.md` se invoca con `/eco`.

A diferencia de las habilidades, los flujos **sí** se lanzan escribiendo `/` en el chat.

### Hooks

Los hooks son acciones que se ejecutan automáticamente en puntos concretos del ciclo de vida de una tarea (por ejemplo, antes o después de determinados pasos). No son instrucciones que el modelo tenga en cuenta, sino disparadores que actúan por sí solos cuando el archivo del hook existe y está activado.

Cómo crearlos:

1. En el panel, abrir la pestaña **Hooks**, elegir el **tipo de hook** en el desplegable y pulsar **Crear**.
2. Editar el archivo generado y activarlo con su interruptor.

Los hooks del proyecto viven en `.clinerules/hooks/`. La pestaña **Hooks** solo aparece si la función *Hooks* está activada en **Ajustes → Funciones**.

> Los enlaces anteriores son material de referencia externo para el formato y las buenas prácticas. La documentación de Catalina se limita a indicar que estas funciones están disponibles en la extensión y cómo acceder a ellas.
