## Ajustes

Los ajustes de Catalina se abren desde el icono **Ajustes** de la barra de navegación del panel. La configuración se reparte en varias pestañas.

### Pestañas de ajustes

| Pestaña | Contenido |
| --- | --- |
| Configuración de API | Proveedor de modelos, clave de API y modelo a utilizar. |
| Funciones | Activar o desactivar capacidades de Catalina. |
| Navegador | Permitir o impedir que Catalina utilice el navegador. |
| Terminal | Cómo ejecuta Catalina los comandos durante una tarea. |
| Acerca de | Versión de Catalina y una breve descripción. |

### Configuración de API

Pestaña donde se selecciona el proveedor de modelos, se introduce la clave de API y se elige el modelo. Su uso se detalla en el capítulo «Configurar la clave de API».

### Funciones

Permite activar o desactivar capacidades concretas de Catalina.

#### Puntos de control (checkpoints)

Los puntos de control son instantáneas del estado del trabajo que permiten revertir cambios realizados durante una tarea. Características:

- Vienen **desactivados** por defecto; se activan desde la pestaña **Funciones**.
- No son compatibles con espacios de trabajo multi-raíz.

### Navegador

Controla si Catalina puede utilizar el navegador como parte de una tarea. Permite permitir o impedir esta capacidad.

### Terminal

Configura cómo ejecuta Catalina los comandos cuando los lanza dentro de una tarea. Estas opciones se aplican a la ejecución de comandos por parte del agente, no a un uso manual del terminal.

| Opción | Descripción |
| --- | --- |
| Terminal por defecto | Terminal que se utiliza al ejecutar comandos. |
| Tiempo de espera de integración del shell | Margen de espera para la integración con el shell. |
| Reutilizar terminales | Aprovechar terminales ya abiertos en lugar de crear nuevos. |
| Lugar de ejecución | Ejecutar en el terminal de VS Code o en segundo plano. |

### Acerca de

Muestra la versión instalada de Catalina y una breve descripción del producto.
