/**
 * Represents a function that prints a greeting message with the provided name.
 * @namespace print_hello_world
 */
const print_hello_world = {
  /**
   * Definition of the function.
   * @type {object}
   * @property {string} type - The type of the object, which is "function".
   * @property {object} function - The function definition.
   * @property {string} function.name - The name of the function.
   * @property {string} function.description - The description of the function.
   * @property {object} function.parameters - The parameters of the function.
   * @property {object} function.parameters.properties - The properties of the parameters.
   * @property {object} function.parameters.properties.name - The name parameter.
   * @property {string} function.parameters.properties.name.type - The type of the name parameter.
   * @property {string} function.parameters.properties.name.description - The description of the name parameter.
   * @property {string[]} function.parameters.required - The required parameters.
   */
  def: {
    type: "function",
    function: {
      name: "print_hello_world",
      description: "Prints a greeting message with the provided name.",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "The name to include in the greeting message."
          }
        },
        required: ["name"]
      }
    }
  },
  /**
   * Executes the function to print a greeting message.
   * @function run
   * @param {object} params - The parameters for the function.
   * @param {string} params.name - The name to include in the greeting message.
   * @returns {Promise<string>} A promise that resolves to the greeting message.
   */
  run: async function(params) {
    const response = `Print a greeting message for the name: ${params.name}`;
    return response;
  }
};

module.exports = print_hello_world;
