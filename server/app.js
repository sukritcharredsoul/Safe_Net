import express from "express";
import fs from 'fs'
import routeIndex from './routes/routeIndex.js';
import cors from 'cors'
import morgan from 'morgan' ;
import helmet from 'helmet' ;
// Swagger Imports
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger/swagger.js";
import {limiter} from "./utils/rate.limiting.js";

// import helmet from 'helmet'

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(helmet({
    contentSecurityPolicy : false
})) ;


app.use(morgan("combined", {
  stream : fs.createWriteStream('./logs/access.log',{flags : 'a'})
})) ;
app.use(express.json());
app.use(limiter) ;

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