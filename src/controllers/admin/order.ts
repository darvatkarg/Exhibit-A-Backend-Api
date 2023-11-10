"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { userModel, orderModel } from '../../database'
import { apiResponse, userStatus } from '../../common'
import { Request, Response } from 'express'
import bcryptjs from 'bcryptjs'

const ObjectId = require('mongoose').Types.ObjectId

export const get_orders = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = (req.header('user') as any)?._id
    try {
        let response = await orderModel.aggregate([
            { $match: { isActive: true } },
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
                $lookup: {
                    from: "users",
                    let: { userId: '$createdBy' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$_id', '$$userId'] },
                                        { $eq: ['$isActive', true] },
                                    ],
                                },
                            }
                        }
                    ],
                    as: "user"
                },
            },
            {
                $project: {
                    orderType: 1,
                    "book.title": 1, "book._id": 1,
                    "user.name": 1
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