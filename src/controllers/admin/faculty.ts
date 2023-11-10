"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { userModel } from '../../database'
import { apiResponse, userStatus } from '../../common'
import { Request, Response } from 'express'
import bcryptjs from 'bcryptjs'
import { email_login_mail } from '../../helpers/mail'
import { func } from 'joi'

const ObjectId = require('mongoose').Types.ObjectId

export const add_faculty = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        pass = body.password
    let user: any = req.header('user')
    body.createdBy = user._id

    try {
        let authToken = 0,
            isAlready: any = await userModel.findOne({ $and: [{ $or: [{ email: body.email }, { phoneNumber: body.phoneNumber }] }, { isActive: true }] })
        if (isAlready) {
            if (isAlready?.phoneNumber == body?.phoneNumber) return res.status(409).json(new apiResponse(409, 'Phone number already registered.', {}, {}))
            if (isAlready?.email == body?.email) return res.status(409).json(new apiResponse(409, 'Email is already registered.', {}, {}))
            if (isAlready?.isBlock == true) return res.status(403).json(new apiResponse(403, 'Your account has been blocked.', {}, {}))
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
            body.userType = userStatus.faculty
            body.isPhoneVerified = true
            body.isEmailVerified = true
            req.body.createdBy = (req.header('user') as any)?._id
            await new userModel(req.body).save().then(async data => {
                //console.log(pass);
                let action = await email_login_mail(data, pass)
                return res.status(200).json(new apiResponse(200, 'Account successfully created!', { action: action }, {}));
            })
            // if (response) return res.status(200).json(new apiResponse(200, 'faculty sign-up successfully', {}, {}))
            // else return res.status(400).json(new apiResponse(400, 'database error while signing up faculty', {}, Error))
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, error))

    }
}

export const get_faculty = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await userModel.find({ userType: userStatus.faculty, isActive: true }, { _id: 1, name: 1, email: 1, phoneNumber: 1, image: 1, schoolId: 1 })
        if (response) return res.status(200).json(new apiResponse(200, 'Get faculty successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while getting faculty', {}, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, "Internal server error", {}, error))
    }
}

export const by_id_faculty = async (req: Request, res: Response) => {
    reqInfo(req)
    let body: any = req.body,
        id = req.params.id
    try {
        let response = await userModel.findOne({ _id: ObjectId(id), isActive: true, userType: userStatus.faculty }, { _id: 1, name: 1, email: 1, phoneNumber: 1 })
        if (response) return res.status(200).json(new apiResponse(200, 'Get faculty details successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while getting faculty details', {}, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, "Internal server error", {}, error))
    }
}

export const update_faculty = async (req: Request, res: Response) => {
    reqInfo(req)
    let body: any = req.body
    body.updatedBy = (req.header('user') as any)?._id
    try {
        let response = await userModel.findOneAndUpdate({ _id: ObjectId(body.id), isActive: true, userType: userStatus.faculty }, body)
        if (response) return res.status(200).json(new apiResponse(200, 'Faculty updated successfully', {}, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while updating faculty ', {}, Error))
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const delete_faculty = async (req: Request, res: Response) => {
    reqInfo(req)
    let id = req.params.id
    let body: any = req.body
    body.updatedBy = (req.header('user') as any)?._id

    try {
        let response = await userModel.findOneAndUpdate({ _id: ObjectId(id), isActive: true, userType: userStatus.faculty }, { isActive: false }).select('image _id email name')
        if (response) return res.status(200).json(new apiResponse(200, 'Faculty successfully deleted', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while deleting faculty', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const get_filter_faculty = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = req.header('user'),
        { _id, search, limit, page, ascending } = req.body,
        skip = 0,
        response: any = {},
        match: any = {},
        sort: any = {}
    limit = parseInt(limit)
    skip = ((parseInt(page) - 1) * parseInt(limit))
    try {
        // Database Filtering
        if (_id?.length != 0 && _id !== undefined) {
            _id.forEach(function (part, index, theArray) {
                theArray[index] = ObjectId(String(part))
            });
            match['_id'] = { "$in": _id }
        }
        if (search) {
            var nameArray: Array<any> = []
            var emailArray: Array<any> = []
            var phoneNumberArray: Array<any> = []
            search = search.split(" ")
            search.forEach(data => {
                nameArray.push({ name: { $regex: data, $options: 'si' } })
                emailArray.push({ email: { $regex: data, $options: 'si' } })
                phoneNumberArray.push({ phoneNumber: { $regex: data, $options: 'si' } })
            })
            match.$or = [{ $and: nameArray }, { $and: emailArray }, { $and: phoneNumberArray }]
        }
        // match['phoneNumber'] = { $regex: search, $options: 'si' }
        match.isActive = true
        match.userType = userStatus.faculty
        // Sorting Database
        sort.createdAt = -1
        if (ascending) sort.createdAt = 1

        let faculty_data = await userModel.aggregate([
            { $match: match },
            {
                $facet: {
                    user: [
                        { $sort: sort },
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                _id: 1, name: 1, email: 1, phoneNumber: 1,
                            }
                        }
                    ],
                    faculty_count: [{ $count: "count" }]
                }
            }
        ])
        response.faculty_data = faculty_data[0].user || []
        response.state = {
            page, limit,
            page_limit: Math.ceil(faculty_data[0]?.faculty_count[0]?.count / limit)
        }
        res.status(200).json(new apiResponse(200, `Get faculty successfully`, response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}