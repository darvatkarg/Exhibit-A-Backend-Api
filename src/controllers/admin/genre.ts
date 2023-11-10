"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { genreModel } from '../../database'
import { apiResponse, URL_decode } from '../../common'
import { Request, Response } from 'express'
import { deleteImage } from '../../helpers/S3'

const ObjectId = require('mongoose').Types.ObjectId

export const add_genre = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        search = new RegExp(`^${body.name}$`, "ig")
    let user: any = req.header('user')
    body.createdBy = user._id

    try {
        let isExist = await genreModel.findOne({ name: { $regex: search }, isActive: true })
        if (isExist) return res.status(409).json(new apiResponse(409, 'Genre already register', {}, {}))

        let response = await new genreModel(body).save()
        if (response) return res.status(200).json(new apiResponse(200, 'Genre successfully added', {}, {}))
        else return res.status(400).json(new apiResponse(409, 'Database error while adding genre', {}, `${response}`))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, error))
    }
}

export const get_genre = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await genreModel.find({ isActive: true }, { isActive: 0, createdBy: 0, createdAt: 0, updatedAt: 0, __v: 0 }).sort({ name: 1 })
        if (response) return res.status(200).json(new apiResponse(200, 'Get genre successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while getting genre', {}, Error))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, error))
    }
}

export const get_by_id_genre = async (req: Request, res: Response) => {
    reqInfo(req)
    let body: any = req.body,
        id = req.params.id
    try {
        let response = await genreModel.findOne({ _id: ObjectId(id), isActive: true }, { name: 1, image: 1 })
        if (response) return res.status(200).json(new apiResponse(200, 'Get genre successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while getting genre', {}, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, "Internal server error", {}, error))
    }
}

export const update_genre = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        id = body?.id,
        user: any = req.header('user')
    body.updatedBy = user._id
    try {
        let response = await genreModel.findOneAndUpdate({ _id: ObjectId(id), isActive: true }, body)
        if (response) {
            // if (response.image != body?.image) {
            //     let [folder_name, image_name] = await URL_decode(response?.image)
            //     await deleteImage(image_name, folder_name)
            // }
            return res.status(200).json(new apiResponse(200, `Genre successfully updated`, {}, {}))
        }
        else return res.status(404).json(new apiResponse(404, `Database error while updating genre`, {}, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, "Internal server error", {}, error))
    }
}

export const delete_genre = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        id = req.params.id
    try {
        let response = await genreModel.findOneAndUpdate({ _id: ObjectId(req.params.id), isActive: true }, { isActive: false, updatedBy: ObjectId((req.header('user') as any)?._id) })
        if (response) {
            // let [folder_name, image_name] = await URL_decode(response?.image)
            // await deleteImage(image_name, folder_name)
            return res.status(200).json(new apiResponse(200, `Genre successfully deleted`, {}, {}))
        }
        else return res.status(404).json(new apiResponse(404, `Database error while deleting genre`, {}, {}))

    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, "Internal server error", {}, error))
    }
}

export const search_genre = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        search = new RegExp(`^${body.name}$`, "ig")
    try {
        let response = await genreModel.aggregate([
            {
                $match: { name: search }
            },
            {
                $lookup: {
                    from: "books",
                    let: { genreId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$genreId', '$$genreId'] },
                                        { $eq: ['$isActive', true] },
                                    ],
                                },
                            }
                        }
                    ],
                    as: "book"
                },
            },
            {
                $project: {
                    name: 1,
                    "book.title": 1,
                    "book.author": 1, "book.description": 1,
                    "book.image": 1, "book.language": 1,
                    "book.summary": 1, "book.page": 1,
                    "book.cost": 1, "book.edition": 1,
                    "book.file": 1, "book.published_date": 1,
                    "book.publisher": 1, "book.feedback_rating": 1,
                }
            }
        ])
        if (response) return res.status(200).json(new apiResponse(200, 'Get genre successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while getting genre', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const get_filter_genre = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = req.header('user'),
        { _id, search, limit, page, ascending } = req.body,
        skip = 0,
        response: any = {},
        match: any = {},
        sort: any = {}
    limit = parseInt(limit)
    skip = ((parseInt(page) - 1) * parseInt(limit))
    try {
        // Database Filtering
        if (_id?.length != 0 && _id !== undefined) {
            _id.forEach(function (part, index, theArray) {
                theArray[index] = ObjectId(String(part))
            });
            match['_id'] = { "$in": _id }
        }
        if (search) {
            var nameArray: Array<any> = []
            search = search.split(" ")
            search.forEach(data => {
                nameArray.push({ name: { $regex: data, $options: 'si' } })

            })
            match.$or = [{ $and: nameArray }]
        }
        match.isActive = true
        // Sorting Database
        sort.createdAt = -1
        if (ascending) sort.createdAt = 1

        let genre_data = await genreModel.aggregate([
            { $match: match },
            {
                $facet: {
                    user: [
                        { $sort: sort },
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                _id: 1, name: 1,
                            }
                        }
                    ],
                    genre_count: [{ $count: "count" }]
                }
            }
        ])
        response.genre_data = genre_data[0].user || []
        response.state = {
            page, limit,
            page_limit: Math.ceil(genre_data[0]?.genre_count[0]?.count / limit)
        }
        res.status(200).json(new apiResponse(200, `Get genre successfully`, response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}