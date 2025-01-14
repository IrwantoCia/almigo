/**
 * Represents a function that prints a greeting message with the provided name.
 * @namespace get_weather
 */
const get_weather = {
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
      name: "get_weather",
      description: "Retrieves the weather information for the provided country.",
      parameters: {
        type: "object",
        properties: {
          country: {
            type: "string",
            description: "The country for which to retrieve the weather information."
          }
        },
        required: ["country"]
      }
    }
  },
  /**
   * Runs the function to retrieve a greeting message based on the provided country.
   * @param {object} params - The parameters for the function.
   * @param {string} params.country - The country for which to retrieve the greeting message. Supported countries are Indonesia and India.
   * @returns {string} - The greeting message or an error message if the country is not supported.
   */
  run: async function(params) {
    if (params.country !== "Indonesia" && params.country !== "India") {
      return "Unsupported country. Only Indonesia and India are supported.";
    }

    let response;
    if (params.country === "India") {
      response = 'accha';
    } else if (params.country === "Indonesia") {
      response = 'anjayyyy';
    }

    return response;
  }
}

module.exports = get_weather;
