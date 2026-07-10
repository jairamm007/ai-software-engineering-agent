export interface ParsedSymbol {
  name: string;
  kind: string;
}

export interface ParsedFileAST {
  path: string;

  imports: string[];

  exports: string[];

  classes: ParsedSymbol[];

  interfaces: ParsedSymbol[];

  functions: ParsedSymbol[];

  enums: ParsedSymbol[];

  types: ParsedSymbol[];
}