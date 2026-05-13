import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware.js";
import { checkEmail } from "./breach.controller.js";
const router = Router() ;
router.get("/breach",authMiddleware ,checkEmail) ;


export default router ;