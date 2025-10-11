// Expo Metro configuration with custom symbolicator to avoid noisy ENOENT logs
// for Hermes-internal frames like "InternalBytecode.js" on Windows.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.symbolicator = {
  customizeFrame: (frame) => {
    try {
      const file = frame && frame.file ? String(frame.file) : '';
      if (/InternalBytecode\.js$/i.test(file)) {
        // Collapse Hermes internal frames so Metro doesn't try to read a codeframe
        return { ...frame, collapse: true };
      }
    } catch {}
    return frame;
  },
  customizeStack: (stack) => stack,
};

module.exports = config;
