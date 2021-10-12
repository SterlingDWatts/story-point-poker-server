const { NODE_ENV } = require("../config");
const logger = require("./logger");

const errorHandler = (error, _req, res, _next) => {
  let response;
  if (NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    console.log(error);
    logger.error(error.message);
    response = { message: error.massage, error };
  }
  res.status(500).json(response);
};

module.exports = errorHandler;
