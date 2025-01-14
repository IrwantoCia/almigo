const { OpenAI } = require('openai');

/**
 * Generates an embedding for the given text using OpenAI's text-embedding-3-large model.
 * 
 * @async
 * @function embed
 * @param {string} text - The input text to generate an embedding for.
 * @returns {Promise<Array<number>>} A promise that resolves to an array of numbers representing the embedding.
 * @throws {Error} If the OpenAI API request fails or if the API key is missing.
 */
async function embed(text) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await openai.embeddings.create({
    input: text,
    model: "text-embedding-3-large"
  });
  return response.data[0].embedding;
}

module.exports = embed;
