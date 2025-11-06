const Subscribe = require('../models/Subscribe');

// POST /api/subscribe
exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }
    // Prevent duplicate subscriptions
    const existing = await Subscribe.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already subscribed.' });
    }
    const subscription = new Subscribe({ email });
    await subscription.save();
    res.status(201).json({ message: 'Subscribed successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/subscribe
exports.getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscribe.find().sort({ subscribedAt: -1 });
    res.json(subscriptions);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
