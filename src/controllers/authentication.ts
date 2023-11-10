"use strict";
import { reqInfo } from "../helpers/winston_logger";
import { schoolModel, userModel, userSessionModel } from "../database";
import { apiResponse, loginStatus, SMS_message, URL_decode, userStatus } from "../common";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "config";
import { sendOTP } from '../helpers/aws_sms'
import { Request, Response } from "express";
import async from 'async'
import axios from 'axios'
import { email_verification_mail, forgot_password_mail, welcome_mail, welcome_mail_google_SL_facebook_SL } from "../helpers/mail";

import { deleteImage } from "../helpers/S3";
const SMS: any = config.get('SMS')
const ObjectId = require("mongoose").Types.ObjectId;
const jwt_token_secret = config.get("jwt_token_secret");
const refresh_jwt_token_secret = config.get("refresh_jwt_token_secret");

export const signUp = async (req: Request, res: Response) => {
  reqInfo(req);
  try {
    let body = req.body,
      otpFlag = 1, // OTP has already assign or not for cross-verification
      authToken = 0, phone_otp = 0;
    // body.userType = parseInt(req.headers.userType as string);
    let isAlready: any = await userModel.findOne({
      $or: [{ email: body?.email }, { phoneNumber: body?.phoneNumber }],
      isActive: true,
    });
    if (isAlready?.isEmailVerified == true && isAlready?.email == body?.email) return res.status(409).json(new apiResponse(409, "Email already registered.", {}, {}));
    if (isAlready?.isPhoneVerified == true && isAlready?.phoneNumber == body?.phoneNumber) return res.status(409).json(new apiResponse(409, "Phone number already registered.", {}, {}));
    if (isAlready?.isEmailVerified == false || isAlready?.isPhoneVerified == false) {
      let otpScreen = true;
      let register_pass = body.password;
      const salt = await bcryptjs.genSaltSync(10);
      const hashPassword = await bcryptjs.hash(body.password, salt);
      delete body.password;
      body.password = hashPassword;
      while (otpFlag == 1) {
        for (let flag = 0; flag < 1;) {
          authToken = await Math.round(Math.random() * 1000000);
          if (authToken.toString().length == 6) {
            flag++;
          }
        }
        let isAlreadyAssign = await userModel.findOne({ otp: authToken });
        if (isAlreadyAssign?.otp != authToken) otpFlag = 0;
      }
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
      body.otpScreen = false;
      body.authToken = authToken;
      body.otp = authToken;
      body.phone_otp = phone_otp;
      // body.otpExpireTime = new Date(
      //   new Date().setMinutes(new Date().getMinutes() + 10)
      // );
      let update_data: any = await userModel.findOneAndUpdate(
        { $or: [{ email: body?.email }, { phoneNumber: body?.phoneNumber }], isActive: true },
        {
          authToken: body.authToken, otp: body.otp, otpScreen: body.otpScreen, name: body.name,
          email: body.email, password: body.password, phone_otp: body.phone_otp,
          address: body.address, city: body.city, region: body.region, register_password: register_pass
        }, { new: true }
      );

      // let result = await axios.post(`${SMS?.URL}`, {
      //   "recipients": [
      //     `${update_data?.countryCode}${update_data?.phoneNumber}`
      //   ],
      // "msgText": SMS_message?.OTP_verification + `${body.phone_otp}`,
      //   "smsSender": SMS?.smsSender,
      //   "userName": SMS?.userName,
      //   "appKey": SMS?.appKey
      // })
      if (update_data?.phoneNumber[0] == 0) {
        update_data.phoneNumber = update_data.phoneNumber.substring(1)
      }

      let result: any = await axios.post(`${SMS?.URL}`, JSON.stringify({
        "messages": [
          {
            "destinations": [
              {
                "to": `${update_data?.countryCode}${update_data.phoneNumber}`
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
        }).catch(error => {
          console.log(error);
          return false
        })
      if (update_data) {
        if (result?.data.messages[0]?.status.id == 26) {
          await email_verification_mail(update_data, authToken);
          return res.status(200).json(new apiResponse(200, "Verify email!", { otpScreen: otpScreen, phone_otp: body.phone_otp, email_otp: authToken, }, {}));
        }
        else {
          return res.status(500).json(new apiResponse(500, "Status", result?.data.status, {}))
        }
      }
      else {
        console.log("Error");
        return res.status(500).json(new apiResponse(500, 'Something went wrong!', {}, {}))
      }

    }
    if (isAlready?.isBlock == true) return res.status(403).json(new apiResponse(403, "Your account has been blocked.", {}, {}));
    let register_pass = body.password;
    const salt = await bcryptjs.genSaltSync(10);
    const hashPassword = await bcryptjs.hash(body.password, salt);
    delete body.password;
    body.password = hashPassword;
    body.username = body.name;
    while (otpFlag == 1) {
      for (let flag = 0; flag < 1;) {
        authToken = await Math.round(Math.random() * 1000000);
        if (authToken.toString().length == 6) {
          flag++;
        }
      }
      let isAlreadyAssign = await userModel.findOne({ otp: authToken });
      if (isAlreadyAssign?.otp != authToken) otpFlag = 0;
    }
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
    body.authToken = authToken;
    body.otp = authToken;
    body.phone_otp = phone_otp;
    body.register_password = register_pass;
    // body.otpExpireTime = new Date(
    //   new Date().setMinutes(new Date().getMinutes() + 10)
    // );
    if (body?.phoneNumber[0] == 0) {
      body.phoneNumber = body.phoneNumber.substring(1)
    }
    await new userModel(body).save().then(async (data) => {
      await email_verification_mail(data, authToken);
      // await axios.post(`${SMS?.URL}`, {
      //   "recipients": [
      //     `${data?.countryCode}${data?.phoneNumber}`
      //   ],
      //   "msgText": SMS_message?.OTP_verification + `${body.phone_otp}`,
      //   "smsSender": SMS?.smsSender,
      //   "userName": SMS?.userName,
      //   "appKey": SMS?.appKey
      // })
      await axios.post(`${SMS?.URL}`, JSON.stringify({
        "messages": [
          {
            "destinations": [
              {
                "to": `${data?.countryCode}${data?.phoneNumber}`
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
        }).catch(error => {
          console.log(error);
          return false
        })
      return res.status(200).json(new apiResponse(200, "Verify your account!", { phone_otp: body.phone_otp, email_otp: authToken }, {}));
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(new apiResponse(500, "Internal Server Error", {}, error));
  }
};

export const login = async (req: Request, res: Response) => {
  let body = req.body,
    response: any;
  reqInfo(req);
  try {
    if (parseInt(req.headers?.userType as string) == userStatus.school) {
      //userType: req.headers?.userType
      response = await schoolModel.findOne({ email: body.email, isActive: true, userType: userStatus.school, }).select("-__v -createdAt -updatedAt");
      if (!response) return res.status(400).json(new apiResponse(400, "Email address doesn't exist!", {}, {}));
      if (response?.isBlock == true) return res.status(403).json(new apiResponse(403, "Your account han been blocked.", {}, {}));
    }
    else {
      response = await userModel.findOne({ email: body.email, isActive: true, userType: req.headers.userType, }).select("-__v -createdAt -updatedAt");
      if (!response) return res.status(400).json(new apiResponse(400, "Email address doesn't exist!", {}, {}));
      if (response.isEmailVerified == false) {

        return res.status(502).json(new apiResponse(502, "Email is unverified.", {}, {}));
      }
      if (response.isPhoneVerified == false) {

        return res.status(502).json(new apiResponse(502, "Phone number is unverified.", {}, {}));
      }
      if (response?.isBlock == true) return res.status(403).json(new apiResponse(403, "Your account han been blocked.", {}, {}));
    }
    const passwordMatch = await bcryptjs.compare(body.password, response.password);
    if (!passwordMatch) return res.status(400).json(new apiResponse(400, "Password is wrong", {}, {}));
    const token = jwt.sign(
      {
        _id: response._id,
        authToken: response.authToken,
        type: response.userType,
        status: "Login",
        generatedOn: new Date().getTime(),
      },
      jwt_token_secret
    );
    const refresh_token = jwt.sign(
      {
        _id: response._id,
        generatedOn: new Date().getTime(),
      },
      refresh_jwt_token_secret
    );
    await new userSessionModel({ createdBy: response._id, refresh_token, }).save();
    response = {
      username: response.username,
      name: response.name,
      email: response.email,
      image: response.image,
      userType: response.userType,
      token,
      refresh_token,
    };

    return res.status(200).json(new apiResponse(200, "Login successfully", response, {}));
  } catch (error) {
    console.log(error);
    return res.status(500).json(new apiResponse(500, "Internal Server Error", {}, error));
  }
};

export const forgot_password = async (req: Request, res: Response) => {
  reqInfo(req);
  let body = req.body,
    otpFlag = 1, // OTP has already assign or not for cross-verification
    otp = 0, response: any
  try {
    body.isActive = true;
    let data = await userModel.findOne(body);

    if (!data) {
      return res.status(400).json(new apiResponse(400, "Email address doesn't exist!", {}, {}));
    }
    if (data.isBlock == true) {
      return res.status(403).json(new apiResponse(403, "Account has been blocked", {}, {}));
    }
    // if (data?.isEmailVerified == false) return res.status(502).json(new apiResponse(502,"Email is already exist and Email is unverified.", {}, {} ));

    while (otpFlag == 1) {
      for (let flag = 0; flag < 1;) {
        otp = await Math.round(Math.random() * 1000000);
        if (otp.toString().length == 6) {
          flag++;
        }
      }
      let isAlreadyAssign = await userModel.findOne({ otp: otp });
      if (isAlreadyAssign?.otp != otp) otpFlag = 0;
    }
    if (data?.isEmailVerified)
      response = await forgot_password_mail(data, otp).then(result => { return result }).catch(error => { return error })
    else
      response = await email_verification_mail(data, otp).then(result => { return result }).catch(error => { return error })
    if (response) {
      await userModel.findOneAndUpdate(body, { otp })
      return res.status(200).json(new apiResponse(200, `${response}`, { otp }, {}));
    }
    else return res.status(501).json(new apiResponse(501, "Error in mail system!", {}, `${response}`));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new apiResponse(500, "Internal Server Error", {}, error));
  }
};

export const otp_verification = async (req: Request, res: Response) => {
  reqInfo(req);
  let body = req.body, new_response: any
  try {
    body.isActive = true;
    // let data = await userModel.findOneAndUpdate(body, { otp: null, otpExpireTime: null, isEmailVerified: true, isPhoneVerified: true, otpScreen: false, authToken: body.otp });
    let data = await userModel.findOne(body);

    if (!data)
      return res.status(400).json(new apiResponse(400, "Invalid OTP ", {}, {}));
    if (data.isBlock == true)
      return res.status(403).json(new apiResponse(403, "Account has been blocked", {}, {}));
    // if (new Date(data.otpExpireTime).getTime() < new Date().getTime())
    //   return res.status(410).json(new apiResponse(410, "Otp has been expired", {}, {}));
    if (!data?.isEmailVerified && body?.otp) {
      new_response = await userModel.findOneAndUpdate(body, { isEmailVerified: true }, { new: true })
      return res.status(200).json(new apiResponse(200, "Your email address has been verified!", { _id: data._id, authToken: new_response?.otp, isEmailVerified: new_response?.isEmailVerified, isPhoneVerified: new_response?.isPhoneVerified }, {}))
    }
    if (!data?.isPhoneVerified && body?.phone_otp) {
      new_response = await userModel.findOneAndUpdate({ phone_otp: data?.phone_otp }, { isPhoneVerified: true }, { new: true });
      if (new_response?.accountType == 0) {
        await welcome_mail(new_response);
      } else {
        await welcome_mail_google_SL_facebook_SL(new_response);
      }
      return res.status(200).json(new apiResponse(200, "Your Phone Number has been verified!", { _id: data._id, authToken: new_response?.otp, isEmailVerified: new_response?.isEmailVerified, isPhoneVerified: new_response?.isPhoneVerified }, {}))
    }

    if (data)
      return res.status(200).json(new apiResponse(200, "OTP has been verified", { _id: data._id, otp: data.otp, phone_otp: data.phone_otp }, {}));
    // else
    //   return res.status(501).json(new apiResponse(501, `Error in mail system`, {}, data));

  } catch (error) {
    console.log(error);
    return res.status(500).json(new apiResponse(500, "Internal Server Error", {}, error));
  }
};

export const reset_password = async (req: Request, res: Response) => {
  reqInfo(req);
  let body = req.body,
    authToken = 0,
    id = body.id;
  try {
    const salt = await bcryptjs.genSaltSync(10);
    const hashPassword = await bcryptjs.hash(body.password, salt);
    delete body.password;
    delete body.id;
    body.password = hashPassword;

    for (let flag = 0; flag < 1;) {
      authToken = await Math.round(Math.random() * 1000000);
      if (authToken.toString().length == 6) {
        flag++;
      }
    }
    body.authToken = authToken;
    let response = await userModel.findOneAndUpdate(
      { _id: id, isActive: true },
      body
    );
    if (response)
      return res
        .status(200)
        .json(
          new apiResponse(
            200,
            "Reset-password successfully completed",
            { action: "Please go to login page" },
            {}
          )
        );
    else
      return res
        .status(501)
        .json(new apiResponse(501, `Error in reset-password`, {}, response));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new apiResponse(500, "Internal Server Error", {}, error));
  }
};

export const resend_otp = async (req: Request, res: Response) => {
  reqInfo(req);
  let { email, phoneNumber } = req.body,
    otpFlag = 1, // OTP has already assign or not for cross-verification
    otp = 0,
    phone_otp = 0,
    response;
  try {
    if (email) {
      let data = await userModel.findOne({ email, isActive: true });
      if (!data)
        return res
          .status(400)
          .json(new apiResponse(400, "Email address doesn't exist!", {}, {}));
      if (data.isBlock == true)
        return res
          .status(403)
          .json(new apiResponse(403, "Account has been blocked", {}, {}));
      while (otpFlag == 1) {
        for (let flag = 0; flag < 1;) {
          otp = await Math.round(Math.random() * 1000000);
          if (otp.toString().length == 6) {
            flag++;
          }
        }
        let isAlreadyAssign = await userModel.findOne({ otp: otp });
        if (isAlreadyAssign?.otp != otp) otpFlag = 0;
      }
      if (data.isEmailVerified == false) {
        response = await email_verification_mail(data, otp);
      } else {
        response = await forgot_password_mail(data, otp);
      }
      //console.log(response);

      if (response) {
        await userModel.findOneAndUpdate(
          { email, isActive: true },
          {
            otp,
            // otpExpireTime: new Date(
            //   new Date().setMinutes(new Date().getMinutes() + 10)
            // ),
          }
        );
        return res.status(200).json(new apiResponse(200, `${response}`, {}, {}));
      } else
        return res
          .status(501)
          .json(new apiResponse(501, `Error in mail system`, {}, `${response}`));
    }
    if (phoneNumber) {
      let data = await userModel.findOne({ phoneNumber, isActive: true });
      if (!data)
        return res
          .status(400)
          .json(new apiResponse(400, "Phone number is wrong", {}, {}));
      if (data.isBlock == true)
        return res
          .status(403)
          .json(new apiResponse(403, "Account has been blocked", {}, {}));
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
      if (data.isPhoneVerified == false) {
        // response = await axios.post(`${SMS?.URL}`, {
        //   "recipients": [
        //     `${data?.countryCode}${data?.phoneNumber}`
        //   ],
        //   "msgText": SMS_message?.OTP_verification + `${phone_otp}`,
        //   "smsSender": SMS?.smsSender,
        //   "userName": SMS?.userName,
        //   "appKey": SMS?.appKey
        // })
        if (data?.phoneNumber[0] == 0) {
          data.phoneNumber = data.phoneNumber.substring(1)
        }
        response = await axios.post(`${SMS?.URL}`, JSON.stringify({
          "messages": [
            {
              "destinations": [
                {
                  "to": `${data?.countryCode}${data?.phoneNumber}`
                }
              ],
              "from": `${SMS?.smsSender}`,
              "text": SMS_message?.OTP_verification + `${phone_otp}`
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
      }
      //console.log(response);

      if (response) {
        await userModel.findOneAndUpdate(
          { phoneNumber, isActive: true },
          {
            phone_otp,
            // otpExpireTime: new Date(
            //   new Date().setMinutes(new Date().getMinutes() + 10)
            // ),
          }
        );
        return res.status(200).json(new apiResponse(200, `OTP has been sent to this phone number ${phoneNumber}`, {}, {}));
      } else
        return res
          .status(501)
          .json(new apiResponse(501, `Error in send OTP to phone number`, {}, `${response}`));
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new apiResponse(500, "Internal Server Error", {}, {}));
  }
};

export const update_profile = async (req: Request, res: Response) => {
  reqInfo(req);
  let user: any = req.header("user"),
    body: any = req.body;
  try {
    let response = await userModel.findOneAndUpdate(
      { _id: ObjectId(user._id), isActive: true },
      body
    );
    if (
      body?.image != response?.image &&
      response.image != null &&
      body?.image != null &&
      body?.image != undefined
    ) {
      let [folder_name, image_name] = await URL_decode(response?.image);
      await deleteImage(image_name, folder_name);
    }
    if (response)
      return res
        .status(200)
        .json(new apiResponse(200, "User profile update successfully", {}, {}));
    else
      return res
        .status(501)
        .json(
          new apiResponse(501, "User profile update database error", {}, {})
        );
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new apiResponse(500, "Internal Server Error", {}, {}));
  }
};

export const get_profile = async (req: Request, res: Response) => {
  reqInfo(req);
  let user: any = req.header("user");
  try {
    let response = await userModel
      .findOne({ _id: ObjectId(user._id), isActive: true })
      .select("image _id email name userType");
    if (response)
      return res
        .status(200)
        .json(
          new apiResponse(200, "User get profile successfully", response, {})
        );
    else
      return res
        .status(501)
        .json(new apiResponse(501, "User get profile  database error", {}, {}));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new apiResponse(500, "Internal Server Error", {}, {}));
  }
};

export const change_password = async (req: Request, res: Response) => {
  reqInfo(req);
  let user: any = req.header("user"),
    { old_password, new_password } = req.body,
    authToken: any;
  try {
    let user_data = await userModel
      .findOne({ _id: ObjectId(user._id), isActive: true })
      .select("password");

    const passwordMatch = await bcryptjs.compare(
      old_password,
      user_data.password
    );
    if (!passwordMatch)
      return res
        .status(400)
        .json(new apiResponse(400, "Old password is wrong", {}, {}));

    const salt = await bcryptjs.genSaltSync(10);
    const hashPassword = await bcryptjs.hash(new_password, salt);
    for (let flag = 0; flag < 1;) {
      authToken = await Math.round(Math.random() * 1000000);
      if (authToken.toString().length == 6) {
        flag++;
      }
    }
    let response = await userModel.findOneAndUpdate(
      { _id: ObjectId(user._id), isActive: true },
      { password: hashPassword, authToken }
    );
    if (response)
      return res
        .status(200)
        .json(new apiResponse(200, "Password has been changed", {}, {}));
    else
      return res
        .status(501)
        .json(
          new apiResponse(
            501,
            "During password changing error in database",
            {},
            {}
          )
        );
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new apiResponse(500, "Internal Server Error", {}, {}));
  }
};

export const generate_token = async (req: Request, res: Response) => {
  let { old_token, refresh_token } = req.body;
  reqInfo(req);
  try {
    let isVerifyToken = jwt.verify(old_token, jwt_token_secret);
    let refreshTokenVerify = jwt.verify(
      refresh_token,
      refresh_jwt_token_secret
    );
    if (refreshTokenVerify._id != isVerifyToken._id)
      return res
        .status(403)
        .json(
          new apiResponse(403, "Invalid old_token or refresh_token", {}, {})
        );

    let response = await userSessionModel.findOneAndUpdate(
      { createdBy: ObjectId(isVerifyToken._id), refresh_token, isActive: true },
      { isActive: false }
    );
    if (response == null)
      return res
        .status(404)
        .json(new apiResponse(404, "Refresh_token not found", {}, {}));
    const token = jwt.sign(
      {
        _id: isVerifyToken._id,
        authToken: isVerifyToken.authToken,
        type: isVerifyToken.userType,
        status: "Generate Token",
        generatedOn: new Date().getTime(),
      },
      jwt_token_secret
    );
    refresh_token = jwt.sign(
      {
        _id: response._id,
        generatedOn: new Date().getTime(),
      },
      refresh_jwt_token_secret
    );
    await new userSessionModel({
      createdBy: response._id,
      refresh_token,
    }).save();
    response = {
      token,
      refresh_token,
    };
    return res
      .status(200)
      .json(
        new apiResponse(200, "New token successfully generate", response, {})
      );
  } catch (error) {
    console.log(error.message);
    if (error.message == "Invalid signature")
      return res
        .status(403)
        .json(new apiResponse(403, `Don't try different one token`, {}, {}));
    if (error.message == "jwt malformed")
      return res
        .status(403)
        .json(new apiResponse(403, `Don't try different one token`, {}, {}));
    if (error.message === "jwt must be provided")
      return res
        .status(403)
        .json(new apiResponse(403, `Token not found in header`, {}, {}));
    return res
      .status(500)
      .json(new apiResponse(500, "Internal Server Error", {}, error));
  }
};

export const logout = async (req: Request, res: Response) => {
  reqInfo(req);
  try {
    if (parseInt(req.headers?.userType as string) == userStatus.school) {
      //userType: req.headers?.userType
      await schoolModel.findOneAndUpdate(
        { _id: ObjectId((req.header("user") as any)?._id), isActive: true },
        { $pull: { deviceToken: req.body?.deviceToken } }
      );
      return res
        .status(200)
        .json(new apiResponse(200, "Successfully logout", {}, {}));
    } else {
      await userModel.findOneAndUpdate(
        { _id: ObjectId((req.header("user") as any)?._id), isActive: true },
        { $pull: { deviceToken: req.body?.deviceToken } }
      );
      return res
        .status(200)
        .json(new apiResponse(200, "Successfully logout", {}, {}));
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new apiResponse(500, "Internal Server Error", {}, error));
  }
};

export const student_teacher_login = async (req: Request, res: Response) => {
  let body = req.body,
    response: any,
    otpFlag = 1,
    authToken = 0,
    phone_otp = 0;
  reqInfo(req);
  try {
    response = await userModel.findOne({ email: body.email, isActive: true, $or: [{ userType: userStatus.teacher }, { userType: userStatus.student }, { userType: userStatus.faculty }] }).select("-__v -createdAt -updatedAt");

    if (!response) return res.status(400).json(new apiResponse(400, "Email address doesn't exist!", {}, {}));
    if (response.isEmailVerified == false) {
      let userData = await userModel.findOne({ isActive: true, email: body.email, isEmailVerified: false }, { otpScreen: 1 });
      // let otpScreen = true;
      while (otpFlag == 1) {
        for (let flag = 0; flag < 1;) {
          authToken = await Math.round(Math.random() * 1000000);
          if (authToken.toString().length == 6) {
            flag++;
          }
        }
        let isAlreadyAssign = await userModel.findOne({ otp: authToken });
        if (isAlreadyAssign?.otp != authToken) otpFlag = 0;
      }

      // body.otpScreen = false;
      body.authToken = authToken;
      body.otp = authToken;
      // body.otpExpireTime = new Date(
      //   new Date().setMinutes(new Date().getMinutes() + 10)
      // );
      let update_data = await userModel.findOneAndUpdate({ email: body.email, isActive: true }, { authToken: body.authToken, otp: body.otp, otpScreen: body.otpScreen, });
      await email_verification_mail(update_data, authToken);
      return res.status(200).json(new apiResponse(200, `Email is already registered. please verify your email address! \n OTP is send to this email address.`, userData, {}));
      // return res
      //   .status(502)
      //   .json(new apiResponse(502, "Email is unverified.", userData, {}));
    }
    if (response.isPhoneVerified == false) {
      let userData = await userModel.findOne({ isActive: true, email: body.email, isPhoneVerified: false }, { phone_otpScreen: 1 });
      // let otpScreen = true;
      while (otpFlag == 1) {
        for (let flag = 0; flag < 1;) {
          authToken = await Math.round(Math.random() * 1000000);
          if (authToken.toString().length == 6) {
            flag++;
          }
        }
        let isAlreadyAssign = await userModel.findOne({ phone_otp: authToken });
        if (isAlreadyAssign?.phone_otp != authToken) otpFlag = 0;
      }

      // body.otpScreen = false;
      body.phone_otp = authToken;
      // body.otpExpireTime = new Date(
      //   new Date().setMinutes(new Date().getMinutes() + 10)
      // );
      let update_data = await userModel.findOneAndUpdate({ email: body.email, isActive: true }, { phone_otp: body.phone_otp, phone_otpScreen: body.phone_otpScreen, });
      if (update_data) {
        // await axios.post(`${SMS?.URL}`, {
        //   "recipients": [
        //     `${update_data?.countryCode}${update_data?.phoneNumber}`
        //   ],
        //   "msgText": SMS_message?.OTP_verification + `${phone_otp}`,
        //   "smsSender": SMS?.smsSender,
        //   "userName": SMS?.userName,
        //   "appKey": SMS?.appKey
        // })
        if (update_data?.phoneNumber == null) {
          return res.status(200).json(new apiResponse(200, "", { _id: update_data._id, isPhoneNumber: false }, {}))
        }
        if (update_data?.phoneNumber[0] == 0) {
          update_data.phoneNumber = update_data.phoneNumber.substring(1)
        }
        await axios.post(`${SMS?.URL}`, JSON.stringify({
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
        return res.status(200).json(new apiResponse(200, `Phone number is already registered. please verify your phone number! \n OTP is sended to this phone number.`, userData, {}));
      }
    }
    if (response?.isBlock == true)
      return res
        .status(403)
        .json(new apiResponse(403, "Your account han been blocked.", {}, {}));

    const passwordMatch = await bcryptjs.compare(
      body.password,
      response.password
    );
    if (!passwordMatch)
      return res
        .status(400)
        .json(new apiResponse(400, "Password is wrong", {}, {}));
    const token = jwt.sign(
      {
        _id: response._id,
        authToken: response.authToken,
        type: response.userType,
        status: "Login",
        generatedOn: new Date().getTime(),
      },
      jwt_token_secret
    );
    const refresh_token = jwt.sign(
      {
        _id: response._id,
        generatedOn: new Date().getTime(),
      },
      refresh_jwt_token_secret
    );
    await new userSessionModel({
      createdBy: response._id,
      refresh_token,
    }).save();
    response = {
      id: response._id,
      username: response.username,
      name: response.name,
      email: response.email,
      image: response.image,
      userType: response.userType,
      isEmailVerified: response.isEmailVerified,
      isPhoneVerified: response.isPhoneVerified,
      token,
      refresh_token,
    };
    return res
      .status(200)
      .json(new apiResponse(200, "Login successfully", response, {}));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new apiResponse(500, "Internal Server Error", {}, error));
  }
};

export const verify = async (req: Request, res: Response) => {
  reqInfo(req);
  let body = req.body,
    otpFlag = 1, // OTP has already assign or not for cross-verification
    phone_otp = 0, authToken = 0;
  try {
    let filterArray: any = []
    if (body?.email)
      filterArray.push({ email: body?.email })
    if (body?.phoneNumber)
      filterArray.push({ phoneNumber: body?.phoneNumber })
    let userData = await userModel.findOne({ $and: [{ $or: filterArray }, { isActive: true }] })
    // let userData = await userModel.findOne({ $and: [{ $or: [{ ...(body?.email) && { email: body?.email } }, { ...(body?.phoneNumber) && { phoneNumber: body?.phoneNumber } }] }, { isActive: true }] })

    if (userData) {
      if (userData?.email == body?.email) return res.status(409).json(new apiResponse(409, 'Email already registered.', {}, {}))
      if (userData?.phoneNumber == body?.phoneNumber) return res.status(409).json(new apiResponse(409, 'PhoneNumber already registered.', {}, {}))
    }
    let otpScreen = true;
    while (otpFlag == 1) {
      for (let flag = 0; flag < 1;) {
        authToken = await Math.round(Math.random() * 1000000);
        if (authToken.toString().length == 6) {
          flag++;
        }
      }
      let isAlreadyAssign = await userModel.findOne({ otp: authToken });
      if (isAlreadyAssign?.otp != authToken) otpFlag = 0;
    }
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
    body.otpScreen = false;
    body.otp = authToken;
    body.phone_otp = phone_otp;
    // body.otpExpireTime = new Date(
    //   new Date().setMinutes(new Date().getMinutes() + 10)
    // );
    let update_data: any = await userModel.findOneAndUpdate(
      { _id: ObjectId(body.id), isActive: true },
      {
        otp: body.otp, otpScreen: body.otpScreen,
        ...(body?.email) && { email: body.email }, ...(body?.phoneNumber) && { phoneNumber: body.phoneNumber },
        ...(body?.phone_otp) && { phone_otp: body?.phone_otp }, countryCode: body.countryCode
      }, { new: true }
    );

    if (update_data) {
      if (body?.phoneNumber) {
        if (update_data?.phoneNumber[0] == 0) {
          update_data.phoneNumber = update_data.phoneNumber.substring(1)
        }
        let result = await axios.post(`${SMS?.URL}`, JSON.stringify({
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
      }
      if (body?.email) {
        await email_verification_mail(update_data, authToken);
      }
      return res.status(200).json(new apiResponse(200, "Verify your account!", { otpScreen: otpScreen }, {}));
    }
    else {
      console.log("Error");
      return res.status(500).json(new apiResponse(500, 'Something went wrong!', {}, {}))
    }

  } catch (error) {
    console.log(error);
    return res.status(500).json(new apiResponse(500, "Internal Server Error", {}, error));
  }
};

export const email_verify = async (req: Request, res: Response) => {
  reqInfo(req);
  let body = req.body,
    otpFlag = 1, // OTP has already assign or not for cross-verification
    authToken = 0;
  try {
    let otpScreen = true;
    while (otpFlag == 1) {
      for (let flag = 0; flag < 1;) {
        authToken = await Math.round(Math.random() * 1000000);
        if (authToken.toString().length == 6) {
          flag++;
        }
      }
      let isAlreadyAssign = await userModel.findOne({ otp: authToken });
      if (isAlreadyAssign?.otp != authToken) otpFlag = 0;
    }
    body.authToken = authToken;
    body.otpScreen = false;
    body.otp = authToken;
    // body.otpExpireTime = new Date(
    //   new Date().setMinutes(new Date().getMinutes() + 10)
    // );
    let update_data: any = await userModel.findOneAndUpdate(
      { _id: ObjectId(body.id), isActive: true },
      {
        otpScreen: body.otpScreen, otp: body.authToken, email: body.email,
      }, { new: true }
    );
    if (update_data) {
      await email_verification_mail(update_data, body.authToken);
      return res.status(200).json(new apiResponse(200, "Verify email!", { otpScreen: otpScreen }, {}));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(new apiResponse(500, "Internal Server Error", {}, error));
  }
};