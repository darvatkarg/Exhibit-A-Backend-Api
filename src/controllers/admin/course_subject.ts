"use strict";
import { reqInfo } from "../../helpers/winston_logger";
import { contentModel, course_subjectModel, question_bankModel, schedule_time_slotModel } from "../../database";
import { apiResponse, URL_decode } from "../../common";
import { Request, Response } from "express";
import { deleteImage } from "../../helpers/S3";

const ObjectId = require("mongoose").Types.ObjectId;

export const add_subject = async (req: Request, res: Response) => {
  reqInfo(req);
  let body = req.body;
  req.body.createdBy = (req.header("user") as any)?._id;
  try {
    let response = await new course_subjectModel(body).save();
    if (response)
      return res.status(200).json(new apiResponse(200, "Course added successfully", response, {}));
    else
      return res.status(400).json(new apiResponse(400, "Database error while adding course", {}, {}));
  } catch (error) {
    console.log(error);
    return res.status(500).json(new apiResponse(500, "Internal server error", {}, {}));
  }
};

export const get_subject = async (req: Request, res: Response) => {
  reqInfo(req);
  try {
    let response = await course_subjectModel.find({ isActive: true }, { description: 1, duration: 1, title: 1, pdf: 1, ePub: 1, image: 1, pdf_document: 1, }).sort({ createdAt: -1 });
    if (response) return res.status(200).json(new apiResponse(200, "Get course successfully", response, {}));
    else return res.status(400).json(new apiResponse(400, "Database error while getting course", {}, {}));
  } catch (error) {
    console.log(error);
    return res.status(500).json(new apiResponse(500, "Internal server error", {}, {}));
  }
};

export const get_subject_by_id = async (req: Request, res: Response) => {
  reqInfo(req);
  try {
    // let response = await course_subjectModel.find({ _id: ObjectId(req.params.id), isActive: true }, { description: 1, duration: 1, title: 1, pdf: 1, ePub: 1, image: 1, pdf_document: 1, training_typeId: 1, time_slot: 1, passing_marks: 1, });
    let response = await course_subjectModel.aggregate([
      { $match: { _id: ObjectId(req.params.id), isActive: true } },
      {
        $lookup: {
          from: "training_types",
          let: { training_typeId: '$training_typeId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ['$_id', '$$training_typeId'] },
                    { $eq: ['$isActive', true] },
                  ],
                },
              }
            },
            { $project: { name: 1, optionType: 1 } }
          ],
          as: "training"
        }
      },
      {
        $project: {
          description: 1, duration: 1, title: 1, pdf: 1, ePub: 1, image: 1, pdf_document: 1, training: 1, time_slotId: 1, passing_marks: 1, question_select: 1
        }
      }
    ])
    if (response)
      return res.status(200).json(new apiResponse(200, " Get course successfully", response, {}));
    else return res.status(400).json(new apiResponse(400, "Database error while getting course", {}, {}));
  } catch (error) {
    console.log(error);
    return res.status(500).json(new apiResponse(500, "Internal server error", {}, {}));
  }
};

export const update_subject = async (req: Request, res: Response) => {
  reqInfo(req);
  let body = req.body,
    user: any = req.header("user");
  body.updatedBy = user._id;
  try {
    let response = await course_subjectModel.findOneAndUpdate(
      { _id: ObjectId(body._id), isActive: true },
      body
    );
    if (response) {
      if (response.pdf != null) {
        if (response.pdf != body?.pdf) {
          let [folder_name, pdf_name] = await URL_decode(response?.pdf);
          await deleteImage(pdf_name, folder_name);
        }
      }
      if (response.ePub != null) {
        if (response.ePub != body?.ePub) {
          let [folder_name, ePub_name] = await URL_decode(response?.ePub);
          await deleteImage(ePub_name, folder_name);
        }
      }
      if (response.image != null) {
        if (response.image != body?.image) {
          let [folder_name, image_name] = await URL_decode(response?.image);
          await deleteImage(image_name, folder_name);
        }
      }
      return res.status(200).json(new apiResponse(200, "Course updated successfully", {}, {}));
    } else
      return res.status(400).json(new apiResponse(400, "Database error while updating course", {}, {}));
  } catch (error) {
    console.log(error);
    return res.status(500).json(new apiResponse(500, "Internal server error", {}, {}));
  }
};

export const delete_subject = async (req: Request, res: Response) => {
  reqInfo(req);
  let body = req.body,
    user: any = req.header("user");
  body.updatedBy = user._id;
  try {
    let response = await course_subjectModel.findOneAndUpdate({ _id: ObjectId(req.params.id), isActive: true }, { isActive: false });
    if (response) {
      await contentModel.findOneAndUpdate({ subjectId: ObjectId(req.params.id), isActive: true }, { isActive: false, updatedBy: ObjectId((req.header('user') as any)?._id) })
      await question_bankModel.updateMany({ subjectId: ObjectId(req.params.id), isActive: true }, { isActive: false, updatedBy: ObjectId((req.header('user') as any)?._id) })
      await schedule_time_slotModel.updateMany({ subjectId: ObjectId(req.params.id), isActive: true }, { isActive: false, updatedBy: ObjectId((req.header('user') as any)?._id) })
      // await question_bankModel.findOneAndUpdate({ subjectId: ObjectId(req.params.id), isActive: true }, { isActive: false, updatedBy: ObjectId((req.header('user') as any)?._id) })
      return res.status(200).json(new apiResponse(200, "Deleted course successfully", {}, {}));
    }
    else return res.status(400).json(new apiResponse(400, "Database error while deleting course", {}, {}));
  } catch (error) {
    console.log(error);
    return res.status(500).json(new apiResponse(500, "Internal server error", {}, {}));
  }
};

export const get_content_by_subject_id = async (req: Request, res: Response) => {
  reqInfo(req);
  let id = req.params.id;
  let user = (req.header("user") as any)?._id;
  try {
    //let response = await course_subjectModel.find({ isActive: true }, { description: 1, duration: 1, title: 1 })
    let response = await course_subjectModel.aggregate([
      { $match: { _id: ObjectId(id), isActive: true } },
      {
        $lookup: {
          from: "contents",
          let: { subjectId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$subjectId", "$$subjectId"] },
                    { $eq: ["$isActive", true] },
                  ],
                },
              },
            },
            { $sort: { sequence: 1 } },
          ],
          as: "subject",
        },
      },
      {
        $lookup: {
          from: "forms",
          let: { subjectId: "$_id" },
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
          from: "results",
          let: { subjectId: "$_id" },
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
        $project: {
          _id: 1, title: 1, description: 1, during: 1, passing_marks: 1, image: 1, pdf: 1, pdf_document: 1, ePub: 1,
          time_slot: 1, training_type: 1,
          "subject.title": 1, "subject.content": 1, "subject.pdf": 1, "subject.ePub": 1, "subject.video": 1, "subject._id": 1, "subject.sequence": 1,
          "documents.document_image": 1,
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
        },
      },
    ]);
    if (response)
      return res.status(200).json(new apiResponse(200, "Get course content successfully", response, {}));
    else
      return res.status(400).json(new apiResponse(400, "Database error while getting course", {}, {}));
  } catch (error) {
    console.log(error);
    return res.status(500).json(new apiResponse(500, "Internal server error", {}, {}));
  }
};

export const get_content_by_subject_id_for_video = async (req: Request, res: Response) => {
  reqInfo(req);
  let id = req.params.id;
  let user = (req.header("user") as any)?._id;
  try {
    //let response = await course_subjectModel.find({ isActive: true }, { description: 1, duration: 1, title: 1 })
    let response = await course_subjectModel.aggregate([
      { $match: { _id: ObjectId(id), isActive: true } },
      {
        $lookup: {
          from: "contents",
          let: { subjectId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$subjectId", "$$subjectId"] },
                    { $eq: ["$isActive", true] },
                  ],
                },
              },
            },
          ],
          as: "subject",
        },
      },
      {
        $project: {
          title: 1,
          "subject.title": 1, "subject.content": 1, "subject.pdf": 1, "subject.ePub": 1, "subject.video": 1, "subject._id": 1,
          "documents.document_image": 1,
        },
      },
    ]);
    if (response)
      return res.status(200).json(new apiResponse(200, "Get course content successfully", response, {}));
    else
      return res.status(400).json(new apiResponse(400, "Database error while getting course", {}, {}));
  } catch (error) {
    console.log(error);
    return res.status(500).json(new apiResponse(500, "Internal server error", {}, {}));
  }
};