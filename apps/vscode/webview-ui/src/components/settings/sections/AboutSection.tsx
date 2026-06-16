import Section from "../Section"

interface AboutSectionProps {
	version: string
	renderSectionHeader: (tabId: string) => JSX.Element | null
}
const AboutSection = ({ version, renderSectionHeader }: AboutSectionProps) => {
	return (
		<div>
			{renderSectionHeader("about")}
			<Section>
				<div className="flex px-4 flex-col gap-2">
					<h2 className="text-lg font-semibold">Catalina v{version}</h2>
					<p>
						Un asistente de IA que puede usar tu CLI y tu editor. Catalina puede gestionar tareas complejas de
						desarrollo de software paso a paso con herramientas que le permiten crear y editar archivos, explorar
						proyectos grandes, usar el navegador y ejecutar comandos del terminal (después de que le concedas
						permiso).
					</p>
				</div>
			</Section>
		</div>
	)
}

export default AboutSection
