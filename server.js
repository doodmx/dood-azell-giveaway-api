// Require the framework and instantiate it
const fastify = require("fastify")({ logger: true });
require("dotenv").config();

fastify.register(require("./dbConnector"));
fastify.register(require("./routes"));
// Run the server!
const start = async () => {
  try {
    console.log(process.env.PORT);
    await fastify.listen(process.env.PORT || 3000);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
