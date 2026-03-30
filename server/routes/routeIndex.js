import { Router } from 'express';
import healthRoute from './healthRoute.js' ;
import authRoute from './authRoute.js' ;
import securityRoute from './securityRoute.js' ;

// Route Endpoint

const router = Router() ;

router.use('/v1/auth',authRoute) ;
router.use('/v1/health',healthRoute) ;
router.use('/v1/security',securityRoute) ;


export default router ;

