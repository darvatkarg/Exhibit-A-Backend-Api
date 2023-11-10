"use strict";
import { reqInfo } from "../../helpers/winston_logger";
import {
  questionModel,
  answerModel,
  testModel,
  resultModel,
  course_subjectModel,
  training_optionModel,
} from "../../database";
import { apiResponse, URL_decode, userStatus } from "../../common";
import { Request, Response } from "express";
import { pdf_generation } from "../../helpers/pdf_generate";
import moment from 'moment';

import { count } from "console";
import { promises } from "stream";
import { Logform } from "winston";

const ObjectId = require("mongoose").Types.ObjectId;

export const get_result = async (req: Request, res: Response) => {
  reqInfo(req);
  try {
    let response = await resultModel.findOne(
      { createdBy: ObjectId((req.header("user") as any)?._id), isActive: true },
      { subjectId: 1, score: 1, test_start_time: 1, test_end_time: 1 }
    );
    if (response)
      return res.status(200).json(new apiResponse(200, "Result", response, {}));
    else
      return res
        .status(400)
        .json(new apiResponse(400, "Database error", {}, {}));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new apiResponse(500, "Internal Server error", {}, {}));
  }
};

export const get_computer_result = async (req: Request, res: Response) => {
  reqInfo(req);
  try {
    // let response = await resultModel.findOne({ updatedBy: ObjectId((req.header('user') as any)?._id), isActive: true }, { testId: 1, score: 1, test_start_time: 1, createdBy: 1 })
    let response = await resultModel.aggregate([
      {
        $match: {
          createdBy: ObjectId((req.header("user") as any)?._id),
          isActive: true,
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
            {
              $project: {
                name: 1,
              },
            },
          ],
          as: "user",
        },
      },
      {
        $project: {
          _id: 1,
          subjectId: 1,
          score: 1,
          test_start_time: 1,
          createdBy: 1,
          certificate: 1,
          createdAt: 1,
          name: { $first: "$user.name" },
        },
      },
    ]);

    await pdf_generation(
      {
        resultId: response[0]?._id,
        name: response[0]?.name,
        date: new Date().toLocaleDateString(),
      },
      `${response[0]?._id}/pdf`
    );
    await resultModel.findOneAndUpdate(
      { _id: ObjectId(response[0]?._id), isActive: true },
      {
        certificate_is_create: true,
        certificate: `${response[0]?._id}/pdf/Certificate_of_Completion.pdf`,
      }
    );
    //console.log(response);
    if (response)
      return res.status(200).json(new apiResponse(200, "Result", response, {}));
    else
      return res.status(400).json(new apiResponse(400, "Result", response, {}));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new apiResponse(500, "Internal Server error", {}, {}));
  }
};

export const get_subject_result = async (req: Request, res: Response) => {
  reqInfo(req);
  try {
    // let response = await resultModel.findOne({ updatedBy: ObjectId((req.header('user') as any)?._id), isActive: true }, { testId: 1, score: 1, test_start_time: 1, createdBy: 1 })
    let response = await resultModel.aggregate([
      {
        $match: {
          createdBy: ObjectId((req.header("user") as any)?._id),
          isActive: true,
          subjectId: ObjectId(req.params.id),
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
            {
              $project: {
                name: 1,
              },
            },
          ],
          as: "user",
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
                    { $eq: ["$isActive", true] },
                  ],
                },
              },
            },
            {
              $project: {
                title: 1,
              },
            },
          ],
          as: "subject",
        },
      },
      {
        $lookup: {
          from: "review_answers",
          let: { subjectId: "$subjectId", createdBy: "$createdBy" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$subjectId", "$$subjectId"] },
                    { $eq: ["$createdBy", "$$createdBy"] },
                    { $eq: ["$isActive", true] },
                  ],
                },
              },
            },
            {
              $project: {
                title: 1,
              },
            },
          ],
          as: "review",
        },
      },
      {
        $lookup: {
          from: "feedback_answers",
          let: { subjectId: "$subjectId", createdBy: "$createdBy" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$subjectId", "$$subjectId"] },
                    { $eq: ["$createdBy", "$$createdBy"] },
                    { $eq: ["$isActive", true] },
                  ],
                },
              },
            },
          ],
          as: "feedback_answer",
        },
      },
      {
        $project: {
          _id: 1,
          subjectId: 1,
          score: 1,
          test_start_time: 1,
          createdBy: 1,
          certificate: 1,
          createdAt: 1,
          isApprove: 1,
          name: { $first: "$user.name" },
          subject_name: { $first: "$subject.title" },
          isReview: {
            $cond: [
              {
                $eq: ["$review", []]
              },
              { $const: false }, true
            ]
          },
          isFeedbackAnswer: {
            $cond: [
              {
                $eq: ["$feedback_answer", []]
              },
              { $const: false }, true
            ]
          },
        },
      },
    ]);

    if (response)
      return res
        .status(200)
        .json(
          new apiResponse(
            200,
            "Completed Exam. Certifiate will be provide",
            response,
            {}
          )
        );
    else
      return res.status(400).json(new apiResponse(400, "Result", response, {}));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new apiResponse(500, "Internal Server error", {}, {}));
  }
};

// export const add_result = async (req: Request, res: Response) => {
//     reqInfo(req)
//     let body = req.body
//     let user: any = (req.header('user') as any)?._id
//     try {
//         let isAlreadyExit = await resultModel.findOne({ createdBy: ObjectId(user), isActive: true, subjectId: ObjectId(body.subjectId) })

//         if (isAlreadyExit != null) {
//             let getCourseSubject = await course_subjectModel.findOne({ _id: ObjectId(body.subjectId), isActive: true }, { _id: 0, passing_marks: 1 })
//             console.log(getCourseSubject);
//             let count = await answerModel.find({ createdBy: ObjectId(user), isActive: true, isAnswerTrue: true }).countDocuments()
//             body.score = count * 2

//             console.log(isAlreadyExit?.score >= getCourseSubject?.passing_marks);
//             if (isAlreadyExit?.score >= getCourseSubject?.passing_marks) {
//                 let updateData = await resultModel.findOneAndUpdate({ isActive: true, subjectId: ObjectId(body.subjectId), createdBy: ObjectId(user) }, body, { new: true })

//                 if (updateData) res.status(200).json(new apiResponse(200, 'Result', updateData, {}))
//                 else res.status(400).json(new apiResponse(400, 'error', {}, {}))
//             }
//             else {
//                 //await resultModel.deleteMany({ createdBy: ObjectId(user), isActive: true, subjectId: ObjectId(body.subjectId) })
//                 //await answerModel.deleteMany({ createdBy: ObjectId(user), isActive: true, subjectId: ObjectId(body.subjectId) })
//                 return res.status(200).json(new apiResponse(200, `You haven't passed yet. Your score is ${isAlreadyExit?.score}. You need at least ${getCourseSubject?.passing_marks} score to pass.`, {}, {}))
//             }
//         }
//         else {
//             return res.status(400).json(new apiResponse(400, 'Give At least One Answer', {}, {}))
//         }
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json(new apiResponse(500, 'Internal Server error', {}, {}))
//     }
// }

// export const add_result = async (req: Request, res: Response) => {
//   reqInfo(req);
//   let body = req.body;
//   let user: any = (req.header("user") as any)?._id;
//   try {
//     let isAlreadyExit = await resultModel.findOne({
//       createdBy: ObjectId(user),
//       isActive: true,
//       subjectId: ObjectId(body.subjectId),
//     });
//     let count = await answerModel
//       .find({
//         createdBy: ObjectId(user),
//         isActive: true,
//         subjectId: ObjectId(body.subjectId),
//         isAnswerTrue: true,
//       })
//       .countDocuments();
//     let getCourseSubject = await course_subjectModel.findOne(
//       { _id: ObjectId(body.subjectId), isActive: true },
//       { passing_marks: 1, _id: 0 }
//     );
//     // console.log("--------------", isAlreadyExit);
//     // console.log("+++++++++++++++++", count);
//     // console.log("*************", getCourseSubject);

//     if (isAlreadyExit) {
//       body.score = count * 1;
//       let response = await resultModel.findOneAndUpdate(
//         {
//           createdBy: ObjectId(user),
//           isActive: true,
//           subjectId: ObjectId(body.subjectId),
//         },
//         body,
//         { new: true }
//       );
//       // console.log("11111111111111", response?.score >= getCourseSubject?.passing_marks);

//       if (response) {
//         response.isFailed = false
//         if (response?.score >= getCourseSubject?.passing_marks) {
//           res
//             .status(200)
//             .json(
//               new apiResponse(
//                 200,
//                 `Congratulation! You have successfully Passed Exam.\n Your score is ${response?.score}.\n Admin will provide you certificate soon.`,
//                 response,
//                 {}
//               )
//             );
//         } else {
//           // await resultModel.deleteMany({ createdBy: ObjectId(user), isActive: true, subjectId: ObjectId(body.subjectId) })
//           // await answerModel.deleteMany({ createdBy: ObjectId(user), isActive: true, subjectId: ObjectId(body.subjectId) })
//           await resultModel.findOneAndUpdate(
//             {
//               createdBy: ObjectId(user),
//               isActive: true,
//               subjectId: ObjectId(body.subjectId),
//             },
//             { isActive: false }
//           );
//           await answerModel.updateMany(
//             {
//               createdBy: ObjectId(user),
//               isActive: true,
//               subjectId: ObjectId(body.subjectId),
//             },
//             { isActive: false }
//           );
//           return res
//             .status(200)
//             .json(
//               new apiResponse(
//                 200,
//                 `You haven't passed yet. Your score is ${response?.score}. You need at least ${getCourseSubject?.passing_marks} score to pass.`,
//                 { isFailed: true },
//                 {}
//               )
//             );
//         }
//       } else {
//         return res
//           .status(400)
//           .json(new apiResponse(400, "Give at least one answer", {}, {}));
//       }
//     } else {
//       return res
//         .status(400)
//         .json(new apiResponse(400, "Give at least one answer", {}, {}));
//     }
//   } catch (error) {
//     console.log(error);
//     return res
//       .status(500)
//       .json(new apiResponse(500, "Internal Server error", {}, {}));
//   }
// };


export const add_result = async (req: Request, res: Response) => {
  reqInfo(req);
  let body = req.body;
  let user: any = (req.header("user") as any)?._id;
  try {
    let getCourseSubject = await course_subjectModel.findOne(
      { _id: ObjectId(body.subjectId), isActive: true },
      { passing_marks: 1, _id: 0 }
    );

    let scores = body.score * 1

    if (scores >= getCourseSubject?.passing_marks) {
      let findData = await resultModel.findOne({ subjectId: ObjectId(body.subjectId), createdBy: ObjectId(user), isActive: true })
      if (findData) return res.status(200).json(new apiResponse(200, `You have already Passed Exam.\n Your score is ${findData?.score}.\n Admin will provide you certificate soon.`, {}, {}));
      let addResult = await new resultModel({ subjectId: ObjectId(body.subjectId), createdBy: ObjectId(user), test_start_time: body.test_start_time, test_end_time: new Date(), score: scores }).save();
      await training_optionModel.findOneAndUpdate({ createdBy: ObjectId(addResult.createdBy) }, { isExamCompleted: true })
      res.status(200).json(new apiResponse(200, `Congratulation! You have successfully Passed Exam.\n Your score is ${addResult?.score}.\n Admin will provide you certificate soon.`, addResult, {}));
    } else {
      res.status(200).json(new apiResponse(200, `You haven't passed yet. Your score is ${scores}. You need at least ${getCourseSubject?.passing_marks} score to pass.`, {}, {}));
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new apiResponse(500, "Internal Server error", {}, {}));
  }
};


export const get_sub_result = async (req: Request, res: Response) => {
  reqInfo(req);
  try {
    // let response = await resultModel.findOne({ updatedBy: ObjectId((req.header('user') as any)?._id), isActive: true }, { testId: 1, score: 1, test_start_time: 1, createdBy: 1 })
    let response = await resultModel.aggregate([
      {
        $match: {
          createdBy: ObjectId((req.header("user") as any)?._id),
          isActive: true,
          subjectId: ObjectId(req.params.id),
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
            {
              $project: {
                name: 1,
              },
            },
          ],
          as: "user",
        },
      },

      {
        $project: {
          _id: 1,
          subjectId: 1,
          score: 1,
          test_start_time: 1,
          createdBy: 1,
          certificate: 1,
          createdAt: 1,
          name: { $first: "$user.name" },
        },
      },
    ]);

    // await pdf_generation({
    //     resultId: response[0]?._id,
    //     name: response[0]?.name,
    //     date: new Date().toLocaleDateString()
    // }, `${response[0]?._id}/pdf`);
    // await resultModel.findOneAndUpdate({ _id: ObjectId(response[0]?._id), isActive: true }, {
    //     certificate_is_create: true,
    //     certificate: `${response[0]?._id}/pdf/Certificate_of_Completion.pdf`
    // })
    // console.log(response);
    if (response)
      return res
        .status(200)
        .json(
          new apiResponse(
            200,
            `You have successfully Pass the exam. Certificate will be provide Soon`,
            {},
            {}
          )
        );
    else
      return res.status(400).json(new apiResponse(400, "Result", response, {}));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new apiResponse(500, "Internal Server error", {}, {}));
  }
};

export const start_exam = async (req: Request, res: Response) => {
  reqInfo(req);
  let body = req.body;
  // body.test_start_time = new Date().toLocaleTimeString()
  console.log(new Date().toLocaleTimeString());
  console.log(new Date().toISOString());
  console.log(new Date().getTime());

  try {
    let response = await resultModel.findOneAndUpdate(
      {
        createdBy: ObjectId((req.header("user") as any)?._id),
        isActive: true,
        subjectId: ObjectId(body.subjectId),
      },
      body
    );
    // console.log(response);

    if (response)
      return res
        .status(200)
        .json(new apiResponse(200, "Start exam", response, {}));
    else
      return res
        .status(400)
        .json(new apiResponse(400, "Database error", {}, {}));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new apiResponse(500, "Internal Server error", {}, {}));
  }
};

export const download_certificate = async (req: Request, res: Response) => {
  reqInfo(req);
  try {
    let response = await resultModel.aggregate([
      {
        $match: {
          createdBy: ObjectId((req.header("user") as any)?._id),
          isActive: true,
          subjectId: ObjectId(req.params.id),
        }
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
            {
              $project: {
                name: 1,
              },
            },
          ],
          as: "user",
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
                    { $eq: ["$isActive", true] },
                  ],
                },
              },
            },
            {
              $project: {
                title: 1,
              },
            },
          ],
          as: "subject",
        },
      },
      {
        $project: {
          _id: 1,
          subjectId: 1,
          score: 1,
          test_start_time: 1,
          createdBy: 1,
          certificate: 1,
          createdAt: 1,
          updatedAt: 1,
          name: { $first: "$user.name" },
          subject_name: { $first: "$subject.title" },
          // isExam: {
          //     $cond: [
          //         {
          //             $eq: ["$result", []]
          //         },
          //         { $const: false }, true
          //     ]
          // },
        },
      },
    ]);
    // if (response[0].subjectId.toString() == ObjectId("61648f4bfa12f00e6b9d8036").toString()) {
    //   await pdf_generation(
    //     {
    //       resultId: response[0]?._id,
    //       name: response[0]?.name,
    //       subject_name: response[0]?.subject_name,
    //       date: moment(response[0]?.updatedAt).format("DD MMM YYYY"),
    //     },
    //     `${response[0]?._id}/pdf`,
    //     true
    //   );
    // } else {
    //   await pdf_generation(
    //     {
    //       resultId: response[0]?._id,
    //       name: response[0]?.name,
    //       subject_name: response[0]?.subject_name,
    //       date: moment(response[0]?.updatedAt).format("DD MMM YYYY"),
    //     },
    //     `${response[0]?._id}/pdf`,
    //     true
    //   );
    // }
    await pdf_generation(
      {
        resultId: response[0]?._id,
        name: response[0]?.name,
        subject_name: response[0]?.subject_name,
        date: moment(response[0]?.createdAt).format("DD MMM YYYY"),
      },
      `${response[0]?._id}/pdf`,
      true
    );
    await resultModel.findOneAndUpdate(
      { _id: ObjectId(response[0]?._id), isActive: true },
      {
        isApprove: true,
        certificate_is_create: true,
        certificate: `${response[0]?._id}/pdf/Certificate_of_Completion.pdf`,
      }
    );

    // console.log(response);
    if (response) {
      return res
        .status(200)
        .json(
          new apiResponse(
            200,
            "certificate download",
            `${response[0]?._id}/pdf/Certificate_of_Completion.pdf`,
            {}
          )
        );
    } else
      return res.status(400).json(new apiResponse(400, "Result", response, {}));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new apiResponse(500, "Internal server error", {}, error));
  }
};