"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { course_subjectModel, main_categoryModel, stateModel, training_optionModel, userModel } from '../../database'
import { apiResponse } from '../../common'
import { Request, Response } from 'express'
import { getCache, setCache } from '../../helpers/caching'
import { faculty_assign_mail } from '../../helpers/mail'
import { assign_faculty_Model } from '../../database/models/assign_faculty'

const ObjectId = require('mongoose').Types.ObjectId

export const get_training_option_record = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await training_optionModel.aggregate([
            { $match: { subjectId: ObjectId(req.params.id), isActive: true, isUserBatch: false, isFormUploaded: false, isExamCompleted: false } },
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
                    let: { createdBy: '$createdBy' },
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
                        { $project: { name: 1, region: 1, email: 1, schoolName: 1 } }
                    ],
                    as: "user"
                }
            },
            {
                $project: {
                    subjectId: 1,
                    optionType: 1,
                    createdBy: 1,
                    userDetail: "$user",
                    courseDetail: "$course_subject",
                    createdAt: 1
                }
            },
            // { $sort: { createdAt: -1 } }
        ])
        if (response) return res.status(200).json(new apiResponse(200, 'get training record', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error', {}, {}))

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const get_filter_training_option_record = async (req: Request, res: Response) => {
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
        match.isActive = true;
        // match.optionType = 1;
        match.isUserBatch = false;
        sort.createdAt = -1;
        if (ascending) sort.createdAt = 1;

        let student_data = await training_optionModel.aggregate([
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
                    let: { createdBy: '$createdBy' },
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
            { $match: { ...match, $or: [{ optionType: 0 }, { optionType: 1 }] } },
            {
                $facet: {
                    user: [
                        { $sort: sort },
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                subjectId: 1,
                                optionType: 1,
                                createdBy: 1,
                                "user._id": 1,
                                "user.name": 1,
                                "course_subject._id": 1,
                                "course_subject.title": 1,
                                createdAt: 1
                            }
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
        res.status(200).json(new apiResponse(200, `Get training option record successfully`, response, {}));
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new apiResponse(500, "Internal server error", {}, {}));
    }
};


export const get_subject_user_list = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let subjectIs: any, userIs: any, { subjectId, limit, page, search } = req.body;
        let skip = 0;
        limit = parseInt(limit);
        skip = (parseInt(page) - 1) * parseInt(limit);
        if (Object.keys(req.body).length == 0) {
            subjectIs = await getCache(`ALL_SUBJECT`)
            if (subjectIs) return res.status(200).json(new apiResponse(200, 'Course subject', subjectIs, {}))
            subjectIs = await course_subjectModel.find({ isActive: true }, { title: 1 }).sort({ createdAt: -1 })
            await setCache(`ALL_SUBJECT`, subjectIs, 0)
            return res.status(200).json(new apiResponse(200, 'Course subject', subjectIs, {}))
        } if (req.body.subjectId && req.body.page && req.body.limit) {
            let sort: any = {}, response: any = {},
                match: any = {};
            sort.createdAt = -1;

            if (search) {
                var subjectArray: Array<any> = [];
                search = search.split(" ");
                search.forEach((data) => {
                    subjectArray.push({ "user.name": { $regex: data, $options: "si" } });
                });
                match.$or = [
                    { $and: subjectArray },
                ];
            }
            let findSubject = await course_subjectModel.find({ _id: subjectId });

            match.subjectId = ObjectId(findSubject[0]._id);
            match.optionType = 1;
            match.isActive = true;
            match.isUserBatch = false;
            userIs = await training_optionModel.aggregate([
                {
                    $lookup: {
                        from: "users",
                        let: { createdBy: '$createdBy' },
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
                { $match: match },
                {
                    $facet: {
                        user: [
                            { $sort: sort },
                            { $skip: skip },
                            { $limit: limit },
                            {
                                $project: {
                                    subjectId: 1,
                                    optionType: 1,
                                    createdBy: 1,
                                    "user._id": 1,
                                    "user.name": 1,
                                    createdAt: 1
                                }
                            },
                        ],
                        student_count: [{ $count: "count" }],

                    },
                },
            ]);

            response.student_data = userIs[0].user || [];

            response.state = {
                page,
                limit,
                page_limit: Math.ceil(userIs[0]?.student_count[0]?.count / limit),
            };

            return res.status(200).json(new apiResponse(200, 'Get all user', response, {}))
        }
    } catch (error) {
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const get_region = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await stateModel.find({ countryId: ObjectId("5f9bab0d2c3eaf4358041443") }, { state: 1 }).sort({ state: 1 });
        if (response) return res.status(200).json(new apiResponse(200, 'get region', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const get_region_test = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await userModel.updateMany({ region: "Western Region" }, { region: "Western" });
        if (response) return res.status(200).json(new apiResponse(200, 'get user', {}, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}