"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { discountModel } from '../../database'
import { apiResponse } from '../../common'
import { Request, Response } from 'express'

const ObjectId = require('mongoose').Types.ObjectId

export const add_discount = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    let user: any = req.header('user')
    body.createdBy = user._id
    try {
        let response = await new discountModel(body).save()
        if (response) return res.status(200).json(new apiResponse(200, 'Discount successfully added', {}, {}))
        else return res.status(400).json(new apiResponse(409, 'Error in database while adding discount', {}, `${response}`))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, error))
    }
}

export const get_discount = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await discountModel.find({ isActive: true }, { _id: 0, bookId: 1, discount: 1 })
        if (response) return res.status(200).json(new apiResponse(200, 'Discount successfully ', response, {}))
        else return res.status(400).json(new apiResponse(409, 'Error in database while getting discount', {}, `${response}`))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, error))
    }
}

export const by_id_discount = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await discountModel.findOne({ _id: ObjectId(req.params.id), isActive: true }, { _id: 0, bookId: 1, discount: 1 })
        if (response) return res.status(200).json(new apiResponse(200, 'Discount successfully ', response, {}))
        else return res.status(400).json(new apiResponse(409, 'Error in database while getting discount', {}, `${response}`))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, error))
    }
}

export const update_discount = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        user: any = req.header('user')
    body.updatedBy = user._id
    try {
        let response = await discountModel.findOneAndUpdate({ _id: ObjectId(body.id), isActive: true }, body)
        if (response) return res.status(200).json(new apiResponse(200, 'Discount successfully updated', response, {}))
        else return res.status(400).json(new apiResponse(409, 'Error in database while updating discount', {}, `${response}`))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, error))
    }
}

export const delete_discount = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        user: any = req.header('user')
    body.updatedBy = user._id
    try {
        let response = await discountModel.findOneAndUpdate({ _id: ObjectId(req.params.id), isActive: true }, { isActive: false })
        if (response) return res.status(200).json(new apiResponse(200, 'Discount successfully delete', response, {}))
        else return res.status(400).json(new apiResponse(409, 'Error in database while deleting discount', {}, `${response}`))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, error))
    }
}
