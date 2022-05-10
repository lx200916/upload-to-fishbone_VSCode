// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
//@ts-ignore
import { create } from "./lib";
import * as vscode from "vscode";
import { PasteType, render } from "./panel/webview";
enum BurnType {
  BurnAfterRead,
  OneDay,
  OneWeek,
}
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "upload-to-fishbone" is now active!'
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "upload-to-fishbone.create_paste",
    async (url: vscode.Uri) => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      // const editor = vscode.window.activeTextEditor;
      const workspace = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
      if (workspace) {
        let stat;
        try {
          stat = url ? await vscode.workspace.fs.stat(url) : null;
        } catch (e) {
          vscode.window.showErrorMessage(
            "🤯 Select contents and use `Create Paste Snippet` if not in a workspace!"
          );
          return;
        }
        console.log(stat);
        if (stat && stat.type === 1) {
          let content = await vscode.workspace.fs.readFile(url);
          console.log(content.toString());
          try {
            const lang = (await vscode.workspace.openTextDocument(url))
              .languageId;
            // render(context.extensionUri, {
            //   content: content.toString(),
            //   language: lang ? lang : "plaintext",
            //   type: PasteType.private,
            // });
			showPick(content.toString(), lang,context);

          } catch (e) {
            vscode.window.showErrorMessage("🤯 Unsupported file type!");
          }
        }
      } else {
        vscode.window.showErrorMessage(
          "🤯 Select contents and use `Create Paste Snippet` if not in a workspace!"
        );
      }
    }
  );

  context.subscriptions.push(disposable);
  let disposable1 = vscode.commands.registerCommand(
    "upload-to-fishbone.create_paste_snippet",
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const document = editor.document;
        const selection = editor.selection;
        const text = document.getText(selection);
        console.log(text);
        const lang = editor.document.languageId;
		showPick(text, lang,context);
      }
    }
  );

  context.subscriptions.push(disposable1);
}
function showPick(text: string,lang: string,context: vscode.ExtensionContext) {
	let step = 1;

	const quickPick = vscode.window.createQuickPick();
	quickPick.step = 1;
	quickPick.totalSteps = 2;

	// quickPick.onDidTriggerButton(e => {
	// 	if (e === vscode.QuickInputButtons.Back) {
	// 		step--;}
	// 	});
	quickPick.onDidChangeSelection(async (e) => {
	  console.log(e);
	  if (e[0].label === "Create Private Paste") {
		quickPick.step = 1;
		quickPick.totalSteps = 2;
		step++;

		const input = vscode.window.createInputBox();
		input.step = step;
		input.totalSteps = 2;
		input.prompt = "Input Paste Password";
		input.onDidAccept(async (e) => {
		  if (input.value) {
			console.log(input.value);
			input.dispose();
			let info = await create(text, input.value, {
			  hasDeleteToken: true,
			  lang: lang,
			  type: BurnType.BurnAfterRead,
			});
			let result = await vscode.window.showInformationMessage(
			  `✅ Paste created!\nID: ${info.id}\n ${
				info["deleteToken"] === undefined
				  ? ""
				  : "deleteToken:" + info["deleteToken"]
			  } \n URL: https://bone.saltedfish.fun/${info.id}\n`,
			  "Open In Browser",
			  "Copy URL"
			);
			if (result === "Open In Browser") {
			  vscode.env.openExternal(
				vscode.Uri.parse(`https://bone.saltedfish.fun/${info.id}`)
			  );
			} else if (result === "Copy URL") {
			  vscode.env.clipboard.writeText(
				`https://bone.saltedfish.fun/${info.id}`
			  );
			}
		  }
		});
		input.buttons = [vscode.QuickInputButtons.Back];
		input.onDidTriggerButton((e) => {
		  if (e === vscode.QuickInputButtons.Back) {
			quickPick.show();
		  }
		});
		// quickPick.hide();
		input.show();
	  } else if (e[0].label === "Create Public Paste") {
		console.log(e);
		quickPick.dispose();
		let info = await create(text, "", {
			hasDeleteToken: true,
			lang: lang,
			type: BurnType.BurnAfterRead,
		  });
		  let result = await vscode.window.showInformationMessage(
			`✅ Paste created!\nID: ${info.id}\n ${
			  info["deleteToken"] === undefined
				? ""
				: "deleteToken:" + info["deleteToken"]
			} \n URL: https://bone.saltedfish.fun/${info.id}\n`,
			"Open In Browser",
			"Copy URL"
		  );
		  if (result === "Open In Browser") {
			vscode.env.openExternal(
			  vscode.Uri.parse(`https://bone.saltedfish.fun/${info.id}`)
			);
		  } else if (result === "Copy URL") {
			vscode.env.clipboard.writeText(
			  `https://bone.saltedfish.fun/${info.id}`
			);
		  }
	  } else {
		render(context.extensionUri, {
		  content: text,
		  language: lang ? lang : "plaintext",
		  type: PasteType.public,
		});
		quickPick.dispose();
	  }
	});

	quickPick.items = [
	  { label: "Create Private Paste" },
	  { label: "Create Public Paste" },
	  { label: "Advance Paste", detail: "Show more detailed Options." },
	];
	quickPick.onDidChangeSelection((e) => {
	  console.log(e);
	});

	quickPick.onDidHide(() => {
	  quickPick.dispose();
	});
	quickPick.show();
}

// this method is called when your extension is deactivated
export function deactivate() {}
