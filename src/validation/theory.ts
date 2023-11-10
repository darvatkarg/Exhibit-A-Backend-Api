"use strict"
import * as Joi from "joi"
import { apiResponse, testType } from '../common'
import { isValidObjectId } from 'mongoose'
import { Request, Response } from 'express'

export const add = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        title: Joi.string().required().error(new Error('title is required!')),
        number_question: Joi.number().required().error(new Error('number_question is required!')),
        marks: Joi.number().required().error(new Error('marks is required!')),
        duration: Joi.number().required().error(new Error('duration is required!')),
    })
    schema.validateAsync(req.body).then(result => {
        req.body.type = testType.theory
        return next()
    }).catch(error => { res.status(400).json(new apiResponse(400, error.message, {}, {})) })
}

export const by_id = async (req: Request, res: Response, next: any) => {
    if (!isValidObjectId(req.params.id)) return res.status(400).json(new apiResponse(400, 'invalid id', {}, {}))
    return next()
}

export const update_theory = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        id: Joi.string().error(new Error('id is string')),
        title: Joi.string().error(new Error('title is string')),
        marks: Joi.number().error(new Error('marks is number!')),
        number_question: Joi.number().error(new Error('number_question is number!')),
        duration: Joi.number().required().error(new Error('duration is required!')),
    })
    schema.validateAsync(req.body).then(result => {
        if (!isValidObjectId(req.params.id)) return res.status(400).json(new apiResponse(400, 'invalid id', {}, {}))
        return next()
    }).catch(error => {
        res.status(400).json(new apiResponse(400, error.message, {}, {}));
    })
}