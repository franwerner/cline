import { Empty } from "@shared/proto/cline/common";
import { ResetStateRequest } from "@shared/proto/cline/state";
import {
	resetGlobalState,
	resetWorkspaceState,
} from "@/core/storage/utils/state-helpers";
import { HostProvider } from "@/hosts/host-provider";
import { ShowMessageType } from "@/shared/proto/host/window";
import { Logger } from "@/shared/services/Logger";
import { Controller } from "..";
import { sendChatButtonClickedEvent } from "../ui/subscribeToChatButtonClicked";

/**
 * Resets the extension state to its defaults
 * @param controller The controller instance
 * @param request The reset state request containing the global flag
 * @returns An empty response
 */
export async function resetState(
	controller: Controller,
	request: ResetStateRequest,
): Promise<Empty> {
	try {
		if (request.global) {
			HostProvider.window.showMessage({
				type: ShowMessageType.INFORMATION,
				message: "Restableciendo el estado global...",
			});
			await resetGlobalState();
		} else {
			HostProvider.window.showMessage({
				type: ShowMessageType.INFORMATION,
				message: "Restableciendo el estado del espacio de trabajo...",
			});
			await resetWorkspaceState();
		}

		if (controller.task) {
			controller.task.abortTask();
			controller.task = undefined;
		}

		HostProvider.window.showMessage({
			type: ShowMessageType.INFORMATION,
			message: "Estado restablecido",
		});
		await controller.postStateToWebview();

		await sendChatButtonClickedEvent();

		return Empty.create();
	} catch (error) {
		Logger.error("Error resetting state:", error);
		HostProvider.window.showMessage({
			type: ShowMessageType.ERROR,
			message: `No se ha podido restablecer el estado: ${error instanceof Error ? error.message : String(error)}`,
		});
		throw error;
	}
}
