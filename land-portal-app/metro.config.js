const path = require("path");

const projectRoot = __dirname;

// Isolate this app from the parent repo (fixes babel-preset-expo / Metro on Windows).
process.env.BABEL_CONFIG = path.join(projectRoot, "babel.config.js");
process.env.EXPO_NO_METRO_WORKSPACE_ROOT = "1";

const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(projectRoot);

// Only resolve modules from this app (not parent landd/node_modules).
config.watchFolders = [projectRoot];
config.resolver.nodeModulesPaths = [path.join(projectRoot, "node_modules")];

module.exports = config;
