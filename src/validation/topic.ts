"use strict"
import * as Joi from "joi"
import { apiResponse, testType } from '../common'
import { isValidObjectId } from 'mongoose'
import { Request, Response } from 'express'

export const add = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        topicName: Joi.string().required().error(new Error('topicName is required!')),
        description: Joi.string().required().error(new Error('description is required!')),
        duration: Joi.string().required().error(new Error('duration is required!')),
        passing_marks: Joi.number().required().error(new Error('passing_marks is number!')),
        question_select: Joi.number().required().error(new Error('question_select is number!')),
        topicType: Joi.number().required().error(new Error('topicType is required!')),
        // pdf_document: Joi.string().error(new Error('pdf_document is string!')),
    })
    schema.validateAsync(req.body).then(result => {
        //  req.body.type = testType.theory
        return next()
    }).catch(error => { res.status(400).json(new apiResponse(400, error.message, {}, {})) })
}

export const update = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        _id: Joi.string().required().error(new Error('_id is required!')),
        topicName: Joi.string().required().error(new Error('topicName is required!')),
        description: Joi.string().error(new Error('description is string!')),
        passing_marks: Joi.number().error(new Error('passing_marks is number!')),
        question_select: Joi.number().error(new Error('question_select is number!')),
        duration: Joi.string().error(new Error('duration is number!')),
        topicType: Joi.number().error(new Error('topicType is number!')),
    })
    schema.validateAsync(req.body).then(result => {
        if (!isValidObjectId(result._id)) return res.status(400).json(new apiResponse(400, "Invalid id format", {}, {}));
        return next()
    }).catch(error => { res.status(400).json(new apiResponse(400, error.message, {}, {})) })
}

export const by_id = async (req: Request, res: Response, next: any) => {
    if (!isValidObjectId(req.params.id)) return res.status(400).json(new apiResponse(400, 'invalid id', {}, {}))
    return next()
}