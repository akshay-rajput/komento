// The module 'vscode' contains the VS Code extensibility API
import * as vscode from "vscode";
import { extractFunction } from "./utils/parseFunction";

// This method is called when your extension is activated
// extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // This line of code will only be executed once when your extension is activated
  console.log('"komento" is now active!');

  // The command has been defined in the package.json file
  const disposable = vscode.commands.registerCommand(
    "komento.generateJSDocComments",
    () => {
      const editor = vscode.window.activeTextEditor;

      // if there's no editor open, skip as there's nothing to do
      if (!editor) {
        return;
      }

			// get the function to use for generation
			let functionToUse = extractFunction();
			if(functionToUse) {
				console.log("functionToUse: ", functionToUse?.name);
				vscode.window.showInformationMessage(
          `Generating JSDoc comments for: ${functionToUse?.name}`
        );

				// get response from ai
				
			}
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
