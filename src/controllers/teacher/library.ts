"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { bookModel, libraryModel } from '../../database'
import { apiResponse, } from '../../common'
import { Request, Response } from 'express'

const ObjectId = require('mongoose').Types.ObjectId

export const add_library = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    req.body.createdBy = (req.header('user') as any)?._id
    try {
        let isAlreadyAdded = await libraryModel.findOne({ isActive: true, createdBy: ObjectId((req.header('user') as any)?._id), bookId: ObjectId(body.bookId) }, { bookId: 1 })
        console.log(isAlreadyAdded);

        if (isAlreadyAdded != null) {
            let library = await libraryModel.findOne({ isActive: true, createdBy: ObjectId((req.header('user') as any)?._id), bookId: ObjectId(body.bookId) }, { bookId: 1, })
            return res.status(200).json(new apiResponse(200, 'Library', library, {}))
        }
        else {
            let response = await new libraryModel(body).save()
            if (response) return res.status(200).json(new apiResponse(200, 'Read book history added', response, {}))
            else return res.status(400).json(new apiResponse(400, 'Database error', {}, {}))
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const get_library = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    try {
        let response = await libraryModel.aggregate([
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
                $project: {
                    "book.title": 1,
                    "book.author": 1,
                    "book.image": 1, "book.page": 1,
                    "book.pdf": 1,
                    "book.feedback_rating": 1,
                }
            }
        ])
        if (response) return res.status(200).json(new apiResponse(200, 'get book read history successfully', response, {}))
        else return res.status(404).json(new apiResponse(404, 'Database error', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const delete_library = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        user: any = req.header('user')
    body.updatedBy = user._id
    try {
        let response = await libraryModel.findOneAndUpdate({ _id: ObjectId(req.params.id), isActive: true }, { isActive: false })
        if (response) return res.status(200).json(new apiResponse(200, 'delete book read history successfully', {}, {}))
        else return res.status(404).json(new apiResponse(404, 'Database error', {}, {}))
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const library = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await libraryModel.aggregate([
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
                    as: "Book"
                }

            },
            {
                $project: {
                    "book.title": 1,
                    "book.author": 1,
                    "book.image": 1, "book.page": 1,
                    "book.pdf": 1,
                    "book.feedback_rating": 1,
                }
            }
        ])
        res.status(200).json(new apiResponse(200, `Successfully`, response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const get_filter_library = async (req: Request, res: Response) => {
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

        let read_books = await libraryModel.aggregate([
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
                        },
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
                                    },
                                    { $project: { name: 1 } },
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
                                    },
                                    { $project: { name: 1 } },
                                ],
                                as: "category"
                            }
                        },
                        {
                            $lookup: {
                                from: "sub_categories",
                                let: { subCategoryId: '$subCategoryId' },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $and: [
                                                    { $eq: ['$_id', '$$subCategoryId'] },
                                                    { $eq: ['$isActive', true] },
                                                ],
                                            },
                                        }
                                    },
                                    { $project: { name: 1 } },
                                ],
                                as: "sub_category"
                            }
                        },
                        {
                            $lookup: {
                                from: "genres",
                                let: { genreId: '$genreId' },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $and: [
                                                    { $eq: ['$_id', '$$genreId'] },
                                                    { $eq: ['$isActive', true] },
                                                ],
                                            },
                                        }
                                    },
                                    { $project: { name: 1 } },
                                ],
                                as: "genres"
                            }
                        },
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
                                as: "favorite"
                            }
                        },
                        // { $project: { main_categoryName: { $first: "$main_category" }, categoryName: { $first: "$category" }, sub_categoryName: { $first: "$sub_category" }, generName: { $first: "$genres" } } }
                    ],
                    as: "book"
                }
            },
            {
                $facet: {
                    book: [
                        { $unwind: { path: "$book" } },
                        {
                            $addFields: {
                                isFavorite: { $cond: { if: { $in: [ObjectId(user?._id), "$book.favorite.createdBy"] }, then: true, else: false } },
                            }
                        },
                        { $sort: sort },
                        { $skip: skip },
                        { $limit: limit },
                        // {
                        //     $project: {
                        //         _id: 1, "book.title": 1, "book.author": 1, "book.pdf": 1,
                        //         "book.image": 1, "book.feedback_rating": 1, "book._id": 1, "book.ePub": 1, "book.audio": 1,
                        //         "book.video": 1
                        //     }
                        // }
                    ],
                    book_count: [{ $count: "count" }]
                }
            }
        ])
        response.read_books = read_books[0].book || []
        response.state = {
            page, limit,
            page_limit: Math.ceil(read_books[0]?.book_count[0]?.count / limit)
        }
        res.status(200).json(new apiResponse(200, `get reading book successfully`, response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal Server error', {}, {}))
    }
}

export const get_filter_library_book = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = req.header('user'),
        // { limit, page, ascending } = req.body,
        skip = 0,
        response: any = {},
        sort: any = {}
    // limit = parseInt(limit)
    // skip = ((parseInt(page) - 1) * parseInt(limit))
    try {

        // Sorting Database
        sort.createdAt = -1

        let read_books = await libraryModel.aggregate([
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
                        },
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
                                    },
                                    { $project: { name: 1 } },
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
                                    },
                                    { $project: { name: 1 } },
                                ],
                                as: "category"
                            }
                        },
                        {
                            $lookup: {
                                from: "sub_categories",
                                let: { subCategoryId: '$subCategoryId' },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $and: [
                                                    { $eq: ['$_id', '$$subCategoryId'] },
                                                    { $eq: ['$isActive', true] },
                                                ],
                                            },
                                        }
                                    },
                                    { $project: { name: 1 } },
                                ],
                                as: "sub_category"
                            }
                        },
                        {
                            $lookup: {
                                from: "genres",
                                let: { genreId: '$genreId' },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $and: [
                                                    { $eq: ['$_id', '$$genreId'] },
                                                    { $eq: ['$isActive', true] },
                                                ],
                                            },
                                        }
                                    },
                                    { $project: { name: 1 } },
                                ],
                                as: "genres"
                            }
                        },
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
                                as: "favorite"
                            }
                        },
                        // { $project: { main_categoryName: { $first: "$main_category" }, categoryName: { $first: "$category" }, sub_categoryName: { $first: "$sub_category" }, generName: { $first: "$genres" } } }
                    ],
                    as: "book"
                }
            },
            {
                $facet: {
                    book: [
                        { $unwind: { path: "$book" } },
                        {
                            $addFields: {
                                isFavorite: { $cond: { if: { $in: [ObjectId(user?._id), "$book.favorite.createdBy"] }, then: true, else: false } },
                            }
                        },
                        { $sort: sort },
                        // { $skip: skip },
                        // { $limit: limit },
                        // {
                        //     $project: {
                        //         _id: 1, "book.title": 1, "book.author": 1, "book.pdf": 1,
                        //         "book.image": 1, "book.feedback_rating": 1, "book._id": 1, "book.ePub": 1, "book.audio": 1,
                        //         "book.video": 1
                        //     }
                        // }
                    ],
                    book_count: [{ $count: "count" }]
                }
            }
        ])
        response.read_books = read_books[0].book || []
        // response.state = {
        //     page, limit,
        //     page_limit: Math.ceil(read_books[0]?.book_count[0]?.count / limit)
        // }
        res.status(200).json(new apiResponse(200, `get reading book successfully`, response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal Server error', {}, {}))
    }
}