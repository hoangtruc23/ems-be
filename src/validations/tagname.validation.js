const Joi = require('joi');

const validation = {
    tagnameSchema: Joi.object({
        name: Joi.string().required(),
        symbol: Joi.string().allow('', null),
        functionCode: Joi.number().integer().required(),
        address: Joi.string().required(),
        bit: Joi.number().allow(null),
        dataType: Joi.number().required(),
        unit: Joi.string().allow(null),
        offset: Joi.number().default(0),
        gain: Joi.number().default(1),
        isSaveDb: Joi.boolean(),
        isSendFtp: Joi.boolean(),
        note: Joi.string().allow('', null)
    })

}
module.exports = validation