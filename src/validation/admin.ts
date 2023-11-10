"use strict"
import * as Joi from "joi"
import { apiResponse, userStatus } from '../common'
import { isValidObjectId } from 'mongoose'
import { Request, Response } from 'express'

export const add = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        email: Joi.string().lowercase().required().error(new Error('email is required!')),
        name: Joi.string().lowercase().required().error(new Error('name is required!')),
        password: Joi.string().required().error(new Error('password is required!')),
        phoneNumber: Joi.number().error(new Error('phoneNumber is required!')),
        image: Joi.string().error(new Error('image is string'))
    })
    schema.validateAsync(req.body).then(result => {
        req.body.userType = userStatus.sub_admin
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
        name: Joi.string().error(new Error('name is string')),
        email: Joi.string().error(new Error('email is string')),
        phoneNumber: Joi.string().error(new Error('phoneNumber is string')),
        image: Joi.string().error(new Error('image is string'))
    })
    schema.validateAsync(req.body).then(result => {
        if (!isValidObjectId(req.params.id)) return res.status(400).json(new apiResponse(400, 'invalid id', {}, {}))
        return next()
    }).catch(error => { res.status(400).json(new apiResponse(400, error.message, {}, {})) })
}