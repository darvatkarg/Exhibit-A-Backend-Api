"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { bookModel } from '../../database'
import { apiResponse, bookType, URL_decode } from '../../common'
import { Request, Response } from 'express'
import { deleteImage, delete_file } from '../../helpers/S3'
import { downloadModel } from '../../database/models/downloads'

const ObjectId = require('mongoose').Types.ObjectId

export const download_history = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await downloadModel.find({ isActive: true }, { bookId: 1, createdBy: 1 })
        if (response) return res.status(200).json(new apiResponse(200, "Get download history", response, {}))
        else return res.status(400).json(new apiResponse(400, "Database error while gettin download history ", {}, {}))
    }
    catch (error) {
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}