"use strict"
import * as Joi from "joi"
import { apiResponse, userStatus } from '../common'
import { isValidObjectId } from 'mongoose'
import { Request, Response } from 'express'

export const update_profile = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        name: Joi.string().error(new Error('name is string')),
        // email: Joi.string().error(new Error('email is string')),
        address: Joi.string().error(new Error('address is string')),
        // phoneNumber: Joi.number().error(new Error('phoneNumber is number')),
        // alter_phoneNumber: Joi.number().error(new Error('alter_phoneNumber is number')),
        image: Joi.string().allow(null, "").error(new Error('image is string')),
        city: Joi.string().allow(null, "").error(new Error('city is string')),
        region: Joi.string().allow(null, "").error(new Error('region is string')),
        country: Joi.string().error(new Error('country is string')),
        PINCode: Joi.number().error(new Error('PINCode is number')),
        schoolId: Joi.string().error(new Error('schoolId is string')),
        cityId: Joi.string().error(new Error('cityId is string')),
        regionId: Joi.string().error(new Error('regionId is string')),
        countryId: Joi.string().error(new Error('countryId is string')),
    })
    schema.validateAsync(req.body).then(result => {
        return next()
    }).catch(error => {
        res.status(400).json(new apiResponse(400, error.message, {}, {}));
    })
}