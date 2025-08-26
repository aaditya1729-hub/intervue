const { v4: uuidv4 } = require('uuid');

function generateId(prefix = '') {
  const id = uuidv4();
  return prefix ? `${prefix}_${id}` : id;
}

module.exports = { generateId };