"use strict"
import * as Joi from "joi"
import { apiResponse } from '../common'
import { isValidObjectId } from 'mongoose'
import { Request, Response } from 'express'

export const add = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        main_categoryId: Joi.string().error(new Error('main_categoryId is string')),
        categoryId: Joi.string().error(new Error('categoryId is string')),
        subCategoryId: Joi.string().error(new Error('subCategoryId is string')),
        genreId: Joi.string().required().error(new Error('genreId is string')),
        title: Joi.string().required().error(new Error('title is required!')),
        author: Joi.string().required().error(new Error('author is required')),
        description: Joi.string().required().error(new Error('description is required')),
        page: Joi.number().required().error(new Error('page is required')),
        image: Joi.string().required().error(new Error('image is required!')),
        pdf: Joi.string().error(new Error('pdf is string!')),
        preview: Joi.string().error(new Error('preview is string!')),
        preview_video: Joi.string().error(new Error('preview_video is string!')),
        audio: Joi.string().error(new Error('audio is string!')),
        video: Joi.string().error(new Error('video is string!')),
        ePub: Joi.string().error(new Error('ePub is string!')),
        cost: Joi.number().error(new Error('cost is number')),
        discount: Joi.string().error(new Error('discount is string')),
        edition: Joi.string().required().error(new Error('edition is string!')),
        published_date: Joi.date().error(new Error("published_date is required!")),
        publisher: Joi.string().required().error(new Error('publisher is required!')),
        isFree: Joi.boolean().required().error(new Error('isFree is required!')),
        isPhysical: Joi.boolean().required().error(new Error('isPhysical is required!')),
        // favoriteBy: Joi.array().error(new Error('favoriteBy is string')),
        //quantity: Joi.number().required().error(new Error('quantity is required!')),
    })
    schema.validateAsync(req.body).then(result => {
        if (!isValidObjectId(result.main_categoryId)) return res.status(400).json(new apiResponse(400, "Invalid id format", {}, {}));
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
        main_categoryId: Joi.string().error(new Error('main_categoryId is string')),
        categoryId: Joi.string().error(new Error('categoryId is string')),
        subCategoryId: Joi.string().error(new Error('subCategoryId is string')),
        genreId: Joi.string().error(new Error('genreId is string')),
        id: Joi.string().required().error(new Error('id is required')),
        title: Joi.string().error(new Error('title is required!')),
        author: Joi.string().error(new Error('author is required!')),
        description: Joi.string().error(new Error('description is required!')),
        page: Joi.number().error(new Error('page is required!')),
        image: Joi.string().error(new Error('image is string!')),
        pdf: Joi.string().error(new Error('pdf is string!')),
        preview: Joi.string().error(new Error('preview is string!')),
        preview_video: Joi.string().error(new Error('preview_video is string!')),
        audio: Joi.string().error(new Error('audio is string!')),
        video: Joi.string().error(new Error('video is string!')),
        ePub: Joi.string().error(new Error('ePub is string!')),
        cost: Joi.number().error(new Error('cost is number!')),
        edition: Joi.string().error(new Error('edition is string!')),
        published_date: Joi.date().error(new Error("published_date is required!")),
        publisher: Joi.string().error(new Error('publisher is string!')),
        // quantity: Joi.number().error(new Error('quantity is number!')),
        isFree: Joi.boolean().error(new Error('isFree is boolean!')),
        isPhysical: Joi.boolean().error(new Error('isPhysical is boolean!')),
    })
    schema.validateAsync(req.body).then(result => {
        console.log("BEFORE", req.body.video);
        if (!isValidObjectId(result.main_categoryId)) return res.status(400).json(new apiResponse(400, "invalid categoryId", {}, {}));
        if (!isValidObjectId(result.categoryId)) return res.status(400).json(new apiResponse(400, "invalid categoryId", {}, {}));
        if (!isValidObjectId(result.subCategoryId)) return res.status(400).json(new apiResponse(400, "invalid categoryId", {}, {}));
        if (!isValidObjectId(result.id)) return res.status(400).json(new apiResponse(400, "Invalid id format", {}, {}));
        if (result.video) {
            req.body.video = `60d45480d1f4892d14d7b775/video/${result.video}`
            req.body.video = req.body.video.split('/').filter(function (item, i, allItems) {
                return i == allItems.indexOf(item);
            }).join('/')
        }
        if (!result.video) { req.body.video = `${result.video}` }
        if (!result.preview_video) { req.body.preview_video = `` }
        console.log("AFTER", req.body.video);
        return next()
    }).catch(error => { res.status(400).json(new apiResponse(400, error.message, {}, {})) })
}

export const enable = async (req: Request, res: Response, next: any) => {
    if (!isValidObjectId(req.params.id)) return res.status(400).json(new apiResponse(400, 'invalid id', {}, {}))
    if (req.params.isEnable != 'true' && req.params.isEnable != 'false') return res.status(400).json(new apiResponse(400, 'after id value is boolean', {}, {}))
    return next()
}