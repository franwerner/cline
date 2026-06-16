import { SVGProps } from "react"
import type { Environment } from "../../../src/shared/config-types"
import { getEnvironmentColor } from "../utils/environmentColors"

/**
 * Catalina logo (chat bubble) with automatic theme adaptation and
 * environment-based color indicators (local/staging/production).
 */
const ClineLogoVariable = (props: SVGProps<SVGSVGElement> & { environment?: Environment }) => {
	const { environment, ...svgProps } = props

	const fillColor = environment ? getEnvironmentColor(environment) : "var(--vscode-icon-foreground)"

	return (
		<svg fill="none" height="50" viewBox="0 0 16 16" width="50" xmlns="http://www.w3.org/2000/svg" {...svgProps}>
			<path
				d="M8 1C4.134 1 1 3.806 1 7.25c0 1.857.87 3.52 2.25 4.67V14l2.625-1.313C6.545 12.885 7.258 13 8 13c3.866 0 7-2.806 7-5.75S11.866 1 8 1z"
				fill={fillColor}
			/>
		</svg>
	)
}
export default ClineLogoVariable
