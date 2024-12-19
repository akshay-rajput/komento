// The module 'vscode' contains the VS Code extensibility API
import * as vscode from "vscode";
import { extractFunction } from "./utils/parseFunction";
import { getGeneratedJSDoc } from "./api/generateJSDoc";

// This method is called when your extension is activated
// extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  // The command has been defined in the package.json file
  const disposable = vscode.commands.registerCommand(
    "komento.generateJSDocComments",
    async () => {
      const editor = vscode.window.activeTextEditor;

      // if there's no editor open, skip as there's nothing to do
      if (!editor) {
        return;
      }

      // get the function to use for generation
      const functionToUse = extractFunction();
      if (functionToUse && functionToUse.fullString) {
        vscode.window.showInformationMessage(
          `🔵 Generating JSDoc comments for: "${functionToUse?.name}"`
        );

        // get response from ai
        try {
          const generatedJSDoc = await getGeneratedJSDoc(functionToUse.fullString);
          // console.log("generatedJSDoc: ", generatedJSDoc);
          if(generatedJSDoc) {
            vscode.window.showInformationMessage(
              `✅ Generated JSDoc comments for: "${functionToUse?.name}"`
            );
          } else {
            vscode.window.showInformationMessage(
              `❕Received empty response for JSDoc generation for function: "${functionToUse?.name}"`
            );
          }
        } catch (error) {
          console.log("Error generating jsdoc - ", error);
          vscode.window.showInformationMessage(
            `❌ Something went wrong when generating comment for: "${functionToUse?.name}"`
          );
        }
      }
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
