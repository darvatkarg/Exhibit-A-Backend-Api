"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { questionModel, answerModel, testModel, resultModel, question_bankModel, course_subjectModel, topicModel, userModel } from '../../database'
import { apiResponse, SMS_message, URL_decode, userStatus } from '../../common'
import { Request, Response } from 'express'
import config from "config";
import axios from 'axios'
import { email_verification_mail_during_exam } from "../../helpers/mail";

const SMS: any = config.get('SMS')
const ObjectId = require('mongoose').Types.ObjectId

export const get_mcq_question = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    let user: any = (req.header('user') as any)?._id
    try {
        let getQuestionNumber = await topicModel.findOne({ _id: ObjectId(req.params.id) }, { question_select: 1 });

        let response = await questionModel.aggregate([
            { $match: { topicId: ObjectId(req.params.id), isActive: true } }, { $sample: { size: getQuestionNumber?.question_select } },
            {
                $lookup: {
                    from: "topics",
                    let: { topicId: '$topicId' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$_id', '$$topicId'] },
                                        { $eq: ['$isActive', true] },
                                    ],
                                },
                            }
                        },
                        {
                            $project: {
                                topicName: 1
                            }
                        }
                    ],
                    as: "topic"
                }
            },
            {
                $facet: {
                    question_data: [
                        {
                            $project: {
                                topicId: 1, topic: { $first: "$topic.topicName" },
                                question: 1, option: 1, _id: 1, answer: 1,
                            }
                        },
                    ],
                    question_count: [{ $count: "count" }]
                }
            }
        ]);
        if (response) return res.status(200).json(new apiResponse(200, 'Get MCQ question successfully', { question_data: response[0]?.question_data, question_count: response[0]?.question_count }, {}))
        else return res.status(404).json(new apiResponse(404, 'Database error while getting MCQ question', {}, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, "Internal server error", {}, error))
    }
}

export const send_otp_during_exam = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body, otpFlag = 1, phone_otp = 0
    let user: any = (req.header('user') as any)?._id
    try {
        otpFlag = 1;
        while (otpFlag == 1) {
            for (let flag = 0; flag < 1;) {
                phone_otp = await Math.round(Math.random() * 1000000);
                if (phone_otp.toString().length == 6) {
                    flag++;
                }
            }
            let isAlreadyAssign = await userModel.findOne({ phone_otp: phone_otp });
            if (isAlreadyAssign?.phone_otp != phone_otp) otpFlag = 0;
        }
        body.phone_otp = phone_otp;
        let update_data = await userModel.findOneAndUpdate({ _id: ObjectId(user), isActive: true }, { phone_otp: body.phone_otp, otp: body.phone_otp }, { new: true })
        if (update_data?.phoneNumber[0] == 0) {
            update_data.phoneNumber = update_data.phoneNumber.substring(1)
        }
        let result: any = await axios.post(`${SMS?.URL}`, JSON.stringify({
            "messages": [
                {
                    "destinations": [
                        {
                            "to": `${update_data?.countryCode}${update_data?.phoneNumber}`
                        }
                    ],
                    "from": `${SMS?.smsSender}`,
                    "text": SMS_message?.OTP_verification + `${body.phone_otp}`
                }
            ]
        }),
            {
                headers: {
                    'Authorization': `App ${SMS?.apiKey}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            })
        if (update_data) {
            await email_verification_mail_during_exam(update_data)
            if (result?.data.messages[0].status.id == 26) {
                return res.status(200).json(new apiResponse(200, `Verification code is sent to your registered Mobile no. ${update_data.phoneNumber} and Email address ${update_data.email}`, { phone_otp: body.phone_otp }, {}));
            }
            else {
                // console.log(result?.data.messages[0].status.id);
                return res.status(500).json(new apiResponse(500, "Status", result?.data.messages[0].status.id, {}))
            }
        }
        else {
            return res.status(500).json(new apiResponse(500, 'Something went wrong!', {}, {}))
        }
    } catch (error) {
        return res.status(500).json(new apiResponse(500, "Internal Server Error", {}, error));
    }
}

export const otp_verification_during_exam = async (req: Request, res: Response) => {
    reqInfo(req);
    let { phone_otp } = req.body
    let user: any = (req.header('user') as any)?._id
    try {
        let data = await userModel.findOne({ _id: ObjectId(user), phone_otp: phone_otp, isActive: true, });

        if (!data)
            return res.status(400).json(new apiResponse(400, "Invalid OTP ", {}, {}));
        if (data.isBlock == true)
            return res.status(403).json(new apiResponse(403, "Account has been blocked", {}, {}));
        if (phone_otp) {
            return res.status(200).json(new apiResponse(200, "User verify successfully!", { _id: data._id, phone_otp: data.phone_otp }, {}))
        }
        if (data) return res.status(200).json(new apiResponse(200, "OTP has been verified", { _id: data._id, otp: data.otp, phone_otp: data.phone_otp }, {}));

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, "Internal Server Error", {}, error));
    }
};