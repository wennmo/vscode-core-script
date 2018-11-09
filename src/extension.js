// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const { window, StatusBarAlignment, commands, languages, Range, Diagnostic, DiagnosticSeverity } = require('vscode');
const { checkScriptSyntax } = require("./check-script-syntax")

let nbrScriptErrors = 0;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

  const scriptErrors = window.createStatusBarItem(StatusBarAlignment.Right, 100);

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = commands.registerCommand('extension.checkScriptSyntax', async function () {
    // The code you place here will be executed every time your command is executed

    const editor = window.activeTextEditor;
    const script = editor._documentData._lines.join('\r\n');
    const uri = editor._documentData._uri;

    let diagnosticCollection = languages.createDiagnosticCollection("QVS");
    let diagnostics = [];
    
    const range = new Range(0, 1);
    const message = 'The human-readable message.';

    diagnostics.push(new Diagnostic(range, message, DiagnosticSeverity.Warning));
    diagnosticCollection.set(uri, diagnostics);

    // Display a message box to the user
    window.showInformationMessage('Lets check the script');
    const errors = await checkScriptSyntax(script);
    nbrScriptErrors = errors.length;
    updateStatus(scriptErrors);
  });

  context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;

function updateStatus(status) {
	let errors = nbrScriptErrors;
	if (errors) {
		status.text = `$(megaphone) Number of script errors: ${errors}`;
	}

	if (errors) {
		status.show();
	} else {
		status.hide();
	}
}
