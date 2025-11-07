const mongoose = require('mongoose');

const statsSchema = new mongoose.Schema({
    title: {type: String, required: true},
    content: {type: String, required:true}
},{_id:false})

const companyAboutSchema = new mongoose.Schema({
    heading: {type: String, required: true},
    description: {type: String, required: true},
    image: {type: String}, // Antryk URL for company image
    imageKey: {type: String}, // Antryk object key for deletion
    stats: [statsSchema]
}, {timestamps: true});

module.exports = mongoose.model('CompanyAbout', companyAboutSchema);