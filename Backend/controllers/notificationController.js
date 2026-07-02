const Notification = require('../model/notification');

const getUserNotifications = async (req, res) => {
  const { userId } = req.params;
  try {
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50); // Keep last 50 alerts
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markAllAsRead = async (req, res) => {
  const { userId } = req.params;
  try {
    await Notification.updateMany({ userId, read: false }, { $set: { read: true } });
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getUserNotifications,
  markAllAsRead
};
