const { OpenAI } = require("openai");

/**
 * Calls the OpenAI chat API and streams the response back to the provided callback function.
 * @param {string} query - The user's query or input to be sent to the OpenAI API.
 * @param {string} systemPrompt - The system prompt or context that guides the model's behavior.
 * @param {function} cb - A callback function that handles the streamed response. It receives two arguments:
 *                        - `content`: The partial content received from the stream.
 *                        - `error`: An error object if an error occurs during the API call (optional).
 * @returns {Promise<string>} - A promise that resolves to the full content of the response once the stream is complete.
 * @throws {Error} - Throws an error if the OpenAI API call fails.
 */
async function chat(query, systemPrompt, cb) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  let fullContent = "";

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query }
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      fullContent += content;
      cb(content);
    }

    // Callback with "DONE" when the stream is finished
    cb("|DONE|");
    // Print the full content at the end of the stream
    console.log("Full Content:", fullContent);
    return fullContent;
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    cb(null, error);
  }
}
module.exports = chat;
