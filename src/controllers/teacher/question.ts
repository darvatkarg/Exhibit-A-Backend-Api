"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { questionModel } from '../../database'
import { apiResponse, } from '../../common'
import { Request, Response } from 'express'

const ObjectId = require('mongoose').Types.ObjectId

export const add_question = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    req.body.createdBy = (req.header('user') as any)?._id
    try {
        let response = await new questionModel(body).save()
        if (response) return res.status(200).json(new apiResponse(200, 'Question is added', {}, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while adding question', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const get_question = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await questionModel.find({ isActive: true }, { id_: 1, title: 1, question: 1, option: 1, answer: 1 })
        if (response) return res.status(200).json(new apiResponse(200, 'Get Question Successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while getting questions', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const get_by_id = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await questionModel.find({ _id: ObjectId(req.params.id), isActive: true }, { id_: 1, title: 1, question: 1, option: 1, answer: 1 })
        if (response) return res.status(200).json(new apiResponse(200, 'Get Question Successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while getting question', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const get_by_title = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    try {
        let response = await questionModel.find({ question: body.question, isActive: true }, { id_: 1, title: 1, question: 1, option: 1, answer: 1 })
        if (response) return res.status(200).json(new apiResponse(200, 'Get Question Successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while getting question by title', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const update_question = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        id = body?.id,
        user: any = req.header('user')
    body.updatedBy = user._id
    try {
        let response = await questionModel.findOneAndUpdate({ _id: ObjectId(id), isActive: true }, body)
        if (response) return res.status(200).json(new apiResponse(200, 'Updated question successfully', {}, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while updating question', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const delete_question = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        user: any = req.header('user')
    body.updatedBy = user._id
    try {
        let response = await questionModel.findOneAndUpdate({ _id: ObjectId(req.params.id), isActive: true }, { isActive: false })
        if (response) return res.status(200).json(new apiResponse(200, 'Deleted question successfully', {}, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while deleting question', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const get_mcq_id = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await questionModel.find({ mcqId: ObjectId(req.params.id), isActive: true }, { id_: 1, title: 1, question: 1, option: 1, answer: 1 })
        if (response) return res.status(200).json(new apiResponse(200, 'Get Question Successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while getting question', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}