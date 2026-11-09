const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const mathJaxVersion = require.resolve('mathjax-full/js/components/version.js');
const runtimeVersion = path.join(__dirname, 'src/shared/markdown/mathjax-version.ts');

// MathJax's source distribution discovers its version with eval(require/__dirname).
// Metro/Hermes has neither Node module global. Only replace this metadata module;
// preserve Expo's default resolver for the rest of MathJax and the application.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (context.originModulePath.includes(`${path.sep}mathjax-full${path.sep}`)
      && path.resolve(path.dirname(context.originModulePath), moduleName) === mathJaxVersion) {
    return { type: 'sourceFile', filePath: runtimeVersion };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
