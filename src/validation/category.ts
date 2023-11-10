"use strict"
import * as Joi from "joi"
import { apiResponse } from '../common'
import { isValidObjectId } from 'mongoose'
import { Request, Response } from 'express'

export const add = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        main_categoryId: Joi.string().required().error(new Error('main_categoryId is required')),
        name: Joi.string().required().error(new Error('name is required!')),
        //  image: Joi.string().required().error(new Error('image is required!')),
    })
    schema.validateAsync(req.body).then(result => {
        if (!isValidObjectId(result.main_categoryId)) return res.status(400).json(new apiResponse(400, "Invalid id format", {}, {}));
        return next()
    }).catch(error => { res.status(400).json(new apiResponse(400, error.message, {}, {})) })
}

export const by_id = async (req: Request, res: Response, next: any) => {
    if (!isValidObjectId(req.params.id)) return res.status(400).json(new apiResponse(400, 'invalid id', {}, {}))
    return next()
}

export const update = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        id: Joi.string().required().error(new Error('id is required!')),
        name: Joi.string().error(new Error('name is string!')),
        main_categoryId: Joi.string().error(new Error('main_categoryId is string!')),
        //  image: Joi.string().error(new Error('image is string!')),
    })
    schema.validateAsync(req.body).then(result => {
        if (!isValidObjectId(result.id)) return res.status(400).json(new apiResponse(400, "Invalid id format", {}, {}));
        return next()
    }).catch(error => { res.status(400).json(new apiResponse(400, error.message, {}, {})) })
}