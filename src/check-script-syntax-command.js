const { window, commands, languages, Range, Position, Diagnostic, DiagnosticSeverity } = require('vscode');
const { checkScriptSyntax} = require("./communication")

let diagnosticCollection = languages.createDiagnosticCollection("QVS");

exports.checkScriptSyntaxCommand = commands.registerCommand('extension.checkScriptSyntax', async function () {
  // The code you place here will be executed every time your command is executed

  const editor = window.activeTextEditor;
  const script = editor._documentData._lines.join('\r\n');
  const uri = editor._documentData._uri;

  let diagnostics = [];
  diagnosticCollection.clear();


  // Display a message box to the user
  const errors = await checkScriptSyntax(script);

  errors.forEach(error => {
    if (!error.qSecondaryFailure) {
      const start = new Position(error.qLineInTab, error.qColInLine);
      const end = new Position(error.qLineInTab, error.qColInLine + error.qErrLen);

      const range = new Range(start, end);
      const message = `Syntax error: ${JSON.stringify(error)}`;

      diagnostics.push(new Diagnostic(range, message, DiagnosticSeverity.Error));
    }
  });

  diagnosticCollection.set(uri, diagnostics);
});
