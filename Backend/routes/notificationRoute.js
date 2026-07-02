const express = require('express');
const { getUserNotifications, markAllAsRead } = require('../controllers/notificationController');

const router = express.Router();

router.get('/notifications/:userId', getUserNotifications);
router.put('/notifications/:userId/read', markAllAsRead);

module.exports = router;
