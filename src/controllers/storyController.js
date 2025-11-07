const Story = require('../models/Story');
const { uploadToAntryk, deleteFromAntryk } = require('../utils/cloudinaryHelper');

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
    
    // Handle image upload to Antryk
    let imageKey = '';
    if (image || req.file) {
      const { v4: uuidv4 } = require('uuid');
      const imageData = req.file || image;
      const key = `stories/${uuidv4()}_${imageData.originalname || 'image'}`;
      const uploadResult = await uploadToAntryk(imageData, key);
      imageKey = uploadResult.key;
    }
    const story = new Story({ 
      title, 
      imageKey,
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
      const { v4: uuidv4 } = require('uuid');
      const imageData = req.file || image;
      // Delete old image from Antryk if present
      if (story.imageKey) {
        const { deleteFromAntryk } = require('../utils/cloudinaryHelper');
        try {
          await deleteFromAntryk(story.imageKey);
        } catch (err) {
          console.error('Failed to delete old image from Antryk:', err.message);
        }
      }
      const key = `stories/${uuidv4()}_${imageData.originalname || 'image'}`;
      const uploadResult = await uploadToAntryk(imageData, key);
      updateData.imageKey = uploadResult.key;
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
    
    // Delete image from Antryk before removing story
    if (story.imageKey) {
      const { deleteFromAntryk } = require('../utils/cloudinaryHelper');
      try {
        await deleteFromAntryk(story.imageKey);
      } catch (err) {
        console.error('Failed to delete image from Antryk:', err.message);
      }
    }

    await Story.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Story deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting story', error });
  }
};
