import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import * as playerController from '../controllers/player.controller.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

router.get('/player/:id', playerController.getPlayer);
router.put('/player/:id', playerController.updatePlayer);

export default router;