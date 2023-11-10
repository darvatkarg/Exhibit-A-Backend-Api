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
        name: Joi.string().lowercase().required().error(new Error('name is required!')),
        password: Joi.string().required().error(new Error('password is required!')),
        phoneNumber: Joi.number().required().error(new Error('phoneNumber is required!')),
        schoolId: Joi.string().error(new Error('schoolId is string')),
        staffId: Joi.string().error(new Error('schoolId is string')),
        altEmail: Joi.string().lowercase().email().error(new Error("email is not valid")),
        address: Joi.string().error(new Error('address is string')),
        city: Joi.string().allow(null, "").error(new Error('city is string')),
        region: Joi.string().allow(null, "").error(new Error('region is string')),
        teacherID: Joi.string().allow(null, "").error(new Error('teacherID is string')),
    })
    schema.validateAsync(req.body).then(result => {
        req.body.userType = userStatus.teacher
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
        id: Joi.string().required().error(new Error('id is required')),
        name: Joi.string().error(new Error('name is string')),
        email: Joi.string().error(new Error('email is string')),
        phoneNumber: Joi.string().error(new Error('phoneNumber is string')),
        schoolId: Joi.string().error(new Error('schoolId is required')),
        staffId: Joi.string().error(new Error('staffId is string')),
        altEmail: Joi.string().lowercase().email().error(new Error("email is not valid")),
        address: Joi.string().error(new Error('address is string')),
        city: Joi.string().allow(null, "").error(new Error('city is string')),
        region: Joi.string().allow(null, "").error(new Error('region is string')),
        teacherID: Joi.string().allow(null, "").error(new Error('teacherID is string')),
    })
    schema.validateAsync(req.body).then(result => {
        if (!isValidObjectId(req.params.id)) return res.status(400).json(new apiResponse(400, 'invalid id', {}, {}))
        return next()
    }).catch(error => {
        res.status(400).json(new apiResponse(400, error.message, {}, {}));
    })
}

//teacher
export const update_profile = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        name: Joi.string().error(new Error('name is string')),
        email: Joi.string().error(new Error('email is string')),
        altEmail: Joi.string().error(new Error('altEmail is string')),
        phoneNumber: Joi.number().error(new Error('phoneNumber is number')),
        alter_phoneNumber: Joi.number().error(new Error('alter_phoneNumber is number')),
        image: Joi.string().allow(null, "").error(new Error('image is string')),
        address: Joi.string().error(new Error('address is string')),
        city: Joi.string().error(new Error('city is string')),
        region: Joi.string().error(new Error('region is string')),
        country: Joi.string().error(new Error('country is string')),
        PINCode: Joi.number().error(new Error('PINCode is number')),
        schoolId: Joi.string().error(new Error('schoolId is string')),
        teacherID: Joi.string().allow(null, "").error(new Error('teacherID is string')),
    })
    schema.validateAsync(req.body).then(result => {
        if (!isValidObjectId(req.params.id)) return res.status(400).json(new apiResponse(400, 'invalid id', {}, {}))
        return next()
    }).catch(error => {
        res.status(400).json(new apiResponse(400, error.message, {}, {}));
    })
}