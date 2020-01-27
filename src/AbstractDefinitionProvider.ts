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
  LocationLink
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

  constructor(
    finderRegex: RegExp,
    finderRegexIdentifierMatchIndex: number,
    finderRegexIdentifierMatchIndexAlternative: number
  ) {
    this.finderRegex = finderRegex;
    this.finderRegexMatchIndex = finderRegexIdentifierMatchIndex;
    this.finderRegexMatchIndexAlternative = finderRegexIdentifierMatchIndexAlternative;
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
      targetSelectionRange: targetRange
    };

    return [locationLink];
  }
}
