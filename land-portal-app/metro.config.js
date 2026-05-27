const path = require("path");

// Use only this app's Babel config (ignore parent repo babel.config.js).
process.env.BABEL_CONFIG = path.join(__dirname, "babel.config.js");

const { getDefaultConfig } = require("expo/metro-config");

module.exports = getDefaultConfig(__dirname);
