import { TelemetrySettingEnum, TelemetrySettingRequest } from "@shared/proto/cline/state"
import { useCallback } from "react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { StateServiceClient } from "@/services/grpc-client"

const telemetryRequest = TelemetrySettingRequest.create({
	setting: TelemetrySettingEnum.ENABLED,
})

export const TelemetryBanner: React.FC = () => {
	const { navigateToSettings } = useExtensionState()

	const handleClose = useCallback(() => {
		StateServiceClient.updateTelemetrySetting(telemetryRequest).catch(console.error)
	}, [])

	const handleOpenSettings = useCallback(() => {
		handleClose()
		navigateToSettings()
	}, [handleClose, navigateToSettings])

	return (
		<div className="bg-banner-background text-banner-foreground px-3 py-2 flex flex-col gap-1 shrink-0 mb-1 relative text-sm m-4">
			<h3 className="m-0">Ayuda a mejorar Catalina</h3>
			<i>(y accede a funciones experimentales)</i>
			<p className="m-0">
				Catalina recopila datos de errores y de uso para ayudarnos a corregir fallos y mejorar la extensión. Nunca se envía
				código, prompts ni información personal.
			</p>
			<p className="m-0">
				<span>Puedes desactivar este ajuste en los </span>
				<span className="text-link cursor-pointer" onClick={handleOpenSettings}>
					Ajustes
				</span>
				.
			</p>

			{/* Close button */}
			<button
				aria-label="Cerrar el banner y activar la telemetría"
				className="absolute top-3 right-3 opacity-70 hover:opacity-100 cursor-pointer border-0 bg-transparent p-0 text-inherit"
				onClick={handleClose}
				type="button">
				✕
			</button>
		</div>
	)
}

export default TelemetryBanner
