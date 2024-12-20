import * as vscode from "vscode";
import * as ts from "typescript";
import {
  extractedFunction,
  FunctionWithStartPosition,
} from "../types/functionTypes";

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
    true // preserve comments
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
      "No valid function found at the current position to generate JSDoc comment."
    );
    return null;
  }

  return functionText;
}

export function findFunctionNode(
  node: ts.Node,
  cursorOffset: number,
  selectedText: string | null,
  code: string
): extractedFunction | null {
  let functionResult: extractedFunction | null = null;

  function visit(node: ts.Node) {
    // if already found function, exit recursion - gets top-level function
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
      const start = node.getStart();
      const functionText = code.slice(pos, end).trim(); // get function string from editor using node position

      if (selectedText) {
        // if function text includes selected text, return the function
        if (functionText.includes(selectedText)) {
          functionResult = {
            name: name?.getText() || "",
            fullString: functionText,
            cursorPosition: cursorOffset,
            startPosition: start,
          };
        }
      } else {
        // return the function which encloses the cursor position
        if (cursorOffset >= pos && cursorOffset <= end) {
          // functionResult = functionText;
          functionResult = {
            name: name?.getText() || "",
            fullString: functionText,
            cursorPosition: cursorOffset,
            startPosition: start,
          };
        }
      }
    }

    if (
      ts.isVariableDeclaration(node) &&
      node.initializer &&
      ts.isArrowFunction(node.initializer)
    ) {
      const start = node.getStart(); // variable declaration start
      const end = node.getEnd(); // end is same as arrow function
      const { pos, name } = node;
      const functionText = code.slice(pos, end).trim();

      if (cursorOffset >= start && cursorOffset <= end) {
        functionResult = {
          name: name?.getText() || "",
          fullString: functionText,
          cursorPosition: cursorOffset,
          startPosition: start,
        };
      }
    }

    // Visit child nodes
    ts.forEachChild(node, visit);
  }

  visit(node);

  return functionResult;
}

export function findClosestTopLevelFunctionNode(
  codeOfFile: string,
  cursorPosition: number
): FunctionWithStartPosition {
  const sourceFile = ts.createSourceFile(
    `temp_file`,
    codeOfFile,
    ts.ScriptTarget.Latest,
    true // preserve comments
  );

  let closestFunction:
    | ts.FunctionDeclaration
    | ts.FunctionExpression
    | ts.ArrowFunction
    | ts.MethodDeclaration
    | null = null;
  let closestFunctionStart: number = -1;

  // recursive find
  const findNode = (node: ts.Node) => {
    // if node is kind of function
    if (
      ts.isFunctionDeclaration(node) ||
      ts.isFunctionExpression(node) ||
      ts.isMethodDeclaration(node) ||
      ts.isArrowFunction(node)
    ) {
      // only top-level functions
      if (node.parent && ts.isSourceFile(node.parent)) {
        const start = node.getStart();
        const end = node.getEnd();

        if (cursorPosition >= start && cursorPosition <= end) {
          closestFunction = node;
          closestFunctionStart = start;
        }
      }

      // distance to start of function node
      // const distance = Math.abs(cursorPosition - start);

      // Update the closest function if this one is nearer to cursor
      // if (cursorPosition >= start && cursorPosition <= end ) {
      //   closestFunction = node;
      //   closestDistance = distance;
      // }
    }

    // Handle arrow functions inside variable declarations
    if (
      ts.isVariableDeclaration(node) &&
      node.initializer &&
      ts.isArrowFunction(node.initializer)
    ) {
      const start = node.getStart(); // variable declaration start
      const end = node.initializer.getEnd();

      if (cursorPosition >= start && cursorPosition <= end) {
        closestFunction = node.initializer;
        closestFunctionStart = start;
      }
    }
    // Recursively visit children - returns if matching node found or if no child to check
    ts.forEachChild(node, findNode);
  };

  findNode(sourceFile);

  return { start: closestFunctionStart, node: closestFunction };
}
