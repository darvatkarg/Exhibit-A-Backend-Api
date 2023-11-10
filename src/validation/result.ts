"use strict"
import * as Joi from "joi"
import { apiResponse } from '../common'
import { isValidObjectId } from 'mongoose'
import { Request, Response } from 'express'

export const add = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        subjectId: Joi.string().required().error(new Error('subjectId is required!')),
        score: Joi.number().error(new Error('score is required!')),
        test_start_time: Joi.date().required().error(new Error('test_start_time is required!')),
    })
    schema.validateAsync(req.body).then(result => {
        if (!isValidObjectId(req.params.testId)) return res.status(400).json(new apiResponse(400, 'invalid id', {}, {}))
        return next()
    }).catch(error => { res.status(400).json(new apiResponse(400, error.message, {}, {})) })
}

export const by_id = async (req: Request, res: Response, next: any) => {
    if (!isValidObjectId(req.params.id)) return res.status(400).json(new apiResponse(400, 'invalid id', {}, {}))
    return next()
}

export const update = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        score: Joi.number().error(new Error('score is required!')),
        test_end_time: Joi.date().error(new Error('test_end_time is required!')),
    })
    schema.validateAsync(req.body).then(result => {
        if (!isValidObjectId(req.params.userId)) return res.status(400).json(new apiResponse(400, 'invalid id', {}, {}))
        return next()
    }).catch(error => { res.status(400).json(new apiResponse(400, error.message, {}, {})) })
}

export const start = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        subjectId: Joi.string().required().error(new Error('subjectId is required!')),
        // test_end_time: Joi.date().required().error(new Error('test_end_time is required!')),
    })
    schema.validateAsync(req.body).then(result => {
        if (!isValidObjectId(req.params.testId)) return res.status(400).json(new apiResponse(400, 'invalid id', {}, {}))
        return next()
    }).catch(error => { res.status(400).json(new apiResponse(400, error.message, {}, {})) })
}