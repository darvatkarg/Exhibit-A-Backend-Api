import jwt from 'jsonwebtoken'
import config from 'config'
import { schoolModel, userModel } from '../database'
import mongoose from 'mongoose'
import { apiResponse, userStatus } from '../common'
import { Request, Response } from 'express'

const ObjectId = mongoose.Types.ObjectId
const jwt_token_secret = config.get('jwt_token_secret')

export const userJWT = async (req: Request, res: Response, next) => {
    let { authorization, userType } = req.headers,
        result: any
    if (authorization) {
        try {
            let isVerifyToken = jwt.verify(authorization, jwt_token_secret)
            if (isVerifyToken?.type != userType && userType != "5") return res.status(403).json(new apiResponse(403, 'Access denied', {}, {}));
            // if (parseInt(isVerifyToken.generatedOn + 3600000) < new Date().getTime()) {
            //     return res.status(410).json(new apiResponse(410, "Token has been expired.", {}, {}))
            // }

            if (isVerifyToken?.type == userStatus.school) {
                result = await schoolModel.findOne({ _id: ObjectId(isVerifyToken._id), isActive: true })
            }
            else result = await userModel.findOne({ _id: ObjectId(isVerifyToken._id), isActive: true })
            if (result?.isBlock == true) return res.status(403).json(new apiResponse(403, 'Your account han been blocked.', {}, {}));
            if (result.isActive == true && isVerifyToken.authToken == result.authToken && isVerifyToken.type == result.userType && result.isEmailVerified && result.isPhoneVerified) {
                // Set in Header Decode Token Information
                req.headers.user = isVerifyToken
                return next()
            } else {
                return res.status(401).json(new apiResponse(401, "Invalid-Token", {}, {}))
            }
        } catch (err) {
            if (err.message == "invalid signature") return res.status(403).json(new apiResponse(403, `Don't try different one token`, {}, {}))
            console.log(err)
            return res.status(401).json(new apiResponse(401, "Invalid Token", {}, {}))
        }
    } else {
        return res.status(401).json(new apiResponse(401, "Token not found in header", {}, {}))
    }
}

// export const admin_auditor_sub_admin_JWT = async (req: Request, res: Response, next) => {
//     let { authorization, userType } = req.headers,
//         result: any,
//         role = ['admin', 'auditor', 'sub_admin']
//     if (authorization) {
//         try {
//             let isVerifyToken = jwt.verify(authorization, jwt_token_secret)
//             if (role.indexOf(isVerifyToken?.type) != -1 && userType != "5") return res.status(403).json(new apiResponse(403, 'Access denied', {}, {}));
//             // if (parseInt(isVerifyToken.generatedOn + 3600000) < new Date().getTime()) {
//             //     return res.status(410).json(new apiResponse(410, "Token has been expired.", {}, {}))
//             // }
//             if (isVerifyToken?.type == userStatus.school) {
//                 result = await schoolModel.findOne({ _id: ObjectId(isVerifyToken._id), isActive: true })
//             }
//             else result = await userModel.findOne({ _id: ObjectId(isVerifyToken._id), isActive: true })
//             if (result?.isBlock == true) return res.status(403).json(new apiResponse(403, 'Your account han been blocked.', {}, {}));
//             if (result.isActive == true && isVerifyToken.authToken == result.authToken && isVerifyToken.type == result.userType) {
//                 // Set in Header Decode Token Information
//                 req.headers.user = isVerifyToken
//                 return next()
//             } else {
//                 return res.status(401).json(new apiResponse(401, "Invalid-Token", {}, {}))
//             }
//         } catch (err) {
//             if (err.message == "invalid signature") return res.status(403).json(new apiResponse(403, `Don't try different one token`, {}, {}))
//             console.log(err)
//             return res.status(401).json(new apiResponse(401, "Invalid Token", {}, {}))
//         }
//     } else {
//         return res.status(401).json(new apiResponse(401, "Token not found in header", {}, {}))
//     }
// }

export const partial_userJWT = async (req: Request, res: Response, next) => {
    let { authorization, userType } = req.headers,
        result: any
    if (!authorization) {
        next()
    } else {
        try {
            let isVerifyToken = jwt.verify(authorization, jwt_token_secret)
            if (isVerifyToken?.type != userType && userType != "5") return res.status(403).json(new apiResponse(403, 'Access denied', {}, {}));
            // if (parseInt(isVerifyToken.generatedOn + 3600000) < new Date().getTime()) {
            //     return res.status(410).json(new apiResponse(410, "Token has been expired.", {}, {}))
            // }
            if (isVerifyToken?.type == userStatus.school) {
                result = await schoolModel.findOne({ _id: ObjectId(isVerifyToken._id), isActive: true })
            }
            else result = await userModel.findOne({ _id: ObjectId(isVerifyToken._id), isActive: true })
            if (result?.isBlock == true) return res.status(403).json(new apiResponse(403, 'Your account han been blocked.', {}, {}));
            if (result.isActive == true && isVerifyToken.authToken == result.authToken && isVerifyToken.type == result.userType && result.isEmailVerified && result.isPhoneVerified) {
                // Set in Header Decode Token Information
                req.headers.user = isVerifyToken
                return next()
            } else {
                return res.status(401).json(new apiResponse(401, "Invalid-Token", {}, {}))
            }
        } catch (err) {
            if (err.message == "invalid signature") return res.status(403).json(new apiResponse(403, `Don't try different one token`, {}, {}))
            if (err.message === "jwt must be provided") return res.status(403).json(new apiResponse(403, `Token not found in header`, {}, {}))

            console.log(err)
            return res.status(401).json(new apiResponse(401, "Invalid Token", {}, {}))
        }
    }
}

export const deleteJWT = async (req: Request, res: Response, next) => {
    let { authorization, userType } = req.headers,
        result: any
    try {
        let isVerifyToken = jwt.verify(authorization, jwt_token_secret)
        if (isVerifyToken?.type != userType && userType != "5") return res.status(403).json(new apiResponse(403, 'Access denied', {}, {}));
        // if (parseInt(isVerifyToken.generatedOn + 3600000) < new Date().getTime()) {
        //     return res.status(410).json(new apiResponse(410, "Token has been expired.", {}, {}))
        // }
        if (isVerifyToken?.type == userStatus.school) {
            result = await schoolModel.findOne({ _id: ObjectId(isVerifyToken._id), isActive: true })
        }
        else result = await userModel.findOne({ _id: ObjectId(isVerifyToken._id), isActive: true })
        if (result?.isBlock == true) return res.status(403).json(new apiResponse(403, 'Your account han been blocked.', {}, {}));
        if (result.isActive == true && isVerifyToken.authToken == result.authToken && isVerifyToken.type == result.userType) {
            // Set in Header Decode Token Information
            req.headers.user = isVerifyToken
            return next()
        } else {
            return res.status(401).json(new apiResponse(401, "Invalid-Token", {}, {}))
        }
    } catch (err) {
        if (err.message == "invalid signature") return res.status(403).json(new apiResponse(403, `Don't try different one token`, {}, {}))
        if (err.message === "jwt must be provided") return res.status(403).json(new apiResponse(403, `Token not found in header`, {}, {}))

        console.log(err)
        return res.status(401).json(new apiResponse(401, "Invalid Token", {}, {}))
    }
}