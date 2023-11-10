"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { questionModel, answerModel, testModel, resultModel, question_bankModel, course_subjectModel } from '../../database'
import { apiResponse, URL_decode, userStatus } from '../../common'
import { Request, Response } from 'express'
import { count } from 'console'
import { promises } from 'stream'

const ObjectId = require('mongoose').Types.ObjectId

export const add_computer_answer = async (req: Request, res: Response) => {
    reqInfo(req)
    console.log(1)
    let user: any = (req.header('user') as any)?._id
    let body = req.body
    body.createdBy = user
    try {
        let existAnswer = await answerModel.find({ isActive: true, createdBy: ObjectId(user), questionId: ObjectId(body.questionId) })
        let correctAnswer = await questionModel.findOne({ _id: ObjectId(body.questionId), isActive: true }, { _id: 0, answer: 1, testId: 1 })
        if (existAnswer.length == 1) {
            if (correctAnswer?.answer == body?.answer) {
                body.isAnswerTrue = true;
                await answerModel.findOneAndUpdate({ questionId: ObjectId(body.questionId), isActive: true }, body)
                return res.status(200).json(new apiResponse(200, 'Updated answer', {}, {}))
            }
            else {
                body.isAnswerTrue = false;
                await answerModel.findOneAndUpdate({ questionId: ObjectId(body.questionId), isActive: true }, body)
                return res.status(200).json(new apiResponse(200, 'Updated answer', {}, {}))
            }
        }
        let already = await answerModel.findOne({ isActive: true, createdBy: ObjectId(user) })
        let correct = await questionModel.findOne({ _id: ObjectId(body.questionId), isActive: true }, { _id: 0, answer: 1, testId: 1 })
        if (already == null) {
            await new resultModel({ testId: ObjectId(correct?.testId), createdBy: ObjectId(user), test_start_time: new Date() }).save()
            if (correct?.answer == body?.answer) {
                body.isAnswerTrue = true;
                let response = await new answerModel(body).save()
                if (response) res.status(200).json(new apiResponse(200, 'Added', response, {}))
                else res.status(400).json(new apiResponse(400, 'Database error', {}, {}))
            }
            else {
                let response = await new answerModel(body).save()
                if (response) res.status(200).json(new apiResponse(200, 'Added', response, {}))
                else res.status(400).json(new apiResponse(400, 'Database error', {}, {}))
            }
        } else {
            if (correct?.answer == body?.answer) {
                body.isAnswerTrue = true;
                let response = await new answerModel(body).save()
                if (response) res.status(200).json(new apiResponse(200, 'Added', response, {}))
                else res.status(400).json(new apiResponse(400, 'Database error', {}, {}))
            }
            else {
                let response = await new answerModel(body).save()
                if (response) res.status(200).json(new apiResponse(200, 'Added', response, {}))
                else res.status(400).json(new apiResponse(400, 'Database error', {}, {}))
            }
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, "Internal server error", {}, error))
    }
}

// export const get_computer_answer = async (req: Request, res: Response) => {
//     reqInfo(req)
//     let body = req.body
//     let user: any = (req.header('user') as any)?._id
//     try {
//         let getQuestionNumber = await course_subjectModel.findOne({ _id: ObjectId(req.params.id) }, { question_select: 1 });

//         let response = await question_bankModel.aggregate([
//             { $match: { subjectId: ObjectId(req.params.id), isActive: true } }, { $sample: { size: getQuestionNumber?.question_select } },
//             {
//                 $lookup: {
//                     from: "course_subjects",
//                     let: { subjectId: '$subjectId' },
//                     pipeline: [
//                         {
//                             $match: {
//                                 $expr: {
//                                     $and: [
//                                         { $eq: ['$_id', '$$subjectId'] },
//                                         { $eq: ['$isActive', true] },
//                                     ],
//                                 },
//                             }
//                         },
//                         {
//                             $project: {
//                                 title: 1
//                             }
//                         }
//                     ],
//                     as: "subject"
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "answers",
//                     let: { questionId: '$_id' },
//                     pipeline: [
//                         {
//                             $match: {
//                                 $expr: {
//                                     $and: [
//                                         { $eq: ['$questionId', '$$questionId'] },
//                                         { $eq: ['$isActive', true] },
//                                         { $eq: ['$createdBy', ObjectId(user)] },
//                                     ],
//                                 },
//                             }
//                         },
//                         {
//                             $project: {
//                                 answer: 1
//                             }
//                         }
//                     ],
//                     as: "answer"
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "results",
//                     let: { subjectId: '$subjectId' },
//                     pipeline: [
//                         {
//                             $match: {
//                                 $expr: {
//                                     $and: [
//                                         { $eq: ['$subjectId', '$$subjectId'] },
//                                         { $eq: ['$isActive', true] },
//                                         { $eq: ['$createdBy', ObjectId(user)] },
//                                     ],
//                                 },
//                             }
//                         },
//                         {
//                             $project: {
//                                 test_start_time: 1
//                             }
//                         }
//                     ],
//                     as: "test"
//                 }
//             },
//             {
//                 $facet: {
//                     // subject: ["$subject.title"],
//                     question_data: [
//                         {
//                             $project: {
//                                 subjectId: 1, subject: { $first: "$subject.title" },
//                                 question: 1, option: 1, _id: 1,
//                                 user_answer: {
//                                     $cond: [{ $eq: ["$answer", []] }, { $const: "" }, { $first: "$answer.answer" }]
//                                 },
//                                 isAnswered: {
//                                     $cond: [
//                                         {
//                                             $eq: ["$answer", []]
//                                         },
//                                         { $const: false }, true
//                                     ]
//                                 }
//                             }
//                         },
//                     ],
//                     answered_question: [
//                         {
//                             $project: {
//                                 isAnswered: {
//                                     $cond: [
//                                         {
//                                             $eq: ["$answer", []]
//                                         },
//                                         { $const: false }, true
//                                     ]
//                                 }
//                             }
//                         },
//                         { $match: { isAnswered: true } },
//                         {
//                             $group: {
//                                 _id: "$isAnswered",
//                                 count: { $sum: 1 }
//                             }
//                         }
//                     ],
//                     unanswered_question: [
//                         {
//                             $project: {
//                                 isAnswered: {
//                                     $cond: [
//                                         {
//                                             $eq: ["$answer", []]
//                                         },
//                                         { $const: false }, true
//                                     ]
//                                 }
//                             }
//                         },
//                         { $match: { isAnswered: false } },
//                         {
//                             $group: {
//                                 _id: "$isAnswered",
//                                 count: { $sum: 1 }
//                             }
//                         }
//                     ],
//                     start_time: [
//                         {
//                             $project: {
//                                 test: 1,
//                             }
//                         }
//                     ]
//                 }
//             }

//         ]);
//         if (response) return res.status(200).json(new apiResponse(200, 'get Question successfully',
//             {
//                 question_data: response[0]?.question_data,
//                 answered_question: response[0]?.answered_question[0] || { "_id": true, count: 0 },
//                 unanswered_question: response[0]?.unanswered_question[0] || { "_id": false, count: 0 },
//                 start_time: response[0]?.start_time[0],
//             }, {}))
//         else return res.status(404).json(new apiResponse(404, 'Database error while getting computer test', {}, {}))
//     } catch (error) {
//         console.log(error)
//         return res.status(500).json(new apiResponse(500, "Internal server error", {}, error))
//     }
// }

export const get_computer_answer = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    let user: any = (req.header('user') as any)?._id
    try {
        let getQuestionNumber = await course_subjectModel.findOne({ _id: ObjectId(req.params.id) }, { question_select: 1 });

        let response = await question_bankModel.aggregate([
            { $match: { subjectId: ObjectId(req.params.id), isActive: true } }, { $sample: { size: getQuestionNumber?.question_select } },
            {
                $lookup: {
                    from: "course_subjects",
                    let: { subjectId: '$subjectId' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$_id', '$$subjectId'] },
                                        { $eq: ['$isActive', true] },
                                    ],
                                },
                            }
                        },
                        {
                            $project: {
                                title: 1
                            }
                        }
                    ],
                    as: "subject"
                }
            },
            {
                $facet: {
                    question_data: [
                        {
                            $project: {
                                subjectId: 1, subject: { $first: "$subject.title" },
                                question: 1, option: 1, _id: 1, answer: 1,
                            }
                        },
                    ],
                }
            }

        ]);
        if (response) return res.status(200).json(new apiResponse(200, 'get Question successfully',
            {
                question_data: response[0]?.question_data,
            }, {}))
        else return res.status(404).json(new apiResponse(404, 'Database error while getting computer test', {}, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, "Internal server error", {}, error))
    }
}