"use strict"
import * as Joi from "joi"
import { apiResponse, orderStatus } from '../common'
import { isValidObjectId } from 'mongoose'
import { Request, Response } from 'express'

export const add = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        name: Joi.string().required().error(new Error('name is required!')),
        email: Joi.string().required().error(new Error('email is required!')),
        phoneNumber: Joi.number().required().error(new Error('phoneNumber is required!')),
        address: Joi.string().required().error(new Error('address is required!')),
        PINcode: Joi.number().required().error(new Error('PINcode is required!')),
        state: Joi.string().required().error(new Error('state is required!')),
        city: Joi.string().required().error(new Error('city is required!')),
        country: Joi.string().required().error(new Error('country is required!')),
        bookId: Joi.string().required().error(new Error('bookId is required!')),
        orderType: Joi.number().required().error(new Error('orderType is required!')),
        // Total_price: Joi.string().required().error(new Error('Total_price is required!')),

    })
    schema.validateAsync(req.body).then(result => {
        req.body.status = orderStatus.pending
        return next()
    }).catch(error => { res.status(400).json(new apiResponse(400, error.message, {}, {})) })
}

export const by_id = async (req: Request, res: Response, next: any) => {
    if (!isValidObjectId(req.params.id)) return res.status(400).json(new apiResponse(400, 'invalid id', {}, {}));
    next()
}