import { Router } from "express";

import { checkEmail } from "./breach.controller.js";
const router = Router() ;
router.get("/breach",checkEmail) ;


export default router ;