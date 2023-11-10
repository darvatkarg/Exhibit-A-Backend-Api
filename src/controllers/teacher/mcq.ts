"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { testModel } from '../../database'
import { apiResponse, testType } from '../../common'
import { Request, Response } from 'express'

const ObjectId = require('mongoose').Types.ObjectId

export const add_mcq_test = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    req.body.createdBy = (req.header('user') as any)?._id
    try {
        let response = await new testModel(body).save()
        if (response) return res.status(200).json(new apiResponse(200, 'MCQ test is added', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while adding mcq test', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const get_mcq = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await testModel.find({ isActive: true, type: testType.mcq }, { number_question: 1, duration: 1, marks: 1, title: 1 })
        if (response) return res.status(200).json(new apiResponse(200, ' get MCQ test Successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while getting mcq test', {}, {}))

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const get_by_mcq = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await testModel.findOne({ _id: ObjectId(req.params.id), type: testType.mcq, isActive: true }, { type: 1, number_question: 1, duration: 1, marks: 1, title: 1 })
        if (response) return res.status(200).json(new apiResponse(200, ' get mcq Successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while getting mcq', {}, {}))

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const update_mcq = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        user: any = req.header('user')
    body.updatedBy = user._id
    try {
        let response = await testModel.findOneAndUpdate({ _id: ObjectId(body.id), isActive: true }, body)
        if (response) return res.status(200).json(new apiResponse(200, 'Updated MCQ test successfully', {}, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while updating mcq test', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const delete_mcq = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        user: any = req.header('user')
    body.updatedBy = user._id
    try {
        let response = await testModel.findOneAndUpdate({ _id: ObjectId(req.params.id), isActive: true }, { isActive: false })
        if (response) return res.status(200).json(new apiResponse(200, 'Deleted MCQ test successfully', {}, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while deleting mcq test', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}