"use strict"
import * as Joi from "joi"
import { apiResponse, testType } from '../common'
import { isValidObjectId } from 'mongoose'
import { Request, Response } from 'express'

export const add = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        logUserId: Joi.string().required().error(new Error('logUserId is required!')),
        subjectId: Joi.string().required().error(new Error('subjectId is required!')),
        logLatestDate: Joi.date().required().error(new Error('logLatestDate is required!')),
        topicCovered: Joi.number().error(new Error('topicCovered is number!')),
    })
    schema.validateAsync(req.body).then(result => {
        return next()
    }).catch(error => { res.status(400).json(new apiResponse(400, error.message, {}, {})) })
}

export const by_id = async (req: Request, res: Response, next: any) => {
    if (!isValidObjectId(req.params.id)) return res.status(400).json(new apiResponse(400, 'invalid id', {}, {}))
    return next()
}