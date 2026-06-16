## Configurar la clave de API

Para funcionar, Catalina necesita conectarse a un proveedor de modelos de inteligencia artificial. Esta conexión se establece mediante una clave de API que se obtiene del propio proveedor. La clave se guarda localmente en el equipo.

### Obtener la clave del proveedor

La clave de API se genera en el panel de la cuenta del proveedor de modelos elegido. Catalina admite varios proveedores (por ejemplo, Anthropic/Claude, OpenAI, entre otros). Cada proveedor entrega su propia clave desde su panel; conviene tenerla disponible antes de empezar la configuración.

### Configurar la clave en Catalina

1. Abrir el panel de Catalina.
2. Pulsar el icono de **Ajustes** en la barra de navegación del panel.
3. Abrir la pestaña **Configuración de API**.
4. Seleccionar el proveedor de modelos en el desplegable.
5. Pegar la clave de API obtenida del proveedor en el campo correspondiente.
6. Seleccionar el modelo que se quiere utilizar.
7. Guardar los cambios.

### Notas

- La clave de API se almacena localmente en el equipo; no se comparte fuera de la configuración de la extensión.
- Cada proveedor ofrece distintos modelos. La elección del modelo afecta a la calidad y al coste de las respuestas, según las condiciones del proveedor.
- Si el proveedor o el modelo cambian, basta con volver a la pestaña **Configuración de API** y actualizar los valores.
