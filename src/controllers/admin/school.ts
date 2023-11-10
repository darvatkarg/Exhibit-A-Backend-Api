"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { userModel, schoolModel } from '../../database'
import { apiResponse, userStatus } from '../../common'
import { Request, Response } from 'express'
import bcryptjs from 'bcryptjs'

const ObjectId = require('mongoose').Types.ObjectId

export const add_school = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    try {
        let authToken = 0,
            isAlready: any = await schoolModel.findOne({ $and: [{ $or: [{ email: body.email }, { phoneNumber: body.phoneNumber }] }, { isActive: true }] })
        if (isAlready) {
            if (isAlready?.phoneNumber == body?.phoneNumber) return res.status(409).json(new apiResponse(409, 'Phone number is already registered.', {}, {}))
            if (isAlready?.email == body?.email) return res.status(409).json(new apiResponse(409, 'Email is already registered.', {}, {}))
            if (isAlready?.isBlock == true) return res.status(403).json(new apiResponse(403, 'Your account han been blocked.', {}, {}))
        }
        else {
            // const salt = await bcryptjs.genSaltSync(10)
            // const hashPassword = await bcryptjs.hash(body.password, salt)
            // delete body.password
            // body.password = hashPassword
            // for (let flag = 0; flag < 1;) {
            //     authToken = await Math.round(Math.random() * 1000000)
            //     if (authToken.toString().length == 6) {
            //         flag++
            //     }
            // }
            req.body.createdBy = (req.header('user') as any)?._id
            let response = await new schoolModel(req.body).save()
            if (response) return res.status(200).json(new apiResponse(200, 'School added successfully', {}, {}))
            else return res.status(400).json(new apiResponse(400, 'Database error while adding school', {}, Error))
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, error))
    }
}

export const get_school = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await schoolModel.find({ isActive: true }, { createdBy: 0, updatedBy: 0, createdAt: 0, updatedAt: 0, __v: 0, isActive: 0, isBlock: 0 })
        if (response) return res.status(200).json(new apiResponse(200, 'Get school successfully ', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while getting school details ', {}, Error))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, error))
    }
}

export const get_by_id_school = async (req: Request, res: Response) => {
    reqInfo(req)
    let body: any = req.body,
        id = req.params.id
    try {
        let response = await schoolModel.findOne({ _id: ObjectId(id), isActive: true }, { _id: 1, createdBy: 0, updatedBy: 0, createdAt: 0, updatedAt: 0, __v: 0, isActive: 0, isBlock: 0 })
        if (response) return res.status(200).json(new apiResponse(200, 'Get school successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while getting school details', {}, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, "Internal server error", {}, error))
    }
}

export const update_school = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        id = body?.id,
        user: any = req.header('user')
    body.updatedBy = user._id
    try {
        let response = await schoolModel.findOneAndUpdate({ _id: ObjectId(id), isActive: true }, body)
        if (response) return res.status(200).json(new apiResponse(200, `School detail successfully updated`, {}, {}))
        else return res.status(404).json(new apiResponse(404, `Database  error while updating school details`, {}, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, "Internal server error", {}, error))
    }
}

export const delete_school = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        user: any = req.header('user')
    body.updatedBy = user._id
    try {
        let response = await schoolModel.findOneAndUpdate({ _id: ObjectId(req.params.id), isActive: true }, { isActive: false })
        if (response) return res.status(200).json(new apiResponse(200, `School detail successfully deleted`, {}, {}))
        else return res.status(404).json(new apiResponse(404, `Database error while deleting school`, {}, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, "Internal server error", {}, error))
    }
}

export const get_school_teacher = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        id = req.params.id
    try {
        let response = await userModel.find({ schoolId: ObjectId(id), isActive: true, userType: userStatus.teacher }, { name: 1, email: 1, phoneNumber: 1 })
        if (response) return res.status(200).json(new apiResponse(200, `Get school's teacher detail successfully`, response, {}))
        else return res.status(404).json(new apiResponse(404, `Database error while getting school's teacher details`, {}, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, "Internal server error", {}, error))
    }
}

export const get_filter_school = async (req: Request, res: Response) => {
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
            search = search.split(" ")
            search.forEach(data => {
                nameArray.push({ name: { $regex: data, $options: 'si' } })
                emailArray.push({ email: { $regex: data, $options: 'si' } })
            })
            match.$or = [{ $and: nameArray }, { $and: emailArray }]
        }

        match.isActive = true

        // Sorting Database
        sort.createdAt = -1
        if (ascending) sort.createdAt = 1

        let school_data = await schoolModel.aggregate([
            { $match: match },
            {
                $facet: {
                    user: [
                        { $sort: sort },
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                _id: 1, name: 1, email: 1, phoneNumber: 1, address: 1
                            }
                        }
                    ],
                    school_count: [{ $count: "count" }]
                }
            }
        ])
        response.school_data = school_data[0].user || []
        response.state = {
            page, limit,
            page_limit: Math.ceil(school_data[0]?.school_count[0]?.count / limit)
        }
        res.status(200).json(new apiResponse(200, `Get school successfully`, response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}
