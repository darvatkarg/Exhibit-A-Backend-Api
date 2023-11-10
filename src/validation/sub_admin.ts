"use strict"
import * as Joi from "joi"
import { apiResponse, userStatus } from '../common'
import { isValidObjectId } from 'mongoose'
import { Request, Response } from 'express'

export const update_profile = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        name: Joi.string().error(new Error('name is string')),
        email: Joi.string().error(new Error('email is string')),
        altEmail: Joi.string().error(new Error('altEmail is string')),
        phoneNumber: Joi.number().error(new Error('phoneNumber is number')),
        alter_phoneNumber: Joi.number().error(new Error('alter_phoneNumber is number')),
        image: Joi.string().error(new Error('image is string')),
    })
    schema.validateAsync(req.body).then(result => {
        return next()
    }).catch(error => {
        res.status(400).json(new apiResponse(400, error.message, {}, {}));
    })
}