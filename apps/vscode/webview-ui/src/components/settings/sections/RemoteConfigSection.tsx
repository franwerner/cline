import { EmptyRequest } from "@shared/proto/index.cline"
import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { useEffect, useRef, useState } from "react"
import { RemoteConfigToggle } from "@/components/account/RemoteConfigToggle"
import { useClineAuth } from "@/context/ClineAuthContext"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { StateServiceClient } from "@/services/grpc-client"
import Section from "../Section"

interface RemoteConfigSectionProps {
	renderSectionHeader: (tabId: string) => JSX.Element | null
}

function BaseRemoteConfigSection({ renderSectionHeader, children }: React.PropsWithChildren<RemoteConfigSectionProps>) {
	return (
		<div>
			{renderSectionHeader("remote-config")}
			<Section>{children}</Section>
		</div>
	)
}

const AUTOMATIC_DELAY_MS = 30000

function RefreshButton() {
	const [isLoading, setIsLoading] = useState(false)
	const [retryIn, setRetryIn] = useState<number | null>(null)
	const intervalRef = useRef<NodeJS.Timeout>()

	useEffect(() => {
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current)
			}
		}
	}, [])

	const onRefresh = () => {
		setIsLoading(true)
		StateServiceClient.refreshRemoteConfig(EmptyRequest.create()).finally(() => {
			setIsLoading(false)
			setRetryIn(AUTOMATIC_DELAY_MS / 1000)

			intervalRef.current = setInterval(() => {
				setRetryIn((old) => {
					if (old && old > 0) return old - 1

					intervalRef.current && clearInterval(intervalRef.current)
					return null
				})
			}, 1000)
		})
	}

	return (
		<VSCodeButton
			className={`w-full rounded-xs ${isLoading ? "animate-pulse" : ""}`}
			disabled={isLoading || (retryIn !== null && retryIn > 0)}
			onClick={() => onRefresh()}>
			Actualizar {retryIn && retryIn > 0 && <>(Reintentar en: {retryIn} segundos)</>}
		</VSCodeButton>
	)
}

interface SettingRowProps {
	label: string
	value: string | number | boolean | undefined | null
	isSecret?: boolean
}

function SettingRow({ label, value, isSecret }: SettingRowProps) {
	const displayValue = (() => {
		if (value === undefined || value === null) {
			return <span className="text-description italic">Sin configurar</span>
		}
		if (typeof value === "boolean") {
			return value ? (
				<span className="text-green-500">Activado</span>
			) : (
				<span className="text-description">Desactivado</span>
			)
		}
		if (isSecret && typeof value === "string" && value.length > 0) {
			return <span className="font-mono text-xs">{"•".repeat(Math.min(value.length, 20))}</span>
		}
		return <span className="font-mono text-xs break-all">{String(value)}</span>
	})()

	const isLongValue = typeof value === "string" && value.length > 25
	if (isLongValue) {
		return (
			<div className="flex flex-col gap-1 py-1.5 border-b border-vscode-widget-border last:border-b-0">
				<span className="text-description text-xs">{label}</span>
				<div className="pl-2 overflow-hidden text-right">{displayValue}</div>
			</div>
		)
	}

	return (
		<div className="flex justify-between items-center py-1.5 border-b border-vscode-widget-border last:border-b-0 gap-2">
			<span className="text-description text-xs shrink-0">{label}</span>
			<span className="text-right overflow-hidden text-ellipsis">{displayValue}</span>
		</div>
	)
}

interface TestButtonProps {
	label: string
	onClick: () => Promise<void>
	disabled?: boolean
	successMessage?: string
}

function TestButton({ label, onClick, disabled, successMessage }: TestButtonProps) {
	const [isLoading, setIsLoading] = useState(false)
	const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
	const timeoutRef = useRef<NodeJS.Timeout>()

	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current)
			}
		}
	}, [])

	const handleClick = async () => {
		setIsLoading(true)
		setResult(null)
		try {
			await onClick()
			setResult({ success: true, message: successMessage || "¡Correcto!" })
		} catch (error) {
			setResult({ success: false, message: error instanceof Error ? error.message : "Error" })
		} finally {
			setIsLoading(false)
			timeoutRef.current = setTimeout(() => setResult(null), 5000)
		}
	}

	return (
		<div className="flex items-center gap-2">
			<VSCodeButton
				appearance="secondary"
				className={isLoading ? "animate-pulse" : ""}
				disabled={disabled || isLoading}
				onClick={handleClick}>
				{isLoading ? "Probando..." : label}
			</VSCodeButton>
			{result && <span className={`text-xs ${result.success ? "text-green-500" : "text-red-500"}`}>{result.message}</span>}
		</div>
	)
}

function OtelSettingsSection() {
	const { remoteConfigSettings } = useExtensionState()

	const otelEnabled = remoteConfigSettings?.openTelemetryEnabled
	const hasOtelConfig =
		otelEnabled !== undefined ||
		remoteConfigSettings?.openTelemetryOtlpEndpoint !== undefined ||
		remoteConfigSettings?.openTelemetryMetricsExporter !== undefined ||
		remoteConfigSettings?.openTelemetryLogsExporter !== undefined

	if (!hasOtelConfig) {
		return null
	}

	const handleTestOtel = async () => {
		const response = await StateServiceClient.testOtelConnection(EmptyRequest.create({}))
		if (!response.success) {
			throw new Error(response.error || "La prueba ha fallado")
		}
	}

	return (
		<div className="mb-4">
			<h4 className="text-sm font-medium mb-2 flex items-center gap-2">
				<i className="codicon codicon-pulse" />
				Configuración de OpenTelemetry
			</h4>
			<div className="bg-vscode-textBlockQuote-background rounded p-3 mb-2">
				<SettingRow label="Activado" value={otelEnabled} />
				<SettingRow label="Exportador de métricas" value={remoteConfigSettings?.openTelemetryMetricsExporter} />
				<SettingRow label="Exportador de registros" value={remoteConfigSettings?.openTelemetryLogsExporter} />
				<SettingRow label="Protocolo OTLP" value={remoteConfigSettings?.openTelemetryOtlpProtocol} />
				<SettingRow label="Endpoint OTLP" value={remoteConfigSettings?.openTelemetryOtlpEndpoint} />
				{remoteConfigSettings?.openTelemetryOtlpMetricsEndpoint && (
					<SettingRow label="Endpoint de métricas" value={remoteConfigSettings?.openTelemetryOtlpMetricsEndpoint} />
				)}
				{remoteConfigSettings?.openTelemetryOtlpLogsEndpoint && (
					<SettingRow label="Endpoint de registros" value={remoteConfigSettings?.openTelemetryOtlpLogsEndpoint} />
				)}
				{remoteConfigSettings?.openTelemetryOtlpHeaders && (
					<SettingRow
						label="Cabeceras OTLP"
						value={`${Object.keys(remoteConfigSettings.openTelemetryOtlpHeaders).length} cabecera(s)`}
					/>
				)}
				{remoteConfigSettings?.openTelemetryMetricExportInterval && (
					<SettingRow
						label="Intervalo de exportación de métricas"
						value={`${remoteConfigSettings.openTelemetryMetricExportInterval}ms`}
					/>
				)}
				{remoteConfigSettings?.openTelemetryOtlpInsecure !== undefined && (
					<SettingRow label="OTLP sin cifrar" value={remoteConfigSettings?.openTelemetryOtlpInsecure} />
				)}
				{remoteConfigSettings?.openTelemetryLogBatchSize && (
					<SettingRow label="Tamaño del lote de registros" value={remoteConfigSettings?.openTelemetryLogBatchSize} />
				)}
				{remoteConfigSettings?.openTelemetryLogBatchTimeout && (
					<SettingRow
						label="Tiempo de espera del lote de registros"
						value={`${remoteConfigSettings.openTelemetryLogBatchTimeout}ms`}
					/>
				)}
				{remoteConfigSettings?.openTelemetryLogMaxQueueSize && (
					<SettingRow
						label="Tamaño máximo de la cola de registros"
						value={remoteConfigSettings?.openTelemetryLogMaxQueueSize}
					/>
				)}
			</div>

			{otelEnabled && (
				<div className="flex gap-2 flex-wrap">
					<TestButton
						disabled={!remoteConfigSettings?.openTelemetryMetricsExporter}
						label="Probar"
						onClick={handleTestOtel}
						successMessage="¡Buffers vaciados! Consulta el canal de salida para obtener información más detallada"
					/>
				</div>
			)}
		</div>
	)
}

function PromptUploadingSection() {
	const { remoteConfigSettings } = useExtensionState()

	const blobStoreConfig = remoteConfigSettings?.blobStoreConfig
	if (!blobStoreConfig) {
		return null
	}

	const handleTestPromptUploading = async () => {
		const response = await StateServiceClient.testPromptUploading(EmptyRequest.create({}))
		if (!response.success) {
			throw new Error(response.error || "La prueba ha fallado")
		}
	}

	return (
		<div className="mb-4">
			<h4 className="text-sm font-medium mb-2 flex items-center gap-2">
				<i className="codicon codicon-cloud-upload" />
				Configuración de la subida de prompts
			</h4>
			<div className="bg-vscode-textBlockQuote-background rounded p-3 mb-2">
				<SettingRow label="Tipo de almacenamiento" value={blobStoreConfig.adapterType?.toUpperCase()} />
				<SettingRow label="Bucket" value={blobStoreConfig.bucket} />
				<SettingRow label="Región" value={blobStoreConfig.region} />
				{blobStoreConfig.endpoint && <SettingRow label="Endpoint" value={blobStoreConfig.endpoint} />}
				{blobStoreConfig.accountId && <SettingRow label="ID de cuenta" value={blobStoreConfig.accountId} />}
				<SettingRow isSecret label="ID de clave de acceso" value={blobStoreConfig.accessKeyId} />
				<SettingRow isSecret label="Clave de acceso secreta" value={blobStoreConfig.secretAccessKey} />
				{blobStoreConfig.intervalMs && (
					<SettingRow label="Intervalo de sincronización" value={`${blobStoreConfig.intervalMs}ms`} />
				)}
				{blobStoreConfig.batchSize && <SettingRow label="Tamaño del lote" value={blobStoreConfig.batchSize} />}
				{blobStoreConfig.maxRetries && <SettingRow label="Reintentos máximos" value={blobStoreConfig.maxRetries} />}
				{blobStoreConfig.maxQueueSize && (
					<SettingRow label="Tamaño máximo de la cola" value={blobStoreConfig.maxQueueSize} />
				)}
				<SettingRow label="Backfill activado" value={blobStoreConfig.backfillEnabled} />
			</div>

			<TestButton label="Probar subida" onClick={handleTestPromptUploading} />
		</div>
	)
}

export function RemoteConfigSection({ renderSectionHeader }: RemoteConfigSectionProps) {
	const { remoteConfigSettings, optOutOfRemoteConfig } = useExtensionState()
	const { activeOrganization } = useClineAuth()

	if (optOutOfRemoteConfig) {
		return (
			<BaseRemoteConfigSection renderSectionHeader={renderSectionHeader}>
				<div className="flex flex-col justify-center gap-4">
					<h3>Has rechazado la configuración remota. Vuelve a activarla para aplicarla y verla aquí.</h3>

					<RemoteConfigToggle activeOrganization={activeOrganization} />
				</div>
			</BaseRemoteConfigSection>
		)
	}

	if (!remoteConfigSettings || Object.keys(remoteConfigSettings).length === 0) {
		return (
			<BaseRemoteConfigSection renderSectionHeader={renderSectionHeader}>
				<div className="flex flex-col justify-center gap-4">
					<h3>
						Aún no has configurado la configuración remota. Hazlo a través de nuestro{" "}
						<VSCodeLink href="https://app.cline.bot/dashboard/organization?tab=settings">panel de control</VSCodeLink>.
					</h3>

					<RefreshButton />
				</div>
			</BaseRemoteConfigSection>
		)
	}

	return (
		<BaseRemoteConfigSection renderSectionHeader={renderSectionHeader}>
			<div className="flex flex-col gap-2">
				<p className="text-description text-xs mb-2">
					Estos ajustes están gestionados por la configuración remota de tu organización.
				</p>

				<OtelSettingsSection />
				<PromptUploadingSection />

				<div className="mt-2">
					<RefreshButton />
				</div>
			</div>
		</BaseRemoteConfigSection>
	)
}
