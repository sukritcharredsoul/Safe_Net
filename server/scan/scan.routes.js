import multer from 'multer';
import express from 'express'
import authMiddleware from '../middleware/auth.middleware.js'
import checkfile from '../utils/mime.Validation.js'
import { getDomainReportController, getIPReportController, scanFileController, scanUrlController , getUrlReportController} from './scan.controller.js';

const router = express.Router() ;

const upload = multer({dest:'uploads/'})


router.post('/file',upload.single('file'),checkfile,authMiddleware,scanFileController) ;
router.post('/url',authMiddleware,scanUrlController) ;
router.get('/domain',authMiddleware,getDomainReportController) ;
router.get('/ip',authMiddleware,getIPReportController) ;
router.get('/url/report', authMiddleware, getUrlReportController);

export default router ;