"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { theory_questionModel } from '../../database'
import { apiResponse } from '../../common'
import { Request, Response } from 'express'

const ObjectId = require('mongoose').Types.ObjectId

export const add_theory_question = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    req.body.createdBy = (req.header('user') as any)?._id
    try {
        let response = await new theory_questionModel(body).save()
        if (response) return res.status(200).json(new apiResponse(200, 'Theory question is added', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while adding theory question', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const get_theory_question = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await theory_questionModel.find({ isActive: true }, { _id: 1, question: 1, answer: 1, topicId: 1 })
        if (response) return res.status(200).json(new apiResponse(200, 'Theory question get successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while getting theory question', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const byId_theory_question = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await theory_questionModel.findOne({ _id: ObjectId(req.params.id), isActive: true })
        if (response) return res.status(200).json(new apiResponse(200, 'Theory question get successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while getting theory question', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const update_theory_question = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        id = body?.id,
        user: any = req.header('user')
    body.updatedBy = user._id
    try {
        let response = await theory_questionModel.findOneAndUpdate({ _id: ObjectId(id), isActive: true }, body)
        if (response) return res.status(200).json(new apiResponse(200, 'Updated theory question successfully', {}, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while updating theory question', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const delete_theory_question = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        user: any = req.header('user')
    body.updatedBy = user._id
    try {
        // let response = await theory_questionModel.findOneAndUpdate({ _id: ObjectId(req.params.id), isActive: true }, { isActive: false })
        let response = await theory_questionModel.findByIdAndDelete({ _id: ObjectId(req.params.id) })
        if (response) return res.status(200).json(new apiResponse(200, 'Deleted question successfully', {}, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while deleting theory questions', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const answer_theory_question = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    try {
        let response = await theory_questionModel.find({ theoryId: ObjectId(body.theoryId), isActive: true }, { answer: 1 })
        if (response) return res.status(200).json(new apiResponse(200, 'Answer successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while getting answer', {}, {}))
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const get_filter_theory_question = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = req.header('user'),
        { _id, search, limit, page, ascending, topicId } = req.body,
        skip = 0,
        response: any = {},
        match: any = {},
        sort: any = {}
    limit = parseInt(limit)
    skip = ((parseInt(page) - 1) * parseInt(limit))
    try {
        // if (search) {
        //     var questionArray: Array<any> = []
        //     var answerArray: Array<any> = []
        //     search = search.split(" ")
        //     search.forEach(data => {
        //         questionArray.push({ question: { $regex: data, $options: 'si' } })
        //         answerArray.push({ answer: { $regex: data, $options: 'si' } })

        //     })
        //     match.$or = [{ $and: questionArray }, { $and: answerArray }]
        // }
        if (topicId) {
            match.topicId = ObjectId(topicId)
        }
        match.isActive = true

        // Sorting Database
        sort.createdAt = -1
        if (ascending) sort.createdAt = 1

        let theoryQuestion_data = await theory_questionModel.aggregate([
            { $match: match },
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
                    theoryQuestion_count: [{ $count: "count" }]
                }
            }
        ])
        response.theoryQuestion_data = theoryQuestion_data[0].user || []
        response.state = {
            page, limit,
            page_limit: Math.ceil(theoryQuestion_data[0]?.theoryQuestion_count[0]?.count / limit)
        }
        res.status(200).json(new apiResponse(200, `Get theory question successfully`, response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}