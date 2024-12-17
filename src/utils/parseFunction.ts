import * as vscode from "vscode";
import * as ts from "typescript";
import { extractedFunction } from "../types/functionTypes";

// Extract the function near the cursor or from the currently selected text.
export function extractFunction(): extractedFunction | null {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("No active editor found.");
    return null;
  }

  const document = editor.document;
  const selection = editor.selection;

  // full code of editor and cursor position
  const codeOfFile = document.getText();
  const cursorOffset = document.offsetAt(selection.active);
  const selectedText = selection.isEmpty ? null : document.getText(selection);

  // Parse the code into Abstract Syntax Tree to get function node
  const sourceFile = ts.createSourceFile(
    document.fileName,
    codeOfFile,
    ts.ScriptTarget.Latest,
    true, // preserve comments
  );

  // get function node near the cursor or the selection
  const functionText = findFunctionNode(
    sourceFile,
    cursorOffset,
    selectedText,
    codeOfFile
  );

  if (!functionText) {
    vscode.window.showInformationMessage(
      "No function found at the current position."
    );
    return null;
  }

  return functionText;
}

function findFunctionNode(
  node: ts.Node,
  cursorOffset: number,
  selectedText: string | null,
  code: string
): extractedFunction | null {
  let functionResult: extractedFunction | null = null;

  function visit(node: ts.Node) {
    // if already found function, exit recursion
    if (functionResult) {
      return;
    }

    // check if node is a kind of function
    if (
      ts.isFunctionDeclaration(node) ||
      ts.isArrowFunction(node) ||
      ts.isFunctionExpression(node) ||
      ts.isMethodDeclaration(node)
    ) {
      const { pos, end, name } = node;
      const functionText = code.slice(pos, end).trim(); // get function string from editor using node position

      if (selectedText) {
        // if function text includes selected text, return the function
        if (functionText.includes(selectedText)) {
          functionResult = {
            name: name?.getText() || '',
            fullString: functionText,
          };
        }
      } else {
        // return the function which encloses the cursor position
        if (cursorOffset >= pos && cursorOffset <= end) {
          // functionResult = functionText;
          functionResult = {
            name: name?.getText() || '',
            fullString: functionText,
          };
        }
      }
    }

    // Visit child nodes
    ts.forEachChild(node, visit);
  }

  visit(node);
  return functionResult;
}
