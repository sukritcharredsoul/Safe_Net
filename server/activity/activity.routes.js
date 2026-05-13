import {Router } from 'express'
import {getActivity} from './activity.controller.js' ;
import authMiddleware from '../middleware/auth.middleware.js';

const router = Router() ;

router.get("/recent",authMiddleware,getActivity) ;

export default router ;