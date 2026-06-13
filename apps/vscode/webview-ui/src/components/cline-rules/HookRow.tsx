import { StringRequest } from "@shared/proto/cline/common"
import { DeleteHookRequest, HooksToggles } from "@shared/proto/cline/file"
import { PenIcon, Trash2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { FileServiceClient } from "@/services/grpc-client"

interface HookRowProps {
	hookName: string
	enabled: boolean
	absolutePath: string
	isGlobal: boolean
	isWindows: boolean
	workspaceName?: string
	onToggle: (hookName: string, newEnabled: boolean) => void
	onDelete: (hooksToggles: HooksToggles) => void
}

const HookRow: React.FC<HookRowProps> = ({
	hookName,
	enabled,
	absolutePath,
	isGlobal,
	isWindows,
	workspaceName,
	onToggle,
	onDelete,
}) => {
	const handleEditClick = () => {
		FileServiceClient.openFile(StringRequest.create({ value: absolutePath })).catch((err) =>
			console.error("Failed to open file:", err),
		)
	}

	const handleDeleteClick = () => {
		FileServiceClient.deleteHook(
			DeleteHookRequest.create({
				hookName,
				isGlobal,
				workspaceName,
			}),
		)
			.then((response) => {
				if (response.hooksToggles) {
					onDelete(response.hooksToggles)
				}
			})
			.catch((err) => console.error("Failed to delete hook:", err))
	}

	return (
		<div className="mb-2.5">
			<div className="flex items-center px-2 py-4 rounded bg-text-block-background max-h-4">
				<span className="flex-1 overflow-hidden break-all whitespace-normal flex items-center mr-1">
					<span className="ph-no-capture">{hookName}</span>
				</span>

				{/* Toggle Switch */}
				<div className="flex items-center space-x-2 gap-2">
					<div
						title={
							isWindows
								? "Activar o desactivar hooks aún no es compatible en Windows en este PR base. Los hooks se ejecutan cuando existe el archivo del hook."
								: undefined
						}>
						<Switch
							checked={enabled}
							className="mx-1"
							disabled={isWindows}
							key={hookName}
							onClick={() => onToggle(hookName, !enabled)}
							style={isWindows ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
						/>
					</div>
					<Button aria-label="Editar archivo del hook" onClick={handleEditClick} size="xs" title="Editar archivo del hook" variant="icon">
						<PenIcon />
					</Button>
					<Button
						aria-label="Eliminar archivo del hook"
						onClick={handleDeleteClick}
						size="xs"
						title="Eliminar archivo del hook"
						variant="icon">
						<Trash2Icon />
					</Button>
				</div>
			</div>
		</div>
	)
}

export default HookRow
