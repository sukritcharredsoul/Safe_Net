import express from "express";
import routeIndex from './routes/routeIndex.js' 
import helmet from 'helmet'


const app = express() ;
app.use(helmet()) ;
app.use(express.json()) ;


app.get("/",(req,res) => {
    res.send("everything works !!") ;
})

app.use("/api",routeIndex) ;



export default app ;
