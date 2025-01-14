const { OpenAI } = require('openai')

/**
 * Calls a tool using OpenAI's API to process a given prompt.
 *
 * @async
 * @function callToolWithOpenAI
 * @param {string} prompt - The input prompt to be processed by the tool.
 * @param {Tool[]} tools - Tools definition
 * @param {Object} [options={ model: "gpt-3.5-turbo", temperature: 0.7 }] - Options for the OpenAI API call.
 * @param {string} [options.model="gpt-3.5-turbo"] - The model to be used for the API call.
 * @param {number} [options.temperature=0.7] - The temperature setting for the API call, controlling randomness.
 * @returns {Promise<any>} - The response from the tool after processing the prompt.
 * @throws {Error} - Throws an error if the API call or tool processing fails.
 */
async function callToolWithOpenAI(prompt, tools, options = { model: "gpt-4o-mini", temperature: 0.1 }) {
  const { model, temperature } = options;
  const openai = new OpenAI();

  const response = await openai.chat.completions.create({
    model,
    temperature,
    messages: [{ role: "user", content: prompt }],
    tools,
    tool_choice: 'required'
  });

  const toolCall = response.choices[0].message.tool_calls[0];
  const toolName = toolCall.function.name;
  console.log(toolCall)

  try {
    const tool = require(`./tools/${toolName}`);
    if (!tool) {
      throw new Error(`Tool ${toolName} not found.`);
    }
    const toolResponse = await tool.run(JSON.parse(toolCall.function.arguments));
    return toolResponse;
  } catch (error) {
    console.error(`Error loading or executing tool ${toolName}:`, error);
    throw error;
  }
}

module.exports = callToolWithOpenAI
