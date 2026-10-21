const express = require('express');
const router = express.Router();
const { requireAuth } = require('../controllers/authController');
const {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification
} = require('../controllers/notificationController');

router.get('/', requireAuth, getNotifications);                                // GET      http://localhost:5000/api/notifications?unread=true&limit=50
router.patch('/read-all', requireAuth, markAllNotificationsRead);              // PATCH    http://localhost:5000/api/notifications/read-all
router.patch('/:notification_id/read', requireAuth, markNotificationRead);     // PATCH    http://localhost:5000/api/notifications/12/read
router.delete('/:notification_id', requireAuth, deleteNotification);           // DELETE   http://localhost:5000/api/notifications/12

module.exports = router;
