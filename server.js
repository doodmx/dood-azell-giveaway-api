// Require the framework and instantiate it
const fastify = require("fastify")({ logger: true });
require("dotenv").config();
const multer = require('fastify-multer')
    //
fastify.register(require("./dbConnector"));
fastify.register(require("fastify-cors"), {
    // put your options here
});
fastify.register(multer.contentParser)
fastify.register(require("fastify-formbody"));

fastify.register(require("./invest.routes"));
fastify.register(require("./credit-card.routes"));
fastify.register(require("./urbk-us-inver.routes"));
fastify.register(require("./urbk-us-blog.routes"));
// Run the server!
const start = async() => {
    try {
        await fastify.listen(process.env.PORT || 3000, "localhost");
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();