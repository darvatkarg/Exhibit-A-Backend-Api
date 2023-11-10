"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { answerModel, testModel } from '../../database'
import { apiResponse, testType } from '../../common'
import { Request, Response } from 'express'

const ObjectId = require('mongoose').Types.ObjectId

export const get_mcq_answer = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    try {
        let response = await answerModel.find({ status: true, isActive: true }, { questionId: 1, _id: 0, answer: 1, createdBy: 1 })
        // let response = await answerModel.findOne({ createdBy: ObjectId(body.id), status: true, isActive: true }).countDocuments()
        if (response) return res.status(200).json(new apiResponse(200, 'Total score', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while getting mcq test answer', {}, {}))

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}
