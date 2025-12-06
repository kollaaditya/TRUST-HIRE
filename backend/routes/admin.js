import express from 'express';
import { addToBlacklist, getBlacklistedUsers, removeFromBlacklist } from '../controllers/adminController.js';

const router = express.Router();

router.post('/blacklist', addToBlacklist);
router.get('/blacklist', getBlacklistedUsers);
router.delete('/blacklist/:mobile', removeFromBlacklist);

export default router;