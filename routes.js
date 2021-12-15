async function routes(fastify, options) {
  const collection = fastify.mongo.db.collection("invest");

  fastify.get("/", async (request, reply) => {
    return { hello: "world" };
  });

  fastify.get("/invest", async (request, reply) => {
    try {
      const result = await collection.find().toArray();
      if (result.length === 0) {
        throw {
          message: "Sin registros",
          status: 400,
        };
      }
      return result;
    } catch (error) {
      throw error;
    }
  });
  /*
  fastify.get("/animals/:animal", async (request, reply) => {
    const result = await collection.findOne({ animal: request.params.animal });
    if (!result) {
      throw new Error("Invalid value");
    }
    return result;
  });*/

  const investBodyJsonSchema = {
    type: "object",
    required: ["name", "email", "phoneNumber"],
    properties: {
      name: { type: "string", minimum: 3, maxLength: 255 },
      email: { type: "string", minimum: 2, maxLength: 255 },
      phoneNumber: { type: "string", minimum: 10, maxLength: 13 },
    },
  };

  const schema = {
    body: investBodyJsonSchema,
  };

  fastify.post("/invest", { schema }, async (request, reply) => {
    try {
      const { email } = request.body;
      if (!email.includes("@"))
        throw {
          message: "La dirección de coreo electronico no es valida",
          status: 400,
        };
      const emailExist = await collection.findOne({ email });
      if (emailExist) {
        throw {
          message:
            "El correo electronico ya esta registrado, por favor registre otro",
          status: 400,
        };
      }
      const result = await collection.insertOne(request.body);
      return result;
    } catch (error) {
      throw error;
    }
  });
}

module.exports = routes;
