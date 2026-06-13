import { ApiConfiguration, ModelInfo, openRouterDefaultModelId } from "@shared/api"
import { Mode } from "@shared/storage/types"
import { getModeSpecificFields } from "@/components/settings/utils/providerUtils"

export function validateApiConfiguration(currentMode: Mode, apiConfiguration?: ApiConfiguration): string | undefined {
	if (apiConfiguration) {
		const {
			apiProvider,
			openAiModelId,
			requestyModelId,
			togetherModelId,
			ollamaModelId,
			lmStudioModelId,
			vsCodeLmModelSelector,
		} = getModeSpecificFields(apiConfiguration, currentMode)

		switch (apiProvider) {
			case "anthropic":
				if (!apiConfiguration.apiKey) {
					return "Debes proporcionar una clave de API válida o elegir otro proveedor."
				}
				break
			case "bedrock":
				if (!apiConfiguration.awsRegion) {
					return "Debes elegir una región para usar con AWS Bedrock."
				}
				break
			case "openrouter":
				if (!apiConfiguration.openRouterApiKey) {
					return "Debes proporcionar una clave de API válida o elegir otro proveedor."
				}
				break
			case "vertex":
				if (!apiConfiguration.vertexProjectId || !apiConfiguration.vertexRegion) {
					return "Debes proporcionar un ID de proyecto y una región de Google Cloud válidos."
				}
				break
			case "gemini":
				if (!apiConfiguration.geminiApiKey) {
					return "Debes proporcionar una clave de API válida o elegir otro proveedor."
				}
				break
			case "openai-native":
				if (!apiConfiguration.openAiNativeApiKey) {
					return "Debes proporcionar una clave de API válida o elegir otro proveedor."
				}
				break
			case "deepseek":
				if (!apiConfiguration.deepSeekApiKey) {
					return "Debes proporcionar una clave de API válida o elegir otro proveedor."
				}
				break
			case "xai":
				if (!apiConfiguration.xaiApiKey) {
					return "Debes proporcionar una clave de API válida o elegir otro proveedor."
				}
				break
			case "qwen":
				if (!apiConfiguration.qwenApiKey) {
					return "Debes proporcionar una clave de API válida o elegir otro proveedor."
				}
				break
			case "doubao":
				if (!apiConfiguration.doubaoApiKey) {
					return "Debes proporcionar una clave de API válida o elegir otro proveedor."
				}
				break
			case "mistral":
				if (!apiConfiguration.mistralApiKey) {
					return "Debes proporcionar una clave de API válida o elegir otro proveedor."
				}
				break
			case "cline":
				break
			case "openai-codex":
				// Authentication is handled via OAuth, not API key
				// Validation happens at runtime in the handler
				break
			case "openai":
				if (
					!apiConfiguration.openAiBaseUrl ||
					(!apiConfiguration.openAiApiKey && !apiConfiguration.azureIdentity) ||
					!openAiModelId
				) {
					return "Debes proporcionar una URL base, una clave de API y un ID de modelo válidos."
				}
				break
			case "requesty":
				if (!apiConfiguration.requestyApiKey) {
					return "Debes proporcionar una clave de API válida o elegir otro proveedor."
				}
				break
			case "fireworks":
				if (!apiConfiguration.fireworksApiKey) {
					return "Debes proporcionar una clave de API válida o elegir otro proveedor."
				}
				break
			case "together":
				if (!apiConfiguration.togetherApiKey || !togetherModelId) {
					return "Debes proporcionar una clave de API válida o elegir otro proveedor."
				}
				break
			case "ollama":
				if (!ollamaModelId) {
					return "Debes proporcionar un ID de modelo válido."
				}
				break
			case "lmstudio":
				if (!lmStudioModelId) {
					return "Debes proporcionar un ID de modelo válido."
				}
				break
			case "vscode-lm":
				if (!vsCodeLmModelSelector) {
					return "Debes proporcionar un selector de modelo válido."
				}
				break
			case "moonshot":
				if (!apiConfiguration.moonshotApiKey) {
					return "Debes proporcionar una clave de API válida o elegir otro proveedor."
				}
				break
			case "nebius":
				if (!apiConfiguration.nebiusApiKey) {
					return "Debes proporcionar una clave de API válida o elegir otro proveedor."
				}
				break
			case "asksage":
				if (!apiConfiguration.asksageApiKey) {
					return "Debes proporcionar una clave de API válida o elegir otro proveedor."
				}
				break
			case "sambanova":
				if (!apiConfiguration.sambanovaApiKey) {
					return "Debes proporcionar una clave de API válida o elegir otro proveedor."
				}
				break
			case "sapaicore":
				if (!apiConfiguration.sapAiCoreBaseUrl) {
					return "Debes proporcionar una URL base válida o elegir otro proveedor."
				}
				if (!apiConfiguration.sapAiCoreClientId) {
					return "Debes proporcionar un Client Id válido o elegir otro proveedor."
				}
				if (!apiConfiguration.sapAiCoreClientSecret) {
					return "Debes proporcionar un Client Secret válido o elegir otro proveedor."
				}
				if (!apiConfiguration.sapAiCoreTokenUrl) {
					return "Debes proporcionar una URL de autenticación válida o elegir otro proveedor."
				}
				break
			case "zai":
				if (!apiConfiguration.zaiApiKey) {
					return "Debes proporcionar una clave de API válida o elegir otro proveedor."
				}
				break
			case "dify":
				if (!apiConfiguration.difyBaseUrl) {
					return "Debes proporcionar una URL base válida o elegir otro proveedor."
				}
				if (!apiConfiguration.difyApiKey) {
					return "Debes proporcionar una clave de API válida o elegir otro proveedor."
				}
				break
			case "minimax":
				if (!apiConfiguration.minimaxApiKey) {
					return "Debes proporcionar una clave de API válida o elegir otro proveedor."
				}
				break
			case "hicap":
				if (!apiConfiguration.hicapApiKey) {
					return "Debes proporcionar una clave de API válida"
				}
				break
			case "wandb":
				if (!apiConfiguration.wandbApiKey) {
					return "Debes proporcionar una clave de API válida o elegir otro proveedor."
				}
				break
		}
	}
	return undefined
}

export function validateModelId(
	currentMode: Mode,
	apiConfiguration?: ApiConfiguration,
	openRouterModels?: Record<string, ModelInfo>,
	clineModels?: Record<string, ModelInfo>,
): string | undefined {
	if (apiConfiguration) {
		const { apiProvider, openRouterModelId, clineModelId } = getModeSpecificFields(apiConfiguration, currentMode)
		switch (apiProvider) {
			case "openrouter":
				const modelId = openRouterModelId || openRouterDefaultModelId // in case the user hasn't changed the model id, it will be undefined by default
				if (!modelId) {
					return "Debes proporcionar un ID de modelo."
				}
				if (openRouterModels && !Object.keys(openRouterModels).includes(modelId)) {
					// even if the model list endpoint failed, extensionstatecontext will always have the default model info
					return "El ID de modelo que proporcionaste no está disponible. Elige otro modelo."
				}
				break
			case "cline":
				const clineResolvedModelId = clineModelId || openRouterDefaultModelId
				if (!clineResolvedModelId) {
					return "Debes proporcionar un ID de modelo."
				}
				if (clineModels && !Object.keys(clineModels).includes(clineResolvedModelId)) {
					return "El ID de modelo que proporcionaste no está disponible. Elige otro modelo."
				}
				break
		}
	}
	return undefined
}
