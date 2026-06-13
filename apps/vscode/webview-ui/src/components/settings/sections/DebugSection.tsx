import { Button } from "@/components/ui/button"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { StateServiceClient } from "@/services/grpc-client"
import Section from "../Section"

interface DebugSectionProps {
	onResetState: (resetGlobalState?: boolean) => Promise<void>
	renderSectionHeader: (tabId: string) => JSX.Element | null
}

const DebugSection = ({ onResetState, renderSectionHeader }: DebugSectionProps) => {
	const { setShowWelcome } = useExtensionState()
	return (
		<div>
			{renderSectionHeader("debug")}
			<Section>
				<Button onClick={() => onResetState()} variant="error">
					Restablecer el estado del espacio de trabajo
				</Button>
				<Button onClick={() => onResetState(true)} variant="error">
					Restablecer el estado global
				</Button>
				<p className="text-xs mt-[5px] text-(--vscode-descriptionForeground)">
					Esto restablecerá todo el estado global y el almacenamiento de secretos de la extensión.
				</p>
			</Section>
			<Section>
				<Button
					onClick={async () =>
						await StateServiceClient.setWelcomeViewCompleted({ value: false })
							.catch(() => {})
							.finally(() => setShowWelcome(true))
					}
					variant="secondary">
					Restablecer el estado de la introducción
				</Button>
			</Section>
		</div>
	)
}

export default DebugSection
