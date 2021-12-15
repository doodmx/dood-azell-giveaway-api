// Require the framework and instantiate it
const fastify = require("fastify")({ logger: true });
require("dotenv").config();

fastify.register(require("./dbConnector"));
fastify.register(require("./routes"));
// Run the server!
const start = async () => {
  try {
    const PORT = process.PORT || 3000;
    console.log(PORT);
    await fastify.listen(PORT);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
