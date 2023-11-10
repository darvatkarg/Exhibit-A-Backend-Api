"use strict";
import { reqInfo } from "../../helpers/winston_logger";
import { contentModel, topicModel, question_bankModel, schedule_time_slotModel, questionModel } from "../../database";
import { apiResponse, topicType } from "../../common";
import { Request, Response } from "express";
import { deleteImage } from "../../helpers/S3";

const ObjectId = require("mongoose").Types.ObjectId;

export const add_topic = async (req: Request, res: Response) => {
    reqInfo(req);
    let body = req.body;
    req.body.createdBy = (req.header("user") as any)?._id;
    try {
        let response = await new topicModel(body).save();
        if (response)
            return res.status(200).json(new apiResponse(200, "Topic added successfully", response, {}));
        else
            return res.status(400).json(new apiResponse(400, "Database error while adding topic", {}, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, "Internal server error", {}, {}));
    }
};

export const get_topic = async (req: Request, res: Response) => {
    reqInfo(req);
    try {
        let response = await topicModel.find({ isActive: true }).sort({ createdAt: -1 });
        if (response) return res.status(200).json(new apiResponse(200, "Get topic successfully", response, {}));
        else return res.status(400).json(new apiResponse(400, "Database error while getting topic", {}, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, "Internal server error", {}, {}));
    }
};

export const get_mcq_que = async (req: Request, res: Response) => {
    reqInfo(req);
    try {
        let response = await topicModel.find({ isActive: true, topicType: topicType.mcq }).sort({ createdAt: -1 });
        if (response) return res.status(200).json(new apiResponse(200, "Get topic successfully", response, {}));
        else return res.status(400).json(new apiResponse(400, "Database error while getting topic", {}, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, "Internal server error", {}, {}));
    }
};

export const get_theory_que = async (req: Request, res: Response) => {
    reqInfo(req);
    try {
        let response = await topicModel.find({ isActive: true, topicType: topicType.theory }).sort({ createdAt: -1 });
        if (response) return res.status(200).json(new apiResponse(200, "Get topic successfully", response, {}));
        else return res.status(400).json(new apiResponse(400, "Database error while getting topic", {}, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, "Internal server error", {}, {}));
    }
};

export const get_topic_by_id = async (req: Request, res: Response) => {
    reqInfo(req);
    try {
        // let response = await topicModel.find({ _id: ObjectId(req.params.id), isActive: true }, { description: 1, duration: 1, title: 1, pdf: 1, ePub: 1, image: 1, pdf_document: 1, training_typeId: 1, time_slot: 1, passing_marks: 1, });
        let response = await topicModel.aggregate([
            { $match: { _id: ObjectId(req.params.id), isActive: true } },
        ])
        if (response)
            return res.status(200).json(new apiResponse(200, " Get topic successfully", response, {}));
        else return res.status(400).json(new apiResponse(400, "Database error while getting topic", {}, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, "Internal server error", {}, {}));
    }
};

export const update_topic = async (req: Request, res: Response) => {
    reqInfo(req);
    let body = req.body,
        user: any = req.header("user");
    body.updatedBy = user._id;
    try {
        let response = await topicModel.findOneAndUpdate(
            { _id: ObjectId(body._id), isActive: true },
            body
        );
        if (response) {
            return res.status(200).json(new apiResponse(200, "Topic updated successfully", {}, {}));
        } else
            return res.status(400).json(new apiResponse(400, "Database error while updating topic", {}, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, "Internal server error", {}, {}));
    }
};

export const delete_topic = async (req: Request, res: Response) => {
    reqInfo(req);
    let body = req.body,
        user: any = req.header("user");
    body.updatedBy = user._id;
    try {
        let response = await topicModel.findByIdAndDelete({ _id: ObjectId(req.params.id) });
        if (response) {
            await questionModel.deleteMany({ topicId: ObjectId(req.params.id) });
            return res.status(200).json(new apiResponse(200, "Deleted topic successfully", {}, {}));
        }
        else return res.status(400).json(new apiResponse(400, "Database error while deleting topic", {}, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, "Internal server error", {}, {}));
    }
};

export const get_filter_topic = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = req.header('user'),
        { _id, search, limit, page, ascending } = req.body,
        skip = 0,
        response: any = {},
        match: any = {},
        sort: any = {}
    limit = parseInt(limit)
    skip = ((parseInt(page) - 1) * parseInt(limit))
    try {
        match.isActive = true
        sort.createdAt = -1

        let topic_data = await topicModel.aggregate([
            { $match: match },
            {
                $facet: {
                    topic: [
                        { $sort: sort },
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                createdBy: 0, updatedBy: 0, createdAt: 0, updatedAt: 0
                            }
                        }
                    ],
                    topic_count: [{ $count: "count" }]
                }
            }
        ])
        response.topic_data = topic_data[0].topic || []
        response.state = {
            page, limit,
            page_limit: Math.ceil(topic_data[0]?.topic_count[0]?.count / limit)
        }
        res.status(200).json(new apiResponse(200, `Get theory question successfully`, response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}