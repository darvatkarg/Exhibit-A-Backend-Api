"use strict"
import * as Joi from "joi"
import { apiResponse } from '../common'
import { isValidObjectId } from 'mongoose'
import { Request, Response } from 'express'

export const add_feedback = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        bookId: Joi.string().required().error(new Error('appointmentId is required!')),
        feedback_rating: Joi.number().error(new Error('feedback_rating is a number')),
        comment: Joi.string().error(new Error('comment is required!')),
    })
    schema.validateAsync(req.body).then(result => {
        return next()
    }).catch(error => { res.status(400).json(new apiResponse(400, error.message, {}, {})) })
}

export const update_feedback = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        id: Joi.string().required().error(new Error('id is required!')),
        bookId: Joi.string().required().error(new Error('bookId is required!')),
        feedback_rating: Joi.number().error(new Error('feedback_rating is a number')),
        comment: Joi.string().error(new Error('comment is required!')),
    })
    schema.validateAsync(req.body).then(result => {
        return next()
    }).catch(error => { res.status(400).json(new apiResponse(400, error.message, {}, {})) })
}

export const by_id = async (req: Request, res: Response, next: any) => {
    if (!isValidObjectId(req.params.id)) return res.status(400).json(new apiResponse(400, 'invalid id', {}, {}))
    return next()
}