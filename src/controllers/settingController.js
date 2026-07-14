const roleService = require('../services/roleService')
const settingService = require('../services/settingService')
const response = require('../utils/response/response')

//Helper function to transform setting into suitable object
const transformSetting = (req, settingDocument) => {
    if (!settingDocument) return null;
    
    const settingObject = settingDocument.toObject();
    
    const domain = `${req.protocol}://${req.get('host')}`;
    settingObject.logoUrl = settingDocument.logo ? `${domain}${req.baseUrl}/logo` : null;
    
    delete settingObject.logo; 
    
    return settingObject;
};

const settingController = {
    getAll: async (req, res, next) => {
        try {
            const result = await settingService.getAll()

            const dataResponse = transformSetting(req, result);

            return res.status(200).json(response.success(dataResponse))
        } catch (error) {
            next(error)
        }
    },
    update: async (req, res, next) => {
        try {
            const result = await settingService.update(req.body, req.file)
            
            const dataResponse = transformSetting(req, result);
            
            return res.status(200).json(response.success({dataResponse}))
        } catch (error) {
            next(error)
        }
    },
    getLogo: async (req, res, next) => {
        try {
            const { logo, contentType } = await settingService.getLogoData()
            
            res.set('Content-Type', contentType)
            return res.send(logo)
        } catch (error) {
            next(error)
        }
    }
}

module.exports = settingController
