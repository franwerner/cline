import { VSCodeDropdown, VSCodeOption } from "@vscode/webview-ui-toolkit/react"
import React from "react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { updateSetting } from "./utils/settingsHandlers"

const PreferredLanguageSetting: React.FC = () => {
	const { preferredLanguage } = useExtensionState()

	const handleLanguageChange = (newLanguage: string) => {
		updateSetting("preferredLanguage", newLanguage)
	}

	return (
		<div style={{}}>
			<label className="block mb-1 text-base font-medium" htmlFor="preferred-language-dropdown">
				Idioma preferido
			</label>
			<VSCodeDropdown
				currentValue={preferredLanguage || "English"}
				id="preferred-language-dropdown"
				onChange={(e: any) => {
					handleLanguageChange(e.target.value)
				}}
				style={{ width: "100%" }}>
				<VSCodeOption value="English">Inglés - English</VSCodeOption>
				<VSCodeOption value="Arabic - العربية">Árabe - العربية</VSCodeOption>
				<VSCodeOption value="Portuguese - Português (Brasil)">Portugués - Português (Brasil)</VSCodeOption>
				<VSCodeOption value="Czech - Čeština">Checo - Čeština</VSCodeOption>
				<VSCodeOption value="French - Français">Francés - Français</VSCodeOption>
				<VSCodeOption value="German - Deutsch">Alemán - Deutsch</VSCodeOption>
				<VSCodeOption value="Hindi - हिन्दी">Hindi - हिन्दी</VSCodeOption>
				<VSCodeOption value="Hungarian - Magyar">Húngaro - Magyar</VSCodeOption>
				<VSCodeOption value="Italian - Italiano">Italiano - Italiano</VSCodeOption>
				<VSCodeOption value="Japanese - 日本語">Japonés - 日本語</VSCodeOption>
				<VSCodeOption value="Korean - 한국어">Coreano - 한국어</VSCodeOption>
				<VSCodeOption value="Polish - Polski">Polaco - Polski</VSCodeOption>
				<VSCodeOption value="Portuguese - Português (Portugal)">Portugués - Português (Portugal)</VSCodeOption>
				<VSCodeOption value="Russian - Русский">Ruso - Русский</VSCodeOption>
				<VSCodeOption value="Simplified Chinese - 简体中文">Chino simplificado - 简体中文</VSCodeOption>
				<VSCodeOption value="Spanish - Español">Español - Español</VSCodeOption>
				<VSCodeOption value="Traditional Chinese - 繁體中文">Chino tradicional - 繁體中文</VSCodeOption>
				<VSCodeOption value="Turkish - Türkçe">Turco - Türkçe</VSCodeOption>
			</VSCodeDropdown>
			<p className="text-sm text-description mt-1">El idioma que Catalina debe usar para comunicarse.</p>
		</div>
	)
}

export default React.memo(PreferredLanguageSetting)
