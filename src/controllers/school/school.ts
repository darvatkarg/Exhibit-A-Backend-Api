"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { schoolModel } from '../../database'
import { apiResponse, userStatus } from '../../common'
import bcryptjs from 'bcryptjs'
import config from 'config'
import { Request, Response } from 'express'
// import { forgot_password_mail } from '../../helpers/aws_mail'
import { email_verification_mail, forgot_password_mail } from '../../helpers/mail'


const ObjectId = require('mongoose').Types.ObjectId
const jwt_token_secret = config.get('jwt_token_secret')
const refresh_jwt_token_secret = config.get('refresh_jwt_token_secret')

export const get_profile = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await schoolModel.findOne({ _id: ObjectId((req.header('user') as any)?._id), isActive: true, userType: userStatus.school }, { _id: 1, name: 1, email: 1, phoneNumber: 1, alterPhoneNumber: 1, image: 1 })
        if (response) return res.status(200).json(new apiResponse(200, 'Get profile successfully', response, {}))
        else return res.status(404).json(new apiResponse(404, 'Database error', {}, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, "Internal server error", {}, error))
    }
}

export const update_profile = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        user: any = req.header('user')
    body.updatedBy = user._id
    try {
        let response = await schoolModel.findOneAndUpdate({ _id: ObjectId((req.header('user') as any)?._id), isActive: true }, body)
        if (response) return res.status(200).json(new apiResponse(200, 'Profile updated successfully', {}, {}))
        else return res.status(404).json(new apiResponse(404, 'Database error while updating profile', {}, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, "Internal server error", {}, error))
    }
}

export const forgot_password = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        otpFlag = 1, // OTP has already assign or not for cross-verification
        otp = 0
    try {
        body.isActive = true
        let data = await schoolModel.findOne(body)

        if (!data) return res.status(400).json(new apiResponse(400, 'Email address is wrong', {}, {}))
        if (data.isEmailVerified == false) return res.status(403).json(new apiResponse(403, 'Email is not verified', {}, {}))
        if (data.isBlock == true) return res.status(403).json(new apiResponse(403, 'Account han been blocked', {}, {}))

        while (otpFlag == 1) {
            for (let flag = 0; flag < 1;) {
                otp = await Math.round(Math.random() * 1000000)
                if (otp.toString().length == 6) {
                    flag++
                }
            }
            let isAlreadyAssign = await schoolModel.findOne({ otp: otp })
            if (isAlreadyAssign?.otp != otp) otpFlag = 0
        }
        let response = await forgot_password_mail(data, otp)
        if (response) {
            let result = await schoolModel.findOneAndUpdate(body, { otp, otpExpireTime: new Date(new Date().setMinutes(new Date().getMinutes() + 10)) })
            return res.status(200).json(new apiResponse(200, `${response}`, {}, {}))
        }
        else return res.status(501).json(new apiResponse(501, `Error in mail system`, {}, `${response}`))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, error))
    }
}

export const otp_verification = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    try {
        body.isActive = true
        let data = await schoolModel.findOneAndUpdate(body, { otp: null, otpExpireTime: null, isEmailVerified: true, authToken: body.otp })

        if (!data) return res.status(400).json(new apiResponse(400, 'Invalid OTP ', {}, {}));
        if (data.isBlock == true) return res.status(403).json(new apiResponse(403, 'Account han been blocked', {}, {}));
        if (new Date(data.otpExpireTime).getTime() < new Date().getTime()) return res.status(410).json(new apiResponse(410, 'OTP has been expired', {}, {}));

        if (data.isEmailVerified == false) {
            return res.status(200).json(new apiResponse(200, 'User email verification completed', { action: "please go to login page" }, {}));
        }
        else {
            if (data) return res.status(200).json(new apiResponse(200, 'OTP has been verified', { _id: data._id, authToken: body?.otp }, {}));
            else return res.status(501).json(new apiResponse(501, `Error in mail system`, {}, data));
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, error));
    }
}

export const reset_password = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        oldAuthToken = 0,
        authToken = 0,
        id = body.id
    oldAuthToken = body?.authToken
    try {
        const salt = await bcryptjs.genSaltSync(10)
        const hashPassword = await bcryptjs.hash(body.password, salt)
        delete body.password
        delete body.id
        body.password = hashPassword

        for (let flag = 0; flag < 1;) {
            authToken = await Math.round(Math.random() * 1000000)
            if (authToken.toString().length == 6) {
                flag++
            }
        }
        body.authToken = authToken
        let response = await schoolModel.findOneAndUpdate({ _id: ObjectId(id), isActive: true, authToken: oldAuthToken }, body)
        if (response) return res.status(200).json(new apiResponse(200, 'Reset-password successfully completed', { action: "please go to login page" }, {}))
        else return res.status(501).json(new apiResponse(501, `Error in reset-password`, {}, response))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, error))
    }
}

export const change_password = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = req.header('user'),
        { old_password, new_password } = req.body,
        authToken: any
    try {
        let user_data = await schoolModel.findOne({ _id: ObjectId(user._id), isActive: true }).select('password')

        const passwordMatch = await bcryptjs.compare(old_password, user_data.password)
        if (!passwordMatch) return res.status(400).json(new apiResponse(400, 'Old password is wrong', {}, {}));

        const salt = await bcryptjs.genSaltSync(10)
        const hashPassword = await bcryptjs.hash(new_password, salt)
        for (let flag = 0; flag < 1;) {
            authToken = await Math.round(Math.random() * 1000000)
            if (authToken.toString().length == 6) {
                flag++
            }
        }
        let response = await schoolModel.findOneAndUpdate({ _id: ObjectId(user._id), isActive: true }, { password: hashPassword, authToken })
        if (response) return res.status(200).json(new apiResponse(200, 'Password has been changed', {}, {}))
        else return res.status(501).json(new apiResponse(501, 'During password changing error in database', {}, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}
