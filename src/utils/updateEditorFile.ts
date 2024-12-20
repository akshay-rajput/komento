import * as vscode from "vscode";
import * as ts from "typescript";
import { findFunctionNode } from "./parseFunction";

export async function insertJSDocBeforeFunction(
  cursorPosition: number,
  editor: vscode.TextEditor,
  generatedJSDoc: string
) {
  if (!editor) {
    vscode.window.showErrorMessage("No active editor found.");
    return;
  }

  const document = editor.document;
  const textOfCurrentFile = document.getText();

  // const {node: functionNode, start} = findClosestTopLevelFunctionNode(textOfCurrentFile, cursorPosition);
  const sourceFile = ts.createSourceFile(
    document.fileName,
    textOfCurrentFile,
    ts.ScriptTarget.Latest,
    true // preserve comments
  );

  // use same method to find node as the one used to extract function
  const functionNodeResult = findFunctionNode(
    sourceFile,
    cursorPosition,
    null,
    textOfCurrentFile
  );
  const start = functionNodeResult?.startPosition;

  if (!functionNodeResult?.fullString || !start) {
    vscode.window.showErrorMessage("No function found to add comments.");
    return;
  }

  // Convert the start position of the function to a line number
  const functionStartPos = document.positionAt(start);
  const functionLine = functionStartPos.line;

  // Check if the line above is empty
  const lineAbove =
    functionLine > 0 ? document.lineAt(functionLine - 1).text : null;
  const isLineAboveEmpty = lineAbove !== null && lineAbove.trim() === "";

  let insertionLine = functionLine;

  // final comment that will be added
  let formattedComment = generatedJSDoc;

  // If no empty line exists above, or function is at the top of the document
  if (!isLineAboveEmpty || functionLine === 0) {
    // Insert a blank line above the comment and below (if not already there)
    formattedComment = formattedComment.endsWith("\n")
      ? "\n" + formattedComment
      : "\n" + formattedComment + "\n";
  } else {
    // Use the line above as the insertion point
    insertionLine = functionLine - 1;
    formattedComment = "\n" + generatedJSDoc;
  }

  // insertion position for comments
  const insertionPos = new vscode.Position(insertionLine, 0);

  await editor.edit((editBuilder) => {
    editBuilder.insert(insertionPos, formattedComment);
  });
}
