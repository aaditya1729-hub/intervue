const fs = require('fs');
const path = require('path');
const config = require('../config');

function ensureDataDir() {
  const dir = path.resolve(process.cwd(), config.dataDir);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function getPollFile(pollId) {
  const dir = ensureDataDir();
  return path.join(dir, `poll-${pollId}.json`);
}

function appendQuestionHistory(pollId, record) {
  const file = getPollFile(pollId);
  let data = [];
  if (fs.existsSync(file)) {
    try {
      const raw = fs.readFileSync(file, 'utf8');
      data = JSON.parse(raw);
    } catch {}
  }
  data.push(record);
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

function readHistory(pollId) {
  const file = getPollFile(pollId);
  if (!fs.existsSync(file)) return [];
  try {
    const raw = fs.readFileSync(file, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

module.exports = { appendQuestionHistory, readHistory, ensureDataDir };