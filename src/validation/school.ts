"use strict"
import * as Joi from "joi"
import { apiResponse, userStatus } from '../common'
import { isValidObjectId } from 'mongoose'
import { Request, Response } from 'express'
import { reqInfo } from "../helpers/winston_logger"

//Admin
export const add = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        email: Joi.string().lowercase().required().error(new Error('email is required!')),
        // password: Joi.string().error(new Error('password is required')),
        name: Joi.string().lowercase().required().error(new Error('name is required!')),
        phoneNumber: Joi.number().error(new Error('phoneNumber is required!')),
        address: Joi.string().error(new Error('address is required!')),
        //website: Joi.string().required().error(new Error('website is required!')),
        // city: Joi.string().error(new Error('city is required!')),
        // state: Joi.string().error(new Error('state is required!')),
        // country: Joi.string().error(new Error('country is required!')),
        // PINcode: Joi.number().error(new Error('PINcode is required!')),
        established_date: Joi.date().error(new Error('established_date is required!')),
        //image: Joi.string().required().error(new Error('image is required'))
    })
    schema.validateAsync(req.body).then(result => {
        return next()
    }).catch(error => {
        res.status(400).json(new apiResponse(400, error.message, {}, {}));
    })
}

export const by_id = async (req: Request, res: Response, next: any) => {
    if (!isValidObjectId(req.params.id)) return res.status(400).json(new apiResponse(400, 'invalid id', {}, {}))
    return next()
}

export const update = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        id: Joi.string().required().error(new Error('id is required!')),
        name: Joi.string().error(new Error('name is string!')),
        email: Joi.string().error(new Error('email is string')),
        phoneNumber: Joi.number().error(new Error('phoneNumber is string!')),
        address: Joi.string().error(new Error('address is string!')),
        // city: Joi.string().error(new Error('city is string!')),
        // state: Joi.string().error(new Error('state is string!')),
        // country: Joi.string().error(new Error('country is string!')),
        // PINcode: Joi.number().error(new Error('PINcode is string!')),
        established_date: Joi.date().error(new Error('established_date is string!')),
        //image: Joi.string().error(new Error('image is string!'))
    })
    schema.validateAsync(req.body).then(result => {
        if (!isValidObjectId(result.id)) return res.status(400).json(new apiResponse(400, "Invalid id format", {}, {}));
        return next()
    }).catch(error => { res.status(400).json(new apiResponse(400, error.message, {}, {})) })
}

//school
export const update_profile = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        name: Joi.string().error(new Error('name is string')),
        email: Joi.string().error(new Error('email is string')),
        phoneNumber: Joi.string().error(new Error('phoneNumber is string')),
        image: Joi.string().error(new Error('image is string')),
    })
    schema.validateAsync(req.body).then(result => {
        if (!isValidObjectId(req.params.id)) return res.status(400).json(new apiResponse(400, 'invalid id', {}, {}))
        return next()
    }).catch(error => {
        res.status(400).json(new apiResponse(400, error.message, {}, {}));
    })
}