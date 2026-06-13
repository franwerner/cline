import { CreateHookRequest, CreateSkillRequest, RuleFileRequest } from "@shared/proto/index.cline"
import { PlusIcon } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useClickAway } from "react-use"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { FileServiceClient } from "@/services/grpc-client"

interface NewRuleRowProps {
	isGlobal: boolean
	ruleType?: string
	existingHooks?: string[]
	workspaceName?: string
}

const HOOK_TYPES = [
	{ name: "TaskStart", description: "Se ejecuta cuando comienza una nueva tarea" },
	{ name: "TaskResume", description: "Se ejecuta cuando se reanuda una tarea" },
	{ name: "TaskCancel", description: "Se ejecuta cuando se cancela una tarea" },
	{ name: "TaskComplete", description: "Se ejecuta cuando se completa una tarea" },
	{ name: "PreToolUse", description: "Se ejecuta antes de usar cualquier herramienta" },
	{ name: "PostToolUse", description: "Se ejecuta después de usar cualquier herramienta" },
	{ name: "UserPromptSubmit", description: "Se ejecuta cuando el usuario envía un prompt" },
	{ name: "PreCompact", description: "Se ejecuta antes de la compactación de la conversación" },
]

const NewRuleRow: React.FC<NewRuleRowProps> = ({ isGlobal, ruleType, existingHooks = [], workspaceName }) => {
	const [isExpanded, setIsExpanded] = useState(false)
	const [filename, setFilename] = useState("")
	const inputRef = useRef<HTMLInputElement>(null)
	const [error, setError] = useState<string | null>(null)

	const componentRef = useRef<HTMLDivElement>(null)

	// Calculate available hook types by filtering out existing hooks
	const availableHookTypes = useMemo(() => HOOK_TYPES.filter((type) => !existingHooks.includes(type.name)), [existingHooks])

	// Focus the input when expanded
	useEffect(() => {
		if (isExpanded && inputRef.current) {
			inputRef.current.focus()
		}
	}, [isExpanded])

	useClickAway(componentRef, () => {
		if (isExpanded) {
			setIsExpanded(false)
			setFilename("")
			setError(null)
		}
	})

	const getExtension = (filename: string): string => {
		if (filename.startsWith(".") && !filename.includes(".", 1)) {
			return ""
		}
		const match = filename.match(/\.[^.]+$/)
		return match ? match[0].toLowerCase() : ""
	}

	const isValidExtension = (ext: string): boolean => {
		return ext === "" || ext === ".md" || ext === ".txt"
	}

	const handleCreateHook = async (hookName: string) => {
		if (!hookName) return

		try {
			await FileServiceClient.createHook(
				CreateHookRequest.create({
					hookName,
					isGlobal,
					workspaceName,
				}),
			)
		} catch (err) {
			console.error("Error creating hook:", err)
		}
	}

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()

		if (filename.trim()) {
			const trimmedFilename = filename.trim()

			// Skills use directory names, not file extensions
			if (ruleType === "skill") {
				// Validate skill name - only allow alphanumeric, dashes, underscores
				if (!/^[a-zA-Z0-9_-]+$/.test(trimmedFilename)) {
					setError("El nombre de la skill solo puede contener letras, números, guiones y guiones bajos")
					return
				}

				try {
					await FileServiceClient.createSkillFile(
						CreateSkillRequest.create({
							skillName: trimmedFilename,
							isGlobal,
						}),
					)
					setFilename("")
					setError(null)
					setIsExpanded(false)
				} catch (err) {
					setError(err instanceof Error ? err.message : "No se pudo crear la skill")
				}
				return
			}

			const extension = getExtension(trimmedFilename)

			if (!isValidExtension(extension)) {
				setError("Solo se permiten .md, .txt o ninguna extensión de archivo")
				return
			}

			let finalFilename = trimmedFilename
			if (extension === "") {
				finalFilename = `${trimmedFilename}.md`
			}

			try {
				await FileServiceClient.createRuleFile(
					RuleFileRequest.create({
						isGlobal,
						filename: finalFilename,
						type: ruleType || "cline",
					}),
				)
			} catch (err) {
				console.error("Error creating rule file:", err)
			}

			setFilename("")
			setError(null)
			setIsExpanded(false)
		}
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Escape") {
			setIsExpanded(false)
			setFilename("")
		}
	}

	return (
		<>
			<div
				className={cn("mb-2.5 transition-all duration-300 ease-in-out", {
					"opacity-100": isExpanded,
					"opacity-70 hover:opacity-100": !isExpanded,
				})}
				onClick={() => !isExpanded && ruleType !== "hook" && setIsExpanded(true)}
				ref={componentRef}>
				<div
					className={cn(
						"flex items-center px-2 py-4 rounded bg-input-background transition-all duration-300 ease-in-out h-5",
						{
							"shadow-sm": isExpanded,
						},
					)}>
					{ruleType === "hook" ? (
						<>
							<label className="sr-only" htmlFor="hook-type-select">
								Selecciona el tipo de hook a crear
							</label>
							<span className="sr-only" id="hook-select-description">
								Elige un tipo de hook a crear. Los hooks se ejecutan en puntos concretos del ciclo de vida de
								Catalina. Disponibles:{" "}
								{availableHookTypes.map((h) => h.name).join(", ")}
							</span>
							<select
								aria-describedby="hook-select-description"
								aria-label="Selecciona el tipo de hook a crear"
								className="flex-1 bg-input-background text-input-foreground border-0 outline-0 rounded focus:outline-none focus:ring-0 focus:border-transparent px-2 cursor-pointer"
								disabled={availableHookTypes.length === 0}
								id="hook-type-select"
								onChange={(e) => {
									if (e.target.value) {
										handleCreateHook(e.target.value)
										// Reset selection after creating
										e.target.value = ""
									}
								}}
								style={{
									fontStyle: "italic",
									appearance: "none",
									backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23cccccc' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
									backgroundRepeat: "no-repeat",
									backgroundPosition: "right 8px center",
									paddingRight: "24px",
								}}
								value="">
								<option disabled value="">
									{availableHookTypes.length === 0 ? "Todos los hooks creados" : "Nuevo hook..."}
								</option>
								{availableHookTypes.map((hook) => (
									<option key={hook.name} title={hook.description} value={hook.name}>
										{hook.name}
									</option>
								))}
							</select>
						</>
					) : (
						<form className="flex flex-1 items-center" onSubmit={handleSubmit}>
							<input
								className={cn(
									"flex-1 bg-input-background text-input-foreground border-0 outline-0 rounded focus:outline-none focus:ring-0 focus:border-transparent",
									{
										italic: !isExpanded,
									},
								)}
								onChange={(e) => setFilename(e.target.value)}
								placeholder={
									isExpanded
										? ruleType === "workflow"
											? "nombre-del-flujo (.md, .txt o sin extensión)"
											: ruleType === "skill"
												? "nombre-de-skill (letras, números, guiones, guiones bajos)"
												: "nombre-de-regla (.md, .txt o sin extensión)"
										: ruleType === "workflow"
											? "Nuevo archivo de flujo de trabajo..."
											: ruleType === "skill"
												? "Nueva skill..."
												: "Nuevo archivo de regla..."
								}
								ref={inputRef}
								type="text"
								value={isExpanded ? filename : ""}
							/>

							<Button
								aria-label={
									isExpanded
										? ruleType === "skill"
											? "Crear skill"
											: "Crear archivo"
										: ruleType === "workflow"
											? "Nuevo archivo de flujo de trabajo..."
											: ruleType === "skill"
												? "Nueva skill..."
												: "Nuevo archivo de regla..."
								}
								className="mx-0.5"
								onClick={(e) => {
									e.stopPropagation()
									if (!isExpanded) {
										setIsExpanded(true)
									}
								}}
								size="icon"
								title={isExpanded ? (ruleType === "skill" ? "Crear skill" : "Crear archivo") : "Nuevo archivo"}
								type={isExpanded ? "submit" : "button"}
								variant="icon">
								<PlusIcon />
							</Button>
						</form>
					)}
				</div>
				{isExpanded && error && <div className="text-error text-xs mt-1 ml-2">{error}</div>}
			</div>
		</>
	)
}

export default NewRuleRow
