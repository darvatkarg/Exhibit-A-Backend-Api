"use strict";
import { reqInfo } from "../../helpers/winston_logger";
import {
  questionModel,
  answerModel,
  testModel,
  resultModel,
  training_optionModel,
  training_typeModel,
} from "../../database";
import {
  apiResponse,
  trainingType,
  URL_decode,
  userStatus,
} from "../../common";
import { Request, Response } from "express";
import { count } from "console";
import { promises } from "stream";

const ObjectId = require("mongoose").Types.ObjectId;

export const add_training = async (req: Request, res: Response) => {
  reqInfo(req);
  let body = req.body;
  let user: any = (req.header("user") as any)?._id;
  body.createdBy = user;
  try {
    let isAlready = await training_optionModel.findOne({ isActive: true, createdBy: ObjectId(user), subjectId: ObjectId(body.subjectId), });
    if (isAlready != null) {
      return res
        .status(200)
        .json(new apiResponse(200, " Selected", isAlready, {}));
    } else {
      let response = await new training_optionModel(body).save();
      if (response) return res.status(200).json(new apiResponse(200, "Selected successfully", response, {}));
      else
        return res
          .status(404)
          .json(new apiResponse(404, "Database error", {}, {}));
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new apiResponse(500, "Internal Server Error", {}, error));
  }
};

export const update_training = async (req: Request, res: Response) => {
  reqInfo(req);
  let body = req.body;
  let user: any = (req.header("user") as any)?._id;
  body.updatedBy = user;
  try {
    let response = await training_optionModel.findOneAndUpdate({ isActive: true, _id: ObjectId(body.id), }, body, { new: true });
    if (response) return res.status(200).json(new apiResponse(200, "Successfully updated", response, {}));
    else return res.status(404).json(new apiResponse(404, "Database error", {}, {}));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new apiResponse(500, "Internal Server Error", {}, error));
  }
};

export const get_training = async (req: Request, res: Response) => {
  reqInfo(req);
  let body = req.body;
  let user: any = (req.header("user") as any)?._id;
  body.createdBy = user;
  try {
    let option = await training_optionModel.find(
      { isActive: true, createdBy: ObjectId(user) },
      { optionType: 1 }
    );
    console.log(option);

    if (option?.optionType == trainingType.recorded) {
      let result = await resultModel.findOne(
        { isActive: true, createdBy: ObjectId(user) },
        { score: 1, testId: 1 }
      );
      console.log(result);
      if (result == null) {
        return res
          .status(200)
          .json(new apiResponse(400, "Option selected", option, {}));
      }
      let data = await training_optionModel.aggregate([
        { $match: { createdBy: ObjectId(user), isActive: true } },
        {
          $lookup: {
            from: "results",
            let: { createdBy: "$createdBy" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$createdBy", "$$createdBy"] },
                      { $eq: ["$isActive", true] },
                    ],
                  },
                },
              },
            ],
            as: "result",
          },
        },
        {
          $project: {
            optionType: 1,
            createdBy: 1,
            result: { $first: "$result.score" },
          },
        },
      ]);
      return res
        .status(200)
        .json(new apiResponse(200, "Get result successfully", data[0], {}));
    } else {
      let response = await training_optionModel.find(
        { isActive: true, createdBy: ObjectId(user) },
        { optionType: 1, createdBy: 1, subjectId: 1 }
      );
      if (response)
        return res
          .status(200)
          .json(new apiResponse(200, "Get successfully", response, {}));
      else
        return res
          .status(404)
          .json(new apiResponse(404, "Not selected option", response, {}));
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new apiResponse(500, "Internal Server Error", {}, error));
  }
};

export const get_type = async (req: Request, res: Response) => {
  let user: any = (req.header("user") as any)?._id;
  try {
    let response = await training_optionModel.find(
      { isActive: true, createdBy: ObjectId(user) },
      { _id: 1, subjectId: 1, optionType: 1 }
    );
    if (response)
      return res
        .status(200)
        .json(new apiResponse(200, "Training", response, {}));
    return res.status(400).json(new apiResponse(400, "Database error", {}, {}));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new apiResponse(500, "Internal Server Error", {}, error));
  }
};

export const by_id_subject = async (req: Request, res: Response) => {
  reqInfo(req);
  let user = (req.header("user") as any)?._id;
  try {
    // let response = await training_optionModel.findOne({subjectId: ObjectId(req.params.id),isActive: true,createdBy: ObjectId((req.header("user") as any)?._id),},{ subjectId: 1, optionType: 1 });
    let response = await training_optionModel.aggregate([
      { $match: { subjectId: ObjectId(req.params.id), isActive: true, createdBy: ObjectId((req.header("user") as any)?._id) } },
      {
        $lookup: {
          from: "forms",
          let: { subjectId: "$subjectId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$subjectId", "$$subjectId"] },
                    { $eq: ["$createdBy", ObjectId(user)] },
                    { $eq: ["$isActive", true] },
                  ],
                },
              },
            },
          ],
          as: "documents",
        },
      },
      {
        $lookup: {
          from: "training_types",
          let: { optionType: "$optionType" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$optionType", "$$optionType"] },
                    { $eq: ["$isActive", true] },
                  ],
                },
              },
            },
          ],
          as: "option",
        },
      },
      {
        $lookup: {
          from: "results",
          let: { subjectId: "$subjectId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$subjectId", "$$subjectId"] },
                    { $eq: ["$createdBy", ObjectId(user)] },
                    { $eq: ["$isActive", true] },
                  ],
                },
              },
            },
          ],
          as: "result",
        },
      },
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
                    // { $eq: ["$createdBy", ObjectId(user)] },
                    { $eq: ["$isActive", true] },
                  ],
                },
              },
            },
          ],
          as: "course_subject",
        },
      },
      {
        $lookup: {
          from: "user_batches",
          let: { selectedUser: "$createdBy" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ["$$selectedUser", "$selectedUser"] },
                    // { $eq: ["$createdBy", ObjectId(user)] },
                    { $eq: ["$isActive", true] },
                  ],
                },
              },
            },
          ],
          as: "user_batch",
        },
      },
      {
        $project: {
          _id: 1, subjectId: 1, optionType: 1,
          "option.description": 1,
          "documents.document_image": 1,
          "result.score": 1,
          "course_subject.title": 1,
          "course_subject.description": 1,
          "course_subject.image": 1,
          "user_batch.shortMeetingURL": 1,
          isExamGiven: {
            $cond: [
              {
                $eq: ["$result", []],
              },
              { $const: false },
              true,
            ],
          },
          isDocument: {
            $cond: [
              {
                $eq: ["$documents", []],
              },
              { $const: false },
              true,
            ],
          },
        }
      }
    ])
    if (response) return res.status(200).json(new apiResponse(200, "Training option by subject Id", response[0], {}));
    else return res.status(200).json(new apiResponse(200, "Not selected training option for this subjectId", {}, {}));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new apiResponse(500, "Internal server error", {}, {}));
  }
};
