"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { bookModel, orderModel } from '../../database'
import { apiResponse, bookType, orderStatus, orderType } from '../../common'
import { Request, response, Response } from 'express'

const ObjectId = require('mongoose').Types.ObjectId

export const add_order = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    req.body.createdBy = (req.header('user') as any)?._id
    try {
        let buy = await orderModel.findOne({ isActive: true, bookId: ObjectId(body.bookId), createdBy: ObjectId((req.header('user') as any)?._id) })
        if (buy != null) {
            await orderModel.findOne({ isActive: true, createdBy: ObjectId((req.header('user') as any)?._id), bookId: ObjectId(body.bookId) })
            return res.status(200).json(new apiResponse(200, 'Already Purchased', {}, {}))
        }
        else {
            if (body.orderType == orderType.online) {
                body.status = orderStatus.deliver
            }
            let response = await new orderModel(body).save()
            if (response) return res.status(200).json(new apiResponse(200, 'Order Place', response, {}))
            else return res.status(400).json(new apiResponse(400, 'database error while adding cart', {}, {}))
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const get_order = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = (req.header('user') as any)?._id
    try {
        let response = await orderModel.aggregate([
            { $match: { isActive: true, createdBy: ObjectId(user) } },
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
                },
            },
            {
                $project: {
                    orderType: 1,
                    "book.title": 1, "book._id": 1,
                    "book.author": 1, "book.pdf": 1,
                    "book.image": 1, "book.ePub": 1,
                    "book.cost": 1, "book.audio": 1, "book.video": 1
                }
            }
        ])
        //let response = await orderModel.find({ isActive: true, createdBy: user._id }, { CartId: 1, _id: 1, Total_price: 1, status: 1 })
        if (response) return res.status(200).json(new apiResponse(200, 'Order', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const delete_order = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await orderModel.findOneAndUpdate({ _id: ObjectId(req.params.id), isActive: true }, { isActive: false })
        if (response) return res.status(200).json(new apiResponse(200, 'deleted order successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'database error', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}