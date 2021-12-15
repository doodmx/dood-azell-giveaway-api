const fastifyPlugin = require("fastify-plugin");
const fastifyMongo = require("fastify-mongodb");

async function dbConnector(fastify, options) {

  const url = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`;
  fastify.register(fastifyMongo, {
    url,
  });
}

// Wrapping a plugin function with fastify-plugin exposes the decorators
// and hooks, declared inside the plugin to the parent scope.
module.exports = fastifyPlugin(dbConnector);
