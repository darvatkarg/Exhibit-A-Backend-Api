"use strict"
import * as Joi from "joi"
import { apiResponse } from '../common'
import { isValidObjectId } from 'mongoose'
import { Request, Response } from 'express'

export const add = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        // bookId: Joi.string().required().error(new Error('bookId is required!')),
        DateTime: Joi.date().required().error(new Error('DateTime is required!')),
        weekDay: Joi.array().error(new Error('weekDay is array!')),
        repeat: Joi.number().error(new Error('repeat is number!')),
        //promptTime: Joi.string().error(new Error('promptTime is string!')),
    })
    schema.validateAsync(req.body).then(result => {
        return next()
    }).catch(error => { res.status(400).json(new apiResponse(400, error.message, {}, {})) })
}

export const update = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        id: Joi.string().required().error(new Error('id is required!')),
        bookId: Joi.string().error(new Error('bookId is required!')),
        time: Joi.string().required().error(new Error('time is required!')),
        weekDay: Joi.array().error(new Error('weekDay is array!')),
        repeat: Joi.number().error(new Error('repeat is number!')),
        promptTime: Joi.string().error(new Error('promptTime is string!')),
    })
    schema.validateAsync(req.body).then(result => {
        return next()
    }).catch(error => { res.status(400).json(new apiResponse(400, error.message, {}, {})) })
}

export const by_id = async (req: Request, res: Response, next: any) => {
    if (!isValidObjectId(req.params.id)) return res.status(400).json(new apiResponse(400, 'invalid id', {}, {}))
    return next()
}