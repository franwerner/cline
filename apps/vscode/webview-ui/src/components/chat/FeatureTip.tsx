import { LightbulbIcon } from "lucide-react"
import { memo, useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface FeatureTipItem {
	text: string
}

const FEATURE_TIPS: FeatureTipItem[] = [
	{
		text: 'Activa "Doble verificación de finalización" en los ajustes para que Catalina revise su trabajo antes de terminar una tarea.',
	},
	{
		text: "Añade un archivo .clinerules a la raíz de tu proyecto para darle a Catalina instrucciones específicas del proyecto.",
	},
	{
		text: "Cambia al modo Plan para debatir y planificar un enfoque antes de que Catalina actúe.",
	},
	{
		text: "Usa @ en la entrada del chat para añadir archivos, carpetas o URL como contexto para tu tarea.",
	},
	{
		text: "Configura servidores MCP para darle a Catalina acceso a herramientas y API externas.",
	},
	{
		text: "Catalina crea puntos de control tras los cambios: siempre puedes restaurar un estado anterior.",
	},
	{
		text: "Usa /compact para condensar conversaciones largas y liberar espacio en la ventana de contexto.",
	},
	{
		text: "Activa la aprobación automática para herramientas de solo lectura, como la lectura de archivos, para acelerar la exploración.",
	},
	{
		text: "Usa el botón de cita para seleccionar texto de la respuesta de Catalina y referenciarlo en tu respuesta.",
	},
	{
		text: "Puedes arrastrar y soltar imágenes en el chat para compartir capturas de pantalla con Catalina.",
	},
	{
		text: "Catalina puede navegar por sitios web: pídele que pruebe tu servidor de desarrollo local en el navegador.",
	},
	{
		text: "Usa /reportbug para crear rápidamente una incidencia de GitHub con el contexto de diagnóstico incluido.",
	},
	{
		text: 'Puedes desactivar estos consejos en Ajustes → Funciones → "Consejos sobre funciones".',
	},
]

const SHOW_DELAY_MS = 2000
const CYCLE_INTERVAL_MS = 8000
const FADE_DURATION_MS = 300

/**
 * Shows rotating feature tips below the "Thinking..." indicator.
 * Appears after a brief delay and cycles through tips while Cline is thinking.
 */
export const FeatureTip = memo(() => {
	const [isVisible, setIsVisible] = useState(false)
	const [hasFadedIn, setHasFadedIn] = useState(false)
	const [isFading, setIsFading] = useState(false)
	const [tipIndex, setTipIndex] = useState(() => Math.floor(Math.random() * FEATURE_TIPS.length))
	const cycleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
	const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	const currentTip = FEATURE_TIPS[tipIndex]

	const advanceTip = useCallback(() => {
		setIsFading(true)
		fadeTimerRef.current = setTimeout(() => {
			setTipIndex((prev) => (prev + 1) % FEATURE_TIPS.length)
			setIsFading(false)
		}, FADE_DURATION_MS)
	}, [])

	useEffect(() => {
		showTimerRef.current = setTimeout(() => {
			setIsVisible(true)
			// Trigger fade-in on next frame so transition applies
			requestAnimationFrame(() => setHasFadedIn(true))
			cycleTimerRef.current = setInterval(advanceTip, CYCLE_INTERVAL_MS)
		}, SHOW_DELAY_MS)

		return () => {
			if (showTimerRef.current) {
				clearTimeout(showTimerRef.current)
			}
			if (cycleTimerRef.current) {
				clearInterval(cycleTimerRef.current)
			}
			if (fadeTimerRef.current) {
				clearTimeout(fadeTimerRef.current)
			}
		}
	}, [advanceTip])

	if (!isVisible) {
		return null
	}

	return (
		<div
			className={cn(
				"flex items-start gap-1.5 mt-2 ml-1 transition-opacity duration-300",
				!hasFadedIn || isFading ? "opacity-0" : "opacity-100",
			)}>
			<LightbulbIcon className="size-3 text-description shrink-0 mt-[1px]" />
			<span className="text-xs text-description leading-relaxed">
				<span className="font-medium">Consejo:</span> {currentTip.text}
			</span>
		</div>
	)
})

FeatureTip.displayName = "FeatureTip"
