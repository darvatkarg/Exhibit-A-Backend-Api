"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { questionModel, resultModel, userModel, userSessionModel, countryModel, stateModel, cityModel, schoolModel } from '../../database'
import { apiResponse, loginStatus, URL_decode, userStatus } from '../../common'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import config from 'config'
import { Request, Response } from 'express'
import { deleteImage } from '../../helpers/S3'
import axios from 'axios'
import { getCache, setCache } from '../../helpers/caching'
import { email_verification_mail, forgot_password_mail, welcome_mail_google_SL_facebook_SL } from "../../helpers/mail";

const ObjectId = require('mongoose').Types.ObjectId
const jwt_token_secret = config.get('jwt_token_secret')
const refresh_jwt_token_secret = config.get('refresh_jwt_token_secret')



export const get_profile = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await userModel.findOne({ _id: ObjectId((req.header('user') as any)?._id), isActive: true, userType: userStatus.student }, { _id: 1, name: 1, email: 1, phoneNumber: 1, city: 1, image: 1, address: 1, region: 1, country: 1, cityId: 1, regionId: 1, countryId: 1, schoolId: 1, PINCode: 1, accountType: 1 })
        if (response) return res.status(200).json(new apiResponse(200, 'Get profile successfully', response, {}))
        else return res.status(404).json(new apiResponse(404, 'Database error while getting profile', {}, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, "Internal Server Error", {}, error))
    }
}

export const update_profile = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        id = body?.id,
        user: any = req.header('user')
    body.updatedBy = user._id

    try {
        let response = await userModel.findOneAndUpdate({ _id: ObjectId((req.header('user') as any)?._id), isActive: true, userType: userStatus.student }, body)
        if (response) {
            if (body?.image != response?.image && response.image != null && body?.image != null && body?.image != undefined) {
                let [folder_name, image_name] = await URL_decode(response?.image)
                await deleteImage(image_name, folder_name)
            }
            // if (response.image != body?.image) {
            //     let [folder_name, image_name] = await URL_decode(response?.image)
            //     await deleteImage(image_name, folder_name)
            // }
            return res.status(200).json(new apiResponse(200, 'Profile updated successfully', {}, {}))
        }
        else return res.status(404).json(new apiResponse(404, 'Database error while updating profile', {}, {}))
    } catch (error) {
        return res.status(500).json(new apiResponse(500, "Internal Server Error", {}, error))
    }
}

export const google_SL = async (req: Request, res: Response) => {
    let { accessToken, idToken, deviceToken } = req.body
    reqInfo(req)
    try {
        if (accessToken && idToken) {
            let verificationAPI = `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`,
                idAPI = `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`;

            let access_token: any = await axios.get(verificationAPI)
                .then((result) => {
                    return result.data
                }).catch((error) => {
                    return false;
                })
            let id_token: any = await axios.get(idAPI)
                .then((result) => {
                    return result.data
                }).catch((error) => {
                    return false
                })
            if (access_token.email == id_token.email && access_token.verified_email == true) {
                const isUser = await userModel.findOneAndUpdate({
                    $and: [{
                        email: id_token.email,
                        isActive: true
                    }]
                }, {
                    $addToSet: { deviceToken: deviceToken }
                }
                )
                if (!isUser) {
                    for (let flag = 0; flag < 1;) {
                        var authToken = await Math.round(Math.random() * 1000000)
                        if (authToken.toString().length == 6) {
                            flag++
                        }
                    }
                    return new userModel({
                        email: id_token.email,
                        name: id_token.given_name + " " + id_token.family_name,
                        // image: id_token.picture,
                        accountType: loginStatus.google,
                        isEmailVerified: true,
                        deviceToken: [deviceToken],
                        otpExpireTime: new Date(new Date().setMinutes(new Date().getMinutes() + 10)),
                        authToken,
                        otp: authToken
                    }).save()
                        .then(async response => {
                            const token = jwt.sign({
                                _id: response._id,
                                authToken: response.authToken,
                                type: response.userType,
                                status: "Login",
                                generatedOn: (new Date().getTime())
                            }, jwt_token_secret)

                            const refresh_token = jwt.sign({
                                _id: response._id,
                                generatedOn: (new Date().getTime())
                            }, refresh_jwt_token_secret)

                            await new userSessionModel({ createdBy: response._id, refresh_token }).save()

                            let return_response = {
                                id: response?._id,
                                userType: response?.userType,
                                isEmailVerified: response?.isEmailVerified,
                                isPhoneVerified: response?.isPhoneVerified,
                                accountType: response?.accountType,
                                _id: response?._id,
                                name: response?.name,
                                email: response?.email,
                                // image: id_token?.image,
                                token,
                                refresh_token
                            }
                            return res.status(200).json(new apiResponse(200, "Login successful!", return_response, {}));
                        })
                } else {
                    if (isUser?.isBlock == true) return res.status(401).json(new apiResponse(401, "Your account has been blocked!", {}, {}));
                    const token = jwt.sign({
                        _id: isUser._id,
                        authToken: isUser.authToken,
                        type: isUser.userType,
                        status: "Login",
                        generatedOn: (new Date().getTime())
                    }, jwt_token_secret)

                    const refresh_token = jwt.sign({
                        _id: isUser._id,
                        generatedOn: (new Date().getTime())
                    }, refresh_jwt_token_secret)

                    await new userSessionModel({
                        createdBy: isUser._id,
                        refresh_token
                    }).save()

                    let response = {
                        id: isUser?._id,
                        userType: isUser?.userType,
                        isEmailVerified: isUser?.isEmailVerified,
                        isPhoneVerified: isUser?.isPhoneVerified,
                        accountType: isUser?.accountType,
                        _id: isUser?._id,
                        name: isUser?.name,
                        email: isUser?.email,
                        image: isUser?.image,
                        token,
                        refresh_token
                    }
                    // console.log(response);
                    return res.status(200).json(new apiResponse(200, "Login successful!", response, {}));
                }
            }
            return res.status(401).json(new apiResponse(401, "You have entered an invalid idToken or accessToken!", {}, {}))
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, "Internal Server Error!", {}, error));
    }
}

export const facebook_SL = async (req: Request, res: Response) => {
    let { accessToken, deviceToken } = req.body
    reqInfo(req)
    try {
        let userURL = `https://graph.facebook.com/me?fields=first_name,last_name,picture,email&access_token=${accessToken}`
        let user_profile: any = await axios.get(userURL)
            .then((result) => {
                return result.data
            }).catch((error) => {
                return false;
            })
        if (!user_profile) return res.status(200).json(new apiResponse(200, "Invalid Token!", {}, {}))
        let userIsExist = await userModel.findOneAndUpdate({ $and: [{ $or: [{ facebookId: user_profile?.id }, { email: user_profile?.email }] }, { isActive: true, accountType: loginStatus.facebook }] }, { $addToSet: { deviceToken: deviceToken } })

        if (userIsExist) {
            if (userIsExist?.isBlock == true) return res.status(401).json(new apiResponse(401, "Your account is Block!", {}, {}));
            const token = jwt.sign({
                _id: userIsExist._id,
                authToken: userIsExist.authToken,
                type: userIsExist.userType,
                accountType: loginStatus.facebook,
                status: "Login",
                generatedOn: (new Date().getTime())
            }, jwt_token_secret)

            const refresh_token = jwt.sign({
                _id: userIsExist._id,
                generatedOn: (new Date().getTime())
            }, refresh_jwt_token_secret)

            await new userSessionModel({
                createdBy: userIsExist._id,
                refresh_token
            }).save()
            let response = {
                _id: userIsExist?._id,
                id: userIsExist?._id,
                isEmailVerified: userIsExist.isEmailVerified,
                isPhoneVerified: userIsExist.isPhoneVerified,
                userType: userIsExist.userType,
                accountType: userIsExist.accountType,
                name: userIsExist?.name,
                email: userIsExist?.email,
                // image: userIsExist?.image,
                token,
                refresh_token
            }
            return res.status(200).json(new apiResponse(200, "Login successfully!", response, {}));
        } else {
            for (let flag = 0; flag < 1;) {
                var authToken = await Math.round(Math.random() * 1000000)
                if (authToken.toString().length == 6) {
                    flag++
                }
            }
            return new userModel({
                email: user_profile.email,
                name: user_profile.first_name + " " + user_profile.last_name,
                userName: user_profile.first_name + " " + user_profile.last_name,
                accountType: loginStatus.facebook,
                facebookId: user_profile?.id,
                // image: user_profile.picture.data.url,
                isPhoneVerified: false,
                isEmailVerified: user_profile.email ? true : false,
                deviceToken: [deviceToken],
                authToken,
            }).save()
                .then(async response => {
                    const token = jwt.sign({
                        _id: response._id,
                        authToken: response.authToken,
                        type: response.userType,
                        status: "Login",
                        generatedOn: (new Date().getTime())
                    }, jwt_token_secret)

                    const refresh_token = jwt.sign({
                        _id: response._id,
                        generatedOn: (new Date().getTime())
                    }, refresh_jwt_token_secret)

                    await new userSessionModel({
                        createdBy: response._id,
                        refresh_token
                    }).save()

                    let return_response = {
                        userType: response.userType,
                        accountType: response.accountType,
                        isEmailVerified: response.isEmailVerified,
                        isPhoneVerified: response.isPhoneVerified,
                        _id: response?._id,
                        id: response?._id,
                        name: response?.name,
                        email: response?.email,
                        // image: user_profile?.picture?.data.url,
                        token,
                        refresh_token
                    }
                    return res.status(200).json(new apiResponse(200, "Login successfully!", return_response, {}));
                })
        }
    } catch (error) {
        return res.status(500).json(new apiResponse(500, "Internal Server Error", {}, error));
    }
}

export const test_history = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await resultModel.findOne({ userId: ObjectId((req.header('user') as any)?._id), isActive: true }, { testId: 1, score: 1 })
        if (response) return res.status(200).json(new apiResponse(200, 'History', response, {}))
        else return res.status(404).json(new apiResponse(404, 'Database error ', {}, {}))

    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, "Internal Server Error", {}, error))
    }
}

export const get_country = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await countryModel.find({}, { country: 1, code: 1, shortName: 1 })
        if (response) return res.status(200).json(new apiResponse(200, 'Country', response, {}))
        else return res.status(404).json(new apiResponse(404, 'Database error', {}, {}))
    } catch (error) {
        return res.status(500).json(new apiResponse(500, "Internal Server Error", {}, error))
    }
}

export const get_country_state_city = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let countryIs: any, stateIs: any, cityIs: any, { country_name, state_name } = req.body
        // allCountry: `ALL_COUNTRY`,
        // country: (id: any): any => `COUNTRY_${id}`,
        // state: (id: any): any => `STATE_${id}`,
        if (Object.keys(req.body).length == 0) {
            countryIs = await getCache(`ALL_COUNTRY`)
            if (countryIs) return res.status(200).json(new apiResponse(200, 'Country', countryIs, {}))
            countryIs = await countryModel.find({}, { country: 1 }).sort({ country: 1 })
            await setCache(`ALL_COUNTRY`, countryIs, 0)
            return res.status(200).json(new apiResponse(200, 'Country', countryIs, {}))
        } if (req.body.country_name && !req.body.stateId) {
            let findCountry = await countryModel.find({ country: req.body.country_name });
            stateIs = await getCache(`COUNTRY_${country_name}`)
            if (stateIs) return res.status(200).json(new apiResponse(200, 'State', stateIs, {}))
            stateIs = await stateModel.find({ countryId: ObjectId(findCountry[0]._id) }, { state: 1, countryId: 1 }).sort({ state: 1 })
            // await setCache(`COUNTRY_${countryId}`, stateIs, 0)
            return res.status(200).json(new apiResponse(200, 'State', stateIs, {}))
        }
        // if (req.body.state_name && !req.body.cityId) {
        //     let findState = await stateModel.find({ state: req.body?.state_name });
        //     cityIs = await getCache(`STATE_${state_name}`)
        //     if (cityIs) return res.status(200).json(new apiResponse(200, 'city', cityIs, {}))
        //     cityIs = await cityModel.find({ stateId: ObjectId(findState[0]._id) }, { city: 1, stateId: 1 }).sort({ city: 1 })
        //     await setCache(`STATE_${state_name}`, cityIs, 0)
        //     return res.status(200).json(new apiResponse(200, 'city', cityIs, {}))
        // }
    } catch (error) {
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const delete_account = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = req.header('user')
    try {
        let response = await userModel.findByIdAndDelete({ _id: ObjectId(user._id) });
        // let response = await userModel.findOneAndUpdate({ _id: ObjectId(user._id), isActive: true }, { isActive: false }, { new: true }).select('fullName image userName email phoneNumber isActive isBlock')
        if (response) {
            return res.status(200).json(new apiResponse(200, `Your account has been successfully deleted!`, {}, {}))
        }
        else return res.status(501).json(new apiResponse(501, `We couldn't find the account you requested!`, {}, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const get_school_dropdown = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await schoolModel.find({ isActive: true }, { name: 1 })
        if (response) return res.status(200).json(new apiResponse(200, 'Get school successfully ', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while getting school details ', {}, Error))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, error))
    }
}

// export const add_district = async (req: Request, res: Response) => {
//     reqInfo(req)
//     let body = req.body,
//         search = new RegExp(`^${body.city}$`, "ig")
//     let user: any = req.header('user')
//     try {
//         let isExist = await cityModel.findOne({ city: { $regex: search }, isActive: true })
//         if (isExist) return res.status(409).json(new apiResponse(409, ' city Already Register', {}, {}))

//         let response = await new cityModel(body).save()

//         if (response) return res.status(200).json(new apiResponse(200, ' city Successfully Added', response, {}))
//         else return res.status(400).json(new apiResponse(409, 'Database Error While Adding city', {}, `${response}`))
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json(new apiResponse(500, 'Internal Server Error', {}, error))
//     }
// }