"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { bookModel, favoriteModel, libraryModel, userModel } from '../../database'
import { apiResponse } from '../../common'
import { Request, Response } from 'express'

const ObjectId = require('mongoose').Types.ObjectId

export const add_favorite = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        user: any = req.header('user')
    try {
        let existFav = await favoriteModel.findOne({ createdBy: ObjectId(user._id), bookId: ObjectId(body.bookId), isActive: true })
        if (existFav != null) {
            await favoriteModel.deleteOne({ createdBy: ObjectId(user._id), bookId: ObjectId(body.bookId) })
            return res.status(200).json(new apiResponse(200, 'Book unfavorited successfully', {}, {}));
        }
        else {
            await new favoriteModel({ createdBy: ObjectId(user._id), bookId: ObjectId(body.bookId) }).save()
            await bookModel.findOneAndUpdate({ isActive: true, _id: ObjectId(body.bookId) }, { favoriteBy: ObjectId(user._id) })
            return res.status(200).json(new apiResponse(200, 'Book favorited successfully', {}, {}));
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, "Internal Server Error", {}, error))
    }
}

export const get_favorite = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = (req.header('user') as any)?._id
    try {
        let response = await favoriteModel.aggregate([
            { $match: { createdBy: ObjectId(user), isActive: true } },
            {
                $lookup: {
                    from: "books",
                    let: { bookId: '$bookId' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$_id', '$$bookId'] },
                                        { $eq: ['$isActive', true] },
                                    ],
                                },
                            }
                        }
                    ],
                    as: "book"
                }
            },
            {
                $project: {
                    "book._id": 1,
                    "book.title": 1,
                    "book.author": 1,
                    "book.image": 1,
                    "book.feedback_rating": 1,
                }
            }
        ])
        //let response = await favoriteModel.find({ createdBy: ObjectId(user), isActive: true }, { bookId: 1 })
        if (response) return res.status(200).json(new apiResponse(200, 'Favorite ', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, "Internal Server Error", {}, error))
    }
}

export const delete_favorite = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = (req.header('user') as any)?._id
    try {
        let response = await favoriteModel.findOneAndUpdate({ _id: ObjectId(req.params.id), isActive: true }, { isActive: false })
        if (response) return res.status(200).json(new apiResponse(200, 'Favorite book deleted', {}, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, "Internal Server Error", {}, error))
    }
}

export const get_filter_favorite = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = req.header('user'),
        { limit, page, ascending } = req.body,
        skip = 0,
        response: any = {},
        sort: any = {}
    limit = parseInt(limit)
    skip = ((parseInt(page) - 1) * parseInt(limit))
    try {

        // Sorting Database
        sort.createdAt = -1

        let fav_books = await favoriteModel.aggregate([
            { $match: { createdBy: ObjectId((req.header('user') as any)?._id), isActive: true } },
            {
                $lookup: {
                    from: "books",
                    let: { bookId: '$bookId' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$_id', '$$bookId'] },
                                        { $eq: ['$isActive', true] },
                                    ],
                                },
                            }
                        }
                    ],
                    as: "book"
                }
            },
            {
                $facet: {
                    book: [
                        { $unwind: { path: "$book" } },
                        { $sort: sort },
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                _id: 1, "book.title": 1, "book.author": 1,
                                "book.image": 1, "book.feedback_rating": 1

                            }
                        }
                    ],
                    book_count: [{ $count: "count" }]
                }
            }
        ])
        response.fav_books = fav_books[0].book || []
        response.state = {
            page, limit,
            page_limit: Math.ceil(fav_books[0]?.book_count[0]?.count / limit)
        }
        res.status(200).json(new apiResponse(200, `Get fav book successfully`, response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal Server error', {}, {}))
    }
}

export const my_library = async (req: Request, res: Response) => {
    reqInfo(req)
    let { myLibrary_limit, readHistory_limit } = req.body
    let user: any = (req.header('user') as any)?._id
    try {
        let favorite = await favoriteModel.aggregate([
            { $match: { createdBy: ObjectId(user), isActive: true } },
            //{ $limit: myLibrary_limit },
            {
                $lookup: {
                    from: "books",
                    let: { bookId: '$bookId' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$_id', '$$bookId'] },
                                        { $eq: ['$isActive', true] },
                                    ],
                                },
                            }
                        }
                    ],
                    as: "book"
                }
            },
            { $unwind: { path: "$book" } },
            {
                $project: {
                    "book.title": 1, "book._id": 1,
                    "book.author": 1, "book.description": 1,
                    "book.image": 1, "book.language": 1,
                    "book.summary": 1, "book.page": 1,
                    "book.cost": 1, "book.edition": 1,
                    "book.file": 1, "book.published_date": 1,
                    "book.publisher": 1, "book.feedback_rating": 1,
                }
            }
        ])
        let library = await libraryModel.aggregate([
            { $match: { createdBy: ObjectId(user), isActive: true } },
            { $limit: readHistory_limit },
            {
                $lookup: {
                    from: "books",
                    let: { bookId: '$bookId' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$_id', '$$bookId'] },
                                        { $eq: ['$isActive', true] },
                                    ],
                                },
                            }
                        }
                    ],
                    as: "book"
                }
            },
            { $unwind: { path: "$book" } },
            {
                $project: {
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
        let response = [{
            myLibrary: favorite,
            readHistory: library

        }]
        return res.status(200).json(new apiResponse(200, 'My library', response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, "Internal Server Error", {}, error))
    }
}