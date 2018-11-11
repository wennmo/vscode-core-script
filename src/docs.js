const vscode = require("vscode");
const path = require("path");
const { getConfig, getEngineVersion } = require("./communication")

class Docs {
  constructor() {
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
  }

  getTreeItem(element) {
    return element;
  }

  async getChildren(element) {
    if (!element) {
      const engine = getConfig();
      const version = await getEngineVersion();
      const label = `${engine.host}:${engine.port} (${version})`;
      const item = new Engine(label, vscode.TreeItemCollapsibleState.Collapsed);
      return [item];
    } else {
      const doc1 = new Doc('Should be a doc1', vscode.TreeItemCollapsibleState.None);
      const doc2 = new Doc('Should be a doc2', vscode.TreeItemCollapsibleState.None);
      const doc3 = new Doc('Should be a doc3', vscode.TreeItemCollapsibleState.None);

      return [doc1, doc2, doc3];
    }

  }
}
exports.Docs = Docs;

class Engine extends vscode.TreeItem {
  constructor(label, collapsibleState, command) {
    super(label, collapsibleState);
    this.label = label;
    this.collapsibleState = collapsibleState;
    this.command = command;
    this.iconPath = {
      light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
      dark: path.join(__filename, '..', '..', 'resources', 'dark', 'server-solid.svg')
    };
    this.contextValue = 'engine';
  }
}

class Doc extends vscode.TreeItem {
  constructor(label, collapsibleState, command) {
    super(label, collapsibleState);
    this.label = label;
    this.collapsibleState = collapsibleState;
    this.command = command;
    this.iconPath = {
      light: path.join(__filename, '..', '..', 'resources', 'light', 'document.svg'),
      dark: path.join(__filename, '..', '..', 'resources', 'dark', 'document.svg')
    };
    this.contextValue = 'app';
  }
  get tooltip() {
    return `Insert info about the app`;
  }
}
