"use strict"
import * as Joi from "joi"
import { apiResponse } from '../common'
import { isValidObjectId } from 'mongoose'
import { Request, Response } from 'express'

export const add_form = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        subjectId: Joi.string().required().error(new Error('subjectId is required!')),
        document_image: Joi.string().error(new Error('document_image is a string')),
    })
    schema.validateAsync(req.body).then(result => {
        return next()
    }).catch(error => { res.status(400).json(new apiResponse(400, error.message, {}, {})) })
}

export const by_id = async (req: Request, res: Response, next: any) => {
    if (!isValidObjectId(req.params.id)) return res.status(400).json(new apiResponse(400, 'invalid id', {}, {}))
    return next()
}

export const update_form = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        id: Joi.string().required().error(new Error('id is required!')),
        document_image: Joi.string().error(new Error('document_image is string!')),
    })
    schema.validateAsync(req.body).then(result => {
        if (!isValidObjectId(result.id)) return res.status(400).json(new apiResponse(400, "Invalid id format", {}, {}));
        return next()
    }).catch(error => { res.status(400).json(new apiResponse(400, error.message, {}, {})) })
}

export const admin_add_form = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        createdBy: Joi.string().required().error(new Error('subjectId is required!')),
        subjectId: Joi.string().required().error(new Error('subjectId is required!')),
        document_image: Joi.string().error(new Error('document_image is a string')),
    })
    schema.validateAsync(req.body).then(result => {
        return next()
    }).catch(error => { res.status(400).json(new apiResponse(400, error.message, {}, {})) })
}