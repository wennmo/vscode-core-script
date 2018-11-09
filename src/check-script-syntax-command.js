const {
  window, commands, languages, Range, Position, Diagnostic, DiagnosticSeverity,
} = require('vscode');
const { checkScriptSyntax } = require('./communication');

const diagnosticCollection = languages.createDiagnosticCollection('QVS');

exports.checkScriptSyntaxCommand = commands.registerCommand('extension.checkScriptSyntax', async () => {
  const editor = window.activeTextEditor;
  const script = editor._documentData._lines.join('\r\n');
  const uri = editor._documentData._uri;

  const diagnostics = [];
  diagnosticCollection.clear();

  const errors = await checkScriptSyntax(script);

  if (errors.length > 0) {
    window.showErrorMessage(`Found errors!: ${JSON.stringify(errors)}`);
  } else {
    window.showInformationMessage('No script errors found!');
  }

  errors.forEach((error) => {
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
