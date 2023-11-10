"use strict";
import { reqInfo } from "../../helpers/winston_logger";
import { feedbackQuestionModel, feedbackAnswerModel } from "../../database";
import { apiResponse, topicType } from "../../common";
import { Request, Response } from "express";
import { deleteImage } from "../../helpers/S3";
var json2xls = require('json2xls');
import fs from 'fs'

const ObjectId = require("mongoose").Types.ObjectId;

export const add_feedback_question = async (req: Request, res: Response) => {
    reqInfo(req);
    let body = req.body;
    req.body.createdBy = (req.header("user") as any)?._id;
    try {
        let response = await new feedbackQuestionModel(body).save();
        if (response)
            return res.status(200).json(new apiResponse(200, "feedback question added successfully", response, {}));
        else
            return res.status(400).json(new apiResponse(400, "Database error while adding feedback question", {}, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, "Internal server error", {}, {}));
    }
};

export const get_feedback_answer_by_user = async (req: Request, res: Response) => {
    reqInfo(req);
    let { createdBy, subjectId } = req.body;
    try {
        let response = await feedbackAnswerModel.aggregate([
            { $match: { createdBy: ObjectId(createdBy), subjectId: ObjectId(subjectId), isActive: true } },
            {
                $lookup: {
                    from: "course_subjects",
                    let: { subjectId: "$subjectId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$subjectId"] },
                                        { $eq: ["$isActive", true] },
                                    ],
                                },
                            },
                        },
                        { $project: { title: 1 } }
                    ],
                    as: "subject",
                },
            },
            {
                $lookup: {
                    from: "feedback_questions",
                    let: { questionId: "$question.questionId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $in: ["$_id", "$$questionId"] },
                                        { $eq: ["$isActive", true] },
                                    ],
                                },
                            },
                        },
                        { $project: { question: 1 } }
                    ],
                    as: "questionId",
                },
            },
        ])
        if (response)
            return res.status(200).json(new apiResponse(200, "Get feedback successfully", response, {}));
        else
            return res.status(400).json(new apiResponse(400, "Database error while adding feedback question", {}, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, "Internal server error", {}, {}));
    }
};

export const get_feedback_answer = async (req: Request, res: Response) => {
    reqInfo(req);
    let { page, limit } = req.body,
        skip = 0,
        response: any = {}
    limit = parseInt(limit)
    skip = ((parseInt(page) - 1) * parseInt(limit))
    try {
        let feedback_data = await feedbackAnswerModel.aggregate([
            { $match: { isActive: true } },
            {
                $lookup: {
                    from: "users",
                    let: { createdBy: "$createdBy" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$createdBy"] },
                                        { $eq: ["$isActive", true] },
                                    ],
                                },
                            },
                        },
                        { $project: { name: 1, email: 1, phoneNumber: 1 } }
                    ],
                    as: "user",
                },
            },
            {
                $facet: {
                    feedback: [
                        { $sort: { createdAt: -1 } },
                        { $skip: skip },
                        { $limit: limit },
                    ],
                    feedback_count: [{ $count: "count" }]
                }
            }
        ])
        response.feedback_data = feedback_data[0].feedback || []
        response.state = {
            page, limit,
            page_limit: Math.ceil(feedback_data[0]?.feedback_count[0]?.count / limit)
        }
        return res.status(200).json(new apiResponse(200, "Get feedback successfully", response, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, "Internal server error", {}, {}));
    }
};

export const get_feedback_answer_for_export = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let feedback_data: any = await feedbackAnswerModel.aggregate([
            { $match: { isActive: true } },
            {
                $lookup: {
                    from: "users",
                    let: { createdBy: "$createdBy" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$createdBy"] },
                                        { $eq: ["$isActive", true] },
                                    ],
                                },
                            },
                        },
                        { $project: { name: 1, email: 1, phoneNumber: 1 } }
                    ],
                    as: "user",
                },
            },
            {
                $project: {
                    subjectId: 1,
                    name: { $first: "$user.name" },
                    email: { $first: "$user.email" },
                    questions: {
                        $map: {
                            input: "$question",
                            as: "data",
                            in: {
                                "question": "$$data.question",
                                "ans": "$$data.ans",
                                "questionId": "$$data.questionId"
                            }
                        }
                    },
                }
            }
        ]);

        let findData = await feedbackQuestionModel.find({ isActive: true });

        let myNewData = feedback_data?.map((v, i) => {
            return {
                ...v, questions: v?.questions?.map((k, j) => {
                    let matchData: any = findData?.findIndex((d, x) => ObjectId(d._id).toString() == ObjectId(k.questionId).toString())
                    if (matchData >= 0) {
                        return { ...k, index: matchData }
                    }
                    else {
                        // console.log("else");
                        return v
                    }
                }).sort((a, b) => a.index - b.index)
            }

        })

        // console.log('myNewData', myNewData)

        let export_data: any = [];
        await myNewData.map((data) => {
            let excel_data: any = {
                name: data.name,
                email: data.email,
                "Which of the following age categories apply to you?": data.questions[0]?.ans ? data.questions[0]?.ans : 'No Given Answer',
                "What is the name of your district?": data.questions[1]?.ans ? data.questions[1]?.ans : 'No Given Answer',
                "What is the name of your School?": data.questions[2]?.ans ? data.questions[2]?.ans : 'No Given Answer',
                "How did you get to know about the training?": data.questions[3]?.ans ? data.questions[3]?.ans : 'No Given Answer',
                "How would you rate your ICT skills before the training?": data.questions[4]?.ans ? data.questions[4]?.ans : 'No Given Answer',
                "What type of device did you use for the ICT training?": data.questions[5]?.ans ? data.questions[5]?.ans : 'No Given Answer',
                "The ICT training content was very useful": data.questions[6]?.ans ? data.questions[6]?.ans : 'No Given Answer',
                "I acquired new skills from the training": data.questions[7]?.ans ? data.questions[7]?.ans : 'No Given Answer',
                "The training content was too basic": data.questions[8]?.ans ? data.questions[8]?.ans : 'No Given Answer',
                "Facilitation for the training was excellent": data.questions[9]?.ans ? data.questions[9]?.ans : 'No Given Answer',
                "Facilitators took time to explain key topics": data.questions[10]?.ans ? data.questions[10]?.ans : 'No Given Answer',
                "Training resources were readily accessible on KATon": data.questions[11]?.ans ? data.questions[11]?.ans : 'No Given Answer',
                "The KATon  platform is user friendly": data.questions[12]?.ans ? data.questions[12]?.ans : 'No Given Answer',
                "Materials on the KATon platform are useful for teaching needs in School": data.questions[13]?.ans ? data.questions[13]?.ans : 'No Given Answer',
                "How would you rate your ICT skills after the training?": data.questions[14]?.ans ? data.questions[14]?.ans : 'No Given Answer',
                "Do you have any additional feedback for the training team?": data.questions[15]?.ans ? data.questions[15]?.ans : 'No Given Answer',
            }
            export_data.push(excel_data)
        })
        let xls = json2xls(export_data);

        fs.writeFileSync('feedbackDetails.xlsx', xls, 'binary');
        return res.download('feedbackDetails.xlsx', 'feedbackDetails.xlsx');
        return res.status(200).json(new apiResponse(200, 'Testing successfully done!', myNewData, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, "Internal Server Error", {}, error))
    }
}

export const get_feedback_answer_by_id = async (req: Request, res: Response) => {
    reqInfo(req);
    try {
        let response = await feedbackAnswerModel.aggregate([
            { $match: { _id: ObjectId(req.params.id), isActive: true } },
            {
                $lookup: {
                    from: "course_subjects",
                    let: { subjectId: "$subjectId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$subjectId"] },
                                        { $eq: ["$isActive", true] },
                                    ],
                                },
                            },
                        },
                        { $project: { title: 1 } }
                    ],
                    as: "subject",
                },
            },
            {
                $lookup: {
                    from: "feedback_questions",
                    let: { questionId: "$question.questionId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $in: ["$_id", "$$questionId"] },
                                        { $eq: ["$isActive", true] },
                                    ],
                                },
                            },
                        },
                        { $project: { question: 1 } }
                    ],
                    as: "questionId",
                },
            },
            {
                $lookup: {
                    from: "users",
                    let: { createdBy: "$createdBy" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$createdBy"] },
                                        { $eq: ["$isActive", true] },
                                    ],
                                },
                            },
                        },
                        { $project: { name: 1, email: 1, phoneNumber: 1 } }
                    ],
                    as: "user",
                },
            },
        ])
        if (response)
            return res.status(200).json(new apiResponse(200, "Get feedback successfully", response, {}));
        else
            return res.status(400).json(new apiResponse(400, "Database error while adding feedback question", {}, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, "Internal server error", {}, {}));
    }
};