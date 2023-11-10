"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { categoryModel, subCategoryModel, bookModel } from '../../database'
import { apiResponse, readingStatus, URL_decode } from '../../common'
import { Request, Response } from 'express'
import { deleteImage } from '../../helpers/S3'

const ObjectId = require('mongoose').Types.ObjectId

export const add_category = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        search = new RegExp(`^${body.name}$`, "ig")
    let user: any = req.header('user')
    body.createdBy = user._id
    try {
        let isExist = await categoryModel.findOne({ name: { $regex: search }, isActive: true })
        if (isExist) return res.status(409).json(new apiResponse(409, ' Category already register', {}, {}))

        let response = await new categoryModel(body).save()

        if (response) return res.status(200).json(new apiResponse(200, ' Category successfully added', {}, {}))
        else return res.status(400).json(new apiResponse(409, 'Database error while adding category', {}, `${response}`))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, error))
    }
}

export const get_all_category = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        // let response = await categoryModel.find({ isActive: true }, { _id: 1, isActive: 0, createdAt: 0, updatedAt: 0, __v: 0 })
        let response = await categoryModel.aggregate([
            { $match: { isActive: true } },
            {
                $lookup: {
                    from: "main_categories",
                    let: { main_categoryId: '$main_categoryId' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$_id', '$$main_categoryId'] },
                                        { $eq: ['$isActive', true] },
                                    ],
                                },
                            }
                        }
                    ],
                    as: "main_category"
                }
            },
            {
                $project: {
                    _id: 1, name: 1, main_categoryId: 1,
                    "main_category.name": 1
                }
            }
        ])
        if (response) return res.status(200).json(new apiResponse(200, 'Get category successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while adding category ', {}, Error))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, error))
    }
}

export const get_category = async (req: Request, res: Response) => {
    reqInfo(req)
    let body: any = req.body,
        id = req.params.id
    try {
        let response = await categoryModel.findOne({ _id: ObjectId(id), isActive: true }, { _id: 1, name: 1, main_categoryId: 1 })
        if (response) return res.status(200).json(new apiResponse(200, 'Get category successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while getting category', {}, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, "Internal server error", {}, error))
    }
}

export const update_category = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        id = body?.id,
        user: any = req.header('user')
    body.updatedBy = user._id
    try {
        let response = await categoryModel.findOneAndUpdate({ _id: ObjectId(id), isActive: true }, body)

        if (response) {
            // if (response.image != body?.image) {
            //     let [folder_name, image_name] = await URL_decode(response?.image)
            //     await deleteImage(image_name, folder_name)
            // }
            return res.status(200).json(new apiResponse(200, `Category successfully updated`, {}, {}))
        }
        else return res.status(404).json(new apiResponse(404, `Database error while updating category`, {}, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, "Internal server error", {}, error))
    }
}

export const delete_category = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await categoryModel.findOneAndUpdate({ _id: ObjectId(req.params.id), isActive: true }, { isActive: false, updatedBy: ObjectId((req.header('user') as any)?._id) })
        if (response) {
            await subCategoryModel.findOneAndUpdate({ categoryId: ObjectId(req.params.id), isActive: true }, { isActive: false, updatedBy: ObjectId((req.header('user') as any)?._id) })
            await bookModel.findOneAndUpdate({ categoryId: ObjectId(req.params.id), isActive: true }, { isActive: false, updatedBy: ObjectId((req.header('user') as any)?._id) })
            return res.status(200).json(new apiResponse(200, `Category successfully deleted`, {}, {}))
        }
        else return res.status(404).json(new apiResponse(404, `Database error while deleting category`, {}, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, "Internal server error", {}, error))
    }
}

export const get_by_category = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        // let response = await subCategoryModel.find({ categoryId: ObjectId(req.params.id), isActive: true }, { name: 1, main_categoryId: 1, })
        let response = await subCategoryModel.aggregate([
            { $match: { categoryId: ObjectId(req.params.id), isActive: true } },
            {
                $lookup: {
                    from: "categories",
                    let: { categoryId: '$categoryId' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$_id', '$$categoryId'] },
                                        { $eq: ['$isActive', true] },
                                    ],
                                },
                            }
                        }
                    ],
                    as: "category"
                }
            },
            {
                $project: {
                    _id: 1, name: 1, main_categoryId: 1,
                    "category.name": 1
                }
            }
        ])
        if (response) return res.status(200).json(new apiResponse(200, 'Get sub-category by category', response, {}))
        else res.status(400).json(new apiResponse(400, 'Database error while getting sub-category by category', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const get_filter_category = async (req: Request, res: Response) => {
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

        let category_data = await categoryModel.aggregate([
            { $match: match },
            {
                $lookup: {
                    from: "main_categories",
                    let: { main_categoryId: '$main_categoryId' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$_id', '$$main_categoryId'] },
                                        { $eq: ['$isActive', true] },
                                    ],
                                },
                            }
                        }
                    ],
                    as: "main_category"
                }
            },
            {
                $facet: {
                    user: [
                        { $sort: sort },
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                _id: 1, name: 1, main_categoryId: 1,
                                "main_category.name": 1
                            }
                        }
                    ],
                    category_count: [{ $count: "count" }]
                }
            },

        ])
        response.category_data = category_data[0].user || []
        response.state = {
            page, limit,
            page_limit: Math.ceil(category_data[0]?.category_count[0]?.count / limit)
        }

        res.status(200).json(new apiResponse(200, `Get category successfully`, response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}