import { ActionMetadata } from "./types"

export const ACTION_METADATA: ActionMetadata[] = [
	{
		id: "readFiles",
		label: "Leer archivos del proyecto",
		shortName: "Leer",
		icon: "codicon-search",
		subAction: {
			id: "readFilesExternally",
			label: "Leer todos los archivos",
			shortName: "Leer (todos)",
			icon: "codicon-folder-opened",
			parentActionId: "readFiles",
		},
	},
	{
		id: "editFiles",
		label: "Editar archivos del proyecto",
		shortName: "Editar",
		icon: "codicon-edit",
		subAction: {
			id: "editFilesExternally",
			label: "Editar todos los archivos",
			shortName: "Editar (todos)",
			icon: "codicon-files",
			parentActionId: "editFiles",
		},
	},
	{
		id: "executeSafeCommands",
		label: "Ejecutar comandos seguros",
		shortName: "Comandos seguros",
		icon: "codicon-terminal",
		subAction: {
			id: "executeAllCommands",
			label: "Ejecutar todos los comandos",
			shortName: "Todos los comandos",
			icon: "codicon-terminal-bash",
			parentActionId: "executeSafeCommands",
		},
	},
	{
		id: "useBrowser",
		label: "Usar el navegador",
		shortName: "Navegador",
		icon: "codicon-globe",
	},
	{
		id: "useMcp",
		label: "Usar servidores MCP",
		shortName: "MCP",
		icon: "codicon-server",
	},
]

export const NOTIFICATIONS_SETTING: ActionMetadata = {
	id: "enableNotifications",
	label: "Activar notificaciones",
	shortName: "Notificaciones",
	icon: "codicon-bell",
}
