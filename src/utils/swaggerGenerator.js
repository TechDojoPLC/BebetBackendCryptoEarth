const m2s = require("mongoose-to-swagger");
const dbCollections = require("../utils/dbs");

const {
  server: { fullBaseUrl },
} = require("../config");

function getSchemas(collections) {
  const schemas = {};

  for (const [key, value] of Object.entries(collections)) {
    schemas[key] = m2s(value);
  }

  return schemas;
}

function generateSwagger() {
  const swagger = {
    swaggerDefinition: {
      openapi: "3.0.3",
      info: {
        version: "1.0.0",
        title: "APIs Documentation",
      },
      servers: [
        {
          url: `${fullBaseUrl}/api/v1`,
        },
      ],
      components: {
        schemas: getSchemas(dbCollections),
        securitySchemes: {
          bearerAuth: {
            type: "apiKey",
            in: "header",
            name: "authorization",
          },
        },
      },
      security: [
        {
          bearerAuth: ["read", "write"],
        },
      ],
    },
    apis: ["./src/**/**.swagger.js", "./src/**/**.swagger.yaml"],
  };

  return swagger;
}

const swaggerConfig = generateSwagger();

module.exports = swaggerConfig;
