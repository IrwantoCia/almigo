require('dotenv').config()

const { Pinecone } = require('@pinecone-database/pinecone');

// Initialize a Pinecone client with your API key
const pc = new Pinecone({ apiKey: process.env.PINECONE });

/**
 * @typedef {Object} Vector
 * @property {string} id - The unique identifier for the vector.
 * @property {number[]} values - The vector values.
 * @property {Object} [metadata] - Optional metadata associated with the vector.
 */

/**
 * Creates a new index in Pinecone.
 * @param {string} indexName - The name of the index to create.
 * @param {number} dimension - The dimension of the vectors to be stored in the index.
 * @param {string} [metric='cosine'] - The distance metric to use (e.g., 'cosine', 'euclidean').
 * @returns {Promise<void>}
 */
async function createIndex(indexName, dimension, metric = 'cosine') {
  try {
    await pc.createIndex({
      name: indexName,
      dimension,
      metric,
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-east-1'
        }
      }
    });
    console.log(`Index "${indexName}" created successfully.`);
  } catch (error) {
    console.error(`Failed to create index "${indexName}":`, error);
  }
}

/**
 * Vectorizes the input data.
 * @param {string[]} data - The input data to be vectorized.
 * @returns {Promise<Vector[]>} - The vectorized data with metadata.
 */
async function vectorized(data) {
  const vectorizedData = await Promise.all(data.map(async (text, index) => {
    const vector = await require('../vendors/openai/embedding')(text);
    return {
      id: `vector-${index}`,
      values: vector,
      metadata: { text }
    };
  }));
  return vectorizedData;
}

/**
 * Upserts vectors into the specified index.
 * @param {string} indexName - The name of the index to upsert vectors into.
 * @param {Vector[]} vectors - An array of vectors to upsert.
 * @returns {Promise<void>}
 */
async function upsert(indexName, vectors) {
  try {
    const index = pc.index(indexName);
    await index.upsert(vectors);
    console.log(`Vectors upserted successfully into index "${indexName}".`);
  } catch (error) {
    console.error(`Failed to upsert vectors into index "${indexName}":`, error);
  }
}

/**
 * Queries the specified index with a vector.
 * @param {string} indexName - The name of the index to query.
 * @param {number[]} vector - The query vector.
 * @param {number} topK - The number of top results to return.
 * @returns {Promise<Vector[]>} - An array of the topK closest vectors.
 */
async function query(indexName, vector, topK) {
  try {
    const index = pc.index(indexName);
    const queryResponse = await index.query({
      vector,
      topK,
      includeMetadata: true,
    });
    return queryResponse.matches;
  } catch (error) {
    console.error(`Failed to query index "${indexName}":`, error);
    return [];
  }
}

/**
 * Deletes an existing index in Pinecone.
 * @param {string} indexName - The name of the index to delete.
 * @returns {Promise<void>}
 */
async function deleteIndex(indexName) {
  try {
    await pc.deleteIndex(indexName);
    console.log(`Index "${indexName}" deleted successfully.`);
  } catch (error) {
    console.error(`Failed to delete index "${indexName}":`, error);
  }
}

module.exports = {
  createIndex,
  vectorized,
  upsert,
  query,
  deleteIndex
};
