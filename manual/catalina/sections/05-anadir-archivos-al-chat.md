## Añadir archivos al chat

Para que Catalina trabaje sobre archivos concretos, conviene añadirlos al chat como contexto. Hay tres formas de hacerlo: desde el explorador de archivos, escribiendo `@` en el campo de entrada o arrastrando archivos.

### Desde el explorador de archivos

1. En el explorador de archivos de VS Code, hacer click derecho sobre uno o varios archivos o carpetas.
2. Elegir una de las opciones del menú contextual:

| Opción | Efecto |
| --- | --- |
| Añadir a Catalina | Añade los elementos al chat de la tarea actual. |
| Añadir a Catalina (nueva tarea) | Limpia la tarea actual e inicia una nueva con esos elementos. |

#### Selección múltiple

El explorador admite seleccionar varios elementos antes de abrir el menú:

- `Ctrl/Cmd+click` para añadir elementos sueltos a la selección.
- `Shift+click` para seleccionar un rango.

#### Selector de archivos

El comportamiento depende de lo seleccionado:

- **Un único archivo**: se añade directamente, sin pasos intermedios.
- **Una carpeta o varios elementos con muchos archivos**: se abre un selector con la lista de archivos, todos pre-marcados, junto al texto «Desmarca los archivos que no quieras añadir». La persona usuaria desmarca lo que no quiere incluir y acepta.

Los archivos elegidos se insertan en el campo de entrada como menciones `@/ruta`, agrupadas una línea por carpeta (los archivos de una misma carpeta aparecen juntos en una sola línea).

### Escribiendo `@` en el campo de entrada

1. Situar el cursor en el campo de entrada.
2. Escribir `@` para abrir el selector de menciones.
3. Elegir el archivo o la carpeta, o una de las menciones especiales:

| Mención | Añade |
| --- | --- |
| `@/ruta` | Un archivo o carpeta del proyecto. |
| `@problems` | Los problemas (errores y avisos) detectados en el editor. |
| `@terminal` | El contenido del terminal. |

### Arrastrando archivos

Arrastrar uno o varios archivos directamente sobre el campo de entrada para adjuntarlos a la tarea.
