// The module 'vscode' contains the VS Code extensibility API
import * as vscode from "vscode";
import { extractFunction } from "./utils/parseFunction";
import { getGeneratedJSDoc } from "./api/generateJSDoc";
import { insertJSDocBeforeFunction } from "./utils/updateEditorFile";

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
        vscode.window.showInformationMessage(
          `❕An open editor is needed to run this command.`
        );
        return;
      }

      const language = editor.document.languageId;

      if (language !== "javascript" && language !== "typescript") {
        vscode.window.showErrorMessage(
          "😳 This command is only available for JavaScript/TypeScript files."
        );
        return;
      }

      // get the function to use for generation
      const functionToUse = extractFunction();
      if (functionToUse && functionToUse.fullString) {
        // example help progress api -> https://github.com/microsoft/vscode-extension-samples/blob/main/progress-sample
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: `🔵 Generating JSDoc comments ${
              functionToUse?.name ? "for: " + functionToUse?.name : ""
            }`,
            cancellable: false,
          },
          async (progress) => {
            progress.report({ increment: 0 });

            // get response from ai
            try {
              // console.log("functionToUse: ", functionToUse);

              const generatedJSDoc = await getGeneratedJSDoc(
                functionToUse.fullString
              );

              if (generatedJSDoc) {
                // insert in document
                await insertJSDocBeforeFunction(
                  functionToUse.cursorPosition,
                  editor,
                  generatedJSDoc
                );

                vscode.window.showInformationMessage(
                  `✅ Generated JSDoc comments ${
                    functionToUse?.name ? "for: " + functionToUse?.name : ""
                  }`
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
        );
      }
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
