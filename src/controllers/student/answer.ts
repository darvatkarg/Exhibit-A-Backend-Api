"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { questionModel, answerModel, testModel, resultModel, question_bankModel } from '../../database'
import { apiResponse, URL_decode, userStatus } from '../../common'
import { Request, Response } from 'express'
import { count } from 'console'
import { promises } from 'stream'

const ObjectId = require('mongoose').Types.ObjectId

export const get_question_answered = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    let user: any = (req.header('user') as any)?._id
    try {
        let response = await question_bankModel.aggregate([
            { $match: { isActive: true }, subjectId: ObjectId(req.params.id) },
            {
                $lookup: {
                    from: "answers",
                    let: { questionId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$questionId', '$$questionId'] },
                                        { $eq: ['$isActive', true] },
                                        { $eq: ['$createdBy', ObjectId(user)] },
                                    ],
                                },
                            }
                        },
                        {
                            $project: {
                                answer: 1,
                            }
                        }
                    ],
                    as: "answer"
                }
            },
            {
                $lookup: {
                    from: "results",
                    let: { subjectId: '$subjectId' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$subjectId', '$$subjectId'] },
                                        { $eq: ['$isActive', true] },
                                        { $eq: ['$createdBy', ObjectId(user)] },
                                    ],
                                },
                            }
                        },
                        {
                            $project: {
                                test_start_time: 1
                            }
                        }
                    ],
                    as: "test"
                }
            },
            {
                $facet: {
                    question_data: [
                        {
                            $project: {
                                question: 1, option: 1, _id: 1, user_answer: {
                                    $cond: [{ $eq: ["$answer", []] }, { $const: "" }, { $first: "$answer.answer" }]
                                }, isAnswered: {
                                    $cond: [
                                        {
                                            $eq: ["$answer", []]
                                        },
                                        { $const: false }, true
                                    ]
                                }
                            }
                        },
                    ],
                    answered_question: [
                        {
                            $project: {
                                isAnswered: {
                                    $cond: [
                                        {
                                            $eq: ["$answer", []]
                                        },
                                        { $const: false }, true
                                    ]
                                }
                            }
                        },
                        { $match: { isAnswered: true } },
                        {
                            $group: {
                                _id: "$isAnswered",
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    unanswered_question: [
                        {
                            $project: {
                                isAnswered: {
                                    $cond: [
                                        {
                                            $eq: ["$answer", []]
                                        },
                                        { $const: false }, true
                                    ]
                                }
                            }
                        },
                        { $match: { isAnswered: false } },
                        {
                            $group: {
                                _id: "$isAnswered",
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    start_time: [
                        {
                            $project: {
                                test: 1,
                            }
                        }
                    ]
                }
            }

        ]);

        if (response) return res.status(200).json(new apiResponse(200, 'Get mcq test successfully',
            {
                question_data: response[0]?.question_data,
                answered_question: response[0]?.answered_question[0] || [{ "_id": true, count: 0 }],
                unanswered_question: response[0]?.unanswered_question[0] || [{ "_id": false, count: 0 }],
                start_time: response[0]?.start_time[0],
            }, {}))
        else return res.status(404).json(new apiResponse(404, 'Database error while getting MCQ test', {}, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, "Internal server error", {}, error))
    }
}

// export const add_answer = async (req: Request, res: Response) => {
//     reqInfo(req)
//     let user: any = (req.header('user') as any)?._id
//     let body = req.body
//     body.createdBy = user
//     try {
//         let existAnswer = await answerModel.find({ isActive: true, createdBy: ObjectId(user), questionId: ObjectId(body.questionId) })
//         let correctAnswer = await question_bankModel.findOne({ _id: ObjectId(body.questionId), isActive: true }, { _id: 0, answer: 1, testId: 1 })

//         //already answer exist
//         if (existAnswer.length == 1) {
//             if (correctAnswer?.answer == body?.answer) {
//                 body.isAnswerTrue = true;
//                 await answerModel.findOneAndUpdate({ questionId: ObjectId(body.questionId), isActive: true }, body)
//                 return res.status(200).json(new apiResponse(200, 'updated answer', {}, {}))
//             }
//             else {
//                 body.isAnswerTrue = false;
//                 await answerModel.findOneAndUpdate({ questionId: ObjectId(body.questionId), isActive: true }, body)
//                 return res.status(200).json(new apiResponse(200, 'updated answer', {}, {}))
//             }
//         }
//         let answered = await answerModel.findOne({ isActive: true, createdBy: ObjectId(user) }, { _id: 0, answer: 1 })
//         let result = await question_bankModel.findOne({ _id: ObjectId(body.questionId), isActive: true }, { _id: 0, answer: 1, testId: 1 })

//         if (answered == null) {         //new or old user
//             await new resultModel({ testId: ObjectId(result?.testId), createdBy: ObjectId(user) }).save()
//             if (result?.answer == body?.answer) {
//                 body.isAnswerTrue = true;
//                 let response = await new answerModel(body).save()
//                 if (response) return res.status(200).json(new apiResponse(200, 'Answer is added', {}, {}))
//                 else return res.status(400).json(new apiResponse(400, 'Database error while adding answer', {}, {}))
//             }
//             else {
//                 let response = await new answerModel(body).save()
//                 if (response) return res.status(200).json(new apiResponse(200, 'Answer is added', {}, {}))
//                 else return res.status(400).json(new apiResponse(400, 'Database error while adding answer', {}, {}))
//             }
//         }
//         else {
//             if (result?.answer == body?.answer) {
//                 body.isAnswerTrue = true;
//                 let response = await new answerModel(body).save()
//                 if (response) return res.status(200).json(new apiResponse(200, 'Answer is added', {}, {}))
//                 else return res.status(400).json(new apiResponse(400, 'Database error while adding answer', {}, {}))
//             }
//             else {
//                 let response = await new answerModel(body).save()
//                 if (response) return res.status(200).json(new apiResponse(200, 'Answer is added', {}, {}))
//                 else return res.status(400).json(new apiResponse(400, 'Database error while adding answer', {}, {}))
//             }
//         }
//     } catch (error) {
//         console.log(error)
//         return res.status(500).json(new apiResponse(500, "Internal server error", {}, error))
//     }
// }

export const update_answer = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        id = body?.id,
        qId = body?.questionId,
        user: any = req.header('user')
    body.updatedBy = user._id

    try {
        let response = await answerModel.findOneAndUpdate({ _id: ObjectId(id), isActive: true, questionId: ObjectId(qId) }, body)
        if (response) return res.status(200).json(new apiResponse(200, 'Answer updated successfully', {}, {}))
        else return res.status(404).json(new apiResponse(404, 'Database error while updating profile', {}, {}))
    } catch (error) {
        return res.status(500).json(new apiResponse(500, "Internal server error", {}, error))
    }
}

export const delete_answer = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await answerModel.findOneAndUpdate({ _id: ObjectId(req.params.id), isActive: true }, { isActive: false, updatedBy: ObjectId((req.header('user') as any)?._id), answer: null })
        if (response) return res.status(200).json(new apiResponse(200, 'Answer successfully delete', {}, {}))
        else return res.status(404).json(new apiResponse(404, ` Database error while deleting answer`, {}, {}))

    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, "Internal server error", {}, error))
    }
}

export const by_id_answer = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await questionModel.find({ _id: ObjectId(req.params.id), isActive: true }, { question: 1, option: 1 })
        if (response) return res.status(200).json(new apiResponse(200, 'Question', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}


export const add_answer = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = (req.header('user') as any)?._id
    let body = req.body
    body.createdBy = user
    try {
        let existAnswer = await answerModel.find({ isActive: true, createdBy: ObjectId(user), questionId: ObjectId(body.questionId), subjectId: ObjectId(body.subjectId) });

        let correctAnswer = await question_bankModel.findOne({ _id: ObjectId(body.questionId), isActive: true }, { _id: 0, answer: 1, subjectId: 1 })
        //existAnswer.length == 1
        if (existAnswer.length != 0) {

            if (correctAnswer?.answer == body?.answer) {
                body.isAnswerTrue = true;
                await answerModel.findOneAndUpdate({ questionId: ObjectId(body.questionId), isActive: true }, body)
                return res.status(200).json(new apiResponse(200, 'Updated answer', {}, {}))
            }
            else {
                console.log("else............")
                body.isAnswerTrue = false;
                await answerModel.findOneAndUpdate({ questionId: ObjectId(body.questionId), isActive: true }, body)
                return res.status(200).json(new apiResponse(200, 'Updated answer', {}, {}))
            }
        }

        let already = await answerModel.findOne({ isActive: true, createdBy: ObjectId(user), subjectId: ObjectId(body.subjectId) })
        let correct = await question_bankModel.findOne({ _id: ObjectId(body.questionId), isActive: true }, { _id: 0, answer: 1, subjectId: 1 })
        // console.log("ALREADY===========", already);

        if (already == null) {

            await new resultModel({ subjectId: ObjectId(body.subjectId), createdBy: ObjectId(user), test_start_time: new Date() }).save()
            if (correct?.answer == body?.answer) {
                body.isAnswerTrue = true;
                let response = await new answerModel(body).save()
                // console.log(response);

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