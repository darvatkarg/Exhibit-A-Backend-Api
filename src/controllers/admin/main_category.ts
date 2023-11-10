"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { main_categoryModel, categoryModel, subCategoryModel, bookModel } from '../../database'
import { apiResponse, URL_decode } from '../../common'
import { Request, Response } from 'express'
import { deleteImage } from '../../helpers/S3'
import { categoryValidation } from '../../validation'

const ObjectId = require('mongoose').Types.ObjectId

export const add_main_category = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        search = new RegExp(`^${body.name}$`, "ig")
    let user: any = req.header('user')
    body.createdBy = user._id

    try {           //{ $regex: search }
        let isExist = await main_categoryModel.findOne({ name: { $regex: search }, isActive: true })
        if (isExist) return res.status(409).json(new apiResponse(409, 'Main category already register', {}, {}))

        let response = await new main_categoryModel(body).save()
        if (response) return res.status(200).json(new apiResponse(200, 'Main category successfully added', {}, {}))
        else return res.status(400).json(new apiResponse(409, 'Database error while adding main category', {}, `${response}`))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, error))
    }
}

export const get_main_category = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await main_categoryModel.find({ isActive: true }, { _id: 1, isActive: 0, createdAt: 0, updatedAt: 0, __v: 0 }).sort({ name: 1 })
        if (response) return res.status(200).json(new apiResponse(200, 'Get main category successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while getting main category', {}, Error))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, error))
    }
}

export const get_by_id = async (req: Request, res: Response) => {
    reqInfo(req)
    let body: any = req.body,
        id = req.params.id
    try {
        let response = await main_categoryModel.findOne({ _id: ObjectId(id), isActive: true }, { name: 1, image: 1 })
        if (response) return res.status(200).json(new apiResponse(200, 'Get Main Category successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while getting main category', {}, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, "Internal server error", {}, error))
    }
}

export const update_main_category = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        id = body?.id,
        user: any = req.header('user')
    body.updatedBy = user._id
    try {
        let response = await main_categoryModel.findOneAndUpdate({ _id: ObjectId(id), isActive: true }, body)

        if (response) {
            // if (response.image != body?.image) {
            //     let [folder_name, image_name] = await URL_decode(response?.image)
            //     await deleteImage(image_name, folder_name)
            // }
            return res.status(200).json(new apiResponse(200, `Main category successfully updated`, {}, {}))
        }
        else return res.status(404).json(new apiResponse(404, `Database error while updating main category`, {}, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, "Internal server error", {}, error))
    }
}

export const delete_main_category = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await main_categoryModel.findOneAndUpdate({ _id: ObjectId(req.params.id), isActive: true }, { isActive: false, updatedBy: ObjectId((req.header('user') as any)?._id) })
        if (response) {
            await categoryModel.findOneAndUpdate({ main_categoryId: ObjectId(req.params.id), isActive: true }, { isActive: false, updatedBy: ObjectId((req.header('user') as any)?._id) })
            await subCategoryModel.findOneAndUpdate({ main_categoryId: ObjectId(req.params.id), isActive: true }, { isActive: false, updatedBy: ObjectId((req.header('user') as any)?._id) })
            await bookModel.findOneAndUpdate({ main_categoryId: ObjectId(req.params.id), isActive: true }, { isActive: false, updatedBy: ObjectId((req.header('user') as any)?._id) })
            return res.status(200).json(new apiResponse(200, `Main category successfully deleted`, {}, {}))
        }
        else return res.status(404).json(new apiResponse(404, `Database error while deleting main category`, {}, {}))

    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, "Internal server error", {}, error))
    }
}

export const get_by_main_category = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await categoryModel.find({ main_categoryId: ObjectId(req.params.id), isActive: true }, { name: 1, image: 1 })
        if (response) return res.status(200).json(new apiResponse(200, 'Get category by main category', response, {}))
        else res.status(400).json(new apiResponse(400, 'Database error while getting category by main category', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const get_filter_main_category = async (req: Request, res: Response) => {
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
                genreArray.push({ genre: { $regex: data, $options: 'si' } })

            })
            match.$or = [{ $and: nameArray }, { $and: genreArray }]
        }
        // match['phoneNumber'] = { $regex: search, $options: 'si' }
        match.isActive = true
        // Sorting Database
        sort.createdAt = -1
        if (ascending) sort.createdAt = 1

        let mainCategory_data = await main_categoryModel.aggregate([
            { $match: match },
            {
                $facet: {
                    user: [
                        { $sort: sort },
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                _id: 1, name: 1
                            }
                        }
                    ],
                    mainCategory_count: [{ $count: "count" }]
                }
            }
        ])
        response.mainCategory_data = mainCategory_data[0].user || []
        response.state = {
            page, limit,
            page_limit: Math.ceil(mainCategory_data[0]?.mainCategory_count[0]?.count / limit)
        }
        res.status(200).json(new apiResponse(200, `Get main category successfully`, response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}