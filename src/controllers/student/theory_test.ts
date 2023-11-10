"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { questionModel, answerModel, testModel, theory_questionModel } from '../../database'
import { apiResponse, URL_decode, userStatus } from '../../common'
import { Request, Response } from 'express'

const ObjectId = require('mongoose').Types.ObjectId

export const get_theory = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    //id = body.theoryId
    try {
        let response = await theory_questionModel.find({ theoryId: ObjectId(req.params.id), isActive: true }, { question: 1, _id: 1 })
        if (response) return res.status(200).json(new apiResponse(200, 'Theory question test', response, {}))
        else return res.status(404).json(new apiResponse(404, 'Database error while getting theory question', {}, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, "Internal Server Error", {}, error))
    }
}

export const get_theory_ans = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    try {
        let response = await theory_questionModel.find({ theoryId: ObjectId(req.params.id), isActive: true }, { question: 1, _id: 0, answer: 1 })
        if (response) return res.status(200).json(new apiResponse(200, 'Theory Question Answer', response, {}))
        else return res.status(404).json(new apiResponse(404, 'Database error while getting theory question answer', {}, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, "Internal Server Error", {}, error))
    }
}