"use strict"
import * as Joi from "joi"
import { apiResponse } from '../common'
import { Request, Response } from 'express'
import { isValidObjectId } from "mongoose"

export const add = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        name: Joi.string().required().error(new Error('name is required!')),
        cardNumber: Joi.string().required().error(new Error('cardNumber is required!')),
        expYear: Joi.string().required().error(new Error('expYear is required!')),
        expMonth: Joi.string().required().error(new Error('expMonth is required!')),
        cvv: Joi.string().required().error(new Error('cvv is required!')),

    })
    schema.validateAsync(req.body).then(result => {
        return next()
    }).catch(error => { res.status(400).json(new apiResponse(400, error.message, {}, {})) })
}

export const by_id = async (req: Request, res: Response, next: any) => {
    if (!isValidObjectId(req.params.id)) return res.status(400).json(new apiResponse(400, 'invalid id', {}, {}));
    next()
}

export const update = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        id: Joi.string().required().error(new Error('id is required!')),
        name: Joi.string().error(new Error('name is string!')),
        cardNumber: Joi.number().error(new Error('cardNumber is number!')),
        expYear: Joi.number().error(new Error('expYear is number!')),
        expMonth: Joi.number().error(new Error('expMonth is number!')),
        cvv: Joi.number().error(new Error('cvv is number!')),
    })
    schema.validateAsync(req.body).then(result => {
        if (!isValidObjectId(result?.id)) return res.status(400).json(new apiResponse(400, "invalid id", {}, {}))
        return next()
    }).catch(error => { res.status(400).json(new apiResponse(400, error.message, {}, {})) })
}