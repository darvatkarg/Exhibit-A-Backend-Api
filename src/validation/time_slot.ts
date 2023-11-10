"use strict"
import * as Joi from "joi"
import { apiResponse, testType } from '../common'
import { isValidObjectId } from 'mongoose'
import { Request, Response } from 'express'

export const add = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        start_time: Joi.string().required().error(new Error('start_time is required!')),
        end_time: Joi.string().required().error(new Error('end_time is required!')),
    })
    schema.validateAsync(req.body).then(result => {
        return next()
    }).catch(error => { res.status(400).json(new apiResponse(400, error.message, {}, {})) })
}

export const by_id = async (req: Request, res: Response, next: any) => {
    if (!isValidObjectId(req.params.id)) return res.status(400).json(new apiResponse(400, 'invalid id', {}, {}))
    return next()
}

export const update = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        id: Joi.string().required().error(new Error('id is required')),
        start_time: Joi.string().error(new Error('start_time is string!')),
        end_time: Joi.string().error(new Error('end_time is string!')),
    })
    schema.validateAsync(req.body).then(result => {
        if (!isValidObjectId(req.params.id)) return res.status(400).json(new apiResponse(400, 'invalid id', {}, {}))
        return next()
    }).catch(error => {
        res.status(400).json(new apiResponse(400, error.message, {}, {}));
    })
}