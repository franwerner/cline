import { wandbModels } from "@shared/api"
import { Mode } from "@shared/storage/types"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { ApiKeyField } from "../common/ApiKeyField"
import { ModelInfoView } from "../common/ModelInfoView"
import { ModelSelector } from "../common/ModelSelector"
import { normalizeApiConfiguration } from "../utils/providerUtils"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

interface WandbProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
	currentMode: Mode
}

export const WandbProvider = ({ showModelOptions, isPopup, currentMode }: WandbProviderProps) => {
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange, handleModeFieldChange } = useApiConfigurationHandlers()

	const { selectedModelId, selectedModelInfo } = normalizeApiConfiguration(apiConfiguration, currentMode)

	return (
		<div>
			<ApiKeyField
				helpText="Esta clave se guarda localmente y solo se usa para hacer solicitudes de API desde esta extensión."
				initialValue={apiConfiguration?.wandbApiKey || ""}
				onChange={(value) => handleFieldChange("wandbApiKey", value)}
				providerName="W&B"
				signupUrl="https://wandb.ai"
			/>

			{showModelOptions && (
				<>
					<ModelSelector
						label="Modelo"
						models={wandbModels}
						onChange={(e: any) =>
							handleModeFieldChange(
								{ plan: "planModeApiModelId", act: "actModeApiModelId" },
								e.target.value,
								currentMode,
							)
						}
						selectedModelId={selectedModelId}
					/>

					<ModelInfoView isPopup={isPopup} modelInfo={selectedModelInfo} selectedModelId={selectedModelId} />
				</>
			)}
		</div>
	)
}
