"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { user_batchModel } from '../../database'
import { apiResponse, URL_decode, userStatus } from '../../common'
import { Request, response, Response } from 'express'

const ObjectId = require('mongoose').Types.ObjectId

export const get_batch_date_time = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = (req.header('user') as any)?._id
    try {
        let response = await user_batchModel.aggregate([
            { $match: { selectedUser: ObjectId(user), isActive: true, subjectId: ObjectId(req.params.id) } },
            {
                $lookup: {
                    from: "time_slots",
                    let: { time_slotId: '$time_slotId' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$_id', '$$time_slotId'] },
                                        { $eq: ['$isActive', true] },
                                    ],
                                },
                            }
                        }
                    ],
                    as: "time_slot"
                }
            },
            {
                $project: {
                    date: 1, time_slotId: 1, subjectId: 1,
                    selectedUser: 1,
                    "time_slot.start_time": 1, "time_slot.end_time": 1
                }
            }
        ])

        if (response) return res.status(200).json(new apiResponse(200, 'Your schedule time slot', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal Server error', {}, {}))
    }
}