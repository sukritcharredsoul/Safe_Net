import { Router } from "express";
import {fileController} from "../controllers/feature-controllers/fileController.js"


const router = Router() ;


router.use("/file-scan",fileController) ;
router.use("/file-add",fileController) ;
router.use("/file-delete",fileController) ;


export default router ;