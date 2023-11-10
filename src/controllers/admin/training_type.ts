"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { course_subjectModel, training_optionModel, training_typeModel } from '../../database'
import { apiResponse, testType } from '../../common'
import { Request, Response } from 'express'
import { training_typeValidation } from '../../validation'

const ObjectId = require('mongoose').Types.ObjectId

export const add_training_type = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        search = new RegExp(`^${body.name}$`, "ig")
    req.body.createdBy = (req.header('user') as any)?._id
    try {
        let exist = await training_typeModel.findOne({ name: { $regex: search }, isActive: true }, { optionType: 1 })
        if (exist) return res.status(409).json(new apiResponse(409, 'Already register', {}, {}))
        else {
            let response = await new training_typeModel(body).save()
            if (response) return res.status(200).json(new apiResponse(200, 'Training type is added successfully', response, {}))
            else return res.status(400).json(new apiResponse(400, 'Database error', {}, {}))
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const get_training_type = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    try {
        let response = await training_typeModel.find({ isActive: true }, { name: 1, description: 1, optionType: 1 })
        if (response) return res.status(200).json(new apiResponse(200, 'Training type ', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error', {}, {}))

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const get_training_type_by_course_subject = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    let user = (req.header("user") as any)?._id;
    try {
        // let response = await training_typeModel.aggregate([
        //     { $match: { isActive: true } },
        //     {
        //         $lookup: {
        //             from: "course_subjects",
        //             let: { subjectId: ObjectId(req.params.id) },
        //             pipeline: [
        //                 {
        //                     $match: {
        //                         $expr: {
        //                             $and: [
        //                                 { $eq: ['$_id', '$$subjectId'] },
        //                                 { $eq: ['$isActive', true] },
        //                             ],
        //                         },
        //                     }
        //                 }
        //             ],
        //             as: "course_subject"
        //         }
        //     },
        //     { $project: { name: 1, description: 1, optionType: 1, pdf: { $first: "$course_subject.pdf_document" } } }
        // ])

        let response = await course_subjectModel.aggregate([
            { $match: { _id: ObjectId(req.params.id), isActive: true } },
            {
                $lookup: {
                    from: "training_types",
                    let: { training_typeId: '$training_typeId' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $in: ['$_id', '$$training_typeId'] },
                                        { $eq: ['$isActive', true] },
                                    ],
                                },
                            }
                        },
                        {
                            $lookup: {
                                from: "training_options",
                                let: { subjectId: ObjectId(req.params.id), optionType: "$optionType" },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $and: [
                                                    { $eq: ['$optionType', '$$optionType'] },
                                                    { $eq: ['$subjectId', '$$subjectId'] },
                                                    { $eq: ['$createdBy', ObjectId(user)] },
                                                    { $eq: ['$isActive', true] },
                                                ],
                                            },
                                        }
                                    }
                                ],
                                as: "isSelected"
                            }
                        },
                    ],
                    as: "training"
                }
            },
            {
                $project: {
                    description: 1, duration: 1, title: 1, pdf: 1, ePub: 1, image: 1, pdf_document: 1, passing_marks: 1, training_typeId: 1, time_slot: 1, "training.isSelected": 1,
                    "training.name": 1, "training.description": 1, "training.optionType": 1, "training._id": 1
                }
            }
        ])

        if (response) return res.status(200).json(new apiResponse(200, 'Training type ', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error', {}, {}))

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const update_training_type = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    req.body.updatedBy = (req.header('user') as any)?._id
    try {
        let response = await training_typeModel.findOneAndUpdate({ _id: ObjectId(body?.id), isActive: true }, body)
        if (response) return res.status(200).json(new apiResponse(200, 'Training type updated successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error', {}, {}))

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const delete_training_type = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    req.body.updatedBy = (req.header('user') as any)?._id
    try {
        let response = await training_typeModel.findOneAndUpdate({ _id: ObjectId(req.params.id), isActive: true }, { isActive: false })
        if (response) return res.status(200).json(new apiResponse(200, 'Training type deleted successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error', {}, {}))

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const get_by_training_type = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    try {
        let response = await training_typeModel.findOne({ _id: ObjectId(req.params.id), isActive: true }, { name: 1, description: 1, optionType: 1 })
        if (response) return res.status(200).json(new apiResponse(200, 'Training type ', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error', {}, {}))

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}