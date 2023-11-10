"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { questionModel, answerModel, testModel, resultModel, schedule_time_slotModel } from '../../database'
import { apiResponse, URL_decode, userStatus } from '../../common'
import { Request, response, Response } from 'express'
import { pdf_generation } from '../../helpers/pdf_generate'
import { count } from 'console'
import { promises } from 'stream'

const ObjectId = require('mongoose').Types.ObjectId

export const add_slot = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    let user: any = (req.header('user') as any)?._id
    body.createdBy = user
    try {
        let isAlreadyExit = await schedule_time_slotModel.findOne({ createdBy: ObjectId(user), isActive: true, subjectId: ObjectId(body.subjectId) })
        // console.log(isAlreadyExit);

        if (isAlreadyExit == null) {
            let response = await new schedule_time_slotModel(body).save()
            if (response) res.status(200).json(new apiResponse(200, 'Schedule time slot', response, {}))
            else res.status(400).json(new apiResponse(400, 'Error', {}, {}))
        }
        else {
            return res.status(200).json(new apiResponse(200, 'Your schedule time slot', isAlreadyExit, {}))
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal Server error', {}, {}))
    }
}

export const get_slot = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    let user: any = (req.header('user') as any)?._id
    body.createdBy = user
    try {
        let response = await schedule_time_slotModel.findOne({ createdBy: ObjectId(user), isActive: true }, { date: 1, time_slotId: 1, subjectId: 1 })
        if (response) return res.status(200).json(new apiResponse(200, 'Your schedule time slot', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database Error', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal Server error', {}, {}))
    }
}

export const get__slot = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    let user: any = (req.header('user') as any)?._id
    body.createdBy = user
    try {
        // let response = await schedule_time_slotModel.findOne({ createdBy: ObjectId(user), isActive: true }, { date: 1, time_slotId: 1 })
        let response = await schedule_time_slotModel.aggregate([
            { $match: { createdBy: ObjectId(user), isActive: true } },
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

export const get_slot_subjectId = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = (req.header('user') as any)?._id
    try {
        // let response = await schedule_time_slotModel.findOne({ createdBy: ObjectId(user), isActive: true, subjectId: ObjectId(req.params.id) }, { date: 1, time_slotId: 1,subjectId:1 })
        let response = await schedule_time_slotModel.aggregate([
            { $match: { createdBy: ObjectId(user), isActive: true, subjectId: ObjectId(req.params.id) } },
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
                    "time_slot.start_time": 1, "time_slot.end_time": 1
                }
            }
        ])
        // console.log(response);

        if (response) return res.status(200).json(new apiResponse(200, 'Your schedule time slot', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal Server error', {}, {}))
    }
}