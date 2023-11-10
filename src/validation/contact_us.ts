"use strict"
import * as Joi from "joi"
import { apiResponse } from '../common'
import { isValidObjectId } from 'mongoose'
import { Request, Response } from 'express'

export const add = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        firstName: Joi.string().error(new Error('firstName is required!')),
        email: Joi.string().error(new Error('email is required!')),
        message: Joi.string().error(new Error('message is required!')),
    })
    schema.validateAsync(req.body).then(result => { return next() }).catch(error => { res.status(400).json(new apiResponse(400, error.message, {}, {})) })
}

export const response = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        id: Joi.string().required().error(new Error('id is required!')),
        responseMessage: Joi.string().required().error(new Error('responseMessage is required!')),
    })
    schema.validateAsync(req.body).then(result => { return next() }).catch(error => { res.status(400).json(new apiResponse(400, error.message, {}, {})) })
}

export const get_by_status = async (req: Request, res: Response, next: any) => {
    if (!req.params.isResponded) return res.status(400).json(new apiResponse(400, 'invalid params', {}, {}))
}