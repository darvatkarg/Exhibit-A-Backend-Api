"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { userModel, video_training_logModel, training_optionModel } from '../../database'
import { apiResponse, userStatus } from '../../common'
import { Request, Response } from 'express'
import bcryptjs from 'bcryptjs'
import { email_login_mail } from '../../helpers/mail'

const ObjectId = require('mongoose').Types.ObjectId

export const add_teacher = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        pass = body.password
    let user: any = req.header('user')
    body.createdBy = user._id

    try {
        let authToken = 0,
            isAlready: any = await userModel.findOne({ $and: [{ $or: [{ email: body.email }, { phoneNumber: body.phoneNumber }] }, { isActive: true }] })
        // console.log("user", isAlready);
        if (isAlready) {
            if (isAlready?.phoneNumber == body?.phoneNumber) return res.status(409).json(new apiResponse(409, 'Phone number is already registered.', {}, {}))
            if (isAlready?.email == body?.email) return res.status(409).json(new apiResponse(409, 'Email is already registered.', {}, {}))
            if (isAlready?.isBlock == true) return res.status(403).json(new apiResponse(403, 'Your account han been blocked.', {}, {}))
        }
        else {
            const salt = await bcryptjs.genSaltSync(10)
            const hashPassword = await bcryptjs.hash(body.password, salt)
            //delete body.password
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
            body.isEmailVerified = true
            req.body.createdBy = (req.header('user') as any)?._id
            await new userModel(req.body).save().then(async data => {
                //console.log(pass);
                let action = await email_login_mail(data, pass)
                return res.status(200).json(new apiResponse(200, 'Account created successfully!', { action: action }, {}));
            })
            // if (response) return res.status(200).json(new apiResponse(200, 'teacher sign-up successfully', {}, {}))
            // else return res.status(400).json(new apiResponse(400, 'Database error while signing up teacher', {}, Error))
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, error))

    }
}

export const get_teacher = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await userModel.find({ userType: userStatus.teacher, isActive: true }, { _id: 1, name: 1, email: 1, phoneNumber: 1, image: 1, schoolId: 1, address: 1, city: 1, region: 1, altEmail: 1 })
        if (response) return res.status(200).json(new apiResponse(200, 'Get teacher successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while getting teachers', {}, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, "Internal server error", {}, error))
    }
}

export const get_filter_data = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = req.header('user'),
        { _id, schoolId, search, limit, page, ascending } = req.body,
        skip = 0,
        response: any = {},
        match: any = {},
        sort: any = {}
    limit = parseInt(limit)
    skip = ((parseInt(page) - 1) * parseInt(limit))
    try {
        if (schoolId?.length != 0 && schoolId !== undefined) {
            schoolId.forEach(function (part, index, theArray) {
                theArray[index] = ObjectId(String(part))
            });
            //match['schoolId'] = { "$in": schoolId }
            match.schoolId = { "$in": schoolId }
        }
        if (search) {
            var nameArray: Array<any> = []
            var emailArray: Array<any> = []
            var alter_emailArray: Array<any> = []
            var phoneNumberArray: Array<any> = []
            search = search.split(" ")
            search.forEach(data => {
                nameArray.push({ name: { $regex: data, $options: 'si' } })
                emailArray.push({ email: { $regex: data, $options: 'si' } })
                alter_emailArray.push({ altEmail: { $regex: data, $options: 'si' } })
                phoneNumberArray.push({ phoneNumber: { $regex: data, $options: 'si' } })
            })
            match.$or = [{ $and: nameArray }, { $and: emailArray }, { $and: alter_emailArray }, { $and: phoneNumberArray }]
        }
        match.isActive = true
        match.userType = userStatus.teacher
        sort.createdAt = -1
        if (ascending) sort.createdAt = 1

        let teacher_data = await userModel.aggregate([
            { $match: match },
            {
                $lookup: {
                    from: "schools",
                    let: { schoolId: '$schoolId' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$_id', '$$schoolId'] },
                                        { $eq: ['$isActive', true] },
                                    ],
                                },
                            }
                        }
                    ],
                    as: "school"
                }
            },
            { $sort: sort },
            { $skip: skip },
            { $limit: limit },
            {
                $project: {
                    _id: 1, name: 1, email: 1, phoneNumber: 1,
                    schoolId: 1, registeredDate: 1, createdAt: 1,
                    "school.name": 1, "school.email": 1,
                    "school.address": 1,
                    "school.established_date": 1, "school.phoneNumber": 1,
                    teacherID: 1
                }
            }
        ])
        let teacher_count = await userModel.aggregate([{ $match: match }, { $count: "count" }])
        response.teacher_data = teacher_data || []
        response.state = {
            page, limit,
            page_limit: Math.ceil(teacher_count[0]?.count / limit)
        }
        res.status(200).json(new apiResponse(200, `Get teacher successfully`, response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const by_id_teacher = async (req: Request, res: Response) => {
    reqInfo(req)
    let body: any = req.body,
        id = req.params.id
    try {
        let response = await userModel.findOne({ _id: ObjectId(id), isActive: true, userType: userStatus.teacher }, { _id: 1, name: 1, email: 1, altEmail: 1, phoneNumber: 1, image: 1, schoolId: 1, address: 1, city: 1, region: 1 })
        if (response) return res.status(200).json(new apiResponse(200, 'Get teacher details successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while getting teacher details', {}, {}))
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
        let response = await userModel.findOneAndUpdate({ _id: ObjectId(body.id), isActive: true, userType: userStatus.teacher }, body, { new: true })
        if (response) return res.status(200).json(new apiResponse(200, 'Teacher updated successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while updating teacher ', {}, Error))
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
        await training_optionModel.deleteMany({ createdBy: ObjectId(id) });

        await video_training_logModel.deleteMany({ logUserId: ObjectId(id) })
        if (response) return res.status(200).json(new apiResponse(200, 'Teacher successfully deleted', {}, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while deleting teacher', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}
