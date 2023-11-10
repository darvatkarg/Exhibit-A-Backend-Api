"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { schoolModel } from '../../database'
import { apiResponse, userStatus } from '../../common'
import { Request, Response } from 'express'

const ObjectId = require('mongoose').Types.ObjectId

export const get_student = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
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
                                        { $eq: ['$userType', userStatus.student] },
                                        { $eq: ['$isActive', true] },
                                    ],
                                }
                            }
                        }
                    ],
                    as: "student"
                }
            },
            {
                $project: {
                    name: 1,
                    "student.name": 1, "student.email": 1,
                    "student.phoneNumber": 1,
                }
            }
        ])

        if (response) return res.status(200).json(new apiResponse(200, 'Get students successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while getting student', {}, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, "Internal server error", {}, error))
    }
}