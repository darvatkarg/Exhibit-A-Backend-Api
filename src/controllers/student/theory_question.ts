"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { theory_questionModel, topicModel } from '../../database'
import { apiResponse, URL_decode, userStatus } from '../../common'
import { Request, Response } from 'express'
import { count } from 'console'
import { promises } from 'stream'

const ObjectId = require('mongoose').Types.ObjectId

export const get_theory_question = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    let user: any = (req.header('user') as any)?._id
    try {
        let getQuestionNumber = await topicModel.findOne({ _id: ObjectId(req.params.id) }, { question_select: 1 });

        let response = await theory_questionModel.aggregate([
            { $match: { topicId: ObjectId(req.params.id), isActive: true } }, { $sample: { size: getQuestionNumber?.question_select } },
            {
                $lookup: {
                    from: "topics",
                    let: { topicId: '$topicId' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$_id', '$$topicId'] },
                                        { $eq: ['$isActive', true] },
                                    ],
                                },
                            }
                        },
                        {
                            $project: {
                                topicName: 1
                            }
                        }
                    ],
                    as: "topic"
                }
            },
            {
                $facet: {
                    question_data: [
                        {
                            $project: {
                                topicId: 1, topic: { $first: "$topic.topicName" },
                                question: 1, _id: 1, answer: 1,
                            }
                        },
                    ],
                    question_count: [{ $count: "count" }]
                }
            }
        ]);
        if (response) return res.status(200).json(new apiResponse(200, 'Get theory question successfully', { question_data: response[0]?.question_data, question_count: response[0]?.question_count }, {}))
        else return res.status(404).json(new apiResponse(404, 'Database error while getting MCQ question', {}, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, "Internal server error", {}, error))
    }
}