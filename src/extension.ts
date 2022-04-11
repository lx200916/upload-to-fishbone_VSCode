// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { PasteType, render } from './panel/webview';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "upload-to-fishbone" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('upload-to-fishbone.create_private',async (url:vscode.Uri) =>  {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		// const editor = vscode.window.activeTextEditor;
		const workspace = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
		if (workspace) {
			let stat;
			try {
				 stat = url ? await vscode.workspace.fs.stat(url) : null;
			}catch (e) {
				vscode.window.showErrorMessage('🤯 Select contents and use `Create Paste Snippet` if not in a workspace!');
				return;

			}
			console.log(stat);
			if (stat && stat.type===1) {
			let content=await	vscode.workspace.fs.readFile(url);
			console.log(content.toString());
			try{
				const lang=(await vscode.workspace.openTextDocument(url)).languageId;
				render(context.extensionUri,{
					content:content.toString(),
					language:lang?lang:'plaintext',
					type:PasteType.private,

				});

			}
			catch(e){
				vscode.window.showErrorMessage('🤯 Unsupported file type!');
			}}

		}else{
			vscode.window.showErrorMessage('🤯 Select contents and use `Create Paste Snippet` if not in a workspace!');

		}


	});

	context.subscriptions.push(disposable);
	let disposable1 = vscode.commands.registerCommand('upload-to-fishbone.create_public_snippet', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		const editor = vscode.window.activeTextEditor;
		if (editor){
			const document= editor.document;
			const selection = editor.selection;
			const text = document.getText(selection);
			console.log(text);
			const lang = editor.document.languageId;
		}
	});

	context.subscriptions.push(disposable1);

}

// this method is called when your extension is deactivated
export function deactivate() {}
