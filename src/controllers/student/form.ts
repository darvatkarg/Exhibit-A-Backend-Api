"use strict";
import { reqInfo } from "../../helpers/winston_logger";
import { formModel, training_optionModel, userModel, video_training_logModel } from "../../database";
import { apiResponse, URL_decode } from "../../common";
import { Request, Response } from "express";
import { deleteImage } from "../../helpers/S3";

const ObjectId = require("mongoose").Types.ObjectId;

export const add_form = async (req: Request, res: Response) => {
  reqInfo(req);
  let body = req.body;
  let user: any = (req.header("user") as any)?._id;
  body.createdBy = user;
  try {
    let isAlready: any = await formModel.findOne({ isActive: true, createdBy: ObjectId(user), subjectId: ObjectId(body.subjectId) }, { document_image: 1 });
    if (isAlready) {
      body.updatedBy = user
      let updateDate = await formModel.findOneAndUpdate({ isActive: true, createdBy: ObjectId(user), subjectId: ObjectId(body.subjectId) }, body, { new: true })
      if (updateDate) {
        await training_optionModel.findOneAndUpdate({ createdBy: ObjectId(updateDate?.createdBy), subjectId: ObjectId(updateDate?.subjectId), isActive: true }, { isFormUploaded: true })
        return res.status(200).json(new apiResponse(200, "Form is already uploaded", isAlready, {}));
      }
      else return res.status(400).json(new apiResponse(400, "Something went wrong", {}, {}));
    }
    else {
      let response = await new formModel(body).save();
      if (response) {
        await training_optionModel.findOneAndUpdate({ createdBy: ObjectId(response?.createdBy), subjectId: ObjectId(response?.subjectId), isActive: true }, { isFormUploaded: true })
        await video_training_logModel.findOneAndUpdate({ logUserId: ObjectId(response?.createdBy), subjectId: ObjectId(response?.subjectId) }, { isFormUploaded: true })
        return res.status(200).json(new apiResponse(200, "Successfully form is uploaded", response, {}));
      }
      else
        return res.status(404).json(new apiResponse(404, "Database error", {}, {}));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(new apiResponse(500, "Internal Server Error", {}, error));
  }
};

export const get_form = async (req: Request, res: Response) => {
  let user: any = (req.header("user") as any)?._id;
  try {
    let response = await formModel.find(
      { isActive: true, createdBy: ObjectId(user) },
      { _id: 1, subjectId: 1, pdf_document: 1 }
    );
    if (response)
      return res
        .status(200)
        .json(new apiResponse(200, "Form Document", response, {}));
    return res.status(400).json(new apiResponse(400, "Database error", {}, {}));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new apiResponse(500, "Internal Server Error", {}, error));
  }
};

export const get_by_id = async (req: Request, res: Response) => {
  let user: any = (req.header("user") as any)?._id;
  try {
    let response = await formModel.findOne(
      { isActive: true, _id: ObjectId(req.params.id) },
      { _id: 1, subjectId: 1, pdf_document: 1 }
    );
    if (response)
      return res
        .status(200)
        .json(new apiResponse(200, "Form Document", response, {}));
    return res.status(400).json(new apiResponse(400, "Database error", {}, {}));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new apiResponse(500, "Internal Server Error", {}, error));
  }
};

export const get_by_subject_id = async (req: Request, res: Response) => {
  let user: any = (req.header("user") as any)?._id;
  try {
    let response = await formModel.findOne(
      { isActive: true, subjectId: ObjectId(req.params.id) },
      { _id: 1, subjectId: 1, pdf_document: 1 }
    );
    if (response)
      return res
        .status(200)
        .json(new apiResponse(200, "Form Document", response, {}));
    return res.status(400).json(new apiResponse(400, "Database error", {}, {}));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new apiResponse(500, "Internal Server Error", {}, error));
  }
};

export const update_form = async (req: Request, res: Response) => {
  let user: any = (req.header("user") as any)?._id
  let body = req.body
  try {
    let response = await formModel.findOneAndUpdate({ _id: ObjectId(body.id), isActive: true }, { document_image: body.document_image, updatedBy: ObjectId(user._id) }, { new: true })
    if (response) {
      await training_optionModel.findOneAndUpdate({ createdBy: ObjectId(response?.createdBy), subjectId: ObjectId(response?.subjectId), isActive: true }, { isFormUploaded: true })
      await video_training_logModel.findOneAndUpdate({ logUserId: ObjectId(response?.createdBy), subjectId: ObjectId(response?.subjectId) }, { isFormUploaded: true })
      return res.status(200).json(new apiResponse(200, "Form Document updated", response, {}));
    }
    else return res.status(400).json(new apiResponse(400, "Database error", {}, {}));
  } catch (error) {
    console.log(error);
    return res.status(500).json(new apiResponse(500, "Internal Server Error", {}, error));
  }
};

export const admin_add_form = async (req: Request, res: Response) => {
  reqInfo(req);
  let body = req.body;
  let user: any = (req.header("user") as any)?._id;
  try {
    let isAlready: any = await formModel.findOne({ isActive: true, createdBy: ObjectId(body.createdBy), subjectId: ObjectId(body.subjectId) }, { document_image: 1 });
    console.log("isAlready");

    if (isAlready) {
      body.updatedBy = user
      let updateDate = await formModel.findOneAndUpdate({ isActive: true, createdBy: ObjectId(body.createdBy), subjectId: ObjectId(body.subjectId) }, body, { new: true })
      if (updateDate) {
        await training_optionModel.findOneAndUpdate({ createdBy: ObjectId(updateDate?.createdBy), subjectId: ObjectId(updateDate?.subjectId), isActive: true }, { isFormUploaded: true })
        await video_training_logModel.findOneAndUpdate({ logUserId: ObjectId(updateDate?.createdBy), subjectId: ObjectId(updateDate?.subjectId) }, { isFormUploaded: true })
        return res.status(200).json(new apiResponse(200, "Form is already uploaded", updateDate, {}));
      }
      else return res.status(400).json(new apiResponse(400, "Something went wrong", {}, {}));
    }
    else {
      let response = await new formModel(body).save();
      if (response) {
        await training_optionModel.findOneAndUpdate({ createdBy: ObjectId(response?.createdBy), subjectId: ObjectId(response?.subjectId), isActive: true }, { isFormUploaded: true })
        return res.status(200).json(new apiResponse(200, "Successfully form is uploaded", response, {}));
      }
      else
        return res.status(404).json(new apiResponse(404, "Database error", {}, {}));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(new apiResponse(500, "Internal Server Error", {}, error));
  }
};