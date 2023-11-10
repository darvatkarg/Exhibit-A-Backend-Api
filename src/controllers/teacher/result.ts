"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { answerModel, testModel } from '../../database'
import { apiResponse } from '../../common'
import { Request, Response } from 'express'
import { resultModel } from '../../database/models/result'

const ObjectId = require('mongoose').Types.ObjectId

export const add_result = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    let user: any = req.header('user')
    body.createdBy = user._id
    try {
        let response = await answerModel.find({ createdBy: ObjectId(req.body.userId), isActive: true, status: true }).countDocuments()
        body.score = response
        let result = await new resultModel(body).save()
        if (result) return res.status(200).json(new apiResponse(200, 'Added result', result, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error', {}, {}))

    } catch (error) {
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const get_result = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await resultModel.find({ isActive: true }, { _id: 1, userId: 1, testId: 1, score: 1 })
        if (response) return res.status(200).json(new apiResponse(200, 'Get Result Successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while getting result', {}, {}))
    }
    catch (error) {
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const update_result = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        id = body.userId
    let user: any = req.header('user')
    body.updatedBy = user._id
    try {
        let response = await resultModel.findOneAndUpdate({ userId: ObjectId(id), isActive: true }, body)
        if (response) return res.status(200).json(new apiResponse(200, 'Successfully updated result', {}, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while updating result', {}, {}))
    } catch (error) {
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}


//error
export const delete_result = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        userId = req.params.id,
        user: any = req.header('user')
    body.updatedBy = user._id
    //id = (hex.test(id))? ObjectId(id) : id;
    try {
        let response = await resultModel.findOneAndUpdate({ userId: ObjectId(userId), isActive: true }, { isActive: false })
        if (response) return res.status(200).json(new apiResponse(200, 'Deleted result successfully', {}, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while deleting result', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}