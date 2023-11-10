"use strict"
import * as Joi from "joi"
import { apiResponse, testType } from '../common'
import { isValidObjectId } from 'mongoose'
import { Request, Response } from 'express'


export const add = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        answer: Joi.string().required().error(new Error('answer is required!')),
        questionId: Joi.string().required().error(new Error('questionId is required!')),
        subjectId: Joi.string().required().error(new Error('subjectId is required!')),
    })
    schema.validateAsync(req.body).then(result => {
        return next()
    }).catch(error => { res.status(400).json(new apiResponse(400, error.message, {}, {})) })
}

export const update = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        id: Joi.string().required().error(new Error('id is string!')),
        answer: Joi.string().required().error(new Error('answer is required!')),
        questionId: Joi.string().required().error(new Error('questionId is string!')),
    })
    schema.validateAsync(req.body).then(result => {
        if (!isValidObjectId(result.questionId)) return res.status(400).json(new apiResponse(400, "Invalid id format", {}, {}));
        return next()
    }).catch(error => { res.status(400).json(new apiResponse(400, error.message, {}, {})) })
}

export const by_id = async (req: Request, res: Response, next: any) => {
    if (!isValidObjectId(req.params.id)) return res.status(400).json(new apiResponse(400, 'invalid id', {}, {}))
    return next()
}