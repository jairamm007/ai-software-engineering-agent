import ts from "typescript";

import { ParsedFileAST } from "./ast.types.js";

export const parseAST = (
  filePath: string,
  source: string
): ParsedFileAST => {
  const sourceFile =
    ts.createSourceFile(
      filePath,
      source,
      ts.ScriptTarget.Latest,
      true
    );

  const result: ParsedFileAST = {
    path: filePath,

    imports: [],
    exports: [],

    classes: [],
    interfaces: [],
    functions: [],
    enums: [],
    types: [],
  };

  sourceFile.forEachChild((node) => {
    if (
      ts.isImportDeclaration(node)
    ) {
      result.imports.push(
        node.moduleSpecifier
          .getText(sourceFile)
          .replace(/['"]/g, "")
      );
    }

    if (
      ts.isClassDeclaration(node)
    ) {
      result.classes.push({
        name:
          node.name?.text ??
          "anonymous",

        kind: "class",
      });
    }

    if (
      ts.isFunctionDeclaration(node)
    ) {
      result.functions.push({
        name:
          node.name?.text ??
          "anonymous",

        kind: "function",
      });
    }

    if (
      ts.isInterfaceDeclaration(node)
    ) {
      result.interfaces.push({
        name: node.name.text,

        kind: "interface",
      });
    }

    if (
      ts.isEnumDeclaration(node)
    ) {
      result.enums.push({
        name: node.name.text,

        kind: "enum",
      });
    }

    if (
      ts.isTypeAliasDeclaration(node)
    ) {
      result.types.push({
        name: node.name.text,

        kind: "type",
      });
    }

    const declaration = node as ts.Declaration & {
  modifiers?: readonly ts.Modifier[];
  name?: ts.Identifier;
};

if (
  declaration.modifiers?.some(
    (modifier: ts.Modifier) =>
      modifier.kind ===
      ts.SyntaxKind.ExportKeyword
  )
) {
  if (declaration.name) {
    result.exports.push(
      declaration.name.text
    );
  }
}

});

  return result;
};