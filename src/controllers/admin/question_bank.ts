"use strict";
import { reqInfo } from "../../helpers/winston_logger";
import { questionModel, testModel, question_bankModel } from "../../database";
import { apiResponse, testType } from "../../common";
import { Request, Response } from "express";

const ObjectId = require("mongoose").Types.ObjectId;

export const add_question_bank = async (req: Request, res: Response) => {
  reqInfo(req);
  let body = req.body;
  req.body.createdBy = (req.header("user") as any)?._id;
  try {
    let response = await new question_bankModel(body).save();
    if (response)
      return res
        .status(200)
        .json(new apiResponse(200, "Question is added", response, {}));
    else
      return res
        .status(400)
        .json(
          new apiResponse(400, "Database error while adding question", {}, {})
        );
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new apiResponse(500, "Internal server error", {}, {}));
  }
};

export const get_question_bank = async (req: Request, res: Response) => {
  reqInfo(req);
  try {
    let response = await question_bankModel.find(
      { isActive: true },
      { id_: 1, title: 1, question: 1, option: 1, answer: 1, mcqId: 1 }
    );
    if (response)
      return res
        .status(200)
        .json(new apiResponse(200, "Get question successfully", response, {}));
    else
      return res
        .status(400)
        .json(
          new apiResponse(400, "Database error while getting questions", {}, {})
        );
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new apiResponse(500, "Internal server error", {}, {}));
  }
};

export const get_by_id_question_bank = async (req: Request, res: Response) => {
  reqInfo(req);
  try {
    let response = await question_bankModel.findOne(
      { _id: ObjectId(req.params.id), isActive: true },
      { id_: 1, title: 1, question: 1, option: 1, answer: 1, subjectId: 1 }
    );
    if (response)
      return res
        .status(200)
        .json(new apiResponse(200, "Get question successfully", response, {}));
    else
      return res
        .status(400)
        .json(
          new apiResponse(400, "Database error while getting question", {}, {})
        );
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new apiResponse(500, "Internal server error", {}, {}));
  }
};

export const update_question_bank = async (req: Request, res: Response) => {
  reqInfo(req);
  let body = req.body,
    id = body?.id,
    user: any = req.header("user");
  body.updatedBy = user._id;
  try {
    let response = await question_bankModel.findOneAndUpdate(
      { _id: ObjectId(id), isActive: true },
      body
    );
    if (response)
      return res
        .status(200)
        .json(new apiResponse(200, "Updated question successfully", {}, {}));
    else
      return res
        .status(400)
        .json(
          new apiResponse(400, "Database error while updating question", {}, {})
        );
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new apiResponse(500, "Internal server error", {}, {}));
  }
};

export const delete_question_bank = async (req: Request, res: Response) => {
  reqInfo(req);
  let body = req.body,
    user: any = req.header("user");
  body.updatedBy = user._id;
  try {
    let response = await question_bankModel.findOneAndUpdate(
      { _id: ObjectId(req.params.id), isActive: true },
      { isActive: false }
    );
    if (response)
      return res
        .status(200)
        .json(new apiResponse(200, "Deleted question successfully", {}, {}));
    else
      return res
        .status(400)
        .json(
          new apiResponse(400, "Database error while deleting question", {}, {})
        );
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new apiResponse(500, "Internal server error", {}, {}));
  }
};

export const get_filter_question_bank = async (req: Request, res: Response) => {
  reqInfo(req);
  let user: any = req.header("user"),
    { _id, search, limit, page, ascending, subjectId } = req.body,
    skip = 0,
    response: any = {},
    match: any = {},
    sort: any = {};
  limit = parseInt(limit);
  skip = (parseInt(page) - 1) * parseInt(limit);
  try {
    // Database Filtering
    if (_id?.length != 0 && _id !== undefined) {
      _id.forEach(function (part, index, theArray) {
        theArray[index] = ObjectId(String(part));
      });
      match["_id"] = { $in: _id };
    }
    if (subjectId) {
      match.subjectId = ObjectId(subjectId);
    }
    // if (search) {
    //   var questionArray: Array<any> = [];
    //   var answerArray: Array<any> = [];
    //   search = search.split(" ");
    //   search.forEach((data) => {
    //     questionArray.push({ question: { $regex: data, $options: "si" } });
    //     answerArray.push({ answer: { $regex: data, $options: "si" } });
    //   });
    //   match.$or = [{ $and: questionArray }, { $and: answerArray }];
    // }
    match.isActive = true;
    // Sorting Database
    sort.createdAt = -1;
    if (ascending) sort.createdAt = 1;

    let question_data = await question_bankModel.aggregate([
      { $match: match },
      {
        $facet: {
          user: [
            { $sort: sort },
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 1,
                question: 1,
                answer: 1,
                option: 1,
              },
            },
          ],
          question_count: [{ $count: "count" }],
        },
      },
    ]);
    response.question_data = question_data[0].user || [];
    response.state = {
      page,
      limit,
      page_limit: Math.ceil(question_data[0]?.question_count[0]?.count / limit),
    };
    res
      .status(200)
      .json(new apiResponse(200, `Get question successfully`, response, {}));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new apiResponse(500, "Internal server error", {}, {}));
  }
};

export const get_by_subject = async (req: Request, res: Response) => {
  reqInfo(req);
  try {
    let response = await question_bankModel.find(
      { subjectId: ObjectId(req.params.id), isActive: true },
      { id_: 1, title: 1, question: 1, option: 1, answer: 1, subjectId: 1 }
    );
    if (response)
      return res
        .status(200)
        .json(new apiResponse(200, "Get question successfully", response, {}));
    else
      return res
        .status(400)
        .json(
          new apiResponse(400, "Database error while getting question", {}, {})
        );
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new apiResponse(500, "Internal server error", {}, {}));
  }
};
