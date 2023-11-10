"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { cardModel } from '../../database'
import { apiResponse, } from '../../common'
import { Request, Response } from 'express'
import mongoose from 'mongoose'
import config from 'config'
import CryptoJS from 'react-native-crypto-js'

//const stripe = require('stripe')((config.get('stripe') as any)?.secret_key)
const ObjectId = mongoose.Types.ObjectId

export const add_card = async (req: Request, res: Response) => {
    reqInfo(req)
    req.body.createdBy = (req.header('user') as any)?._id
    try {
        let response = await new cardModel(req.body).save()
        if (response) return res.status(200).json(new apiResponse(200, `Card successfully added`, {}, {}))
        else return res.status(400).json(new apiResponse(400, `Card error in database`, {}, `${response}`))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, "Internal Server Error", {}, error))
    }
}

// export const add_card = async (req: Request, res: Response) => {
//     reqInfo(req)
//     let user: any = req.header('user'),
//         { stripeCustomerId, name, cardNumber, expMonth, expYear, cvc, zipCode } = req.body
//     try {
//         let decrypt_card = {
//             number: (await CryptoJS.AES.decrypt(cardNumber, config.get('crypto_key')).toString(CryptoJS.enc.Utf8)),
//             exp_month: (await CryptoJS.AES.decrypt(expMonth, config.get('crypto_key')).toString(CryptoJS.enc.Utf8)),
//             exp_year: (await CryptoJS.AES.decrypt(expYear, config.get('crypto_key')).toString(CryptoJS.enc.Utf8)),
//             cvc: (await CryptoJS.AES.decrypt(cvc, config.get('crypto_key')).toString(CryptoJS.enc.Utf8)),
//             address_zip: (await CryptoJS.AES.decrypt(zipCode, config.get('crypto_key')).toString(CryptoJS.enc.Utf8)),
//             name: (await CryptoJS.AES.decrypt(name, config.get('crypto_key')).toString(CryptoJS.enc.Utf8))
//         }
//         let is_card_exist = await cardModel.findOne({ createdBy: ObjectId(user?._id), isActive: true, stripeCustomerId })

//         if (is_card_exist) {
//             stripe.customers.deleteSource(stripeCustomerId, is_card_exist.stripeCardId).then(data => { return data }).catch(error => { return error })
//             const card_token = await stripe.tokens.create(
//                 {
//                     card: decrypt_card,
//                 })
//             const attach_card = await stripe.customers.createSource(
//                 stripeCustomerId,
//                 { source: card_token?.id }
//             );
//             await cardModel.findOneAndUpdate({ createdBy: ObjectId(user?._id), isActive: true, stripeCustomerId }, {
//                 stripeCardId: attach_card?.id,
//                 brand: attach_card?.brand,
//                 country: attach_card?.country,
//                 expMonth,
//                 expYear,
//                 name,
//                 last4: (CryptoJS.AES.encrypt(attach_card?.last4, config.get('crypto_key')).toString()),
//             })
//             return res.status(200).json(new apiResponse(200, 'new card add completed', { stripeCardId: attach_card?.id }, {}))
//         }
//         else {
//             const card_token = await stripe.tokens.create(
//                 {
//                     card: decrypt_card,
//                 })
//             const attach_card = await stripe.customers.createSource(
//                 stripeCustomerId,
//                 { source: card_token?.id }
//             );
//             await new cardModel({
//                 stripeCustomerId,
//                 stripeCardId: attach_card?.id,
//                 brand: attach_card?.brand,
//                 country: attach_card?.country,
//                 expMonth,
//                 expYear,
//                 name,
//                 last4: (CryptoJS.AES.encrypt(attach_card?.last4, config.get('crypto_key')).toString()),
//                 createdBy: user?._id
//             }).save()
//             return res.status(200).json(new apiResponse(200, 'new card add completed', { stripeCardId: attach_card?.id }, {}))
//         }
//     } catch (error) {
//         console.log(error)
//         if (error.message) return res.status(404).json(new apiResponse(404, error.message, {}, {}))
//         return res.status(500).json(new apiResponse(500, 'Internal Server Error', {}, {}))
//     }
// }

export const get_card = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await cardModel.find({ isActive: true, createdBy: ObjectId((req.header('user') as any)?._id) }, { createdBy: 0, updatedBy: 0, createdAt: 0, updatedAt: 0, __v: 0 })
        if (response) return res.status(200).json(new apiResponse(200, `Get card successfully`, response, {}))
        else return res.status(400).json(new apiResponse(400, `Card error in database`, {}, `${response}`))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, "Internal Server Error", {}, error))
    }
}

export const get_by_id_card = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await cardModel.findOne({ _id: ObjectId(req.params?.id), isActive: true, createdBy: ObjectId((req.header('user') as any)?._id) }, { createdBy: 0, updatedBy: 0, createdAt: 0, updatedAt: 0, __v: 0 })
        if (response) return res.status(200).json(new apiResponse(200, "Get by id card successfully", response, {}))
        else return res.status(400).json(new apiResponse(400, `Card error in database`, {}, `${response}`))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, "Internal Server Error", {}, error))
    }
}

export const update_card = async (req: Request, res: Response) => {
    reqInfo(req)
    let body: any = req.body,
        id = body?.id
    delete body?.id
    body.updatedBy = (req.header('user') as any)?._id
    try {
        let response = await cardModel.findOneAndUpdate({ _id: ObjectId(id), isActive: true, createdBy: ObjectId((req.header('user') as any)?._id) }, body)
        if (response) return res.status(200).json(new apiResponse(200, `Updated card successfully`, {}, {}))
        else return res.status(404).json(new apiResponse(404, `Card with the specified id does not exists`, {}, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, "Internal Server Error", {}, error))
    }
}

export const delete_card = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await cardModel.findOneAndUpdate({ _id: ObjectId(req.params?.id), isActive: true, createdBy: ObjectId((req.header('user') as any)?._id) }, { isActive: false })
        if (response) return res.status(200).json(new apiResponse(200, `Card has been successfully deleted`, {}, {}))
        else return res.status(404).json(new apiResponse(404, `Card with the specified id does not exists`, {}, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, "Internal Server Error", {}, error))
    }
}