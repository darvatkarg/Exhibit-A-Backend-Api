"use strict";
import { reqInfo } from "../../helpers/winston_logger";
import {
  userModel,
  answerModel,
  resultModel,
  training_optionModel,
  video_training_logModel,
  formModel
} from "../../database";
import { apiResponse, userStatus } from "../../common";
import { Request, Response } from "express";
import { email_approved } from "../../helpers/mail";
import { pdf_generation } from "../../helpers/pdf_generate";
import moment from 'moment';
import async from "async"
import { getS3File } from "../../helpers/S3";
import { existsSync, mkdirSync, writeFileSync } from "fs";

const ObjectId = require("mongoose").Types.ObjectId;

export const get_student = async (req: Request, res: Response) => {
  reqInfo(req);
  try {
    let response = await userModel.find(
      { userType: userStatus.student, isActive: true },
      {
        _id: 1, name: 1, email: 1, phoneNumber: 1, schoolId: 1,
        altEmail: 1,
        alter_phoneNumber: 1,
        image: 1,
        schoolName: 1,
        address: 1,
        country: 1,
        region: 1,
        city: 1,
        countryCode: 1,
        registeredDate: 1,
        createdAt: 1
      }
    ).sort({ createdAt: -1 });
    if (response)
      return res
        .status(200)
        .json(new apiResponse(200, "Get student successfully", response, {}));
    else
      return res
        .status(400)
        .json(
          new apiResponse(
            400,
            "Database error while getting student details ",
            {},
            {}
          )
        );
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new apiResponse(500, "Internal server error", {}, error));
  }
};

export const get_by_student = async (req: Request, res: Response) => {
  reqInfo(req);
  try {
    let response = await userModel.findOne(
      {
        _id: ObjectId(req.params.id),
        isActive: true,
        userType: userStatus.student,
      },
      {
        name: 1,
        email: 1,
        phoneNumber: 1,
        alter_phoneNumber: 1,
        image: 1,
        accountType: 1,
        schoolId: 1,
      }
    );
    if (response)
      return res
        .status(200)
        .json(new apiResponse(200, "Student", response, {}));
    else
      return res
        .status(400)
        .json(new apiResponse(400, "Database error", {}, {}));
  } catch (error) {
    return res
      .status(500)
      .json(new apiResponse(500, "Internal server error", {}, {}));
  }
};

export const get_filter_student = async (req: Request, res: Response) => {
  reqInfo(req);
  let user: any = req.header("user"),
    { _id, search, limit, page, ascending } = req.body,
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
    if (search) {
      var nameArray: Array<any> = [];
      var emailArray: Array<any> = [];
      var alter_emailArray: Array<any> = [];
      var phoneNumberArray: Array<any> = [];
      var alter_phoneNumberArray: Array<any> = [];
      search = search.split(" ");
      search.forEach((data) => {
        nameArray.push({ name: { $regex: data, $options: "si" } });
        emailArray.push({ email: { $regex: data, $options: "si" } });
        phoneNumberArray.push({
          phoneNumber: { $regex: data, $options: "si" },
        });
        alter_emailArray.push({
          altEmail: { $regex: data, $options: "si" },
        });
        alter_phoneNumberArray.push({
          alter_phoneNumber: { $regex: data, $options: "si" },
        });
      });
      match.$or = [
        { $and: nameArray },
        { $and: emailArray },
        { $and: phoneNumberArray },
        { $and: alter_emailArray },
        { $and: alter_phoneNumberArray },
      ];
    }
    match.isActive = true;
    match.userType = userStatus.student;
    match.isEmailVerified = true;
    match.isPhoneVerified = true;
    // Sorting Database
    sort.createdAt = -1;
    if (ascending) sort.createdAt = 1;

    let student_data = await userModel.aggregate([
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
                name: 1,
                email: 1,
                altEmail: 1,
                alter_phoneNumber: 1,
                phoneNumber: 1,
                image: 1,
                schoolName: 1,
                address: 1,
                country: 1,
                region: 1,
                city: 1,
                countryCode: 1,
                registeredDate: 1,
                createdAt: 1
              },
            },
          ],
          student_count: [{ $count: "count" }],
        },
      },
    ]);
    response.student_data = student_data[0].user || [];
    response.state = {
      page,
      limit,
      page_limit: Math.ceil(student_data[0]?.student_count[0]?.count / limit),
    };
    res
      .status(200)
      .json(
        new apiResponse(200, `Get theory question successfully`, response, {})
      );
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new apiResponse(500, "Internal server error", {}, {}));
  }
};

// export const get_student_status = async (req: Request, res: Response) => {
//   reqInfo(req);
//   let { _id, search, limit, page, ascending } = req.body,
//     skip = 0,
//     response: any = {},
//     match: any = {},
//     sort: any = {};
//   limit = parseInt(limit);
//   skip = (parseInt(page) - 1) * parseInt(limit);
//   try {
//     if (_id?.length != 0 && _id !== undefined) {
//       _id.forEach(function (part, index, theArray) {
//         theArray[index] = ObjectId(String(part));
//       });
//       match["_id"] = { $in: _id };
//     }

//     if (search) {
//       var nameArray: Array<any> = [];
//       var emailArray: Array<any> = [];
//       var alter_emailArray: Array<any> = [];
//       var phoneNumberArray: Array<any> = [];
//       search = search.split(" ");
//       search.forEach((data) => {
//         nameArray.push({ name: { $regex: data, $options: "si" } });
//         emailArray.push({ email: { $regex: data, $options: "si" } });
//         alter_emailArray.push({
//           alter_email: { $regex: data, $options: "si" },
//         });
//         phoneNumberArray.push({
//           phoneNumber: { $regex: data, $options: "si" },
//         });
//       });
//       match.$or = [
//         { $and: nameArray },
//         { $and: emailArray },
//         { $and: alter_emailArray },
//         { $and: phoneNumberArray },
//       ];
//     }

//     match.isActive = true;
//     match.userType = userStatus.student;

//     // Sorting Database
//     sort.createdAt = -1;
//     if (ascending) sort.createdAt = 1;

//     // let response = await userModel.find({ userType: userStatus.student, isActive: true }, { _id: 1, name: 1, email: 1, phoneNumber: 1, schoolId: 1 })
//     let student_data = await userModel.aggregate([
//       { $match: match },
//       {
//         $lookup: {
//           from: "results",
//           let: { createdBy: "$_id" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $and: [
//                     { $eq: ["$createdBy", "$$createdBy"] },
//                     { $eq: ["$isActive", true] },
//                   ],
//                 },
//               },
//             },
//             {
//               $lookup: {
//                 from: "course_subjects",
//                 let: { subjectId: "$subjectId" },
//                 pipeline: [
//                   {
//                     $match: {
//                       $expr: {
//                         $and: [
//                           { $eq: ["$_id", "$$subjectId"] },
//                           { $eq: ["$isActive", true] },
//                         ],
//                       },
//                     },
//                   },
//                   { $project: { name: 1 } },
//                 ],
//                 as: "subject",
//               },
//             },
//           ],
//           as: "result",
//         },
//       },
//       {
//         $lookup: {
//           from: "forms",
//           let: { createdBy: "$_id" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $and: [
//                     { $eq: ["$createdBy", "$$createdBy"] },
//                     { $eq: ["$isActive", true] },
//                   ],
//                 },
//               },
//             },
//           ],
//           as: "documents",
//         },
//       },
//       // { $unwind: { path: "$result" } },
//       {
//         $facet: {
//           student: [
//             { $sort: sort },
//             { $skip: skip },
//             { $limit: limit },
//             {
//               $project: {
//                 _id: 1,
//                 name: 1,
//                 email: 1,
//                 "result.score": 1,
//                 "result.isApprove": 1,
//                 "result._id": 1,
//                 "documents.document_image": 1,
//                 //score: { $first: "$result.score" },
//                 isExam: {
//                   $cond: [
//                     {
//                       $eq: ["$result", []],
//                     },
//                     { $const: false },
//                     true,
//                   ],
//                 },
//                 isDocument: {
//                   $cond: [
//                     {
//                       $eq: ["$documents", []],
//                     },
//                     { $const: false },
//                     true,
//                   ],
//                 },
//                 // isPass: {
//                 //     $cond: [
//                 //         {
//                 //             $gte: ["$result.score", [40]]
//                 //         },
//                 //         { $const: true }, false
//                 //     ]
//                 // }
//               },
//             },
//           ],
//           student_count: [{ $count: "count" }],
//         },
//       },
//     ]);
//     response.student_data = student_data[0].student || [];
//     response.state = {
//       page,
//       limit,
//       page_limit: Math.ceil(student_data[0]?.student_count[0]?.count / limit),
//     };
//     if (response)
//       return res
//         .status(200)
//         .json(new apiResponse(200, "get student successfully", response, {}));
//     else
//       return res
//         .status(400)
//         .json(new apiResponse(400, "database error ", {}, {}));
//   } catch (error) {
//     console.log(error);
//     return res
//       .status(500)
//       .json(new apiResponse(500, "Internal server error", {}, error));
//   }
// };

export const Approve = async (req: Request, res: Response) => {
  reqInfo(req);
  let body = req.body,
    email = body.email;
  // let user: any = req.header("user");
  // body.createdBy = user._id;
  try {
    let response = await resultModel.aggregate([
      { $match: { isActive: true, _id: ObjectId(body.resultId) } },
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
    //       date: moment().format("DD MMM YYYY"),
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
    //       date: moment().format("DD MMM YYYY"),
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
      let action = email_approved(email);
      return res
        .status(200)
        .json(
          new apiResponse(
            200,
            `Email has been sent to ${email}, kindly follow the instructions`,
            action,
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

export const get_student_status = async (req: Request, res: Response) => {
  reqInfo(req);
  let { _id, search, limit, page, ascending } = req.body,
    skip = 0,
    response: any = {},
    match: any = {},
    sort: any = {}
  limit = parseInt(limit);
  skip = (parseInt(page) - 1) * parseInt(limit);

  try {

    if (search) {
      var optionType: Array<any> = [];
      search = search.split(" ");
      search.forEach((data) => {
        optionType.push({ "user.name": { $regex: data, $options: "si" } });
      });
      match.$or = [
        { $and: optionType },
      ];
    }

    match.isActive = true;
    // sort.createdAt = -1;
    // if (ascending) sort.createdAt = 1;

    let student_data_count = await training_optionModel.countDocuments({ isActive: true });
    let recorded_count = await training_optionModel.countDocuments({ optionType: 0, isActive: true });
    let live_count = await training_optionModel.countDocuments({ optionType: 1, isActive: true });
    let physical_count = await training_optionModel.countDocuments({ optionType: 2, isActive: true });

    let student_data = await training_optionModel.aggregate([
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
          ],
          as: "subject",
        },
      },
      {
        $lookup: {
          from: "results",
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
          as: "result",
        },
      },
      {
        $lookup: {
          from: "forms",
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
          as: "documents",
        },
      },
      { $match: match },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          optionType: 1,
          subjectId: 1,
          createdAt: 1,
          "result.isApprove": 1,
          "result.createdAt": 1,
          "result._id": 1,
          "result.score": 1,
          "documents.document_image": 1,
          "user._id": 1,
          "user.name": 1,
          "user.email": 1,
          subjectName: { $first: "$subject.title" },
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
          isCourse: {
            $cond: [
              {
                $eq: ["$subject", []],
              },
              { $const: false },
              true,
            ],
          },
          // isPass: {
          //     $cond: [
          //         {
          //             $gte: ["$result.score", [40]]
          //         },
          //         { $const: true }, false
          //     ]
          // }
        },
      },
    ]);
    response.recorded_count = recorded_count;
    response.live_count = live_count;
    response.physical_count = physical_count;
    response.student_data = student_data || [];
    response.state = {
      page,
      limit,
      page_limit: Math.ceil(student_data_count / limit),
    };
    if (response)
      return res
        .status(200)
        .json(new apiResponse(200, "Get student successfully", response, {}));
    else
      return res
        .status(400)
        .json(new apiResponse(400, "Database error ", {}, {}));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new apiResponse(500, "Internal server error", {}, error));
  }
};

export const get_student_result_status_approve = async (req: Request, res: Response) => {
  reqInfo(req);
  let { search, limit, page, subjectId } = req.body,
    skip = 0,
    response: any = {},
    match: any = {}
  limit = parseInt(limit);
  skip = (parseInt(page) - 1) * parseInt(limit);
  try {
    if (search) {
      var nameArray: Array<any> = []
      var emailArray: Array<any> = []
      var teacherArray: Array<any> = []
      var scoreArray: Array<any> = []
      search = search.split(" ")
      search.forEach(data => {
        nameArray.push({ "user.name": { $regex: data, $options: 'si' } })
        emailArray.push({ "user.email": { $regex: data, $options: 'si' } })
        teacherArray.push({ "user.teacherID": { $regex: data, $options: 'si' } })
        scoreArray.push({ score: Number(data) })
      })
      match.$or = [{ $and: scoreArray }, { $and: nameArray }, { $and: emailArray }, { $and: teacherArray }]
    }
    if (subjectId) match.subjectId = ObjectId(subjectId)
    match.isActive = true;
    let student_Ids = await resultModel.aggregate([
      { $match: { isActive: true, isApprove: true, ...match } },
      {
        $group: {
          _id: null,
          subjectIds: { $addToSet: "$subjectId" },
          createdBy: { $addToSet: "$createdBy" },
          count: { $sum: 1 },
        }
      },
    ]);
    let student_data_count = student_Ids[0]?.count || 1
    let recorded_count = await training_optionModel.countDocuments({ subjectId: { $in: student_Ids[0]?.subjectIds }, createdBy: { $in: student_Ids[0]?.createdBy }, optionType: 0, isActive: true });
    let live_count = await training_optionModel.countDocuments({ subjectId: { $in: student_Ids[0]?.subjectIds }, createdBy: { $in: student_Ids[0]?.createdBy }, optionType: 1, isActive: true });
    let physical_count = await training_optionModel.countDocuments({ subjectId: { $in: student_Ids[0]?.subjectIds }, createdBy: { $in: student_Ids[0]?.createdBy }, optionType: 2, isActive: true });
    let student_data = await resultModel.aggregate([
      { $match: { isApprove: true, isActive: true, } },
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
          ],
          as: "subject",
        },
      },
      {
        $lookup: {
          from: "training_options",
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
          as: "training_option",
        },
      },
      {
        $lookup: {
          from: "forms",
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
          as: "documents",
        },
      },
      { $match: match },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          isApprove: 1,
          createdAt: 1,
          score: 1,
          optionType: 1,
          subjectId: 1,
          "training_option.optionType": 1,
          "training_option.subjectId": 1,
          "training_option._id": 1,
          "documents.document_image": 1,
          "user._id": 1,
          "user.name": 1,
          "user.email": 1,
          "user.teacherID": 1,
          "user.region": 1,
          "user.city": 1,
          "user.phoneNumber": 1,
          subjectName: { $first: "$subject.title" },
          isDocument: {
            $cond: [
              {
                $eq: ["$documents", []],
              },
              { $const: false },
              true,
            ],
          },
          isCourse: {
            $cond: [
              {
                $eq: ["$subject", []],
              },
              { $const: false },
              true,
            ],
          },
        },
      },
    ]);
    response.recorded_count = recorded_count;
    response.live_count = live_count;
    response.physical_count = physical_count;
    response.student_data = student_data || [];
    response.state = {
      page,
      limit,
      page_limit: Math.ceil(student_data_count / limit),
    };
    if (response) return res.status(200).json(new apiResponse(200, "Get student successfully", response, {}));
    else return res.status(400).json(new apiResponse(400, "Database error ", {}, {}));
  } catch (error) {
    console.log("error", error);

    return res.status(500).json(new apiResponse(500, "Internal server error", {}, error));
  }
};

export const get_student_result_status = async (req: Request, res: Response) => {
  reqInfo(req);
  let { search, limit, page, subjectId } = req.body,
    skip = 0,
    response: any = {},
    match: any = {}
  limit = parseInt(limit);
  skip = (parseInt(page) - 1) * parseInt(limit);
  try {
    if (search) {
      var nameArray: Array<any> = []
      var emailArray: Array<any> = []
      var teacherArray: Array<any> = []
      var scoreArray: Array<any> = []
      search = search.split(" ")
      search.forEach(data => {
        nameArray.push({ "user.name": { $regex: data, $options: 'si' } })
        emailArray.push({ "user.email": { $regex: data, $options: 'si' } })
        teacherArray.push({ "user.teacherID": { $regex: data, $options: 'si' } })
        scoreArray.push({ score: Number(data) })
      })
      match.$or = [{ $and: scoreArray }, { $and: nameArray }, { $and: emailArray }, { $and: teacherArray }]
    }
    if (subjectId) match.subjectId = ObjectId(subjectId)
    match.isActive = true;
    let student_Ids = await resultModel.aggregate([
      { $match: { isActive: true, isApprove: false, ...match } },
      {
        $group: {
          _id: null,
          subjectIds: { $addToSet: "$subjectId" },
          createdBy: { $addToSet: "$createdBy" },
          count: { $sum: 1 },
        }
      },
    ]);
    let student_data_count = student_Ids[0]?.count || 1
    let recorded_count = await training_optionModel.countDocuments({ subjectId: { $in: student_Ids[0]?.subjectIds }, createdBy: { $in: student_Ids[0]?.createdBy }, optionType: 0, isActive: true });
    let live_count = await training_optionModel.countDocuments({ subjectId: { $in: student_Ids[0]?.subjectIds }, createdBy: { $in: student_Ids[0]?.createdBy }, optionType: 1, isActive: true });
    let physical_count = await training_optionModel.countDocuments({ subjectId: { $in: student_Ids[0]?.subjectIds }, createdBy: { $in: student_Ids[0]?.createdBy }, optionType: 2, isActive: true });
    let student_data = await resultModel.aggregate([
      { $match: { isApprove: false, isActive: true, } },
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
          ],
          as: "subject",
        },
      },
      {
        $lookup: {
          from: "training_options",
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
          as: "training_option",
        },
      },
      {
        $lookup: {
          from: "forms",
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
          as: "documents",
        },
      },
      { $match: match },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          isApprove: 1,
          createdAt: 1,
          score: 1,
          optionType: 1,
          subjectId: 1,
          "training_option.optionType": 1,
          "training_option.subjectId": 1,
          "training_option._id": 1,
          "documents.document_image": 1,
          "user._id": 1,
          "user.name": 1,
          "user.email": 1,
          "user.teacherID": 1,
          "user.region": 1,
          "user.city": 1,
          "user.phoneNumber": 1,
          subjectName: { $first: "$subject.title" },
          isDocument: {
            $cond: [
              {
                $eq: ["$documents", []],
              },
              { $const: false },
              true,
            ],
          },
          isCourse: {
            $cond: [
              {
                $eq: ["$subject", []],
              },
              { $const: false },
              true,
            ],
          },
        },
      },
    ]);
    response.recorded_count = recorded_count;
    response.live_count = live_count;
    response.physical_count = physical_count;
    response.student_data = student_data || [];
    response.state = {
      page,
      limit,
      page_limit: Math.ceil(student_data_count / limit),
    };
    if (response) return res.status(200).json(new apiResponse(200, "Get student successfully", response, {}));
    else return res.status(400).json(new apiResponse(400, "Database error ", {}, {}));
  } catch (error) {
    console.log("error", error);

    return res.status(500).json(new apiResponse(500, "Internal server error", {}, error));
  }
};

export const get_student_attendees = async (req: Request, res: Response) => {
  reqInfo(req);
  let { search, limit, page, subjectId } = req.body,
    skip = 0,
    response: any = {},
    match: any = {}
  limit = parseInt(limit);
  skip = (parseInt(page) - 1) * parseInt(limit);
  try {

    if (search) {
      var optionType: Array<any> = [];
      search = search.split(" ");
      search.forEach((data) => {
        optionType.push({ "user.name": { $regex: data, $options: "si" } });
      });
      match.$or = [
        { $and: optionType },
      ];
    }
    let result_data = await resultModel.find({ isActive: true })
    let sub_array: any = []
    let user_array: any = []
    for (let i = 0; i < result_data.length; i++) {
      sub_array.push(ObjectId(result_data[i].subjectId))
      user_array.push(ObjectId(result_data[i].createdBy))
    }
    // await result_data.map((data) => {
    //   sub_array.push(data.subjectId)
    //   user_array.push(data.createdBy)
    // })
    // console.log(sub_array);
    // console.log("===============");
    // console.log(user_array);

    // return res.send(student_data_count)
    // let student_data_count = await formModel.countDocuments({ isActive: true });
    // match.subjectId = { $nin: sub_array }
    let student_data_count = await formModel.countDocuments({ createdBy: { $nin: user_array }, isActive: true });
    match.isActive = true;
    match.createdBy = { $nin: user_array }
    if (subjectId) match.subjectId = ObjectId(subjectId)
    let student_data = await formModel.aggregate([
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
          ],
          as: "subject",
        },
      },
      {
        $lookup: {
          from: "results",
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
          as: "result",
        },
      },
      {
        $lookup: {
          from: "training_options",
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
          as: "training_option",
        },
      },
      { $match: match },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          document_image: 1,
          subjectId: 1,
          createdAt: 1,
          "training_option.optionType": 1,
          "training_option.subjectId": 1,
          "training_option._id": 1,
          "result.isApprove": 1,
          "result.createdAt": 1,
          "result._id": 1,
          "result.score": 1,
          "user._id": 1,
          "user.name": 1,
          "user.email": 1,
          "user.teacherID": 1,
          subjectName: { $first: "$subject.title" },
          isExamGiven: {
            $cond: [
              {
                $eq: ["$result", []],
              },
              { $const: false },
              true,
            ],
          },
          isCourse: {
            $cond: [
              {
                $eq: ["$subject", []],
              },
              { $const: false },
              true,
            ],
          },
        },
      },
    ]);

    response.student_data = student_data || [];
    response.state = {
      page,
      limit,
      page_limit: Math.ceil(student_data_count / limit),
    };
    if (response)
      return res
        .status(200)
        .json(new apiResponse(200, "Get student successfully", response, {}));
    else
      return res
        .status(400)
        .json(new apiResponse(400, "Database error ", {}, {}));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new apiResponse(500, "Internal server error", {}, error));
  }
};

export const get_student_form = async (req: Request, res: Response) => {
  reqInfo(req);
  let { search, limit, page, subjectId } = req.body,
    skip = 0,
    response: any = {},
    match: any = {}
  limit = parseInt(limit);
  skip = (parseInt(page) - 1) * parseInt(limit);
  try {

    if (search) {
      var optionType: Array<any> = [];
      var emailType: Array<any> = [];
      var teacherType: Array<any> = [];
      search = search.split(" ");
      search.forEach((data) => {
        optionType.push({ "user.name": { $regex: data, $options: "si" } });
        emailType.push({ "user.email": { $regex: data, $options: "si" } });
        teacherType.push({ "user.teacherID": { $regex: data, $options: "si" } });
      });
      match.$or = [
        { $and: optionType }, { $and: emailType }, { $and: teacherType },
      ];
    }

    let array = [];
    let formData = await resultModel.find({ isActive: true });
    for (let i = 0; i < formData.length; i++) {
      array.push(formData[i].createdBy)
    }

    if (subjectId) match.subjectId = ObjectId(subjectId)
    match.isActive = true
    let [student_data_count, physical_count, live_count, recorded_count] = await Promise.all([
      formModel.countDocuments({ ...match, createdBy: { $nin: array } }),
      training_optionModel.countDocuments({ optionType: 2, isFormUploaded: true, isActive: true }),
      training_optionModel.countDocuments({ optionType: 1, isFormUploaded: true, isActive: true }),
      training_optionModel.countDocuments({ optionType: 0, isFormUploaded: true, isActive: true }),
    ])

    let student_data = await formModel.aggregate([
      { $match: { ...match, createdBy: { $nin: array } } },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
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
          ],
          as: "subject",
        },
      },
      {
        $lookup: {
          from: "results",
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
          as: "result",
        },
      },
      {
        $lookup: {
          from: "training_options",
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
          as: "training_option",
        },
      },
      {
        $project: {
          _id: 1,
          document_image: 1,
          subjectId: 1,
          createdAt: 1,
          "training_option.optionType": 1,
          "training_option.subjectId": 1,
          "training_option._id": 1,
          "result.isApprove": 1,
          "result.createdAt": 1,
          "result._id": 1,
          "result.score": 1,
          "user._id": 1,
          "user.name": 1,
          "user.email": 1,
          "user.teacherID": 1,
          "user.region": 1,
          "user.city": 1,
          "user.phoneNumber": 1,
          subjectName: { $first: "$subject.title" },
          isExamGiven: {
            $cond: [
              {
                $eq: ["$result", []],
              },
              { $const: false },
              true,
            ],
          },
          isCourse: {
            $cond: [
              {
                $eq: ["$subject", []],
              },
              { $const: false },
              true,
            ],
          },
        },
      },
    ]);
    if (!existsSync(`${process.cwd()}/upload`)) {
      mkdirSync(`${process.cwd()}/upload`);
    }
    for (let i = 0; i < student_data?.length; i++) {
      console.log(student_data[i]?.document_image);
      let s3Object: any = await getS3File(student_data[i]?.document_image)
      if (s3Object) {
        console.log(11, s3Object);
        let eachFolder: any = student_data[i]?.document_image.split('/')
        if (eachFolder?.length == 0) {
          return
        }
        let folderPath: any = `${process.cwd()}/upload`
        console.log(`${folderPath}/${eachFolder[eachFolder?.length - 1]}`);
        writeFileSync(`${folderPath}/${eachFolder[eachFolder?.length - 1]}`, s3Object?.Body)
      }
    }
    response.student_data = student_data || [];
    response.state = {
      page,
      limit,
      page_limit: Math.ceil(student_data_count / limit),
    };
    response.recorded_count = recorded_count;
    response.live_count = live_count;
    response.physical_count = physical_count;
    if (response)
      return res
        .status(200)
        .json(new apiResponse(200, "Get student successfully", response, {}));
    else
      return res
        .status(400)
        .json(new apiResponse(400, "Database error ", {}, {}));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new apiResponse(500, "Internal server error", {}, error));
  }
};

export const get_student_not_upload_form = async (req: Request, res: Response) => {
  reqInfo(req);
  let { search, limit, page } = req.body,
    skip = 0,
    response: any = {},
    match: any = {},
    match_name: any = {},
    sort: any = {};
  limit = parseInt(limit);
  skip = (parseInt(page) - 1) * parseInt(limit);

  try {

    if (search) {
      var optionType: Array<any> = [];
      var emailType: Array<any> = [];
      var teacherType: Array<any> = [];
      search = search.split(" ");
      search.forEach((data) => {
        optionType.push({ "user.name": { $regex: data, $options: "si" } });
        emailType.push({ "user.email": { $regex: data, $options: "si" } });
        teacherType.push({ "user.teacherID": { $regex: data, $options: "si" } });
      });
      match_name.$or = [
        { $and: optionType }, { $and: emailType }, { $and: teacherType },
      ];
    }

    match.isActive = true;
    let result_data = await formModel.find({ isActive: true })
    let sub_array: any = []
    let user_array = []
    for (let i = 0; i < result_data.length; i++) {
      sub_array.push(ObjectId(result_data[i].subjectId))
      user_array.push(ObjectId(result_data[i].createdBy))
    }
    let student_data_count = await training_optionModel.countDocuments({ createdBy: { $nin: user_array }, isActive: true });
    let recorded_count = await training_optionModel.countDocuments({ optionType: 0, isActive: true });
    let live_count = await training_optionModel.countDocuments({ optionType: 1, isActive: true });
    let physical_count = await training_optionModel.countDocuments({ optionType: 2, isActive: true });

    let student_data = await training_optionModel.aggregate([
      { $match: { createdBy: { $nin: user_array }, ...match } },
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
          ],
          as: "subject",
        },
      },
      {
        $lookup: {
          from: "results",
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
          as: "result",
        },
      },
      {
        $lookup: {
          from: "forms",
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
          as: "documents",
        },
      },
      { $match: match_name },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          optionType: 1,
          subjectId: 1,
          createdAt: 1,
          "result.isApprove": 1,
          "result.createdAt": 1,
          "result._id": 1,
          "result.score": 1,
          "documents.document_image": 1,
          "user._id": 1,
          "user.name": 1,
          "user.email": 1,
          "user.teacherID": 1,
          "user.region": 1,
          "user.city": 1,
          "user.phoneNumber": 1,
          subjectName: { $first: "$subject.title" },
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
          isCourse: {
            $cond: [
              {
                $eq: ["$subject", []],
              },
              { $const: false },
              true,
            ],
          },
          // isPass: {
          //     $cond: [
          //         {
          //             $gte: ["$result.score", [40]]
          //         },
          //         { $const: true }, false
          //     ]
          // }
        },
      },
    ]);
    response.recorded_count = recorded_count;
    response.live_count = live_count;
    response.physical_count = physical_count;
    response.student_data = student_data || [];
    response.state = {
      page,
      limit,
      page_limit: Math.ceil(student_data_count / limit),
    };
    if (response)
      return res
        .status(200)
        .json(new apiResponse(200, "Get student successfully", response, {}));
    else
      return res
        .status(400)
        .json(new apiResponse(400, "Database error ", {}, {}));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new apiResponse(500, "Internal server error", {}, error));
  }
};

export const delete_student = async (req: Request, res: Response) => {
  reqInfo(req)
  let id = req.params.id
  let body: any = req.body
  body.updatedBy = (req.header('user') as any)?._id

  try {
    let response = await userModel.findByIdAndDelete({ _id: ObjectId(id) });
    if (response) {
      let training_option = await training_optionModel.deleteMany({ createdBy: ObjectId(id) });
      await video_training_logModel.deleteMany({ logUserId: ObjectId(id) })
      return res.status(200).json(new apiResponse(200, 'Student successfully deleted', {}, {}))
    }
    else return res.status(400).json(new apiResponse(400, 'Database error while deleting user', {}, {}))
  } catch (error) {
    console.log(error);
    return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
  }
}

export const get_student_result_status_filterBy_date = async (req: Request, res: Response) => {
  reqInfo(req);
  let { search, limit, page, startDate, endDate, subjectId } = req.body,
    skip = 0,
    response: any = {},
    match: any = {}
  limit = parseInt(limit);
  skip = (parseInt(page) - 1) * parseInt(limit)
  try {
    if (search) {
      var optionType: Array<any> = [];
      search = search.split(" ");
      search.forEach((data) => {
        optionType.push({ "user.name": { $regex: data, $options: "si" } });
      });
      match.$or = [
        { $and: optionType },
      ];
    }

    if (subjectId) match.subjectId = ObjectId(subjectId)
    match.isActive = true;
    let student_data_count = await resultModel.countDocuments({ isActive: true, isApprove: false, createdAt: { $gte: new Date(startDate), $lt: new Date(endDate) } });
    let recorded_count = await training_optionModel.countDocuments({ optionType: 0, isActive: true });
    let live_count = await training_optionModel.countDocuments({ optionType: 1, isActive: true });
    let physical_count = await training_optionModel.countDocuments({ optionType: 2, isActive: true });
    let student_data = await resultModel.aggregate([
      { $match: { isApprove: false, createdAt: { $gte: new Date(startDate), $lt: new Date(endDate) } } },
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
          ],
          as: "subject",
        },
      },
      {
        $lookup: {
          from: "training_options",
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
          as: "training_option",
        },
      },
      {
        $lookup: {
          from: "forms",
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
          as: "documents",
        },
      },
      { $match: match },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          isApprove: 1,
          createdAt: 1,
          score: 1,
          optionType: 1,
          subjectId: 1,
          "training_option.optionType": 1,
          "training_option.subjectId": 1,
          "training_option._id": 1,
          "documents.document_image": 1,
          "user._id": 1,
          "user.name": 1,
          "user.email": 1,
          "user.teacherID": 1,
          "user.region": 1,
          "user.city": 1,
          "user.phoneNumber": 1,
          subjectName: { $first: "$subject.title" },
          isDocument: {
            $cond: [
              {
                $eq: ["$documents", []],
              },
              { $const: false },
              true,
            ],
          },
          isCourse: {
            $cond: [
              {
                $eq: ["$subject", []],
              },
              { $const: false },
              true,
            ],
          },
        },
      },
    ]);
    response.recorded_count = recorded_count;
    response.live_count = live_count;
    response.physical_count = physical_count;
    response.student_data = student_data || [];
    response.state = {
      page,
      limit,
      page_limit: Math.ceil(student_data_count / limit),
    };
    if (response) return res.status(200).json(new apiResponse(200, "Get student successfully", response, {}));
    else return res.status(400).json(new apiResponse(400, "Database error ", {}, {}));
  } catch (error) {
    console.log("error", error);

    return res.status(500).json(new apiResponse(500, "Internal server error", {}, error));
  }
};

export const get_student_result_status_approve_filterBy_date = async (req: Request, res: Response) => {
  reqInfo(req);
  let { search, limit, page, startDate, endDate, subjectId } = req.body,
    skip = 0,
    response: any = {},
    match: any = {}
  limit = parseInt(limit);
  skip = (parseInt(page) - 1) * parseInt(limit)
  try {
    if (search) {
      var optionType: Array<any> = [];
      search = search.split(" ");
      search.forEach((data) => {
        optionType.push({ "user.name": { $regex: data, $options: "si" } });
      });
      match.$or = [
        { $and: optionType },
      ];
    }

    if (subjectId) match.subjectId = ObjectId(subjectId)
    match.isActive = true;
    let student_data_count = await resultModel.countDocuments({ isActive: true, isApprove: true, createdAt: { $gte: new Date(startDate), $lt: new Date(endDate) } });
    let recorded_count = await training_optionModel.countDocuments({ optionType: 0, isActive: true });
    let live_count = await training_optionModel.countDocuments({ optionType: 1, isActive: true });
    let physical_count = await training_optionModel.countDocuments({ optionType: 2, isActive: true });
    let student_data = await resultModel.aggregate([
      { $match: { isApprove: true, createdAt: { $gte: new Date(startDate), $lt: new Date(endDate) } } },
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
          ],
          as: "subject",
        },
      },
      {
        $lookup: {
          from: "training_options",
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
          as: "training_option",
        },
      },
      {
        $lookup: {
          from: "forms",
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
          as: "documents",
        },
      },
      { $match: match },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          isApprove: 1,
          createdAt: 1,
          score: 1,
          optionType: 1,
          subjectId: 1,
          "training_option.optionType": 1,
          "training_option.subjectId": 1,
          "training_option._id": 1,
          "documents.document_image": 1,
          "user._id": 1,
          "user.name": 1,
          "user.email": 1,
          "user.teacherID": 1,
          "user.region": 1,
          "user.city": 1,
          "user.phoneNumber": 1,
          subjectName: { $first: "$subject.title" },
          isDocument: {
            $cond: [
              {
                $eq: ["$documents", []],
              },
              { $const: false },
              true,
            ],
          },
          isCourse: {
            $cond: [
              {
                $eq: ["$subject", []],
              },
              { $const: false },
              true,
            ],
          },
        },
      },
    ]);
    response.recorded_count = recorded_count;
    response.live_count = live_count;
    response.physical_count = physical_count;
    response.student_data = student_data || [];
    response.state = {
      page,
      limit,
      page_limit: Math.ceil(student_data_count / limit),
    };
    if (response) return res.status(200).json(new apiResponse(200, "Get student successfully", response, {}));
    else return res.status(400).json(new apiResponse(400, "Database error ", {}, {}));
  } catch (error) {
    console.log("error", error);

    return res.status(500).json(new apiResponse(500, "Internal server error", {}, error));
  }
};

export const delete_result = async (req: Request, res: Response) => {
  reqInfo(req)
  try {
    let response = await resultModel.findByIdAndDelete({ _id: ObjectId(req.params.id), isActive: true })
    if (response) {
      await formModel.findOneAndDelete({ createdBy: ObjectId(response.createdBy), subjectId: ObjectId(response.subjectId), isActive: true })
      return res.status(200).json(new apiResponse(200, "Result successfully deleted!", {}, {}));
    }
    else return res.status(400).json(new apiResponse(400, "Database error ", {}, {}));
  } catch (error) {
    return res.status(500).json(new apiResponse(500, "Internal server error", {}, error));
  }
};