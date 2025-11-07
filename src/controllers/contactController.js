const Contact = require('../models/Contact');

// @desc    Submit contact form (Public endpoint)
// @route   POST /api/contact
// @access  Public
const submitContactForm = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, subject, message, willingToDonate } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !phone || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }


        // Handle image upload to Antryk
        let imageKey = '';
        if (req.file) {
            const { v4: uuidv4 } = require('uuid');
            const { uploadToAntryk } = require('../utils/cloudinaryHelper');
            const key = `contact/${uuidv4()}_${req.file.originalname}`;
            const uploadResult = await uploadToAntryk(req.file, key);
            imageKey = uploadResult.key;
        }

        // Create contact entry (store only key, not full URL)
        const contact = await Contact.create({
            firstName,
            lastName,
            email,
            phone,
            subject,
            message,
            willingToDonate: willingToDonate || false,
            imageKey: imageKey
        });

        res.status(201).json({
            success: true,
            message: 'Thank you for contacting us. We will get back to you soon.',
            data: {
                id: contact._id,
                firstName: contact.firstName,
                lastName: contact.lastName,
                email: contact.email,
                subject: contact.subject,
                createdAt: contact.createdAt,
                imageKey: contact.imageKey
            }
        });

    } catch (error) {
        console.error('Contact form submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting contact form. Please try again.'
        });
    }
};

// @desc    Get all contacts (Admin only)
// @route   GET /api/admin/contacts
// @access  Private/Admin
const getAllContacts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;
        const search = req.query.search;

        const skip = (page - 1) * limit;

        // Build query
        let query = {};
        if (status) {
            query.status = status;
        }
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } }
            ];
        }

        // Get contacts with pagination
        const contacts = await Contact.find(query)
            .populate('respondedBy', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Contact.countDocuments(query);

        res.status(200).json({
            success: true,
            data: contacts,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get contacts error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching contacts'
        });
    }
};

// @desc    Get single contact (Admin only)
// @route   GET /api/admin/contacts/:id
// @access  Private/Admin
const getContactById = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id)
            .populate('respondedBy', 'firstName lastName email');

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        res.status(200).json({
            success: true,
            data: contact
        });

    } catch (error) {
        console.error('Get contact error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching contact'
        });
    }
};

// @desc    Update contact status (Admin only)
// @route   PUT /api/admin/contacts/:id
// @access  Private/Admin
const updateContactStatus = async (req, res) => {
    try {
        const { status, adminNotes, respondedBy } = req.body;

        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        // Update contact
        if (status) contact.status = status;
        if (adminNotes) contact.adminNotes = adminNotes;
        if (respondedBy) {
            contact.respondedBy = respondedBy;
            contact.respondedAt = new Date();
        }

        await contact.save();

        const updatedContact = await Contact.findById(contact._id)
            .populate('respondedBy', 'firstName lastName email');

        res.status(200).json({
            success: true,
            message: 'Contact updated successfully',
            data: updatedContact
        });

    } catch (error) {
        console.error('Update contact error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating contact'
        });
    }
};

// @desc    Delete contact (Admin only)
// @route   DELETE /api/admin/contacts/:id
// @access  Private/Admin
const deleteContact = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }


        // Delete image from Antryk if present
        if (contact.imageKey) {
            const { deleteFromAntryk } = require('../utils/cloudinaryHelper');
            try {
                await deleteFromAntryk(contact.imageKey);
            } catch (err) {
                console.error('Failed to delete file from Antryk:', err.message);
            }
        }

        await contact.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Contact deleted successfully'
        });

    } catch (error) {
        console.error('Delete contact error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting contact'
        });
    }
};

// @desc    Get contact statistics (Admin only)
// @route   GET /api/admin/contacts/stats
// @access  Private/Admin
const getContactStats = async (req, res) => {
    try {
        const totalContacts = await Contact.countDocuments();
        const newContacts = await Contact.countDocuments({ status: 'new' });
        const inProgressContacts = await Contact.countDocuments({ status: 'in-progress' });
        const resolvedContacts = await Contact.countDocuments({ status: 'resolved' });
        const willingToDonate = await Contact.countDocuments({ willingToDonate: true });

        // Get recent contacts
        const recentContacts = await Contact.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('firstName lastName email subject createdAt status');

        res.status(200).json({
            success: true,
            data: {
                stats: {
                    total: totalContacts,
                    new: newContacts,
                    inProgress: inProgressContacts,
                    resolved: resolvedContacts,
                    willingToDonate: willingToDonate
                },
                recentContacts
            }
        });

    } catch (error) {
        console.error('Get contact stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching contact statistics'
        });
    }
};

module.exports = {
    submitContactForm,
    getAllContacts,
    getContactById,
    updateContactStatus,
    deleteContact,
    getContactStats
};