"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { contactUsModel } from '../../database'
import { apiResponse, bookType } from '../../common'
import { Request, response, Response } from 'express'
import { contact_us_mail } from '../../helpers/mail'

const ObjectId = require('mongoose').Types.ObjectId

export const add_contact_us = async (req: Request, res: Response) => {
    reqInfo(req)
    req.body.createdBy = (req.header('user') as any)?._id
    try {
        let response = await new contactUsModel(req.body).save()
        await contact_us_mail(req.body)
        if (response) return res.status(200).json(new apiResponse(200, 'Successfully submitted', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error', {}, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, "Internal Server Error", {}, error))
    }
}

export const get_contact_us = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = (req.header('user') as any)?._id
    try {
        let response = await contactUsModel.find({ createdBy: ObjectId(user), isActive: true }, { createdAt: 0, updatedAt: 0, __v: 0 })
        if (response) return res.status(200).json(new apiResponse(200, 'Successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error', {}, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, "Internal Server Error", {}, error))
    }
}

export const get_response = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let result = await contactUsModel.findOneAndUpdate({ _id: ObjectId(req.body?.id), isActive: true }, { $addToSet: { responseMessage: req.body?.responseMessage }, isResponded: true })
        if (result) return res.status(200).json(new apiResponse(200, 'Your response has been submitted', {}, {}))
        else return res.status(404).json(new apiResponse(404, 'Contact us with the specific Id does not exist', {}, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, "Internal Server Error", {}, error))
    }
}
