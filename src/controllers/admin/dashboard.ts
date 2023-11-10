"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { bookModel, categoryModel, libraryModel, main_categoryModel, subCategoryModel, training_optionModel, userModel } from '../../database'
import { apiResponse, userStatus } from '../../common'
import { Request, Response } from 'express'
import { downloadModel } from '../../database/models/downloads'

const ObjectId = require('mongoose').Types.ObjectId

export const dashboard = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = req.header('user'),
        { year, week } = req.body
    try {
        const last_week = async (week) => {
            const currentDate = new Date()
            const weekDate = new Date()
            week = week * 7

            weekDate.setDate(weekDate.getDate() - week)
            return await downloadModel.aggregate([
                {
                    $match: {
                        isActive: true,
                        createdAt: { $gte: weekDate, $lte: currentDate }
                    }
                },
                {
                    $group: {
                        _id: { "weekly": { $substrCP: ["$createdAt", 5, 5] } },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { "_id.weekly": -1 }
                },
            ])
        }

        const week_download = async () => {
            const currentDate = new Date()
            const weekDate = new Date()
            week = 7
            weekDate.setDate(weekDate.getDate() - week)
            return await downloadModel.find({ isActive: true, createdAt: { $gte: weekDate, $lte: currentDate } }).countDocuments()

        }

        const today_records = async () => {
            const currentDate = new Date()
            // Set Previous 12 months
            currentDate.setHours(0, 0, 0, 0)
            return await downloadModel.countDocuments({ isActive: true, createdAt: { $gte: currentDate } })
        }

        const month_records = async () => {
            var makeDate = new Date();
            makeDate = new Date(makeDate.setMonth(makeDate.getMonth() - 1));
            return await downloadModel.countDocuments({ isActive: true, createdAt: { $gte: makeDate, $lte: new Date() } })
        }

        const teacher_reading = async () => {
            var library = await libraryModel.find({ isActive: true }, { createdBy: 1, _id: 0 })
            library.forEach(data => {
                let user = userModel.find({ _id: data, isActive: true, userType: userStatus.teacher })
            })

        }
        return res.status(200).json(new apiResponse(200, `Get admin dashboard successfully`, {
            users: await userModel.countDocuments({ isActive: true, isBlock: false, userType: userStatus.student }),
            books: await bookModel.countDocuments({ isActive: true }),
            main_category: await main_categoryModel.countDocuments({ isActive: true }),
            category: await categoryModel.countDocuments({ isActive: true }),
            sub_category: await subCategoryModel.countDocuments({ isActive: true }),
            recorded_count: await training_optionModel.countDocuments({ isActive: true, optionType: 0 }),
            live_count: await training_optionModel.countDocuments({ isActive: true, optionType: 1 }),
            physical_count: await training_optionModel.countDocuments({ isActive: true, optionType: 2 }),
            today_downloads: await today_records(),
            teacher: await teacher_reading(),
            //week: await last_week(1),
            week_downloads: await week_download(),
            month_downloads: await month_records()
        }, {}))
        console.log("1");

    } catch (error) {
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}