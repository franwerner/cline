export enum NEW_USER_TYPE {
	FREE = "free",
	POWER = "power",
	BYOK = "byok",
}

type UserTypeSelection = {
	title: string
	description: string
	type: NEW_USER_TYPE
}

export const STEP_CONFIG = {
	0: {
		title: "¿Cómo usarás Catalina?",
		description: "Selecciona una opción a continuación para empezar.",
		buttons: [
			{ text: "Continuar", action: "next", variant: "default" },
			{ text: "Login to Cline", action: "signin", variant: "secondary" },
		],
	},
	[NEW_USER_TYPE.FREE]: {
		title: "Selecciona un modelo gratuito",
		buttons: [
			{ text: "Crear mi cuenta", action: "signup", variant: "default" },
			{ text: "Atrás", action: "back", variant: "secondary" },
		],
	},
	[NEW_USER_TYPE.POWER]: {
		title: "Selecciona tu modelo",
		buttons: [
			{ text: "Crear mi cuenta", action: "signup", variant: "default" },
			{ text: "Atrás", action: "back", variant: "secondary" },
		],
	},
	[NEW_USER_TYPE.BYOK]: {
		title: "Configura tu proveedor",
		buttons: [
			{ text: "Continuar", action: "done", variant: "default" },
			{ text: "Atrás", action: "back", variant: "secondary" },
		],
	},
	2: {
		title: "¡Casi listo!",
		description: "Completa la creación de la cuenta en tu navegador. Después vuelve aquí para terminar.",
		buttons: [{ text: "Atrás", action: "back", variant: "secondary" }],
	},
} as const

export const USER_TYPE_SELECTIONS: UserTypeSelection[] = [
	{ title: "Totalmente gratis", description: "Empieza sin coste alguno", type: NEW_USER_TYPE.FREE },
	{ title: "Modelo de frontera", description: "Claude, GPT Codex, Gemini, etc.", type: NEW_USER_TYPE.POWER },
	{ title: "Usar mi propia clave de API", description: "Usa Catalina con el proveedor que prefieras", type: NEW_USER_TYPE.BYOK },
]
