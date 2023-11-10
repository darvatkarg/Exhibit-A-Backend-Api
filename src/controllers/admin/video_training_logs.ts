"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { main_categoryModel, video_training_logModel, userModel, training_optionModel } from '../../database'
import { apiResponse } from '../../common'
import { Request, Response } from 'express'

const ObjectId = require('mongoose').Types.ObjectId

export const get_video_training_log = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await video_training_logModel.aggregate([
            {
                $lookup: {
                    from: "course_subjects",
                    let: { subjectId: '$subjectId' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$_id', '$$subjectId'] },
                                        { $eq: ['$isActive', true] },
                                    ],
                                },
                            }
                        },
                        { $project: { title: 1 } }
                    ],
                    as: "course_subject"
                }
            },
            {
                $lookup: {
                    from: "users",
                    let: { createdBy: '$logUserId' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$_id', '$$createdBy'] },
                                        { $eq: ['$isActive', true] },
                                    ],
                                },
                            }
                        },
                        { $project: { name: 1 } }
                    ],
                    as: "user"
                }
            },
            {
                $project: {
                    subjectId: 1,
                    logUserId: 1,
                    topicCovered: 1,
                    logLatestDate: 1,
                    "user._id": 1,
                    "user.name": 1,
                    "course_subject._id": 1,
                    "course_subject.title": 1,
                }
            },
            { $sort: { createdAt: -1 } }
        ])
        if (response) return res.status(200).json(new apiResponse(200, 'get video training log', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error', {}, {}))

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const get_filter_video_training_log = async (req: Request, res: Response) => {
    reqInfo(req);
    let user: any = req.header("user"),
        { _id, search, limit, page } = req.body,
        skip = 0,
        response: any = {},
        match: any = {},
        sort: any = {};
    limit = parseInt(limit);
    skip = (parseInt(page) - 1) * parseInt(limit);
    try {
        if (_id?.length != 0 && _id !== undefined) {
            _id.forEach(function (part, index, theArray) {
                theArray[index] = ObjectId(String(part));
            });
            match["_id"] = { $in: _id };
        }
        if (search) {
            var subjectArray: Array<any> = [];
            search = search.split(" ");
            search.forEach((data) => {
                subjectArray.push({ "course_subject.title": { $regex: data, $options: "si" } });
            });
            match.$or = [
                { $and: subjectArray },
            ];
        }

        sort.logLatestDate = -1;

        let student_Count = await video_training_logModel.countDocuments({ isFormUploaded: false });

        let student_data = await video_training_logModel.aggregate([
            { $match: { ...match, isFormUploaded: false } },
            { $sort: sort },
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: "course_subjects",
                    let: { subjectId: '$subjectId' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$_id', '$$subjectId'] },
                                        { $eq: ['$isActive', true] },
                                    ],
                                },
                            }
                        },
                        { $project: { _id: 1, title: 1, } }
                    ],
                    as: "course_subject"
                }
            },
            {
                $lookup: {
                    from: "users",
                    let: { createdBy: '$logUserId' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$_id', '$$createdBy'] },
                                        { $eq: ['$isActive', true] },
                                    ],
                                },
                            }
                        },
                        { $project: { _id: 1, name: 1 } }
                    ],
                    as: "user"
                }
            },
            {
                $project: {
                    subjectId: 1,
                    logUserId: 1,
                    topicCovered: 1,
                    logLatestDate: 1,
                    "id": { $first: "$user._id" },
                    "name": { $first: "$user.name" },
                    "course_subject._id": 1,
                    "course_subject.title": 1,
                }
            },
            // {
            //     $facet: {
            //         user: [
            //             {
            //                 $project: {
            //                     subjectId: 1,
            //                     logUserId: 1,
            //                     topicCovered: 1,
            //                     logLatestDate: 1,
            //                     "user._id": 1,
            //                     "user.name": 1,
            //                     "course_subject._id": 1,
            //                     "course_subject.title": 1,
            //                 }
            //             },
            //         ],
            //         student_count: [{ $count: "count" }],
            //         // completed_video: [{ $match: { topicCovered: 6 } }, { $count: "completed_video" }],
            //     },
            // },
        ]);

        response.student_count = student_Count;
        // response.completed_video = student_data[0]?.completed_video[0]?.completed_video;
        response.student_data = student_data || [];
        response.state = {
            page,
            limit,
            page_limit: Math.ceil(student_Count / limit),
        };
        res
            .status(200)
            .json(
                new apiResponse(200, `Get video training log successfully`, response, {})
            );
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new apiResponse(500, "Internal server error", {}, {}));
    }
};

export const get_video_training_log_count = async (req: Request, res: Response) => {
    reqInfo(req);
    let user: any = req.header("user")
    try {
        return res.status(200).json(new apiResponse(200, `Get video training log count successfully`, {
            user_count: await video_training_logModel.countDocuments(),
        }, {}))
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new apiResponse(500, "Internal server error", {}, {}));
    }
};