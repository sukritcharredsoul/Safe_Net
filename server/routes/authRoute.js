import { Router } from "express";
import { forgotPassword, login, signUp } from '../controllers/registration-controllers/authController.js' ;
const router = Router() ;

router.use("/auth/signup",signUp) ;
router.use("/auth/login",login) ;
router.use("/auth/forgotPassword",forgotPassword) ;


export default router ;