"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { cardModel } from '../../database'
import { apiResponse, } from '../../common'
import { Request, Response } from 'express'
import mongoose from 'mongoose'
import config from 'config'
import CryptoJS from 'react-native-crypto-js'

const ObjectId = mongoose.Types.ObjectId

export const payment = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        return res.status(200).json(new apiResponse(200, 'Payment Done', {}, {}))

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}