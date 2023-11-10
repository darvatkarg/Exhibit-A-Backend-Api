"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { bookModel, categoryModel, main_categoryModel, subCategoryModel } from '../../database'
import { apiResponse, readingStatus, URL_decode } from '../../common'
import { Request, Response } from 'express'
import { deleteImage } from '../../helpers/S3'

const ObjectId = require('mongoose').Types.ObjectId

export const add_sub_category = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        search = new RegExp(`^${body.name}$`, "ig")
    let user: any = req.header('user')
    body.createdBy = user._id
    try {
        if (Object.keys(req.body).length == 0) {
            let main_category = await main_categoryModel.find({ isActive: true }, { name: 1 })
            return res.status(200).json(new apiResponse(200, 'Main category', main_category, {}))
        }
        if (req.body.main_categoryId && !req.body.categoryId) {
            let category = await categoryModel.find({ main_categoryId: ObjectId(req.body.main_categoryId), isActive: 1 }, { name: 1 })
            return res.status(200).json(new apiResponse(200, 'Category', category, {}))
        }
        if (req.body.categoryId) {
            let isExist = await subCategoryModel.findOne({ name: { $regex: search }, isActive: true })
            if (isExist) return res.status(409).json(new apiResponse(409, 'Sub category already register', {}, {}))

            let response = await new subCategoryModel(body).save()
            if (response) return res.status(200).json(new apiResponse(200, 'Sub category successfully added', {}, {}))
            else return res.status(400).json(new apiResponse(409, 'Error in database while adding sub category', {}, `${response}`))
        }
        else {
            return res.status(400).json(new apiResponse(409, 'Error in database', {}, {}))
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, error))
    }
}

export const get_sub_category = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        // let response = await subCategoryModel.find({ isActive: true }, { name: 1, main_categoryId: 1, categoryId: 1 })
        let response = await subCategoryModel.aggregate([
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
                    "main_category.name": 1, "category.name": 1
                }
            }
        ])
        if (response) return res.status(200).json(new apiResponse(200, 'Get sub category successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while getting sub category', {}, Error))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const by_id_sub_category = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        id = req.params.id
    try {
        let response = await subCategoryModel.findOne({ _id: ObjectId(id), isActive: true }, { _id: 1, name: 1, main_categoryId: 1, categoryId: 1 })
        if (response) return res.status(200).json(new apiResponse(200, 'Get sub category successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while getting sub category', {}, {}))

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const update_sub_category = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        id = body?.id,
        user: any = req.header('user')
    body.updatedBy = user._id
    try {
        let response = await subCategoryModel.findOneAndUpdate({ _id: ObjectId(id), isActive: true }, body)
        if (response) {
            // if (response.image != body?.image) {
            //     let [folder_name, image_name] = await URL_decode(response?.image)
            //     await deleteImage(image_name, folder_name)
            // }
            return res.status(200).json(new apiResponse(200, `Sub category successfully updated`, {}, {}))
        }
        else return res.status(404).json(new apiResponse(404, `Database error while updating sub category`, {}, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, "Internal server error", {}, error))
    }
}

export const delete_sub_category = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await subCategoryModel.findOneAndUpdate({ _id: ObjectId(req.params.id), isActive: true }, { isActive: false, updatedBy: ObjectId((req.header('user') as any)?._id) })
        if (response) {
            await bookModel.findOneAndUpdate({ subCategoryId: ObjectId(req.params.id), isActive: true }, { isActive: false, updatedBy: ObjectId((req.header('user') as any)?._id) })
            return res.status(200).json(new apiResponse(200, `Sub category successfully deleted`, {}, {}))
        }
        else return res.status(404).json(new apiResponse(404, `Database error while deleting sub category `, {}, {}))

    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, "Internal server error", {}, error))
    }
}

export const search_sub_category = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await bookModel.find({ subCategoryId: ObjectId(req.params.id), isActive: true }, { title: 1, author: 1 })
        if (response) return res.status(200).json(new apiResponse(200, 'Get books by sub category', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const search_name_sub = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        search = new RegExp(`^${body.name}$`, "ig")
    try {
        let response = await subCategoryModel.aggregate([
            {
                $match: { name: search }
            },
            {
                $lookup: {
                    from: "books",
                    let: { subCategoryId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$subCategoryId', '$$subCategoryId'] },
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
                    name: 1, "book.title": 1,
                    "book.author": 1, "book.description": 1,
                    "book.image": 1, "book.language": 1,
                    "book.summary": 1, "book.page": 1,
                    "book.cost": 1, "book.edition": 1,
                    "book.file": 1, "book.published_date": 1,
                    "book.publisher": 1, "book.feedback_rating": 1,
                }
            }
        ])
        if (response) return res.status(200).json(new apiResponse(200, 'Get books successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error ', {}, {}))
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, error))
    }
}

export const get_filter_sub_category = async (req: Request, res: Response) => {
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
            var genreArray: Array<any> = []
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

        let subCategory_data = await subCategoryModel.aggregate([
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
                $facet: {
                    user: [
                        { $sort: sort },
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                _id: 1, name: 1, main_categoryId: 1, categoryId: 1,
                                "main_category.name": 1, "category.name": 1
                            }
                        }
                    ],
                    subCategory_count: [{ $count: "count" }]
                }
            }
        ])
        response.subCategory_data = subCategory_data[0].user || []
        response.state = {
            page, limit,
            page_limit: Math.ceil(subCategory_data[0]?.subCategory_count[0]?.count / limit)
        }
        res.status(200).json(new apiResponse(200, `Get sub category successfully`, response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}