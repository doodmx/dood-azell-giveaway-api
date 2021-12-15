// Require the framework and instantiate it
const fastify = require("fastify")({ logger: true });
require("dotenv").config();

fastify.register(require("./dbConnector"));
fastify.register(require("./routes"));
// Run the server!
fastify.listen(process.env.PORT || 3000, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
