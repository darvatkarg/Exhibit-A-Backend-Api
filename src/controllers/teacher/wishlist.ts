"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { wishlistModel } from '../../database'
import { apiResponse } from '../../common'
import { Request, Response } from 'express'

const ObjectId = require('mongoose').Types.ObjectId

export const add_wishlist = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    req.body.createdBy = (req.header('user') as any)?._id
    try {
        let response = await new wishlistModel(body).save()
        if (response) return res.status(200).json(new apiResponse(200, 'Wishlist is added', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while adding theory test', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const get_wishlist = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    let user: any = (req.header('user') as any)?._id
    try {
        let response = await wishlistModel.aggregate([
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
                                        { $eq: ['$isEnable', true] },
                                    ],
                                },
                            }
                        }
                    ],
                    as: "book"
                }
            }, {
                $project: {
                    "book.title": 1, "book.isFree": 1,
                    "book.author": 1, "book.description": 1,
                    "book.image": 1, "book.language": 1,
                    "book.summary": 1, "book.page": 1,
                    "book.cost": 1, "book.edition": 1,
                    "book.pdf": 1, "book.published_date": 1,
                    "book.publisher": 1, "book.feedback_rating": 1,
                    "book.audio": 1, "book.video": 1, "book.quantity": 1,
                }
            }
        ])
        //let response = await wishlistModel.find({ createdBy: ObjectId(user), isActive: true }, { bookId: 1 })
        if (response) return res.status(200).json(new apiResponse(200, 'get theory tes Successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error getting theory test', {}, {}))

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const by_id_wishlist = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = (req.header('user') as any)?._id
    try {
        let response = await wishlistModel.aggregate([
            { $match: { bookId: ObjectId(req.params.id), createdBy: ObjectId(user), isActive: true } },
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
                                        { $eq: ['$isEnable', true] },
                                    ],
                                },
                            }
                        }
                    ],
                    as: "book"
                }
            }, {
                $project: {
                    "book.title": 1, "book.isFree": 1,
                    "book.author": 1, "book.description": 1,
                    "book.image": 1, "book.language": 1,
                    "book.summary": 1, "book.page": 1,
                    "book.cost": 1, "book.edition": 1,
                    "book.pdf": 1, "book.published_date": 1,
                    "book.publisher": 1, "book.feedback_rating": 1,
                    "book.audio": 1, "book.video": 1, "book.quantity": 1,
                }
            }
        ])
        if (response) return res.status(200).json(new apiResponse(200, 'get cart successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while getting cart', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const delete_wishlist = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        user: any = req.header('user')
    body.updatedBy = user._id
    try {
        let response = await wishlistModel.findOneAndUpdate({ _id: ObjectId(req.params.id), isActive: true, createdBy: ObjectId(user._id) }, { isActive: false })
        if (response) return res.status(200).json(new apiResponse(200, 'Deleted', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }

}