import ts from "typescript";

export type extractedFunction = {
  name: string;
  fullString: string;
  cursorPosition: number;
  startPosition?: number;
};

export type FunctionWithStartPosition = {
  start: number;
  node: ts.Node | null;
}

export type GenerateCommentsRequestBody = { functionCode: string };