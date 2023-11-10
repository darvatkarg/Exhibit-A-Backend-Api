"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { reminderModel } from '../../database'
import { apiResponse } from '../../common'
import config from 'config'
import { Request, Response } from 'express'
const CronJob = require('cron').CronJob


const ObjectId = require('mongoose').Types.ObjectId

export const add_reminder = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        user: any = req.header('user')
    body.createdBy = user._id
    try {
        let response = await new reminderModel(body).save()

        // let cronTime = response.DateTime,
        //     onTick = function () {
        //         console.log('Done at: ', new Date().toString());

        //     },
        //     onComplete = null,
        //     start = true,
        //     timeZone = 'Asia/Kolkata'
        // new CronJob(cronTime, onTick, onComplete, start, timeZone)

        if (response) return res.status(200).json(new apiResponse(200, 'Reminder set', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error', {}, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, "Internal Server Error", {}, error))
    }
}

export const get_reminder = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await reminderModel.findOne({ createdBy: ObjectId((req.header('user') as any)?._id), isActive: true }, { DateTime: 1, weekDay: 1, bookId: 1 })
        // console.log(response?.DateTime);

        // const someDate = new Date(response?.DateTime.toString())
        // schedule.scheduleJob(someDate, () => {
        //     console.log("job run at ", new Date().toString());
        //     return res.status(200).json(new apiResponse(200, 'Get Reminder set', response, {}))
        // })
        if (response) return res.status(200).json(new apiResponse(200, 'Get Reminder set', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error', {}, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, "Internal Server Error", {}, error))
    }
}

export const update_reminder = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        user: any = req.header('user')
    body.updatedBy = user._id
    try {
        let response = await reminderModel.findOneAndUpdate({ _id: ObjectId(body.id), isActive: true }, body)
        if (response) return res.status(200).json(new apiResponse(200, 'Updated Reminder set', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error', {}, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, "Internal Server Error", {}, error))
    }
}

export const delete_reminder = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        user: any = req.header('user')
    body.updatedBy = user._id
    try {
        let response = await reminderModel.findOneAndUpdate({ _id: ObjectId(req.params.id), isActive: true }, { isActive: false, updatedBy: ObjectId((req.header('user') as any)?._id) })
        if (response) return res.status(200).json(new apiResponse(200, 'deleted Reminder set', {}, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error', {}, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, "Internal Server Error", {}, error))
    }
}

export const get_by_id_reminder = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    try {
        let response = await reminderModel.findOne({ _id: ObjectId(body._id), createdBy: ObjectId((req.header('user') as any)?._id), isActive: true }, { DateTime: 1, weekDay: 1, repeat: 1 })
        // console.log(response?.DateTime);

        // const someDate = new Date(response?.DateTime.toString())
        // schedule.scheduleJob(someDate, () => {
        //     console.log("job run at ", new Date().toString());
        //     return res.status(200).json(new apiResponse(200, 'Get Reminder set', response, {}))
        // })
        if (response) return res.status(200).json(new apiResponse(200, 'Get Reminder', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error', {}, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, "Internal Server Error", {}, error))
    }
}