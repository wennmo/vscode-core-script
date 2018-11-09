const WebSocket = require('ws');
const net = require("net");
const { window, workspace } = require('vscode');
const enigma = require('enigma.js');
const schema = require('enigma.js/schemas/12.170.2.json');

function isReachable(port, opts) {
  opts = Object.assign({ timeout: 1000 }, opts);
  return new Promise((resolve => {
    const socket = new net.Socket();
    const onError = (e) => {
      socket.destroy();
      window.showErrorMessage('Unable to connect to the Qlik Associative Engine.');
      resolve(false);
    };
    socket.setTimeout(opts.timeout);
    socket.on('error', onError);
    socket.on('timeout', onError);
    socket.connect(port, opts.host, () => {
      socket.end();
      resolve(true);
    });
  }));
}

exports.checkScriptSyntax = async function checkScriptSyntax(script) {
  const conf = workspace.getConfiguration("engine");
  const host = conf.get("host");
  const port = conf.get("port");

  const alive = await isReachable(port, { host });
  if (alive === true) {

    const session = enigma.create({
      schema,
      url: `ws://${host}:${port}/app/engineData/`,
      createSocket: url => new WebSocket(url),
    });

    //session.on("traffic:*", (direction, data) => console.log("session", direction, JSON.stringify(data)));
    const qix = await session.open();
    const app = await qix.createSessionApp();
    await app.setScript(script);
    const errors = await app.checkScriptSyntax();
    session.close();

    errors.length > 0 ? window.showErrorMessage(`Found errors!: ${JSON.stringify(errors)}`) : window.showInformationMessage(`No script errors found!`);
    return errors;
  }
  return [];
}
