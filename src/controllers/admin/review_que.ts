"use strict";
import { reqInfo } from "../../helpers/winston_logger";
import { reviewQuestionModel, reviewAnswerModel } from "../../database";
import { apiResponse, topicType } from "../../common";
import { Request, Response } from "express";
import { deleteImage } from "../../helpers/S3";

const ObjectId = require("mongoose").Types.ObjectId;

export const add_review_question = async (req: Request, res: Response) => {
    reqInfo(req);
    let body = req.body;
    req.body.createdBy = (req.header("user") as any)?._id;
    try {
        let response = await new reviewQuestionModel(body).save();
        if (response)
            return res.status(200).json(new apiResponse(200, "Review question added successfully", response, {}));
        else
            return res.status(400).json(new apiResponse(400, "Database error while adding Review question", {}, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, "Internal server error", {}, {}));
    }
};

export const get_review_answer_by_user = async (req: Request, res: Response) => {
    reqInfo(req);
    let { createdBy, subjectId } = req.body;
    try {
        let response = await reviewAnswerModel.aggregate([
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
                    from: "review_questions",
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
            return res.status(200).json(new apiResponse(200, "Review question added successfully", response, {}));
        else
            return res.status(400).json(new apiResponse(400, "Database error while adding Review question", {}, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, "Internal server error", {}, {}));
    }
};