import express from "express";
import healthRoute from "./routes/healthRoute.js"

const app = express() ;



app.get("/",(req,res) => {
    res.send("everything works !!") ;
})

app.use("/api/v1/health",healthRoute) ;




export default app ;
