import * as fs from "fs/promises";
import * as vscode from "vscode";
import { getFileMentionFromPath } from "@/core/mentions";
import { getActiveAddToInputSubscriptionCount } from "@/core/controller/ui/subscribeToAddToInput";
import { sanitizeCellForLLM } from "@/integrations/misc/notebook-utils";
import { ExtensionRegistryInfo } from "@/registry";
import { CommandContext } from "@/shared/proto/index.cline";
import { Logger } from "@/shared/services/Logger";
import { Controller } from "../../core/controller";
import { WebviewProvider } from "../../core/webview";
import { convertVscodeDiagnostics } from "./hostbridge/workspace/getDiagnostics";

/**
 * Finds the notebook cell that contains the selected text and returns its JSON representation
 * @param filePath Path to the .ipynb file
 * @param notebookCell The cell index from the active notebook editor
 * @returns JSON string of the matching cell, or null if no match found
 */
export async function findMatchingNotebookCell(
	filePath: string,
	notebookCell?: number,
): Promise<string | null> {
	try {
		// Read the notebook file directly
		const notebookContent = await fs.readFile(filePath, "utf8");
		const notebook = JSON.parse(notebookContent);

		if (!notebook.cells || !Array.isArray(notebook.cells)) {
			Logger.log("Invalid notebook structure: no cells array found");
			return null;
		}

		Logger.log(`Loaded notebook with ${notebook.cells.length} cells`);

		if (
			typeof notebookCell === "number" &&
			notebookCell >= 0 &&
			notebookCell < notebook.cells.length
		) {
			Logger.log(`Using provided notebook cell number ${notebookCell}`);
			// Get a reference to the specific cell object
			const cellToProcess = notebook.cells[notebookCell];

			// Sanitize the cell outputs (truncate images, keep text outputs)
			return sanitizeCellForLLM(cellToProcess);
		}

		Logger.log("No valid notebook cell number provided");
		return null;
	} catch (error) {
		Logger.error("Error in findMatchingNotebookCell:", error);
		return null;
	}
}

/**
 * Gets the context needed for VSCode commands that interact with the editor
 * @param range Optional range to use instead of current selection
 * @param vscodeDiagnostics Optional diagnostics to include
 * @returns Context object with controller, selected text, file info, and problems
 */
export async function getContextForCommand(
	range?: vscode.Range,
	vscodeDiagnostics?: vscode.Diagnostic[],
	options?: {
		/**
		 * When true, the editor keeps focus when showing the sidebar webview.
		 * Use this for non-interruptive flows (e.g. copy terminal output to Cline).
		 */
		preserveEditorFocus?: boolean;
	},
): Promise<
	| undefined
	| {
			controller: Controller;
			commandContext: CommandContext;
	  }
> {
	const activeWebview = await showWebview(
		options?.preserveEditorFocus ?? false,
	);
	// Use the controller from the active instance
	const controller = activeWebview.controller;

	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		// Fallback for notebooks with no cells (no text editor active)
		const activeNotebook = vscode.window.activeNotebookEditor;
		if (!activeNotebook) {
			return;
		}
		const filePath = activeNotebook.notebook.uri.fsPath;
		const diagnostics = convertVscodeDiagnostics(vscodeDiagnostics || []);
		return {
			controller,
			commandContext: { selectedText: "", filePath, diagnostics, language: "" },
		};
	}
	// Use provided range if available, otherwise use current selection
	// (vscode command passes an argument in the first param by default, so we need to ensure it's a Range object)
	const textRange = range instanceof vscode.Range ? range : editor.selection;
	const selectedText = editor.document.getText(textRange);

	const filePath = editor.document.uri.fsPath;
	const language = editor.document.languageId;
	const diagnostics = convertVscodeDiagnostics(vscodeDiagnostics || []);
	const commandContext: CommandContext = {
		selectedText,
		filePath,
		diagnostics,
		language,
	};

	return { controller, commandContext };
}

/**
 * Resolves the list of resources selected in the Explorer context menu.
 * VS Code passes the clicked resource as the first argument and the full
 * multi-selection (when several items are selected) as the second.
 */
export function getUrisFromCommandArgs(
	clickedUri?: vscode.Uri,
	selectedUris?: vscode.Uri[],
): vscode.Uri[] {
	if (Array.isArray(selectedUris) && selectedUris.length > 0) {
		return selectedUris.filter((uri) => uri instanceof vscode.Uri);
	}
	return clickedUri instanceof vscode.Uri ? [clickedUri] : [];
}

/**
 * Waits until at least one webview is listening for addToInput events, so a
 * host-initiated insert is not dropped when the panel was just opened.
 */
export async function waitForChatInputSubscriber(
	timeoutMs = 4000,
	intervalMs = 100,
): Promise<void> {
	const start = Date.now();
	while (
		getActiveAddToInputSubscriptionCount() === 0 &&
		Date.now() - start < timeoutMs
	) {
		await new Promise((resolve) => setTimeout(resolve, intervalMs));
	}
}

async function walkDirectory(
	uri: vscode.Uri,
	out: vscode.Uri[],
): Promise<void> {
	let entries: [string, vscode.FileType][];
	try {
		entries = await vscode.workspace.fs.readDirectory(uri);
	} catch {
		return;
	}
	for (const [name, type] of entries) {
		if (type === vscode.FileType.Directory) {
			await walkDirectory(vscode.Uri.joinPath(uri, name), out);
		} else if (type === vscode.FileType.File) {
			out.push(vscode.Uri.joinPath(uri, name));
		}
	}
}

/**
 * Expands the given resources into a flat, deduplicated, sorted list of files.
 * Folders are walked recursively (excluding common build/vcs directories).
 */
export async function collectFilesFromUris(
	uris: vscode.Uri[],
): Promise<vscode.Uri[]> {
	const collected: vscode.Uri[] = [];
	for (const uri of uris) {
		let stat: vscode.FileStat;
		try {
			stat = await vscode.workspace.fs.stat(uri);
		} catch {
			continue;
		}
		if (stat.type === vscode.FileType.Directory) {
			await walkDirectory(uri, collected);
		} else if (stat.type === vscode.FileType.File) {
			collected.push(uri);
		}
	}

	const seen = new Set<string>();
	const deduped: vscode.Uri[] = [];
	for (const uri of collected) {
		if (seen.has(uri.fsPath)) {
			continue;
		}
		seen.add(uri.fsPath);
		deduped.push(uri);
	}
	deduped.sort((a, b) => a.fsPath.localeCompare(b.fsPath));
	return deduped;
}

interface FilePickItem extends vscode.QuickPickItem {
	uri: vscode.Uri;
}

/**
 * Resolves which files to add to the chat from an Explorer selection.
 * A single file is returned directly; folders (or multiple resources) are
 * expanded and presented in a multi-select QuickPick (all pre-selected) so the
 * user can deselect the files they don't want. Returns undefined if cancelled.
 */
export async function pickFilesForChat(
	uris: vscode.Uri[],
): Promise<vscode.Uri[] | undefined> {
	const files = await collectFilesFromUris(uris);
	if (files.length <= 1) {
		return files;
	}

	const items: FilePickItem[] = files.map((uri) => ({
		label: vscode.workspace.asRelativePath(uri, false),
		uri,
	}));

	return new Promise<vscode.Uri[] | undefined>((resolve) => {
		const qp = vscode.window.createQuickPick<FilePickItem>();
		qp.title = "Catalina — Archivos a añadir";
		qp.placeholder = "Desmarca los archivos que no quieras añadir";
		qp.canSelectMany = true;
		qp.ignoreFocusOut = true;
		qp.items = items;
		qp.selectedItems = items;

		let settled = false;
		qp.onDidAccept(() => {
			settled = true;
			const chosen = qp.selectedItems.map((i) => i.uri);
			qp.hide();
			resolve(chosen);
		});
		qp.onDidHide(() => {
			qp.dispose();
			if (!settled) {
				resolve(undefined);
			}
		});
		qp.show();
	});
}

/**
 * Builds @-mentions for the given files, grouped by parent folder: one line per
 * folder with that folder's files space-separated. Keeps each file as a real
 * @/path mention (so the model reads it) while avoiding a long, noisy list when
 * many files are added.
 */
export async function buildFileMentionsFromUris(
	uris: vscode.Uri[],
): Promise<string> {
	const byFolder = new Map<string, string[]>();
	for (const uri of uris) {
		const mention = await getFileMentionFromPath(uri.fsPath);
		const relative = mention.replace(/^@\//, "");
		const lastSlash = relative.lastIndexOf("/");
		const folder = lastSlash >= 0 ? relative.slice(0, lastSlash) : "";
		const group = byFolder.get(folder);
		if (group) {
			group.push(mention);
		} else {
			byFolder.set(folder, [mention]);
		}
	}
	return Array.from(byFolder.keys())
		.sort()
		.map((folder) => byFolder.get(folder)!.join(" "))
		.join("\n");
}

export async function showWebview(
	preserveEditorFocus: boolean = true,
): Promise<WebviewProvider> {
	await vscode.commands.executeCommand(
		ExtensionRegistryInfo.commands.FocusChatInput,
		preserveEditorFocus,
	);

	return WebviewProvider.getInstance();
}
