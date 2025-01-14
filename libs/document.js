const fs = require('fs').promises;

/**
 * Reads a file and splits its content by newlines.
 * 
 * @param {string} filePath - The path to the file to be read and split by newlines.
 * @returns {Promise<string[]>} A promise that resolves to an array of text lines.
 */
async function parseTextFile(filePath) {
  const text = await fs.readFile(filePath, 'utf-8');
  return [text];
}

module.exports = { parseTextFile }
