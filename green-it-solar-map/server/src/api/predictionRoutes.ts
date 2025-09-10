import { Router } from 'express';
import { predictEnergy } from '../controllers/predictionController';

const router = Router();

router.post('/predict-energy', predictEnergy);

export default router;