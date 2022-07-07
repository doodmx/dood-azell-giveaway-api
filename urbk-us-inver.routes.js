const Joi = require("@hapi/joi");
const ObjectID = require("mongodb").ObjectID;

async function routes(fastify, options) {
    const urbkUsCollection = fastify.mongo.db.collection("urbk-us");

    fastify.get("/urbk-us", async(request, reply) => {
        try {
            const result = await urbkUsCollection.find().toArray();
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

    fastify.post(
        "/urbk-us", {
            schema: {
                body: Joi.object()
                    .keys({
                        name: Joi.string().min(1).max(250).required(),
                        email: Joi.string().email().required(),
                        phoneNumber: Joi.string().min(10).max(12).required(),
                    })
                    .required(),
            },
            validatorCompiler: ({ schema }) => {
                return (data) => schema.validate(data);
            },
        },
        async(request, reply) => {
            try {
                const requestData = request.body;
                const { email } = requestData;
                if (!email.includes("@"))
                    throw {
                        message: "La dirección de coreo electronico no es valida",
                        status: 400,
                    };
                const emailExist = await urbkUsCollection.findOne({ email });
                if (emailExist) {
                    throw {
                        message: "El correo electronico ya esta registrado, por favor registre otro",
                        status: 400,
                    };
                }
                requestData.status = "prospect";
                requestData.created_at = new Date().toISOString();
                const result = await urbkUsCollection.insertOne(requestData);
                return result;
            } catch (error) {
                throw error;
            }
        }
    );

    fastify.put("/urbk-us/:id/:status", async(request, reply) => {
        try {
            const statusInvest = ["interested", "noInterested"];
            const { id, status } = request.params;
            const existStatus = statusInvest.indexOf(status);
            const existInvest = await urbkUsCollection.findOne({ _id: ObjectID(id) });
            if (!existInvest) {
                throw {
                    message: "No hay registros relacionados con el ID",
                    status: 400,
                };
            }
            if (existStatus < 0) {
                throw {
                    message: "El status no es valido, solo se acepta interested, noInterested",
                    status: 400,
                };
            }
            const updateDoc = {
                $set: {
                    status,
                },
            };
            const result = await urbkUsCollection.updateOne({ _id: ObjectID(id) },
                updateDoc, {
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

    fastify.delete("/urbk-us/:id", async(request, reply) => {
        try {

            const { id } = request.params;
            const existInvest = await urbkUsCollection.findOne({ _id: ObjectID(id) });
            if (!existInvest) {
                throw {
                    message: "No hay registros relacionados con el ID",
                    status: 400,
                };
            }
            const result = await urbkUsCollection.deleteOne({ _id: ObjectID(id) });
            if (!result) {
                throw new Error("Invalid value");
            }
            return result;
        } catch (error) {
            throw error;
        }
    });
}

module.exports = routes;