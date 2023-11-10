"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { answerModel, testModel, userModel } from '../../database'
import { apiResponse, userStatus } from '../../common'
import { Request, Response } from 'express'
import { resultModel } from '../../database/models/result'

const ObjectId = require('mongoose').Types.ObjectId

// export const add_result = async (req: Request, res: Response) => {
//     reqInfo(req)
//     let body = req.body
//     let user: any = req.header('user')
//     body.createdBy = user._id
//     try {
//         let already = await resultModel.findOne({ isActive: true, createdBy: ObjectId(user._id), testId: ObjectId(body.testId) })
//         if (already == null) {
//             let response = await answerModel.find({ createdBy: ObjectId(req.body.userId), isActive: true, isAnswerTrue: true }).countDocuments()
//             body.score = response
//             let result = await new resultModel(body).save()
//             if (result) return res.status(200).json(new apiResponse(200, ' added result', result, {}))
//             else return res.status(400).json(new apiResponse(400, ' database error', {}, {}))

//         }
//         else {
//             let result1 = await resultModel.findOne({ isActive: true, userId: ObjectId(body.userId) }, { testId: 1, score: 1, userId: 1 })
//             return res.status(200).json(new apiResponse(200, 'Already given test', result1, {}))
//         }

//     } catch (error) {
//         return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
//     }
// }

export const get_result = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await resultModel.find({ isActive: true }, { _id: 1, userId: 1, testId: 1, score: 1 })
        if (response) return res.status(200).json(new apiResponse(200, 'Get result successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while getting result', {}, {}))
    }
    catch (error) {
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const get_by_result = async (req: Request, res: Response) => {
    reqInfo(req)
    let body: any = req.body,
        id = req.params.id
    try {
        let response = await resultModel.findOne({ _id: ObjectId(id), isActive: true }, { _id: 1, userId: 1, testId: 1, score: 1 })
        if (response) return res.status(200).json(new apiResponse(200, 'Get main category successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, ' Database error while getting main category', {}, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, "Internal Server Error", {}, error))
    }
}

export const update_result = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        id = body.userId
    let user: any = req.header('user')
    body.updatedBy = user._id
    try {
        let response = await resultModel.findOneAndUpdate({ createdBy: ObjectId(id), isActive: true }, body)
        if (response) return res.status(200).json(new apiResponse(200, 'Successfully updated result', {}, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while updating result', {}, {}))
    } catch (error) {
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}