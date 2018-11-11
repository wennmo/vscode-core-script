const WebSocket = require('ws');
const net = require('net');
const { window, workspace } = require('vscode');
const enigma = require('enigma.js');
const schema = require('enigma.js/schemas/12.170.2.json');

function isReachable(port, opts) {
  return new Promise(((resolve) => {
    const socket = new net.Socket();
    const onError = (e) => {
      socket.destroy();
      window.showErrorMessage(`Unable to connect to the Qlik Associative Engine: ${e}`);
      resolve(false);
    };
    socket.setTimeout(1000);
    socket.on('error', onError);
    socket.on('timeout', onError);
    socket.connect(port, opts.host, () => {
      socket.end();
      resolve(true);
    });
  }));
}

function getConfig() {
  const conf = workspace.getConfiguration('engine');
  return {
    host: conf.get('host'),
    port: conf.get('port'),
  };
}

exports.checkScriptSyntax = async function checkScriptSyntax(script) {
  const config = getConfig();
  const alive = await isReachable(config.port, { host: config.host });
  if (alive === true) {
    const session = enigma.create({
      schema,
      url: `ws://${config.host}:${config.port}/app/engineData/`,
      createSocket: url => new WebSocket(url),
    });

    const qix = await session.open();
    const app = await qix.createSessionApp();
    await app.setScript(script);
    const errors = await app.checkScriptSyntax();
    session.close();
    return errors;
  }
  return [];
};

exports.reloadScriptSessionApp = async function reloadScriptSessionApp(script) {
  const config = getConfig();
  const alive = await isReachable(config.port, { host: config.host });

  if (alive === true) {
    const url = `ws://${config.host}:${config.port}/app/engineData/identity/${+new Date()}`;
    const session = enigma.create({
      schema,
      url,
      createSocket: () => new WebSocket(url),
    });

    const qix = await session.open();
    const app = await qix.createSessionApp();
    await app.setScript(script);
    const result = await app.doReload();

    if (!result) {
      window.showErrorMessage('Failed to reload app');
    }

    return url;
  }

  return '';
};

exports.getEngineVersion = async function getEngineVersion() {
  const config = getConfig();
  const alive = await isReachable(config.port, { host: config.host });

  if (alive === true) {
    const url = `ws://${config.host}:${config.port}/app/engineData/identity/${+new Date()}`;
    const session = enigma.create({
      schema,
      url,
      createSocket: () => new WebSocket(url),
    });

    const qix = await session.open();
    const result = await qix.engineVersion();
    session.close();
    return result.qComponentVersion;
  }

  return '';
};

exports.getConfig = getConfig;
