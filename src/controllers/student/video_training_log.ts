"use strict";
import { reqInfo } from "../../helpers/winston_logger";
import { contentModel, resultModel, video_training_logModel, } from "../../database";
import { apiResponse, trainingType, } from "../../common";
import { Request, Response } from "express";

const ObjectId = require("mongoose").Types.ObjectId;


export const get_video_training = async (req: Request, res: Response) => {
    let user: any = (req.header("user") as any)?._id;
    try {
        let response = await video_training_logModel.find({ logUserId: ObjectId(req.params.id) });
        return res.status(200).json(new apiResponse(200, "Get video training", response, {}));
        // return res.status(400).json(new apiResponse(400, "Database error", {}, {}));
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new apiResponse(500, "Internal Server Error", {}, error));
    }
};

export const add_video_training_log = async (req: Request, res: Response) => {
    reqInfo(req);
    let body = req.body;
    let user: any = (req.header("user") as any)?._id;
    body.logUserId = user;
    try {
        let isAlready = await video_training_logModel.find({ logUserId: ObjectId(user), subjectId: ObjectId(body.subjectId), });
        if (isAlready.length != 0) {
            let updateVideoTraining = await video_training_logModel.findOneAndUpdate({ logUserId: ObjectId(user), subjectId: ObjectId(body.subjectId), }, { topicCovered: body.topicCovered, logLatestDate: body.logLatestDate }, { new: true });
            let getContent = await contentModel.find({ subjectId: ObjectId(body.subjectId), isActive: true });
            if (getContent.length == updateVideoTraining?.topicCovered) {
                let updateTopicCovered = await video_training_logModel.findOneAndUpdate({ logUserId: ObjectId(user), subjectId: ObjectId(body.subjectId), }, { topicCovered: body.topicCovered, logLatestDate: body.logLatestDate, isCompleted: true }, { new: true });
                return res.status(200).json(new apiResponse(200, "Successfully updated", updateTopicCovered, {}));
            }
            return res.status(200).json(new apiResponse(200, "Successfully updated", updateVideoTraining, {}));
        } else {
            let response = await new video_training_logModel(body).save();
            if (response) return res.status(200).json(new apiResponse(200, "Selected successfully", response, {}));
            else
                return res.status(404).json(new apiResponse(404, "Database error", {}, {}));
        }
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new apiResponse(500, "Internal Server Error", {}, error));
    }
};

// export const get_video_training = async (req: Request, res: Response) => {
//     reqInfo(req);
//     let body = req.body;
//     let user: any = (req.header("user") as any)?._id;
//     body.createdBy = user;
//     try {
//         let option = await video_training_logModel.find(
//             { isActive: true, createdBy: ObjectId(user) },
//             { optionType: 1 }
//         );
//         console.log(option);

//         if (option?.optionType == trainingType.recorded) {
//             let result = await resultModel.findOne(
//                 { isActive: true, createdBy: ObjectId(user) },
//                 { score: 1, testId: 1 }
//             );
//             console.log(result);
//             if (result == null) {
//                 return res
//                     .status(200)
//                     .json(new apiResponse(400, "Option selected", option, {}));
//             }
//             let data = await video_training_logModel.aggregate([
//                 { $match: { createdBy: ObjectId(user), isActive: true } },
//                 {
//                     $lookup: {
//                         from: "results",
//                         let: { createdBy: "$createdBy" },
//                         pipeline: [
//                             {
//                                 $match: {
//                                     $expr: {
//                                         $and: [
//                                             { $eq: ["$createdBy", "$$createdBy"] },
//                                             { $eq: ["$isActive", true] },
//                                         ],
//                                     },
//                                 },
//                             },
//                         ],
//                         as: "result",
//                     },
//                 },
//                 {
//                     $project: {
//                         optionType: 1,
//                         createdBy: 1,
//                         result: { $first: "$result.score" },
//                     },
//                 },
//             ]);
//             return res
//                 .status(200)
//                 .json(new apiResponse(200, "Get result successfully", data[0], {}));
//         } else {
//             let response = await video_training_logModel.find(
//                 { isActive: true, createdBy: ObjectId(user) },
//                 { optionType: 1, createdBy: 1, subjectId: 1 }
//             );
//             if (response)
//                 return res
//                     .status(200)
//                     .json(new apiResponse(200, "Get successfully", response, {}));
//             else
//                 return res
//                     .status(404)
//                     .json(new apiResponse(404, "Not selected option", response, {}));
//         }
//     } catch (error) {
//         console.log(error);
//         return res
//             .status(500)
//             .json(new apiResponse(500, "Internal Server Error", {}, error));
//     }
// };



// export const by_id_subject = async (req: Request, res: Response) => {
//     reqInfo(req);
//     let user = (req.header("user") as any)?._id;
//     try {
//         // let response = await video_training_logModel.findOne({subjectId: ObjectId(req.params.id),isActive: true,createdBy: ObjectId((req.header("user") as any)?._id),},{ subjectId: 1, optionType: 1 });
//         let response = await video_training_logModel.aggregate([
//             { $match: { subjectId: ObjectId(req.params.id), isActive: true, createdBy: ObjectId((req.header("user") as any)?._id) } },
//             {
//                 $lookup: {
//                     from: "forms",
//                     let: { subjectId: "$subjectId" },
//                     pipeline: [
//                         {
//                             $match: {
//                                 $expr: {
//                                     $and: [
//                                         { $eq: ["$subjectId", "$$subjectId"] },
//                                         { $eq: ["$createdBy", ObjectId(user)] },
//                                         { $eq: ["$isActive", true] },
//                                     ],
//                                 },
//                             },
//                         },
//                     ],
//                     as: "documents",
//                 },
//             },
//             {
//                 $lookup: {
//                     from: "training_types",
//                     let: { optionType: "$optionType" },
//                     pipeline: [
//                         {
//                             $match: {
//                                 $expr: {
//                                     $and: [
//                                         { $eq: ["$optionType", "$$optionType"] },
//                                         { $eq: ["$isActive", true] },
//                                     ],
//                                 },
//                             },
//                         },
//                     ],
//                     as: "option",
//                 },
//             },
//             {
//                 $lookup: {
//                     from: "results",
//                     let: { subjectId: "$subjectId" },
//                     pipeline: [
//                         {
//                             $match: {
//                                 $expr: {
//                                     $and: [
//                                         { $eq: ["$subjectId", "$$subjectId"] },
//                                         { $eq: ["$createdBy", ObjectId(user)] },
//                                         { $eq: ["$isActive", true] },
//                                     ],
//                                 },
//                             },
//                         },
//                     ],
//                     as: "result",
//                 },
//             },
//             {
//                 $lookup: {
//                     from: "course_subjects",
//                     let: { subjectId: "$subjectId" },
//                     pipeline: [
//                         {
//                             $match: {
//                                 $expr: {
//                                     $and: [
//                                         { $eq: ["$_id", "$$subjectId"] },
//                                         // { $eq: ["$createdBy", ObjectId(user)] },
//                                         { $eq: ["$isActive", true] },
//                                     ],
//                                 },
//                             },
//                         },
//                     ],
//                     as: "course_subject",
//                 },
//             },
//             {
//                 $project: {
//                     _id: 1, subjectId: 1, optionType: 1,
//                     "option.description": 1,
//                     "documents.document_image": 1,
//                     "result.score": 1,
//                     "course_subject.title": 1,
//                     "course_subject.description": 1,
//                     "course_subject.image": 1,
//                     isExamGiven: {
//                         $cond: [
//                             {
//                                 $eq: ["$result", []],
//                             },
//                             { $const: false },
//                             true,
//                         ],
//                     },
//                     isDocument: {
//                         $cond: [
//                             {
//                                 $eq: ["$documents", []],
//                             },
//                             { $const: false },
//                             true,
//                         ],
//                     },
//                 }
//             }
//         ])
//         if (response) return res.status(200).json(new apiResponse(200, "Training option by subject Id", response[0], {}));
//         else return res.status(200).json(new apiResponse(200, "Not selected training option for this subjectId", {}, {}));
//     } catch (error) {
//         console.log(error);
//         return res
//             .status(500)
//             .json(new apiResponse(500, "Internal server error", {}, {}));
//     }
// };
