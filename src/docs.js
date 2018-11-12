/* eslint-disable class-methods-use-this */
const {
  TreeItem, EventEmitter, TreeItemCollapsibleState, window, commands,
} = require('vscode');
const path = require('path');
const { getConfig, getEngineVersion, getDocList } = require('./communication');

class Engine extends TreeItem {
  constructor(label, collapsibleState, command) {
    super(label, collapsibleState);
    this.label = label;
    this.collapsibleState = collapsibleState;
    this.command = command;
    this.iconPath = {
      light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
      dark: path.join(__filename, '..', '..', 'resources', 'dark', 'server-solid_.svg'),
    };
    this.contextValue = 'engine';
  }
}

class Doc extends TreeItem {
  constructor(label, doc, collapsibleState, command) {
    super(label, collapsibleState);
    this.label = label;
    this.docId = doc.qDocId;
    this.description = doc.qMeta.description;
    this.collapsibleState = collapsibleState;
    this.command = command;
    this.iconPath = {
      light: path.join(__filename, '..', '..', 'resources', 'qvf.svg'),
      dark: path.join(__filename, '..', '..', 'resources', 'qvf.svg'),
    };
    this.contextValue = 'app';
  }

  get tooltip() {
    return `${this.description}`;
  }
}

class Docs {
  constructor() {
    this._onDidChangeTreeData = new EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
  }

  refresh() {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element) {
    return element;
  }

  async getChildren(element) {
    if (!element) {
      const engine = getConfig();
      const version = await getEngineVersion();
      const label = `${engine.host}:${engine.port} (${version})`;
      const item = new Engine(label, TreeItemCollapsibleState.Collapsed);
      return [item];
    }

    const docs = await getDocList();
    const docsTreeItems = docs.map((doc) => { //eslint-disable-line
      return new Doc(doc.qTitle, doc, TreeItemCollapsibleState.None);
    });

    return docsTreeItems;
  }
}

const docTree = new Docs();

exports.getDocTree = window.registerTreeDataProvider('qlikDocs', docTree);

exports.refresh = commands.registerCommand('qlikDocs.refresh', async () => {
  docTree.refresh();
  window.showInformationMessage('List of available apps was updated');
});
