const Story = require('../models/Story');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryHelper');

// Get all stories
exports.getAllStories = async (req, res) => {
  try {
    const stories = await Story.find();
    res.status(200).json(stories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stories', error });
  }
};

// Get a single story by ID
exports.getStoryById = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });
    res.status(200).json(story);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching story', error });
  }
};

// Create a new story
exports.createStory = async (req, res) => {
  try {
    const { title, image, author, content, date } = req.body;
    
    // Handle image upload to Cloudinary
    let imageUrl = '';
    let imagePublicId = '';
    
    if (image || req.file) {
      const imageData = req.file || image;
      const uploadResult = await uploadToCloudinary(imageData, 'divinecare/stories');
      imageUrl = uploadResult.secure_url;
      imagePublicId = uploadResult.public_id;
    }
    
    const story = new Story({ 
      title, 
      image: imageUrl, 
      imagePublicId,
      author, 
      content, 
      date 
    });
    await story.save();
    res.status(201).json(story);
  } catch (error) {
    res.status(500).json({ message: 'Error creating story', error });
  }
};

// Update a story
exports.updateStory = async (req, res) => {
  try {
    const { title, image, author, content, date } = req.body;
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });
    
    let updateData = { title, author, content, date };
    
    // Handle image update if provided
    if (image || req.file) {
      const imageData = req.file || image;
      const oldPublicId = story.imagePublicId;
      const uploadResult = await uploadToCloudinary(imageData, 'divinecare/stories', oldPublicId);
      updateData.image = uploadResult.secure_url;
      updateData.imagePublicId = uploadResult.public_id;
    }
    
    const updatedStory = await Story.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.status(200).json(updatedStory);
  } catch (error) {
    res.status(500).json({ message: 'Error updating story', error });
  }
};

// Delete a story
exports.deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });
    
    // Delete image from Cloudinary before removing story
    if (story.imagePublicId) {
      await deleteFromCloudinary(story.imagePublicId);
    }
    
    await Story.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Story deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting story', error });
  }
};
