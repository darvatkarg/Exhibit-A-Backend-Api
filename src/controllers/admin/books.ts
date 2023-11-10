"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { bookModel, feedbackModel } from '../../database'
import { apiResponse, bookType, URL_decode } from '../../common'
import { Request, Response } from 'express'
import { deleteImage, delete_file } from '../../helpers/S3'
import { downloadModel } from '../../database/models/downloads'

const ObjectId = require('mongoose').Types.ObjectId

export const add_book = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        search = new RegExp(`^${body.title}$`, "ig")
    let user: any = req.header('user')
    body.createdBy = user._id
    try {
        let isExist = await bookModel.findOne({ title: { $regex: search }, isActive: true })
        if (isExist) return res.status(409).json(new apiResponse(409, 'Book already register', {}, {}))

        let response = await new bookModel(body).save()
        if (response) return res.status(200).json(new apiResponse(200, ' Book successfully added', {}, {}))
        else return res.status(400).json(new apiResponse(409, 'Database error while adding book', {}, `${response}`))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, error))
    }
}

export const get_book = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await bookModel.find({ isActive: true, isEnable: true }, { _id: 1, isActive: 0, createdAt: 0, updatedAt: 0, __v: 0 })
        if (response) return res.status(200).json(new apiResponse(200, 'Get books successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while getting books', {}, {}))
    } catch (error) {
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const by_id_book = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    try {
        let response = await bookModel.findOne({ _id: ObjectId(req.params.id), isActive: true, isEnable: true }, { _id: 1, isActive: 0, createdAt: 0, updatedAt: 0, __v: 0 })
        if (response) return res.status(200).json(new apiResponse(200, 'Get book successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while getting book', {}, {}))

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const update_book = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        id = body?.id,
        user: any = req.header('user')
    body.updatedBy = user._id
    try {
        //  let result = await bookModel.findOne({ _id: ObjectId(id), isActive: true })
        //let qty = body.quantity + result.quantity
        let response = await bookModel.findOneAndUpdate({ _id: ObjectId(id), isActive: true, isEnable: true }, body)
        if (response) {
            if (response.audio != null) {
                if (response.audio != body?.audio) {
                    let [folder_name, audio_name] = await URL_decode(response?.audio)
                    await deleteImage(audio_name, folder_name)
                }
            }
            if (response.image != null) {
                if (response.image != body?.image) {
                    let [folder_name, image_name] = await URL_decode(response?.image)
                    await deleteImage(image_name, folder_name)
                }
            }
            if (response.pdf != null) {
                if (response.pdf != body?.pdf) {
                    let [folder_name, pdf_name] = await URL_decode(response?.pdf)
                    await deleteImage(pdf_name, folder_name)
                }
            }
            if (response.preview != null) {
                if (response.preview != body?.preview) {
                    let [folder_name, preview_name] = await URL_decode(response?.preview)
                    await deleteImage(preview_name, folder_name)
                }
            }
            // if (response.video != null) {
            //     if (response.video != body?.video) {
            //         let [folder_name, video_name] = await URL_decode(response?.video)
            //         await deleteImage(video_name, folder_name)
            //     }
            // }
            // if (response.preview_video != null) {
            //     if (response.preview_video != body?.preview_video) {
            //         let [folder_name, preview_video_name] = await URL_decode(response?.preview_video)
            //         await deleteImage(preview_video_name, folder_name)
            //     }
            // }
            if (response.ePub != null) {
                if (response.ePub != body?.ePub) {
                    let [folder_name, ePub_name] = await URL_decode(response?.ePub)
                    await deleteImage(ePub_name, folder_name)
                }
            }

            return res.status(200).json(new apiResponse(200, ` Book successfully updated`, {}, {}))
        }
        else return res.status(404).json(new apiResponse(404, ` Database error while updating book details`, {}, Error))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const delete_book = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await bookModel.findOneAndUpdate({ _id: req.params.id, isActive: true }, { isActive: false, updatedBy: ObjectId((req.header('user') as any)?._id) })
        if (response) return res.status(200).json(new apiResponse(200, 'Book deleted successfully', {}, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while deleting book', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const get_paid_book = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await bookModel.find({ isFree: bookType.paid, isActive: true, isEnable: true }, { isActive: 0, createdBy: 0, updatedBy: 0, createdAt: 0, updatedAt: 0, __v: 0, isFree: 0 })
        if (response) return res.status(200).json(new apiResponse(200, 'Get paid books successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while getting paid books', {}, {}))
    } catch (error) {
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const get_free_book = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await bookModel.find({ isFree: bookType.free, isActive: true, isEnable: true }, { isActive: 0, createdBy: 0, updatedBy: 0, createdAt: 0, updatedAt: 0, __v: 0, isFree: 0 })
        if (response) return res.status(200).json(new apiResponse(200, 'Get free books successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while getting free books', {}, {}))
    } catch (error) {
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const get_filter_book = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = req.header('user'),
        { search, limit, page, ascending, main_categoryId, categoryId, subCategoryId, genreId, status } = req.body,
        skip = 0,
        response: any = {},
        match: any = {},
        sort: any = {}
    limit = parseInt(limit)
    skip = ((parseInt(page) - 1) * parseInt(limit))
    try {
        // Database Filtering
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
        // match['phoneNumber'] = { $regex: search, $options: 'si' }
        match.isActive = true
        match.isEnable = true
        //match.isFree = isFree
        // Sorting Database
        sort.createdAt = -1

        if (ascending) sort.createdAt = 1
        if (main_categoryId) match.main_categoryId = ObjectId(main_categoryId)
        if (categoryId) match.categoryId = ObjectId(categoryId)
        if (subCategoryId) match.subCategoryId = ObjectId(subCategoryId)
        if (genreId) match.genreId = ObjectId(genreId)
        //if (isFree) match.isFree = isFree
        if (status == "free") match.isFree = true
        else if (status == "paid") match.isFree = false
        else if (status == "popular") match.feedback_rating = { $gte: 3 }

        let book_data = await bookModel.aggregate([
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
                    user: [
                        { $sort: sort },
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                isFavorite: { $cond: { if: { $in: [ObjectId(user?._id), "$favoriteBy.createdBy"] }, then: true, else: false } },
                                _id: 1, title: 1, author: 1,
                                image: 1, feedback_rating: 1, isEnable: 1,
                                isFree: 1, isPhysical: 1, cost: 1, description: 1, preview: 1, preview_video: 1
                            }
                        }
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
        res.status(200).json(new apiResponse(200, `Get books successfully`, response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const book_details = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = req.header('user')
    let id = req.params.id,
        { limit, recommendBook_limit, similarBook_limit } = req.body
    try {
        // let isAdreay = await
        let existBook = await bookModel.aggregate([
            { $match: { _id: ObjectId(id), isActive: true, isEnable: true } },
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
                        }
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
                        }
                    ],
                    as: "genre"
                }
            },
            {
                $lookup: {
                    from: "libraries",
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
                    as: "library"
                }
            },
            {
                $project: {
                    isFavorite: { $cond: { if: { $in: [ObjectId(user?._id), "$favoriteBy.createdBy"] }, then: true, else: false } },
                    isAdded: { $cond: { if: { $in: [ObjectId(user?._id), "$library.createdBy"] }, then: true, else: false } },
                    _id: 1, title: 1, author: 1, description: 1,
                    edition: 1, ePub: 1, subCategoryId: 1, categoryId: 1, main_categoryId: 1, genreId: 1,
                    image: 1, publisher: 1, pdf: 1, audio: 1, published_date: 1, feedback_rating: 1,
                    total_feedback: 1, isFree: 1, isPhysical: 1, cost: 1, video: 1, preview: 1, preview_video: 1,
                    "main_category.name": 1, "category.name": 1, "sub_category.name": 1, "genre.name": 1
                }

            }
        ])
        let [review, rec_book, similar_book] =
            await Promise.all([
                await feedbackModel.aggregate([
                    { $match: { bookId: ObjectId(id), isActive: true } },
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
                                                // { $eq: ['$isEnable', true] },
                                            ],
                                        },
                                    }
                                }
                            ],
                            as: "user"
                        }
                    },
                    {
                        $project: {
                            "user.name": 1,
                            feedback_rating: 1,
                            createdBy: 1, createdAt: 1
                        }
                    }
                ]),
                await bookModel.aggregate([
                    { $match: { subCategoryId: ObjectId(existBook[0].subCategoryId), isActive: true, _id: { $nin: [ObjectId(id)] } } },
                    {
                        $project: {
                            _id: 1, title: 1, author: 1, feedback_rating: 1,
                            isFree: 1, isPhysical: 1, cost: 1, image: 1
                        }

                    },
                    { $limit: recommendBook_limit },
                ]),
                await bookModel.aggregate([
                    { $match: { main_categoryId: ObjectId(existBook[0].main_categoryId), isActive: true, _id: { $nin: [ObjectId(id)] } } },
                    {
                        $project: {
                            _id: 1, title: 1, author: 1, image: 1
                        }

                    },
                    { $limit: similarBook_limit },
                ]),
            ])

        let response = [{
            book: existBook,
            review,
            recommendBook: rec_book,
            similarBook: similar_book,

        }]
        return res.status(200).json(new apiResponse(200, "Get book details successfully", response, {}))
    }
    catch (error) {
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const get_filter_book_admin = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = req.header('user'),
        { search, limit, page, ascending, main_categoryId, categoryId, subCategoryId, isFree, genreId } = req.body,
        skip = 0,
        response: any = {},
        match: any = {},
        sort: any = {}
    limit = parseInt(limit)
    skip = ((parseInt(page) - 1) * parseInt(limit))
    try {
        // Database Filtering
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
        // match['phoneNumber'] = { $regex: search, $options: 'si' }
        match.isActive = true
        // Sorting Database
        sort.createdAt = -1

        let book_data = await bookModel.aggregate([
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
                        }
                    ],
                    as: "genre"
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
                                _id: 1, title: 1, author: 1,
                                image: 1, feedback_rating: 1,
                                isFree: 1, isPhysical: 1, cost: 1, isEnable: 1,
                                mainCategoryName: { $first: "$main_category.name" },
                                categoryName: { $first: "$category.name" },
                                genreName: { $first: "$genre.name" }
                            }
                        }
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
        res.status(200).json(new apiResponse(200, `Get books successfully`, response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const get_filter_free_book = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = req.header('user'),
        { search, limit, page, ascending, main_categoryId, categoryId, subCategoryId, genreId } = req.body,
        skip = 0,
        response: any = {},
        match: any = {},
        sort: any = {}
    limit = parseInt(limit)
    skip = ((parseInt(page) - 1) * parseInt(limit))
    try {
        // Database Filtering
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
        // match['phoneNumber'] = { $regex: search, $options: 'si' }
        match.isActive = true
        match.isEnable = true
        match.isFree = true
        // Sorting Database
        sort.createdAt = -1
        if (ascending) sort.createdAt = 1
        if (main_categoryId) match.main_categoryId = ObjectId(main_categoryId)
        if (categoryId) match.categoryId = ObjectId(categoryId)
        if (subCategoryId) match.subCategoryId = ObjectId(subCategoryId)
        if (genreId) match.genreId = ObjectId(genreId)
        //if (isFree) match.isFree = isFree

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
                                _id: 1, title: 1, author: 1,
                                image: 1, feedback_rating: 1,
                                isFree: 1, isPhysical: 1, cost: 1,

                            }
                        }
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
        res.status(200).json(new apiResponse(200, `Get book successfully`, response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const get_filter_paid_book = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = req.header('user'),
        { search, limit, page, ascending, main_categoryId, categoryId, subCategoryId, genreId } = req.body,
        skip = 0,
        response: any = {},
        match: any = {},
        sort: any = {}
    limit = parseInt(limit)
    skip = ((parseInt(page) - 1) * parseInt(limit))
    try {
        // Database Filtering
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
        // match['phoneNumber'] = { $regex: search, $options: 'si' }
        match.isActive = true
        match.isEnable = true
        match.isFree = false
        // Sorting Database
        sort.createdAt = -1
        if (ascending) sort.createdAt = 1
        if (main_categoryId) match.main_categoryId = ObjectId(main_categoryId)
        if (categoryId) match.categoryId = ObjectId(categoryId)
        if (subCategoryId) match.subCategoryId = ObjectId(subCategoryId)
        if (genreId) match.genreId = ObjectId(genreId)
        //if (isFree) match.isFree = isFree

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
                                _id: 1, title: 1, author: 1,
                                image: 1, feedback_rating: 1,
                                isFree: 1, isPhysical: 1, cost: 1,

                            }
                        }
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
        res.status(200).json(new apiResponse(200, `Get books successfully`, response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const get_filter_popular_book = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = req.header('user'),
        { search, limit, page, ascending, main_categoryId, categoryId, subCategoryId, genreId } = req.body,
        skip = 0,
        response: any = {},
        match: any = {},
        sort: any = {}
    limit = parseInt(limit)
    skip = ((parseInt(page) - 1) * parseInt(limit))
    try {
        // Database Filtering
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
        // match['phoneNumber'] = { $regex: search, $options: 'si' }
        match.isActive = true
        match.isEnable = true
        match.feedback_rating = { $gte: 3 }
        //match.isFree = false
        // Sorting Database
        sort.createdAt = -1
        if (ascending) sort.createdAt = 1
        if (main_categoryId) match.main_categoryId = ObjectId(main_categoryId)
        if (categoryId) match.categoryId = ObjectId(categoryId)
        if (subCategoryId) match.subCategoryId = ObjectId(subCategoryId)
        if (genreId) match.genreId = ObjectId(genreId)
        //if (isFree) match.isFree = isFree

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
                                _id: 1, title: 1, author: 1,
                                image: 1, feedback_rating: 1,
                                isFree: 1, isPhysical: 1, cost: 1,

                            }
                        }
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
        res.status(200).json(new apiResponse(200, `Get books successfully`, response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const get_recommend_book = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = req.header('user'),
        { search, limit, page, ascending, main_categoryId, categoryId, subCategoryId, isFree, genreId } = req.body,
        skip = 0,
        response: any = {},
        match: any = {},
        sort: any = {}
    limit = parseInt(limit)
    skip = ((parseInt(page) - 1) * parseInt(limit))
    try {
        // Database Filtering
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
        // match['phoneNumber'] = { $regex: search, $options: 'si' }
        match.isActive = true
        match.isEnable = true
        match.subCategoryId = ObjectId(subCategoryId)
        //match.isFree = isFree
        // Sorting Database
        sort.createdAt = -1
        if (ascending) sort.createdAt = 1
        if (main_categoryId) match.main_categoryId = ObjectId(main_categoryId)
        if (categoryId) match.categoryId = ObjectId(categoryId)
        if (subCategoryId) match.subCategoryId = ObjectId(subCategoryId)
        if (genreId) match.genreId = ObjectId(genreId)
        if (isFree) match.isFree = isFree

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
                                _id: 1, title: 1, author: 1,
                                image: 1, feedback_rating: 1,
                                isFree: 1, isPhysical: 1, cost: 1,

                            }
                        }
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
        res.status(200).json(new apiResponse(200, `Get recommend books successfully`, response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const get_similar_book = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = req.header('user'),
        { search, limit, page, ascending, main_categoryId, categoryId, subCategoryId, isFree, genreId } = req.body,
        skip = 0,
        response: any = {},
        match: any = {},
        sort: any = {}
    limit = parseInt(limit)
    skip = ((parseInt(page) - 1) * parseInt(limit))
    try {
        // Database Filtering
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
        // match['phoneNumber'] = { $regex: search, $options: 'si' }
        match.isActive = true
        match.isEnable = true
        match.genreId = ObjectId(genreId)
        //match.isFree = isFree
        // Sorting Database
        sort.createdAt = -1
        if (ascending) sort.createdAt = 1
        if (main_categoryId) match.main_categoryId = ObjectId(main_categoryId)
        if (categoryId) match.categoryId = ObjectId(categoryId)
        if (subCategoryId) match.subCategoryId = ObjectId(subCategoryId)
        if (genreId) match.genreId = ObjectId(genreId)
        if (isFree) match.isFree = isFree

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
                                _id: 1, title: 1, author: 1,
                                image: 1, feedback_rating: 1,
                                isFree: 1, isPhysical: 1, cost: 1,

                            }
                        }
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
        res.status(200).json(new apiResponse(200, `Get similar books successfully`, response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const enable = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = req.header('user'),
        { id, isEnable } = req.params

    try {
        let response = await bookModel.findOneAndUpdate({ _id: ObjectId(id), isActive: true }, { isEnable }, { new: true }).select(' -createdAt -updatedAt -__v ')
        //let response = await userModel.findOneAndUpdate({ _id: ObjectId(id), isActive: true }, { isBlock }, { new: true }).select('-password -authToken -otp -otpExpireTime -createdAt -updatedAt -__v ')

        if (response) {
            if (response.isEnable === true) return res.status(200).json(new apiResponse(200, 'Book enable successfully!', {}, {}))
            else return res.status(200).json(new apiResponse(200, 'Book disable successfully!', {}, {}))
        }
        else return res.status(404).json(new apiResponse(404, 'Book record not found', {}, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}
