"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { bookModel } from '../../database'
import { apiResponse, bookType } from '../../common'
import { Request, Response } from 'express'
import { downloadModel } from '../../database/models/downloads'

const ObjectId = require('mongoose').Types.ObjectId

export const download_free = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = req.header('user')
    try {
        let book_data = await bookModel.findOne({ _id: ObjectId(req.params.id), isActive: true }, { pdf: 1, audio: 1, video: 1, isFree: 1 })
        //console.log(book_data.isFree == bookType.free);

        if (book_data.isFree == bookType.free) {
            let response = await new downloadModel({ bookId: req.params.id, createdBy: user._id }).save()
            if (response) return res.status(200).json(new apiResponse(200, `Book successfully download`, { url: book_data.pdf }, {}));
            else return res.status(400).json(new apiResponse(400, `Error in database`, {}, `${response}`));
        }
        else return res.status(400).json(new apiResponse(400, 'Need to buy this book', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, "Internal Server Error", {}, error))
    }
}

export const download_history = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = (req.header('user') as any)?._id
    try {
        let response = await downloadModel.find({ createdBy: ObjectId(user), isActive: true }, { bookId: 1, isRead: 1 })
        if (response) return res.status(200).json(new apiResponse(200, "History", response, {}))
        else return res.status(400).json(new apiResponse(400, "Database error", {}, {}))
    } catch (error) {
        //console.log(error);
        return res.status(500).json(new apiResponse(500, "Internal Server Error", {}, error))
    }
}