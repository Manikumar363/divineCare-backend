const CompanyAbout = require('../../models/About/companyAbout');


// GET company about section data
exports.getCompanyAbout = async (req, res)=>{
    try{
        const company = await CompanyAbout.findOne();
        res.status(200).json({success: true, company});
    }catch(error){
        res.status(500).json({success: false, message: error.message});
    }
}

// PUT update company about section data
exports.updateCompanyAbout = async (req,res)=>{
    try{
        let updateData = { ...req.body };
        if (req.file) {
            const { v4: uuidv4 } = require('uuid');
            const { uploadToAntryk } = require('../../utils/cloudinaryHelper');
            const key = `company-about/${uuidv4()}_${req.file.originalname}`;
            const uploadResult = await uploadToAntryk(req.file, key);
            updateData.imageKey = uploadResult.key;
        }
        const company = await CompanyAbout.findByIdAndUpdate(
            req.params.id,
            updateData,
            {new: true}
        );
        if(!company) return res.status(404).json({success: false, message: 'Company About section not found'});
        res.status(200).json({success: true, company});
    }catch(error){
        res.status(500).json({success:false, message:error.message});
    }
};
