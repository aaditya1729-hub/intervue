function logInfo(message, meta) {
  if (meta) console.log(`[INFO] ${message}`, meta);
  else console.log(`[INFO] ${message}`);
}

function logWarn(message, meta) {
  if (meta) console.warn(`[WARN] ${message}`, meta);
  else console.warn(`[WARN] ${message}`);
}

function logError(message, meta) {
  if (meta) console.error(`[ERROR] ${message}`, meta);
  else console.error(`[ERROR] ${message}`);
}

module.exports = { logInfo, logWarn, logError };