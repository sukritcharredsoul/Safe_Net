import express from "express";
import routeIndex from './routes/routeIndex.js';

// Swagger Imports
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger/swagger.js";

// import helmet from 'helmet'

const app = express();

// app.use(helmet()) ;
app.use(express.json());

/**
 * @swagger
 * /:
 *   get:
 *     summary: Health check root endpoint
 *     tags: [Root]
 *     responses:
 *       200:
 *         description: Server is running successfully
 */
app.get("/", (req, res) => {
    res.send("everything works !!");
});

// Swagger Documentation Route
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);

app.use("/api", routeIndex);

export default app;