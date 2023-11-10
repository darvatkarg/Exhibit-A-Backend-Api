"use strict"
import * as Joi from "joi"
import { apiResponse } from '../common'
import { Request, Response } from 'express'
import { isValidObjectId } from "mongoose"

export const add = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        id: Joi.string().required().error(new Error('id is required!')),
        facultyId: Joi.string().required().error(new Error('facultyId is required!')),
        isFaculty: Joi.boolean().error(new Error('isFaculty is boolean')),
        isStudent: Joi.boolean().error(new Error('isStudent is boolean')),
        // shortMeetingURL: Joi.string().error(new Error('shortMeetingURL is string')),
    })
    schema.validateAsync(req.body).then(result => {
        return next()
    }).catch(error => { res.status(400).json(new apiResponse(400, error.message, {}, {})) })
}

export const update = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        id: Joi.string().required().error(new Error('id is required!')),
        batchId: Joi.string().required().error(new Error('batchId is required!')),
        facultyId: Joi.string().required().error(new Error('facultyId is required!')),
        time_slotId: Joi.string().required().error(new Error('time_slotId is required!')),
        date: Joi.string().error(new Error('date is required!')),
        meeting_link: Joi.string().error(new Error('meeting_link is required!')),
        subjectId: Joi.string().required().error(new Error('subjectId is required!')),
        isFaculty: Joi.boolean().error(new Error('isFaculty is boolean')),
        isStudent: Joi.boolean().error(new Error('isStudent is boolean'))

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