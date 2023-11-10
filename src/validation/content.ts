"use strict"
import * as Joi from "joi"
import { apiResponse } from '../common'
import { Request, Response } from 'express'
import { isValidObjectId } from "mongoose"

export const add_content_title = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        subjectId: Joi.string().required().error(new Error('subjectId is required!')),
        title: Joi.string().required().error(new Error('title is required!')),
        content: Joi.array().required().error(new Error('content is array!')),
        pdf: Joi.string().error(new Error('pdf is string!')),
        video: Joi.string().error(new Error('video is string!')),
    })
    schema.validateAsync(req.body).then(result => {
        if (result.video) {
            req.body.video = `60d45480d1f4892d14d7b775/video/${result.video}`
            req.body.video = req.body.video.split('/').filter(function (item, i, allItems) {
                return i == allItems.indexOf(item);
            }).join('/')
        }
        return next()
    }).catch(error => { res.status(400).json(new apiResponse(400, error.message, {}, {})) })
}

export const by_id = async (req: Request, res: Response, next: any) => {
    if (!isValidObjectId(req.params.id)) return res.status(400).json(new apiResponse(400, 'invalid id', {}, {}))
    return next()
}

export const update = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        id: Joi.string().required().error(new Error('id is required!')),
        subjectId: Joi.string().error(new Error('subjectId is required!')),
        title: Joi.string().error(new Error('title is string!')),
        content: Joi.array().error(new Error('content is array!')),
        video: Joi.string().error(new Error('video is string!')),
        pdf: Joi.string().error(new Error('pdf is string!')),

    })
    schema.validateAsync(req.body).then(result => {
        if (!isValidObjectId(result.id)) return res.status(400).json(new apiResponse(400, "Invalid id format", {}, {}));
        if (result.video) {
            req.body.video = `60d45480d1f4892d14d7b775/video/${result.video}`
            req.body.video = req.body.video.split('/').filter(function (item, i, allItems) {
                return i == allItems.indexOf(item);
            }).join('/')
        }
        if (!result.video) { req.body.video = `` }
        return next()
    }).catch(error => { res.status(400).json(new apiResponse(400, error.message, {}, {})) })
}