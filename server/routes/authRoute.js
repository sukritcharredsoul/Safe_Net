import { Router } from "express";
import signUpController from '../controllers/registration-controllers/signUpController.js'
import forgotPassController from '../controllers/registration-controllers/forgotPassController.js'
import loginController from '../controllers/registration-controllers/loginController.js'

const router = Router() ;

router.use("/auth/signup",signUpController) ;
router.use("/auth/login",loginController) ;
router.use("/auth/forgotPassword",forgotPassController) ;


export default router ;