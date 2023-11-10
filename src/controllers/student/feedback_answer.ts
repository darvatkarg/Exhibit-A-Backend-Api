"use strict";
import { reqInfo } from "../../helpers/winston_logger";
import { feedbackQuestionModel, feedbackAnswerModel } from "../../database";
import { apiResponse, topicType } from "../../common";
import { Request, Response } from "express";
import { deleteImage } from "../../helpers/S3";

const ObjectId = require("mongoose").Types.ObjectId;

export const get_feedback_Question = async (req: Request, res: Response) => {
    reqInfo(req);
    try {
        let response = await feedbackQuestionModel.find({ isActive: true });
        if (response) return res.status(200).json(new apiResponse(200, "Get feedback question successfully", response, {}));
        else return res.status(400).json(new apiResponse(400, "Database error while getting feedback question", {}, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, "Internal server error", {}, {}));
    }
};

export const add_feedback_answer = async (req: Request, res: Response) => {
    reqInfo(req);
    let body = req.body;
    let user = (req.header("user") as any)?._id;
    req.body.createdBy = (req.header("user") as any)?._id;
    try {
        let findData = await feedbackAnswerModel.findOne({ createdBy: ObjectId(user), subjectId: ObjectId(body.subjectId), isActive: true });
        if (findData) {
            return res.status(400).json(new apiResponse(400, "Feedback already added!", {}, {}));
        }
        let response = await new feedbackAnswerModel(body).save();
        if (response) return res.status(200).json(new apiResponse(200, "feedback answer added successfully", response, {}));
        else return res.status(400).json(new apiResponse(400, "Database error while adding feedback answer", {}, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, "Internal server error", {}, {}));
    }
};

export const update_feedback_answer = async (req: Request, res: Response) => {
    reqInfo(req);
    let body = req.body;
    let user = (req.header("user") as any)?._id;
    // req.body.createdBy = (req.header("user") as any)?._id;
    try {
        let response = await feedbackAnswerModel.findOneAndUpdate({ _id: ObjectId(body.id) }, { subjectId: ObjectId(body.subjectId), question: body.question }, { new: true });
        if (response) return res.status(200).json(new apiResponse(200, "feedback answer added successfully", response, {}));
        else return res.status(400).json(new apiResponse(400, "Database error while adding feedback answer", {}, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, "Internal server error", {}, {}));
    }
};