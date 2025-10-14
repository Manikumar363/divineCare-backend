const HomeEvent = require('../../models/Home/homeEvent');

// GET home event section data
exports.getHomeEvent = async (req, res) => {
  try {
    const event = await HomeEvent.findOne();
    res.status(200).json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT update home event section data
exports.updateHomeEvent = async (req, res) => {
  try {
    const event = await HomeEvent.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );
    if (!event) return res.status(404).json({ success: false, message: 'Home Event section not found' });
    res.status(200).json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
