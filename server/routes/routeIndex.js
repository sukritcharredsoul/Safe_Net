import { Router } from 'express';

import healthRoute from '../health/healthRoute.js';
import authRoute from '../auth/auth.routes.js';
import breachRoute from '../breach/breach.routes.js';
import activityRoute from '../activity/activity.routes.js';
import scanRoute from '../scan/scan.routes.js';

// Route Endpoint
const router = Router();

router.use('/v1',authRoute) ;
router.use('/v1',healthRoute) ;
router.use('/v1',breachRoute) ;
router.use('/v1',activityRoute) ;
router.use('/v1',scanRoute) ;

export default router;