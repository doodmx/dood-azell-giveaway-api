const Joi = require("@hapi/joi");
const ObjectID = require("mongodb").ObjectID;

async function routes(fastify, options) {
  const investCollection = fastify.mongo.db.collection("invest");

  fastify.get("/", async (request, reply) => {
    return { hello: "world" };
  });

  fastify.get("/invest", async (request, reply) => {
    try {
      const result = await investCollection.find().toArray();
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
      const existInvest = await investCollection.findOne({ _id: ObjectID(id) });
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
      const result = await investCollection.updateOne(
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

  fastify.post(
    "/invest",
    {
      schema: {
        body: Joi.object()
          .keys({
            name: Joi.string().min(1).max(250).required(),
            email: Joi.string().email().required(),
            phoneNumber: Joi.string().min(10).max(12).required(),
            possibleInvestment: Joi.string(),
          })
          .required(),
      },
      validatorCompiler: ({ schema }) => {
        return (data) => schema.validate(data);
      },
    },
    async (request, reply) => {
      try {
        const invest = request.body;
        const { email } = invest;
        if (!email.includes("@"))
          throw {
            message: "La dirección de coreo electronico no es valida",
            status: 400,
          };
        const emailExist = await investCollection.findOne({ email });
        if (emailExist) {
          throw {
            message:
              "El correo electronico ya esta registrado, por favor registre otro",
            status: 400,
          };
        }
        invest.status = "prospect";
        invest.created_at = new Date().toISOString();
        const result = await investCollection.insertOne(invest);
        return result;
      } catch (error) {
        throw error;
      }
    }
  );
}

module.exports = routes;
