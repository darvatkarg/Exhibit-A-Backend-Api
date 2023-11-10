"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { userModel, } from '../../database'
import { apiResponse, URL_decode, userStatus } from '../../common'
import { Request, Response } from 'express'
import { deleteImage } from '../../helpers/S3'

const ObjectId = require('mongoose').Types.ObjectId

export const get_profile = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await userModel.findOne({ _id: ObjectId((req.header('user') as any)?._id), isActive: true, userType: userStatus.sub_admin }, { _id: 1, name: 1, email: 1, phoneNumber: 1, alterPhoneNumber: 1, image: 1 })
        if (response) return res.status(200).json(new apiResponse(200, 'Get profile successfully', response, {}))
        else return res.status(404).json(new apiResponse(404, 'Database error while getting profile', {}, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, "Internal Server Error", {}, error))
    }
}

export const update_profile = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        id = body?.id,
        user: any = req.header('user')
    body.updatedBy = user._id

    try {
        let response = await userModel.findOneAndUpdate({ _id: ObjectId((req.header('user') as any)?._id), isActive: true, userType: userStatus.sub_admin }, body)
        if (response) {
            if (response.image != body?.image) {
                let [folder_name, image_name] = await URL_decode(response?.image)
                await deleteImage(image_name, folder_name)
            }
            return res.status(200).json(new apiResponse(200, 'Profile updated successfully', {}, {}))
        }
        else return res.status(404).json(new apiResponse(404, 'Database error while updating profile', {}, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, "Internal Server Error", {}, error))
    }
}

