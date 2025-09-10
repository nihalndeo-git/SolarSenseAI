import { Router } from 'express';
import predictionRoutes from './predictionRoutes';

const router = Router();

// API routes
router.use('/', predictionRoutes);

export default router;