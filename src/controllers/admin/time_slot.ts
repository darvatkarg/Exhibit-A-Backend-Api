"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { course_subjectModel, testModel, time_slot_Model } from '../../database'
import { apiResponse, testType } from '../../common'
import { Request, Response } from 'express'

const ObjectId = require('mongoose').Types.ObjectId

export const add_slot = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    req.body.createdBy = (req.header('user') as any)?._id
    try {
        let response = await new time_slot_Model(body).save()
        if (response) return res.status(200).json(new apiResponse(200, 'Slot is added', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while adding', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const get_slot = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    try {
        let response = await time_slot_Model.find({ isActive: true }, { start_time: 1, end_time: 1, _id: 1 })
        if (response) return res.status(200).json(new apiResponse(200, 'Slot', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const update_slot = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    req.body.updatedBy = (req.header('user') as any)?._id
    try {
        let response = await time_slot_Model.findOneAndUpdate({ _id: ObjectId(body.id), isActive: true }, body)
        if (response) return res.status(200).json(new apiResponse(200, 'Slot updated', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const delete_slot = async (req: Request, res: Response) => {
    reqInfo(req)
    req.body.updatedBy = (req.header('user') as any)?._id
    try {
        let response = await time_slot_Model.findOneAndUpdate({ _id: ObjectId(req.params.id), isActive: true }, { isActive: false })
        if (response) return res.status(200).json(new apiResponse(200, 'Slot deleted', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const get_by_id_slot = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await time_slot_Model.findOne({ _id: ObjectId(req.params.id), isActive: true }, { start_time: 1, end_time: 1, _id: 1 })
        if (response) return res.status(200).json(new apiResponse(200, 'Slot', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const get_slot_by_scbject = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    try {
        // let response = await time_slot_Model.find({ isActive: true }, { start_time: 1, end_time: 1, _id: 1 })
        let response = await course_subjectModel.aggregate([
            {
                $match: { isActive: true, _id: ObjectId(req.params.id) }
            },
            {
                $lookup: {
                    from: "time_slots",
                    let: { time_slotId: '$time_slotId' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $in: ['$_id', '$$time_slotId'] },
                                        { $eq: ['$isActive', true] },
                                    ],
                                },
                            }
                        },
                        { $project: { start_time: 1, end_time: 1 } }
                    ],
                    as: "time_slot"
                }
            },
            {
                $project: {
                    title: 1, description: 1, "time_slot.start_time": 1, "time_slot.end_time": 1, "time_slot._id": 1
                }
            }
        ])
        if (response) return res.status(200).json(new apiResponse(200, 'Slot', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}