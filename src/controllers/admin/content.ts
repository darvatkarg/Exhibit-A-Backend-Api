"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { contentModel, course_subjectModel, userModel } from '../../database'
import { apiResponse, URL_decode } from '../../common'
import { Request, Response } from 'express'
import { deleteImage } from '../../helpers/S3'
import { object } from 'joi'

const ObjectId = require('mongoose').Types.ObjectId

export const add_content = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        search = new RegExp(`^${body.title}$`, "ig")
    req.body.createdBy = (req.header('user') as any)?._id
    try {
        let existTitle = await contentModel.findOne({ title: { $regex: search }, isActive: true })
        if (existTitle) return res.status(200).json(new apiResponse(200, 'Content title is already added', existTitle, {}))
        else {
            let response = await new contentModel(body).save()
            if (response) return res.status(200).json(new apiResponse(200, 'Content added successfully', response, {}))
            else return res.status(400).json(new apiResponse(400, 'Database error while adding content', {}, {}))
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const get_content = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await contentModel.find({ isActive: true }, { title: 1, content: 1, video: 1, subjectId: 1, pdf: 1, ePub: 1 })
        if (response) return res.status(200).json(new apiResponse(200, 'Get content successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while getting content', {}, {}))

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const get_by_content = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await contentModel.findOne({ _id: ObjectId(req.params.id), isActive: true }, { title: 1, content: 1, pdf: 1, subjectId: 1, video: 1 })
        if (response) return res.status(200).json(new apiResponse(200, 'Get content successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while getting content', {}, {}))

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const update_content = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    req.body.updatedBy = (req.header('user') as any)?._id
    try {
        let response = await contentModel.findOneAndUpdate({ _id: ObjectId(body.id), isActive: true }, body)
        if (response) {
            // if (response.video != null) {
            //     if (response.video != body?.video) {
            //         let [folder_name, video_name] = await URL_decode(response?.video)
            //         await deleteImage(video_name, folder_name)
            //     }
            // }
            if (response.pdf != null) {
                if (response.pdf != body?.pdf) {
                    let [folder_name, pdf_name] = await URL_decode(response?.pdf)
                    await deleteImage(pdf_name, folder_name)
                }
            }
            return res.status(200).json(new apiResponse(200, 'Content updated successfully', response, {}))
        }
        else return res.status(400).json(new apiResponse(400, 'Database error while updaing content', {}, {}))

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const delete_content = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await contentModel.findOneAndUpdate({ _id: ObjectId(req.params.id), isActive: true }, { isActive: false, updatedBy: (req.header('user') as any)?._id })
        if (response) return res.status(200).json(new apiResponse(200, 'Content deleted successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while deleting content', {}, {}))

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const get_content_subject = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        // let response = await contentModel.find({ isActive: true }, { title: 1, content: 1, pdf: 1, ePub: 1, video: 1, subjectId: 1 })
        let response = await contentModel.aggregate([
            { $match: { isActive: true } },
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
                        }
                    ],
                    as: "subject"
                }
            },
            {
                $project: {
                    _id: 1, title: 1, content: 1, pdf: 1, ePub: 1, video: 1, subjectId: 1,
                    "subject.title": 1
                }
            }
        ])
        if (response) return res.status(200).json(new apiResponse(200, 'Get content successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while getting content', {}, {}))

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const get_filter_content = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = req.header('user'),
        { subjectId, } = req.body
    try {
        // if (Object.keys(req.body).length == 0) {
        //     let content = await contentModel.find({ isActive: true }, { title: 1, video: 1, content: 1 })
        //     return res.status(200).json(new apiResponse(200, 'Get Content successfully', content, {}))
        // }
        if (req.body.subjectId.length == 0) {
            let content = await contentModel.find({ isActive: true }, { title: 1, video: 1, content: 1 })
            return res.status(200).json(new apiResponse(200, 'Get content successfully', content, {}))
        }
        if (req.body.subjectId) {
            let content = await contentModel.find({ subjectId: ObjectId(subjectId), isActive: true }, { title: 1, video: 1, content: 1 })
            return res.status(200).json(new apiResponse(200, 'Get content successfully', content, {}))
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}
