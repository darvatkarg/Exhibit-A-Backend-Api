"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { feedbackModel, bookModel } from '../../database'
import { apiResponse } from '../../common'
import { Request, Response } from 'express'
import { CloudWatchLogs } from 'aws-sdk'

const ObjectId = require('mongoose').Types.ObjectId

// export const add_feedback = async (req: Request, res: Response) => {
//     reqInfo(req)
//     req.body.createdBy = (req.header('user') as any)?._id
//     try {
//         let [response, book_data] = await Promise.all([
//             await new feedbackModel(req.body).save(),
//             await bookModel.findOne({ _id: ObjectId(req.body.bookId), isActive: true }, { feedback_quality: 1, feedback_price: 1, total_feedback: 1 })
//         ])
//         //let rating = (parseInt(req.body?.quality) + parseInt(req.body?.price))
//         let quantity = ((book_data?.total_feedback * book_data?.feedback_quality) + parseInt(req.body?.quality))
//         let price = ((book_data?.total_feedback * book_data?.feedback_price) + parseInt(req.body?.price))
//         let divide = book_data?.total_feedback + 1
//         await bookModel.findOneAndUpdate({ _id: ObjectId(book_data?._id), isActive: true }, {
//             $inc: { total_feedback: 1 },
//             feedback_quality: (quantity / divide),
//             feedback_price: (price / divide)
//         })
//         if (response) return res.status(200).json(new apiResponse(200, 'Feedback Added successfully', {}, {}))
//         else return res.status(400).json(new apiResponse(400, 'Database error while adding feedback', {}, Error))
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
//     }
// }

export const feedback = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    req.body.createdBy = (req.header('user') as any)?._id
    try {
        let isAlready = await feedbackModel.findOne({ isActive: true, createdBy: ObjectId((req.header('user') as any)?._id), bookId: ObjectId(body.bookId) }, { feedback_rating: 1 })
        if (isAlready != null) {
            return res.status(200).json(new apiResponse(200, 'You have already submitted the feedback', isAlready, {}))
        }
        else {
            let [response, book_data] = await Promise.all([
                await new feedbackModel(req.body).save(),
                await bookModel.findOne({ _id: ObjectId(req.body.bookId), isActive: true }, { feedback_rating: 1, total_feedback: 1 })
            ])
            await bookModel.findOneAndUpdate({ _id: ObjectId(book_data?._id), isActive: true }, {
                $inc: { total_feedback: 1 },
                feedback_rating: (((book_data?.total_feedback * book_data?.feedback_rating) + req.body?.feedback_rating) / (book_data?.total_feedback + 1))
            })
            if (response) return res.status(200).json(new apiResponse(200, 'Feedback added successfully', {}, {}))
            else return res.status(400).json(new apiResponse(400, 'Database error while adding feedback', {}, Error))
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const get_feedback = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = (req.header('user') as any)?._id
    try {
        let response = await feedbackModel.find({ createdBy: ObjectId(user), isActive: true }, { feedback_rating: 1, comment: 1, bookId: 1 })
        if (response) return res.status(200).json(new apiResponse(200, 'Get feedback successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while adding feedback', {}, Error))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const by_id_feedback = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = (req.header('user') as any)?._id
    try {
        let response = await feedbackModel.find({ _id: ObjectId(req.params.id), createdBy: ObjectId(user), isActive: true }, { feedback_rating: 1, comment: 1, bookId: 1 })
        if (response) return res.status(200).json(new apiResponse(200, 'get by id Feedback successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while adding feedback', {}, Error))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const update_feedback = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        id = body?.id,
        user: any = req.header('user')
    body.updatedBy = user._id
    try {
        let response = await feedbackModel.findOneAndUpdate({ _id: ObjectId(id), isActive: true }, body)
        if (response) return res.status(200).json(new apiResponse(200, 'Update feedback successfully', {}, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while updating feedback', {}, Error))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const delete_feedback = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        user: any = req.header('user')
    body.updatedBy = user._id
    try {
        let response = await feedbackModel.findOneAndUpdate({ _id: ObjectId(req.params.id), isActive: true }, { isActive: false })
        if (response) return res.status(200).json(new apiResponse(200, 'Delete feedback successfully', {}, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while updating feedback', {}, Error))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}