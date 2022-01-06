const Joi = require("@hapi/joi");
const ObjectID = require("mongodb").ObjectID;
async function routes(fastify, options) {
  const creditCardCollection = fastify.mongo.db.collection("credit-card");

  fastify.get("/credit-card", async (request, reply) => {
    try {
      const result = await creditCardCollection.find().toArray();
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

  fastify.put("/credit-card/:id/:status", async (request, reply) => {
    try {
      const statusInvest = ["interested", "noInterested"];
      const { id, status } = request.params;
      const existStatus = statusInvest.indexOf(status);
      const existInvest = await creditCardCollection.findOne({
        _id: ObjectID(id),
      });
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
      const result = await creditCardCollection.updateOne(
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
    "/credit-card",
    {
      schema: {
        body: Joi.object()
          .keys({
            name: Joi.string().min(1).max(250).required(),
            lastName: Joi.string().min(1).max(250).required(),
            email: Joi.string().email().required(),
            phoneNumber: Joi.string().min(10).max(12).required(),
          })
          .required(),
      },
      validatorCompiler: ({ schema }) => {
        return (data) => schema.validate(data);
      },
    },
    async (request, reply) => {
      try {
        const prospect = request.body;
        const { email, name, lastName } = prospect;
        prospect.name = `${name} ${lastName}`;
        if (!email.includes("@"))
          throw {
            message: "La dirección de coreo electronico no es valida",
            status: 400,
          };

        const emailExist = await creditCardCollection.findOne({ email });
        if (emailExist) {
          throw {
            message:
              "El correo electronico ya esta registrado, por favor registre otro",
            status: 400,
          };
        }
        prospect.status = "prospect";
        prospect.created_at = new Date().toISOString();
        const result = await creditCardCollection.insertOne(prospect);
        return result;
      } catch (error) {
        throw error;
      }
    }
  );
}
function getCurrentDate() {
  try {
    let current = new Date();
    let cDate =
      current.getFullYear() +
      "-" +
      (current.getMonth() + 1) +
      "-" +
      current.getDate();
    let cTime =
      current.getHours() +
      ":" +
      current.getMinutes() +
      ":" +
      current.getSeconds();
    let dateTime = cDate + " " + cTime;
    return new Date(dateTime);
  } catch (error) {}
}

module.exports = routes;
