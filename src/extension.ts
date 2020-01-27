// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import CommandDefinitionProvider from './CommandDefinitionProvider';
import AbstractDefinitionProvider from './AbstractDefinitionProvider';
import IconDefinitionProvider from './IconDefinitionProvider';
import MenuDefinitionProvider from './MenuDefinitionProvider';

type AbstractDefinitionProviderMap = { [name: string]: AbstractDefinitionProvider };

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const registries: AbstractDefinitionProviderMap = {
    commands: new CommandDefinitionProvider(),
    menus: new MenuDefinitionProvider(),
    icons: new IconDefinitionProvider()
  };

  // NOTE: For even more convenience, we could implement DefinitionProvider classes for
  //
  //   * Settings (see `settings.registerDefaults()`)
  //   * ActivityBarItems
  //   * MenuBarItems
  //   * StatusBarItems
  //   * Panes (see `activityBar.toggleActivity()`)
  //
  findItemDefinitionsInWorkspace(registries);

  vscode.languages.registerDefinitionProvider(['markdown', 'typescript', 'typescriptreact'], registries.commands);
  vscode.languages.registerDefinitionProvider(['markdown', 'typescript', 'typescriptreact'], registries.menus);
  vscode.languages.registerDefinitionProvider(['markdown', 'typescript', 'typescriptreact'], registries.icons);
}

// this method is called when your extension is deactivated
export function deactivate() {}

const GLOB_SOURCES = '**/*.{ts,tsx}';

const FINDERS = {
  commands: {
    regex: /(\.registerCommand\(\s*|\.registerInternalCommand\(\s*)((\')([^\']+)(\')|(\")([^\"]+)(\"))/gim,
    matchIndex: 4
  },
  icons: {
    regex: /((\')([^\']+\ [^\']+)(\')|(\")([^\"]+\ [^\"]+)(\"))\:\s+(\(\s+\<svg|\<svg|(\')([^\']+)(\')|(\")([^\"]+)(\"))/gim,
    matchIndex: 3
  },
  menus: {
    regex: /(\.registerMenu\(\s*)((\')([^\']+)(\')|(\")([^\"]+)(\"))/gim,
    matchIndex: 4
  }
};

function findItemDefinitionsInWorkspace(registries: AbstractDefinitionProviderMap) {
  vscode.workspace.findFiles(GLOB_SOURCES, '**/node_modules/**/*.ts').then((res) => {
    const filenames = res.map((uri) => uri.fsPath).filter((filename: string) => filename.match(/\.d\.ts$/) == null);

    filenames.forEach((filename: string) => findItemDefinitionsInFile(filename, registries));
  });

  const watcher = vscode.workspace.createFileSystemWatcher(GLOB_SOURCES);
  watcher.onDidChange((uri: vscode.Uri) => findItemDefinitionsInFile(uri.fsPath, registries));
  watcher.onDidCreate((uri: vscode.Uri) => findItemDefinitionsInFile(uri.fsPath, registries));
  watcher.onDidDelete((uri: vscode.Uri) => findItemDefinitionsInFile(uri.fsPath, registries));
}

function findItemDefinitionsInFile(filename: string, registries: AbstractDefinitionProviderMap) {
  if (filename.match(/\/node_modules\//) != null) {
    return;
  }

  fs.readFile(filename, function(err, data) {
    if (err) throw err;

    const text = data.toString();

    Object.keys(FINDERS).forEach((type: string) => {
      const { regex, matchIndex } = FINDERS[type];
      const registry = registries[type];

      registry.clearForFilename(filename);

      findItemsInText(text, filename, registry, regex, matchIndex);
    });
  });
}

function findItemsInText(text, filename, registry, regex, matchIndex) {
  let match;

  while ((match = regex.exec(text)) != null) {
    const itemName = match[matchIndex].toString();

    const lineBeforeItemName = match[0].substr(0, match[0].indexOf(itemName));
    const lineBreaksInsideMatchBeforeItemName = lineBeforeItemName.split('\n').length - 1;
    const linesTilHere = text.substr(0, match.index).split('\n');
    const lineNo = linesTilHere.length - 1 + lineBreaksInsideMatchBeforeItemName;
    const column = text.split('\n')[lineNo].indexOf(itemName);

    registry.registerItemDefinition(itemName, { filename, lineNo, column, itemName });
  }
}
