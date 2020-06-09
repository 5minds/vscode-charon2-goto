import {
  DefinitionProvider,
  TextDocument,
  Position,
  CancellationToken,
  ProviderResult,
  Definition,
  DefinitionLink,
  Range,
  Uri,
  LocationLink,
  CompletionItem,
  CompletionItemKind,
} from 'vscode';

type ItemDefinition = {
  itemName: string;
  filename: string;
  lineNo: number;
  column: number;
};

type ItemDefinitionRegistry = {
  [name: string]: ItemDefinition;
};

export default class AbstractDefinitionProvider implements DefinitionProvider {
  private registry: ItemDefinitionRegistry = {};

  private finderRegex: RegExp;
  private finderRegexMatchIndex: number;
  private finderRegexMatchIndexAlternative: number;

  private completionRegex?: RegExp;
  private completionRegexMatchIndex?: number;
  private completionRegexMatchIndexAlternative?: number;

  constructor(
    finderRegex: RegExp,
    finderRegexIdentifierMatchIndex: number,
    finderRegexIdentifierMatchIndexAlternative: number,
    completionRegex?: RegExp,
    completionRegexIdentifierMatchIndex?: number,
    completionRegexIdentifierMatchIndexAlternative?: number
  ) {
    this.finderRegex = finderRegex;
    this.finderRegexMatchIndex = finderRegexIdentifierMatchIndex;
    this.finderRegexMatchIndexAlternative = finderRegexIdentifierMatchIndexAlternative;

    this.completionRegex = completionRegex;
    this.completionRegexMatchIndex = completionRegexIdentifierMatchIndex;
    this.completionRegexMatchIndexAlternative = completionRegexIdentifierMatchIndexAlternative;
  }

  clear() {
    this.registry = {};
  }

  clearForFilename(filename: string) {
    Object.values(this.registry).forEach((itemDefinition: ItemDefinition) => {
      if (itemDefinition.filename === filename && this.registry[itemDefinition.itemName] != null) {
        delete this.registry[itemDefinition.itemName];
      }
    });
  }

  registerItemDefinition(identifier: string, item: any) {
    this.registry[identifier] = item;
  }

  provideDefinition(
    document: TextDocument,
    position: Position,
    token: CancellationToken
  ): ProviderResult<Definition | DefinitionLink[]> {
    const lineAsString = document.lineAt(position).text;

    // NOTE: we could also iterate over multiple defs here

    const matches = lineAsString.match(this.finderRegex);

    if (matches == null) {
      return [];
    }

    let itemName = matches[this.finderRegexMatchIndex];
    if (itemName == null && this.finderRegexMatchIndexAlternative != null) {
      itemName = matches[this.finderRegexMatchIndexAlternative];
    }

    const indexOfMatch = lineAsString.indexOf(matches[0].toString());
    const startOfMatch = indexOfMatch === -1 ? 0 : indexOfMatch;
    const indexOfItemName = startOfMatch + lineAsString.substr(startOfMatch).indexOf(itemName);
    const startOfItemName = indexOfItemName === -1 ? 0 : indexOfItemName;
    const endOfItemName = startOfItemName + itemName.length;

    if (position.character < startOfItemName || position.character > endOfItemName) {
      return [];
    }

    const originSelectionRange = new Range(position.line, startOfItemName, position.line, endOfItemName);

    const itemDefinition = this.registry[itemName];

    if (itemDefinition == null) {
      return [];
    }

    const uri = Uri.parse(itemDefinition.filename);
    const targetRange = new Range(
      itemDefinition.lineNo,
      itemDefinition.column,
      itemDefinition.lineNo,
      itemDefinition.column + itemDefinition.itemName.length
    );
    const locationLink: LocationLink = {
      originSelectionRange: originSelectionRange,
      targetUri: uri,
      targetRange: targetRange,
      targetSelectionRange: targetRange,
    };

    return [locationLink];
  }

  provideCompletionItems(document: TextDocument, position: Position) {
    // get all text until the `position` and check if it reads `console.`
    // and iff so then complete if `log`, `warn`, and `error`
    // let linePrefix =
    if (this.completionRegex == null || this.completionRegexMatchIndex == null) {
      return [];
    }

    // const matches = linePrefix.match(this.completionRegex);

    const lineUpToCursor = document.lineAt(position).text.substr(0, position.character);

    // NOTE: we could also iterate over multiple defs here

    const matches = lineUpToCursor.match(this.completionRegex);
    console.log(matches);

    if (matches == null) {
      return [];
    }

    let partialItemName = matches[this.completionRegexMatchIndex];
    if (partialItemName == null && this.completionRegexMatchIndexAlternative != null) {
      partialItemName = matches[this.completionRegexMatchIndexAlternative];
    }

    const allItemNames = Object.keys(this.registry);
    const candidates = allItemNames.filter((itemName: string) => itemName.startsWith(partialItemName));

    const indexOfMatch = lineUpToCursor.indexOf(matches[0].toString());
    const startOfMatch = indexOfMatch === -1 ? 0 : indexOfMatch;
    const indexOfItemName = startOfMatch + lineUpToCursor.substr(startOfMatch).indexOf(partialItemName);
    const startOfItemName = indexOfItemName === -1 ? 0 : indexOfItemName;
    const endOfItemName = startOfItemName + partialItemName.length;

    let insertRange;
    if (startOfItemName !== endOfItemName) {
      insertRange = new Range(position.line, startOfItemName, position.line, endOfItemName);
    }

    return candidates.map((itemName: string) => {
      const itemDefinition = this.registry[itemName];
      const completionItem = new CompletionItem(itemDefinition.itemName, CompletionItemKind.Value);

      completionItem.range = insertRange;

      return completionItem;
    });
  }
}
