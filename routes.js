const ObjectID = require("mongodb").ObjectID;

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

  fastify.put("/invest/:id/:status", async (request, reply) => {
    try {
      const statusInvest = ["interested", "noInterested"];
      const { id, status } = request.params;
      const existStatus = statusInvest.indexOf(status);
      const existInvest = await collection.findOne({ _id: ObjectID(id) });
      if (!existInvest) {
        throw {
          message: "No hay registros relacionados con el ID",
          status: 400,
        };
      }
      if (existStatus < 0) {
        throw {
          message:
            "El status no es valido, solo se acepta interested, noInterested",
          status: 400,
        };
      }
      const updateDoc = {
        $set: {
          status,
        },
      };
      const result = await collection.updateOne(
        { _id: ObjectID(id) },
        updateDoc,
        {
          upsert: true,
        }
      );

      if (!result) {
        throw new Error("Invalid value");
      }
      return result;
    } catch (error) {
      throw error;
    }
  });

  const investBodyJsonSchema = {
    type: "object",
    required: ["name", "email", "phoneNumber"],
    properties: {
      name: { type: "string", minimum: 3, maxLength: 255 },
      email: { type: "string", minimum: 2, maxLength: 255 },
      phoneNumber: { type: "string", minimum: 10, maxLength: 13 },
      possibleInvestment: { type: "string", minimum: 1, maxLength: 20 },
    },
  };

  const schema = {
    body: investBodyJsonSchema,
  };

  fastify.post("/invest", { schema }, async (request, reply) => {
    try {
      const invest = request.body;
      const { email } = invest;
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
      invest.status = "prospect";
      const result = await collection.insertOne(invest);
      return result;
    } catch (error) {
      throw error;
    }
  });
}

module.exports = routes;
