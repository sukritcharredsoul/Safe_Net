
import express from "express" ;
import healthController from './healthController.js' ;

const router = express.Router() ;

router.get("/health",healthController) ;


export default router ;