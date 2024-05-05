const httpProxy = require("http-proxy");

const createProxyServer = (target, port) => {
  return httpProxy.createProxyServer({ target: target }).listen(port);
};

module.exports = { createProxyServer };
