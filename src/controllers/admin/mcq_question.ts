"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { questionModel, testModel } from '../../database'
import { apiResponse, testType, } from '../../common'
import { Request, Response } from 'express'

const ObjectId = require('mongoose').Types.ObjectId

export const add_question = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    req.body.createdBy = (req.header('user') as any)?._id
    try {
        let response = await new questionModel(body).save()
        if (response) return res.status(200).json(new apiResponse(200, 'Question added successfully', {}, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while adding question', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const get_question = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await questionModel.find({ isActive: true }, { _id: 1, question: 1, option: 1, answer: 1, topicId: 1 })
        if (response) return res.status(200).json(new apiResponse(200, 'Get question successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while getting questions', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const get_by_id_mcq = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await questionModel.find({ _id: ObjectId(req.params.id), isActive: true }, { _id: 1, question: 1, option: 1, answer: 1, topicId: 1 })
        if (response) return res.status(200).json(new apiResponse(200, 'Get question successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while getting question', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const get_by_title = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    try {
        let response = await questionModel.find({ question: body.question, isActive: true }, { id_: 1, topicId: 1, question: 1, option: 1, answer: 1 })
        if (response) return res.status(200).json(new apiResponse(200, 'Get question successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while getting question', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const update_question = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        id = body?.id,
        user: any = req.header('user')
    body.updatedBy = user._id
    try {
        let response = await questionModel.findOneAndUpdate({ _id: ObjectId(id), isActive: true }, body)
        if (response) return res.status(200).json(new apiResponse(200, 'Question updated successfully', {}, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while updating question', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const delete_mcq_question = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        user: any = req.header('user')
    body.updatedBy = user._id
    try {
        // let response = await questionModel.findOneAndUpdate({ _id: ObjectId(req.params.id), isActive: true }, { isActive: false })
        let response = await questionModel.findByIdAndDelete({ _id: ObjectId(req.params.id) })
        if (response) return res.status(200).json(new apiResponse(200, 'Deleted question successfully', {}, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while deleting question', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const get_mcq_id = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await questionModel.find({ mcqId: ObjectId(req.params.id), isActive: true }, { id_: 1, topicId: 1, question: 1, option: 1, answer: 1 })
        if (response) return res.status(200).json(new apiResponse(200, 'Get question successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while getting question', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const get_filter_mcq_question = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = req.header('user'),
        { search, limit, page, ascending, topicId } = req.body,
        skip = 0,
        response: any = {},
        match: any = {},
        sort: any = {}
    limit = parseInt(limit)
    skip = ((parseInt(page) - 1) * parseInt(limit))
    try {
        // if (search) {
        //     var topicArray: Array<any> = []
        //     search = search.split(" ")
        //     search.forEach(data => {
        //         topicArray.push({ "topic.topicName": { $regex: data, $options: 'si' } })

        //     })
        //     match.$or = [{ $and: topicArray }]
        // }
        if (topicId) {
            match.topicId = ObjectId(topicId)
        }
        match.isActive = true

        // Sorting Database
        sort.createdAt = -1
        if (ascending) sort.createdAt = 1

        let mcqQuestion_data = await questionModel.aggregate([
            { $match: match },
            // {
            //     $lookup: {
            //         from: "topics",
            //         let: { topicId: '$topicId' },
            //         pipeline: [
            //             {
            //                 $match: {
            //                     $expr: {
            //                         $and: [
            //                             { $eq: ['$_id', '$$topicId'] },
            //                             { $eq: ['$isActive', true] },
            //                         ],
            //                     },
            //                 }
            //             },
            //             { $project: { _id: 1, topicName: 1, } }
            //         ],
            //         as: "topic"
            //     }
            // },
            {
                $facet: {
                    user: [
                        { $sort: sort },
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                _id: 1, question: 1, answer: 1, topicId: 1
                            }
                        }
                    ],
                    mcqQuestion_count: [{ $count: "count" }]
                }
            }
        ])
        response.mcqQuestion_data = mcqQuestion_data[0].user || []
        response.state = {
            page, limit,
            page_limit: Math.ceil(mcqQuestion_data[0]?.mcqQuestion_count[0]?.count / limit)
        }
        res.status(200).json(new apiResponse(200, `Get theory question successfully`, response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}