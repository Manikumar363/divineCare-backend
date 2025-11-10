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
    // Accept image (URL) and imageKey from frontend, or a multipart file in req.file
    const { title, image, imageKey, author, content, date } = req.body;

    let finalImageUrl = '';
    let finalImageKey = '';

    if (req.file) {
      const { v4: uuidv4 } = require('uuid');
      const imageData = req.file;
      const key = `stories/${uuidv4()}_${imageData.originalname || 'image'}`;
      const uploadResult = await uploadToAntryk(imageData, key);
      finalImageUrl = uploadResult.url || uploadResult.fileUrl || '';
      finalImageKey = uploadResult.key || uploadResult.objectKey || '';
    } else {
      if (image) finalImageUrl = image;
      if (imageKey) finalImageKey = imageKey;
    }

    const story = new Story({ 
      title,
      image: finalImageUrl,
      imageKey: finalImageKey,
      author, 
      content, 
      date 
    });
    await story.save();
    res.status(201).json(story);
  } catch (error) {
    console.error('createStory error:', error && (error.stack || error));
    res.status(500).json({ message: 'Error creating story', error: { message: error?.message || String(error) } });
  }
};

// Update a story
exports.updateStory = async (req, res) => {
  try {
    // Accept image (URL) and imageKey from frontend, or a multipart file in req.file
    const { title, image, imageKey, author, content, date } = req.body;
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    let updateData = { title, author, content, date };

    if (req.file) {
      const { v4: uuidv4 } = require('uuid');
      const imageData = req.file;
      // Delete old image from Antryk if present
      if (story.imageKey) {
        try {
          await deleteFromAntryk(story.imageKey);
        } catch (err) {
          console.error('Failed to delete old image from Antryk:', err.message);
        }
      }
      const key = `stories/${uuidv4()}_${imageData.originalname || 'image'}`;
      const uploadResult = await uploadToAntryk(imageData, key);
      updateData.image = uploadResult.url || uploadResult.fileUrl || '';
      updateData.imageKey = uploadResult.key || uploadResult.objectKey || '';
    } else {
      // No file - accept provided image and imageKey
      if (image !== undefined) updateData.image = image;
      if (imageKey !== undefined) {
        if (story.imageKey && story.imageKey !== imageKey) {
          try {
            await deleteFromAntryk(story.imageKey);
          } catch (err) {
            console.error('Failed to delete old image from Antryk:', err.message);
          }
        }
        updateData.imageKey = imageKey;
      }
    }

    const updatedStory = await Story.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.status(200).json(updatedStory);
  } catch (error) {
    console.error('updateStory error:', error && (error.stack || error));
    res.status(500).json({ message: 'Error updating story', error: { message: error?.message || String(error) } });
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
