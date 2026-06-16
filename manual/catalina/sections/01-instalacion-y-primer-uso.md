## Instalación y primer uso

Catalina se distribuye como un archivo de extensión con extensión `.vsix`. Existen dos formas de instalarla: desde la línea de comandos o desde la interfaz de VS Code.

### Instalar desde la línea de comandos

1. Abrir un terminal en el equipo.
2. Ejecutar el comando de instalación indicando la ruta del archivo `.vsix`:

```
code --install-extension catalina-<version>.vsix --force
```

3. Sustituir `<version>` por el número de versión del archivo recibido.
4. Recargar la ventana de VS Code para que la extensión quede activa.

### Instalar desde la interfaz de VS Code

1. Abrir VS Code.
2. Pulsar `Ctrl+Shift+P` para abrir la paleta de comandos.
3. Escribir y seleccionar **Install from VSIX…**.
4. Seleccionar el archivo `catalina-<version>.vsix` en el explorador de archivos.
5. Cuando finalice la instalación, recargar la ventana: abrir de nuevo la paleta de comandos (`Ctrl+Shift+P`) y ejecutar **Developer: Reload Window**.

### Abrir Catalina

Tras la instalación, el icono de Catalina (una burbuja de chat) aparece en la barra de actividad, situada en el lateral izquierdo del editor.

1. Pulsar el icono de Catalina en la barra de actividad.
2. Se abre el panel de Catalina en el lateral.

### Primeros pasos

Antes de poder enviar la primera tarea es necesario configurar la clave de API del proveedor de modelos. Este paso se describe en el capítulo «Configurar la clave de API».

Una vez configurada la clave, el flujo básico es el siguiente:

1. Pulsar el icono de Catalina para abrir el panel.
2. Describir la tarea en el campo de entrada de texto.
3. Elegir el modo de trabajo (Plan o Acción) en el selector situado junto al campo de entrada.
4. Enviar el mensaje y aprobar los pasos que Catalina vaya proponiendo.
