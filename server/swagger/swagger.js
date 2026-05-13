import swaggerJsdoc from "swagger-jsdoc";

const options = {
    definition: {
        openapi: "3.0.0",

        info: {
            title: "SafeNET API",
            version: "1.0.0",
            description: "API documentation for SafeNET backend",
        },

        servers: [
            {
                url: "http://localhost:5000",
                description: "Local Development Server",
            },
        ],

        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },

        security: [
            {
                bearerAuth: [],
            },
        ],
    },

    apis: [
        "./routes/*.js",
        "./auth/*.js",
        "./activity/*.js",
        "./breach/*.js",
        "./scan/*.js",
        "./health/*.js",
    ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;