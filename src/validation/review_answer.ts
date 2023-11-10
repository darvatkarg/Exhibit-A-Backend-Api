"use strict"
import * as Joi from "joi"
import { apiResponse, testType } from '../common'
import { isValidObjectId } from 'mongoose'
import { Request, Response } from 'express'

export const add = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        subjectId: Joi.string().required().error(new Error('subjectId is required!')),
        question: Joi.array().required().error(new Error('question is required!'))
    })
    schema.validateAsync(req.body).then(result => {
        //  req.body.type = testType.theory
        return next()
    }).catch(error => { res.status(400).json(new apiResponse(400, error.message, {}, {})) })
}

export const by_id = async (req: Request, res: Response, next: any) => {
    if (!isValidObjectId(req.params.id)) return res.status(400).json(new apiResponse(400, 'invalid id', {}, {}))
    return next()
}