"use strict"
import * as Joi from "joi"
import { apiResponse } from '../common'
import { isValidObjectId } from 'mongoose'
import { Request, Response } from 'express'

export const signUp = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        email: Joi.string().lowercase().max(50).required().error(new Error('email is required! & max length is 50')),
        password: Joi.string().required().error(new Error('password is required!')),
        name: Joi.string().required().error(new Error('name is required!')),
        phoneNumber: Joi.string().error(new Error('phoneNumber is number')),
        address: Joi.string().error(new Error('address is string')),
        city: Joi.string().allow(null, "").error(new Error('city is string')),
        region: Joi.string().allow(null, "").error(new Error('region is string')),
        country: Joi.string().error(new Error('country is string')),
        countryCode: Joi.number().error(new Error('countryCode is number')),
        register_password: Joi.string().error(new Error('address is string')),
        userType: Joi.number().required().error(new Error('userType is required')),
    })
    schema.validateAsync(req.body).then(result => {
        return next()
    }).catch(error => {
        res.status(400).json(new apiResponse(400, error.message, {}, {}));
    })

}

export const login = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        email: Joi.string().lowercase().max(50).required().error(new Error('email is required! & max length is 50')),
        password: Joi.string().required().error(new Error('password is required!')),
    })
    schema.validateAsync(req.body).then(result => {
        return next()
    }).catch(error => {
        res.status(400).json(new apiResponse(400, error.message, {}, {}));
    })
}

export const forgot_password = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        email: Joi.string().lowercase().max(50).required().error(new Error('email is required! & max length is 50')),
    })
    schema.validateAsync(req.body).then(result => {
        req.body = result
        return next()
    }).catch(error => {
        res.status(400).json(new apiResponse(400, error.message, {}, {}));
    })
}

export const verify = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        id: Joi.string().required().error(new Error('id is required! ')),
        email: Joi.string().error(new Error('email is required!')),
        countryCode: Joi.number().error(new Error('countryCode is number')),
        phoneNumber: Joi.string().error(new Error('phoneNumber is required!')),
    })
    schema.validateAsync(req.body).then(result => {
        req.body = result
        return next()
    }).catch(error => {
        res.status(400).json(new apiResponse(400, error.message, {}, {}));
    })
}

export const reset_password = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        id: Joi.string().required().error(new Error('id is required! ')),
        password: Joi.string().required().error(new Error('password is required!')),
        authToken: Joi.number().required().error(new Error('authToken is required!')),
    })
    schema.validateAsync(req.body).then(result => {
        if (!isValidObjectId(result.id)) return res.status(400).json(new apiResponse(400, 'invalid id', {}, {}))
        return next()
    }).catch(error => {
        res.status(400).json(new apiResponse(400, error.message, {}, {}));
    })
}

export const otp_verification = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        otp: Joi.number().min(100000).max(999999).error(new Error('OTP is required! & only is 6 digits')),
        phone_otp: Joi.number().min(100000).max(999999).error(new Error('OTP is required! & only is 6 digits')),
        deviceToken: Joi.string().error(new Error('deviceToken is string!')),
        email: Joi.string().error(new Error('email is string!')),
        phoneNumber: Joi.string().error(new Error('phoneNumber is string!')),
    })
    schema.validateAsync(req.body).then(result => {
        return next()
    }).catch(error => {
        res.status(400).json(new apiResponse(400, error.message, {}, {}));
    })
}

export const resend_otp = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        email: Joi.string().required().error(new Error('email is required! '))
    })
    schema.validateAsync(req.body).then(result => {
        return next()
    }).catch(error => {
        res.status(400).json(new apiResponse(400, error.message, {}, {}));
    })
}

export const update_profile = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        image: Joi.string().error(new Error('image is string')),
        name: Joi.string().error(new Error('name is string')),
        email: Joi.string().error(new Error('email is string')),
        phoneNumber: Joi.number().error(new Error('phoneNumber is number')),
        alter_phoneNumber: Joi.number().error(new Error('alter_phoneNumber is number'))
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

export const block = async (req: Request, res: Response, next: any) => {
    if (!isValidObjectId(req.params.id)) return res.status(400).json(new apiResponse(400, 'invalid id', {}, {}))
    if (typeof (req.params.isBlock) !== 'boolean') return res.status(400).json(new apiResponse(400, 'after id value is boolean', {}, {}))
    return next()
}

export const change_password = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        old_password: Joi.string().required().error(new Error('old_password is required! ')),
        new_password: Joi.string().required().error(new Error('new_password is required! ')),
    })
    schema.validateAsync(req.body).then(result => {
        return next()
    }).catch(error => { res.status(400).json(new apiResponse(400, error.message, {}, {})) })
}