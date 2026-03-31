import { Router } from "express";
import { forgotPassword, login, signUp , verifyEmail } from '../controllers/registration-controllers/authController.js' ;
const router = Router() ;

router.post("/auth/signup",signUp) ;
router.post("/auth/login",login) ;
router.post("/auth/forgotPassword",forgotPassword) ;
router.get("/auth/verify-email/:token",verifyEmail) ;


export default router ;