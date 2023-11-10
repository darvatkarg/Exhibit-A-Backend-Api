"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { bookModel, userModel, main_categoryModel, categoryModel, subCategoryModel } from '../../database'
import { apiResponse, bookType } from '../../common'
import { Request, Response } from 'express'

const ObjectId = require('mongoose').Types.ObjectId

export const home_page = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = req.header('user')
    let { _id, search, limit, page, ascending, main_categoryId, categoryId, subCategoryId } = req.body,
        skip = 0,
        response: any = {},
        match: any = {},
        sort: any = {}
    // limit = parseInt(limit)
    // console.log(limit);

    // skip = ((parseInt(page) - 1) * parseInt(limit))
    // console.log(skip);

    try {
        if (subCategoryId?.length != 0 && subCategoryId !== undefined) {
            match.subCategoryId = ObjectId(subCategoryId)
        }

        if (search) {
            var titleArray: Array<any> = []
            var authorArray: Array<any> = []
            var descriptionArray: Array<any> = []
            var publisherArray: Array<any> = []
            search = search.split(" ")
            search.forEach(data => {
                titleArray.push({ title: { $regex: data, $options: 'si' } })
                authorArray.push({ author: { $regex: data, $options: 'si' } })
                descriptionArray.push({ description: { $regex: data, $options: 'si' } })
                publisherArray.push({ publisher: { $regex: data, $options: 'si' } })
            })
            match.$or = [{ $and: titleArray }, { $and: authorArray }, { $and: descriptionArray }, { $and: publisherArray }]
        }

        match.isActive = true
        match.isEnable = true

        // Sorting Database
        sort.createdAt = -1
        if (ascending) sort.createdAt = 1
        if (main_categoryId) match.main_categoryId = ObjectId(main_categoryId)
        if (categoryId) match.categoryId = ObjectId(categoryId)
        if (subCategoryId) match.subCategoryId = ObjectId(subCategoryId)

        response = await bookModel.aggregate([
            { $match: match },
            {
                $lookup: {
                    from: "favorites",
                    let: { bookId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$bookId', '$$bookId'] },
                                        { $eq: ['$isActive', true] },
                                    ],
                                },
                            }
                        }
                    ],
                    as: "favoriteBy"
                }
            },
            {
                $facet: {
                    Free_books: [
                        {
                            $match: { isFree: bookType.free }
                        },
                        { $sort: sort },
                        { $limit: 4 },
                        { $skip: skip },
                        {
                            $project: {
                                isFavorite: { $cond: { if: { $in: [ObjectId(user?._id), "$favoriteBy.createdBy"] }, then: true, else: false } },
                                title: 1, author: 1, description: 1, page: 1, cost: 1, image: 1, publisher: 1, feedback_rating: 1, isFree: 1
                            }
                        },

                    ],
                    Paid_books: [
                        {
                            $match: { isFree: bookType.paid }
                        },
                        { $sort: sort },
                        { $limit: 4 },
                        { $skip: skip },
                        {
                            $project: {
                                isFavorite: { $cond: { if: { $in: [ObjectId(user?._id), "$favoriteBy.createdBy"] }, then: true, else: false } },
                                title: 1, author: 1, description: 1, page: 1, cost: 1, image: 1, publisher: 1, feedback_rating: 1, isFree: 1
                            }
                        },
                    ],
                    Popular_books: [
                        {
                            $match: { feedback_rating: { $gte: 3 } }
                        },
                        { $sort: sort },
                        { $limit: 4 },
                        { $skip: skip },
                        {
                            $project: {
                                isFavorite: { $cond: { if: { $in: [ObjectId(user?._id), "$favoriteBy.createdBy"] }, then: true, else: false } },
                                title: 1, author: 1, description: 1, page: 1, cost: 1, image: 1, publisher: 1, feedback_rating: 1, isFree: 1
                            }
                        },

                    ],
                }
            }
        ])
        return res.status(200).json(new apiResponse(200, 'HOME', response, {}))
    } catch (error) {
        console.log(error);

        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, error))
    }
}

export const search_book = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = req.header('user')
    let { _id, search, limit, page, ascending } = req.body,
        skip = 0,
        response: any = {},
        match: any = {},
        sort: any = {}
    limit = parseInt(limit)
    skip = ((parseInt(page) - 1) * parseInt(limit))
    try {

        if (search) {
            var titleArray: Array<any> = []
            var authorArray: Array<any> = []
            var descriptionArray: Array<any> = []
            var publisherArray: Array<any> = []
            search = search.split(" ")
            search.forEach(data => {
                titleArray.push({ title: { $regex: data, $options: 'si' } })
                authorArray.push({ author: { $regex: data, $options: 'si' } })
                descriptionArray.push({ description: { $regex: data, $options: 'si' } })
                publisherArray.push({ publisher: { $regex: data, $options: 'si' } })
            })
            match.$or = [{ $and: titleArray }, { $and: authorArray }, { $and: descriptionArray }, { $and: publisherArray }]
        }

        match.isActive = true
        // Sorting Database
        sort.createdAt = -1
        if (ascending) sort.createdAt = 1

        let book_data = await bookModel.aggregate([
            { $match: match },
            {
                $facet: {
                    user: [
                        { $sort: sort },
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                title: 1, author: 1, description: 1, page: 1, cost: 1, image: 1, publisher: 1, feedback_rating: 1
                            }
                        },
                    ],
                    book_count: [{ $count: "count" }]
                }
            }
        ])
        response.book_data = book_data[0].user || []
        response.state = {
            page, limit,
            page_limit: Math.ceil(book_data[0]?.book_count[0]?.count / limit)
        }
        return res.status(200).json(new apiResponse(200, 'books data', response, {}))
    } catch (error) {
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const get_category_genre_book = async (req: Request, res: Response) => {
    reqInfo(req)
    let { categoryId, genreId } = req.body,
        response: any = {}
    try {
        if (categoryId) {
            response = await bookModel.aggregate([
                { $match: { categoryId: ObjectId(categoryId), isActive: true } },
                {
                    $project: {
                        _id: 1, title: 1, author: 1, description: 1,
                        edition: 1, ePub: 1, subCategoryId: 1, categoryId: 1, main_categoryId: 1, genreId: 1,
                        image: 1, publisher: 1, pdf: 1, audio: 1, published_date: 1, feedback_rating: 1,
                        total_feedback: 1, isFree: 1, cost: 1
                    }
                }
            ])
            if (response) return res.status(200).json(new apiResponse(200, 'book data of category', response, {}))
            else return res.status(400).json(new apiResponse(400, 'database error', {}, {}))
        }
        if (genreId) {
            response = await bookModel.aggregate([
                { $match: { genreId: ObjectId(genreId), isActive: true } },
                {
                    $project: {
                        _id: 1, title: 1, author: 1, description: 1,
                        edition: 1, ePub: 1, subCategoryId: 1, categoryId: 1, main_categoryId: 1, genreId: 1,
                        image: 1, publisher: 1, pdf: 1, audio: 1, published_date: 1, feedback_rating: 1,
                        total_feedback: 1, isFree: 1, cost: 1
                    }
                }
            ])
            if (response) return res.status(200).json(new apiResponse(200, 'book data of category', response, {}))
            else return res.status(400).json(new apiResponse(400, 'database error', {}, {}))
        }
    } catch (error) {
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const filter = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = req.header('user')
    let { ascending, search } = req.body,
        skip = 0,
        response: any = {},
        match: any = {},
        sort: any = {}
    // limit = parseInt(limit)
    // skip = ((parseInt(page) - 1) * parseInt(limit))
    try {
        if (Object.keys(req.body).length == 0) {
            let main_category = await main_categoryModel.find({ isActive: true }, { name: 1 })
            return res.status(200).json(new apiResponse(200, 'Main Category', main_category, {}))
        } if (req.body.main_categoryId && !req.body.categoryId) {
            let category = await categoryModel.find({ main_categoryId: ObjectId(req.body.main_categoryId), isActive: true }, { name: 1 })
            return res.status(200).json(new apiResponse(200, 'Category', category, {}))
        }
        if (req.body.categoryId && !req.body.subCategoryId) {
            let subCategory = await subCategoryModel.find({ categoryId: ObjectId(req.body.categoryId), isActive: true }, { name: 1 })
            return res.status(200).json(new apiResponse(200, 'Sub Category', subCategory, {}))
        }

    } catch (error) {
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}