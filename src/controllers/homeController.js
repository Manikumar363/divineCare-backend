const Home = require('../models/Home');

// GET home page data
exports.getHome = async (req, res) => {
  try {
    const home = await Home.findOne();
    res.status(200).json({ success: true, home });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST create home page
exports.createHome = async (req, res) => {
  try {
    const home = await Home.create({ ...req.body });
    res.status(201).json({ success: true, home });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT update home page
exports.updateHome = async (req, res) => {
  try {
    const home = await Home.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );
    if (!home) return res.status(404).json({ success: false, message: 'Home page not found' });
    res.status(200).json({ success: true, home });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE home page
exports.deleteHome = async (req, res) => {
  try {
    const home = await Home.findByIdAndDelete(req.params.id);
    if (!home) return res.status(404).json({ success: false, message: 'Home page not found' });
    res.status(200).json({ success: true, message: 'Home page deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
