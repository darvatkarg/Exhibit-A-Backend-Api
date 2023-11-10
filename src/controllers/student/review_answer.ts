"use strict";
import { reqInfo } from "../../helpers/winston_logger";
import { reviewQuestionModel, reviewAnswerModel } from "../../database";
import { apiResponse, topicType } from "../../common";
import { Request, Response } from "express";
import { deleteImage } from "../../helpers/S3";

const ObjectId = require("mongoose").Types.ObjectId;

export const get_review_Question = async (req: Request, res: Response) => {
    reqInfo(req);
    try {
        let response = await reviewQuestionModel.find({ isActive: true });
        if (response) return res.status(200).json(new apiResponse(200, "Get review question successfully", response, {}));
        else return res.status(400).json(new apiResponse(400, "Database error while getting review question", {}, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, "Internal server error", {}, {}));
    }
};

export const add_review_answer = async (req: Request, res: Response) => {
    reqInfo(req);
    let body = req.body;
    req.body.createdBy = (req.header("user") as any)?._id;
    try {
        let response = await new reviewAnswerModel(body).save();
        if (response) return res.status(200).json(new apiResponse(200, "Review answer added successfully", response, {}));
        else return res.status(400).json(new apiResponse(400, "Database error while adding Review answer", {}, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, "Internal server error", {}, {}));
    }
};
