"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { answerModel, testModel, userModel } from '../../database'
import { apiResponse, userStatus } from '../../common'
import { Request, Response } from 'express'

const ObjectId = require('mongoose').Types.ObjectId

export const report_region_wise = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await userModel.aggregate([
            { $match: { isActive: true, userType: 0, isEmailVerified: true, isPhoneVerified: true } },
            {
                $group: {
                    _id: "$city",
                    region: { $first: "$region" },
                    count: { $sum: 1 }
                }
            }
        ])
        if (response) return res.status(200).json(new apiResponse(200, 'report successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while deleting result', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const export_region_wise_user_data = async (req: Request, res: Response) => {
    reqInfo(req)
    let { city } = req.body
    try {
        let response = await userModel.aggregate([
            { $match: { isActive: true, userType: 0, isEmailVerified: true, isPhoneVerified: true, city: city } },
            {
                $lookup: {
                    from: "forms",
                    let: { createdBy: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$createdBy", "$$createdBy"] },
                                        { $eq: ["$isActive", true] },
                                    ],
                                },
                            },
                        },
                        { $project: { document_image: 1 } }
                    ],
                    as: "documents",
                },
            },
            {
                $lookup: {
                    from: "results",
                    let: { createdBy: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$createdBy", "$$createdBy"] },
                                        { $eq: ["$isActive", true] },
                                    ],
                                },
                            },
                        },
                        { $project: { score: 1 } }
                    ],
                    as: "result",
                },
            },
            {
                $project: {
                    name: 1, email: 1, phoneNumber: 1, address: 1, country: 1, region: 1, city: 1, countryCode: 1, teacherID: 1,
                    schoolName: 1, image: 1, isEmailVerified: 1, isPhoneVerified: 1, accountType: 1, userType: 1,
                    documents: 1,
                    result: 1,
                    isExamGiven: {
                        $cond: [
                            {
                                $eq: ["$result", []],
                            },
                            { $const: false },
                            true,
                        ],
                    },
                    isDocument: {
                        $cond: [
                            {
                                $eq: ["$documents", []],
                            },
                            { $const: false },
                            true,
                        ],
                    },
                }
            }
        ])
        if (response) return res.status(200).json(new apiResponse(200, 'report successfully exported', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while deleting result', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}