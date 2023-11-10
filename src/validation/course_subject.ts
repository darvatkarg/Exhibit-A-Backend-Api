"use strict"
import * as Joi from "joi"
import { apiResponse, testType } from '../common'
import { isValidObjectId } from 'mongoose'
import { Request, Response } from 'express'

export const add = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        title: Joi.string().required().error(new Error('title is required!')),
        description: Joi.string().required().error(new Error('description is required!')),
        duration: Joi.string().required().error(new Error('duration is required!')),
        image: Joi.string().required().error(new Error('image is required!')),
        pdf: Joi.string().error(new Error('pdf is required!')),
        ePub: Joi.string().error(new Error('ePub is string!')),
        passing_marks: Joi.number().required().error(new Error('passing_marks is number!')),
        question_select: Joi.number().required().error(new Error('question_select is number!')),
        pdf_document: Joi.string().error(new Error('pdf_document is string!')),
        training_typeId: Joi.array().error(new Error('training_typeId is array!')),
        time_slotId: Joi.array().error(new Error('time_slotId is array!')),
    })
    schema.validateAsync(req.body).then(result => {
        //  req.body.type = testType.theory
        return next()
    }).catch(error => { res.status(400).json(new apiResponse(400, error.message, {}, {})) })
}

export const update = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        _id: Joi.string().required().error(new Error('_id is required!')),
        title: Joi.string().required().error(new Error('title is required!')),
        description: Joi.string().required().error(new Error('description is required!')),
        image: Joi.string().error(new Error('image is string!')),
        passing_marks: Joi.number().error(new Error('passing_marks is number!')),
        question_select: Joi.number().error(new Error('question_select is number!')),
        duration: Joi.string().required().error(new Error('duration is required!')),
        pdf: Joi.string().error(new Error('pdf is string!')),
        pdf_document: Joi.string().error(new Error('pdf_document is string!')),
        ePub: Joi.string().error(new Error('ePub is string!')),
        training_typeId: Joi.array().error(new Error('training_typeId is array!')),
        time_slotId: Joi.array().error(new Error('time_slotId is array!')),
    })
    schema.validateAsync(req.body).then(result => {
        if (!isValidObjectId(result.id)) return res.status(400).json(new apiResponse(400, "Invalid id format", {}, {}));
        return next()
    }).catch(error => { res.status(400).json(new apiResponse(400, error.message, {}, {})) })
}

export const by_id = async (req: Request, res: Response, next: any) => {
    if (!isValidObjectId(req.params.id)) return res.status(400).json(new apiResponse(400, 'invalid id', {}, {}))
    return next()
}