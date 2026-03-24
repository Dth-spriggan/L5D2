const User = require('../models/user');
const CandidateProfile = require('../models/candidateProfile');
const Company = require('../models/company');

exports.getCandidateProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, { attributes: ['id', 'email', 'fullName'] });
        const profile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
        res.status(200).json({ success: true, data: { ...user.toJSON(), profile } });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.updateCandidateProfile = async (req, res) => {
    try {
        const { fullName, phone, bio, education, skills, facebook_url, linkedin_url } = req.body;
        await User.update({ fullName }, { where: { id: req.user.id } });
        await CandidateProfile.update({ phone, bio, education, skills, facebook_url, linkedin_url }, { where: { user_id: req.user.id } });
        res.status(200).json({ success: true, message: 'Cập nhật CV thành công!' });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getEmployerProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, { attributes: ['id', 'email', 'fullName'] });
        const company = await Company.findOne({ where: { employer_id: req.user.id } });
        res.status(200).json({ success: true, data: { ...user.toJSON(), company } });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.updateEmployerProfile = async (req, res) => {
    try {
        const { fullName, company_name, tax_code } = req.body;
        await User.update({ fullName }, { where: { id: req.user.id } });

        let companyData = { company_name, tax_code };
        if (req.file) {
            companyData.logo_url = req.file.path; // Lấy link từ Cloudinary trả về
        }

        await Company.update(companyData, { where: { employer_id: req.user.id } });
        res.status(200).json({ success: true, message: 'Cập nhật Công ty thành công!', logo_url: companyData.logo_url });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};