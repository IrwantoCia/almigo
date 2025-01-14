const order = require('../../../models/order')

/**
 * Represents a function that retrieves order details by order ID.
 * @namespace get_order
 */
const get_order = {
  /**
   * Definition of the function.
   * @type {object}
   * @property {string} type - The type of the object, which is "function".
   * @property {object} function - The function definition.
   * @property {string} function.name - The name of the function.
   * @property {string} function.description - The description of the function.
   * @property {object} function.parameters - The parameters of the function.
   * @property {object} function.parameters.properties - The properties of the parameters.
   * @property {object} function.parameters.properties.order_id - The order ID parameter.
   * @property {string} function.parameters.properties.order_id.type - The type of the order ID parameter.
   * @property {string} function.parameters.properties.order_id.description - The description of the order ID parameter.
   * @property {string[]} function.parameters.required - The required parameters.
   */
  def: {
    type: "function",
    function: {
      name: "get_order",
      description: "Retrieves the details of an order by its ID.",
      parameters: {
        type: "object",
        properties: {
          order_id: {
            type: "string",
            description: "The ID of the order to retrieve."
          }
        },
        required: ["order_id"]
      }
    }
  },
  /**
   * Runs the function to retrieve order details by order ID.
   * @param {object} params - The parameters for the function.
   * @param {string} params.order_id - The ID of the order to retrieve.
   * @returns {object} - The order details or an error message if the order is not found.
   */
  run: async function(params) {
    const orderDetails = await order.read({ id: params.order_id });
    if (orderDetails.data.length === 0) {
      return "Order not found.";
    }
    return JSON.stringify(orderDetails.data);
  }
};

module.exports = get_order;
