// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const { checkScriptSyntaxCommand } = require('./check-script-syntax-command');
const { validateModel } = require('./validate-model-command');
const { getDocTree } = require('./docs');
const { getScript, addDoc, update } = require('./app-handling');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
  context.subscriptions.push(getDocTree);
  context.subscriptions.push(checkScriptSyntaxCommand);
  context.subscriptions.push(validateModel);
  context.subscriptions.push(getScript);
  context.subscriptions.push(update);
  context.subscriptions.push(addDoc);
}

exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
