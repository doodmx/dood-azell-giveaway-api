const Joi = require("@hapi/joi");
const { process } = require("@hapi/joi/lib/errors");
const ObjectID = require("mongodb").ObjectID;
const { multer, upload } = require('./multer')





async function routes(fastify, options) {
    const urbkUsCollection = fastify.mongo.db.collection("urbk-us-blog");

    fastify.get("/urbk-us-blog", async(request, reply) => {
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
        "/urbk-us-blog", {
            schema: {
                body: Joi.object()
                    .keys({
                        tittle: Joi.string().min(1).max(25).required(),
                        desc: Joi.string().max(300).required(),
                        showDate: Joi.string(),
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
                const { tittle } = requestData;

                const emailExist = await urbkUsCollection.findOne({ tittle });
                if (emailExist) {
                    throw {
                        message: "Ya existe una noticia con ese titulo",
                        status: 400,
                    };
                }
                requestData.status = true;
                requestData.created_at = new Date().toISOString();
                requestData.url = 'https://cdn.veltacorp.com/urbk-us-blog/pipa.jpg';
                const result = await urbkUsCollection.insertOne(requestData);
                return result;
            } catch (error) {
                throw error;
            }
        }
    );

    fastify.put("/urbk-us-blog/:id/:status", async(request, reply) => {
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

    fastify.delete("/urbk-us-blog/:id", async(request, reply) => {
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