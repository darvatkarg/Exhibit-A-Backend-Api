"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { schoolModel, userModel } from '../../database'
import { apiResponse, userStatus } from '../../common'
import { Request, Response } from 'express'
import bcryptjs from 'bcryptjs'

const ObjectId = require('mongoose').Types.ObjectId

export const add_teacher = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    let user: any = req.header('user')
    body.createdBy = user._id
    body.schoolId = user._id
    try {
        let authToken = 0,
            isAlready: any = await userModel.findOne({ $and: [{ $or: [{ email: body.email }, { phoneNumber: body.phoneNumber }] }, { isActive: true }] })
        if (isAlready) {
            if (isAlready?.phoneNumber == body?.phoneNumber) return res.status(409).json(new apiResponse(409, 'Phone number is already registered.', {}, {}))
            if (isAlready?.email == body?.email) return res.status(409).json(new apiResponse(409, 'Email is already registered.', {}, {}))
            if (isAlready?.isBlock == true) return res.status(403).json(new apiResponse(403, 'Your account han been blocked.', {}, {}))
        }
        else {
            const salt = await bcryptjs.genSaltSync(10)
            const hashPassword = await bcryptjs.hash(body.password, salt)
            delete body.password
            body.password = hashPassword
            for (let flag = 0; flag < 1;) {
                authToken = await Math.round(Math.random() * 1000000)
                if (authToken.toString().length == 6) {
                    flag++
                }
            }
            body.authToken = authToken
            body.userType = userStatus.teacher
            body.isPhoneVerified = true
            req.body.createdBy = (req.header('user') as any)?._id
            let response = await new userModel(req.body).save()
            if (response) return res.status(200).json(new apiResponse(200, 'Teacher sign-up successfully', {}, {}))
            else return res.status(400).json(new apiResponse(400, 'Database error while adding teacher', {}, Error))
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, error))

    }
}

export const get_teacher = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        //let response = await userModel.find({ userType: userStatus.teacher, isActive: true, schoolId: ObjectId(req.header('user') as any)?._id }, { _id: 1, name: 1, email: 1, phoneNumber: 1, image: 1, schoolId: 1 })
        let response = await schoolModel.aggregate([
            {
                $lookup: {
                    from: "users",
                    let: { schoolId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$schoolId', '$$schoolId'] },
                                        { $eq: ['$isActive', true] },
                                    ],
                                }
                            }
                        }
                    ],
                    as: "teacher"
                }
            },
            {
                $project: {
                    name: 1,
                    "teacher.name": 1, "teacher.email": 1,
                    "teacher.phoneNumber": 1,
                }
            }
        ])
        if (response) return res.status(200).json(new apiResponse(200, 'Get teacher successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while getting teachers', {}, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, "Internal server error", {}, error))
    }
}

export const by_id_teacher = async (req: Request, res: Response) => {
    reqInfo(req)
    let body: any = req.body,
        id = req.params.id
    try {
        //let response = await userModel.findOne({ _id: ObjectId(id), isActive: true, userType: userStatus.teacher }, { _id: 1, name: 1, email: 1, phoneNumber: 1, image: 1, schoolId: 1 })
        let response = await schoolModel.aggregate([
            {
                $match: { isActive: true }
            },
            {
                $lookup: {
                    from: "users",
                    let: { schoolId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$schoolId', '$$schoolId'] },
                                        { $eq: ['$isActive', true] },
                                    ],
                                }
                            }
                        },
                        {
                            $match: { _id: ObjectId(req.params?.id) }
                        }
                    ],
                    as: "teacher"
                }
            },
            {
                $project: {
                    name: 1,
                    "teacher.name": 1, "teacher.email": 1,
                    "teacher.phoneNumber": 1,
                }
            }
        ])
        if (response) return res.status(200).json(new apiResponse(200, 'Get teacher details successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while getting teachers', {}, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, "Internal server error", {}, error))
    }
}

export const update_teacher = async (req: Request, res: Response) => {
    reqInfo(req)
    let body: any = req.body
    body.updatedBy = (req.header('user') as any)?._id
    try {
        let response = await userModel.findOneAndUpdate({ _id: ObjectId(body.id), isActive: true, userType: userStatus.teacher }, body)
        if (response) return res.status(200).json(new apiResponse(200, 'Teacher updated Successfully', {}, {}))
        else return res.status(400).json(new apiResponse(400, 'Teacher not updated ', {}, Error))
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const delete_teacher = async (req: Request, res: Response) => {
    reqInfo(req)
    let id = req.params.id
    let body: any = req.body
    body.updatedBy = (req.header('user') as any)?._id

    try {
        // let response = await userModel.findOneAndUpdate({ _id: ObjectId(id), isActive: true, userType: userStatus.teacher }, { isActive: false }).select('image _id email name')
        let response = await userModel.findOneAndDelete({ _id: ObjectId(id), isActive: true, userType: userStatus.teacher })
        if (response) return res.status(200).json(new apiResponse(200, 'Teacher successfully deleted', {}, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while  deleting teacher', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}