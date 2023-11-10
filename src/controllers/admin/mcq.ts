"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { testModel } from '../../database'
import { apiResponse, testType } from '../../common'
import { Request, Response } from 'express'

const ObjectId = require('mongoose').Types.ObjectId

export const add_mcq_test = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    req.body.createdBy = (req.header('user') as any)?._id
    try {
        let response = await new testModel(body).save()
        if (response) return res.status(200).json(new apiResponse(200, 'MCQ test is added', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while adding mcq test', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

// export const get_mcq = async (req: Request, res: Response) => {
//     reqInfo(req)
//     try {
//         let response = await testModel.find({ isActive: true, type: testType.mcq }, { number_question: 1, duration: 1, marks: 1, title: 1 })
//         if (response) return res.status(200).json(new apiResponse(200, ' get MCQ test successfully', response, {}))
//         else return res.status(400).json(new apiResponse(400, 'Database error while getting mcq test', {}, {}))

//     } catch (error) {
//         console.log(error);
//         return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
//     }
// }

export const get_by_mcq = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await testModel.findById({ _id: ObjectId(req.params.id), type: testType.mcq, isActive: true }, { type: 1, number_question: 1, duration: 1, marks: 1, title: 1 })
        if (response) return res.status(200).json(new apiResponse(200, 'Get mcq successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while getting mcq', {}, {}))

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const update_mcq = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        user: any = req.header('user')
    body.updatedBy = user._id
    try {
        let response = await testModel.findByIdAndUpdate({ _id: ObjectId(body.id), isActive: true }, body)
        if (response) return res.status(200).json(new apiResponse(200, 'Updated mcq test successfully', {}, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while updating mcq test', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const delete_mcq = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        user: any = req.header('user')
    body.updatedBy = user._id
    try {
        let response = await testModel.findByIdAndUpdate({ _id: ObjectId(req.params.id), isActive: true }, { isActive: false })
        if (response) return res.status(200).json(new apiResponse(200, 'Deleted mcq test successfully', {}, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while deleting mcq test', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const get_filter_mcq_test = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = req.header('user'),
        { _id, search, limit, page, ascending } = req.body,
        skip = 0,
        response: any = {},
        match: any = {},
        sort: any = {}
    limit = parseInt(limit)
    skip = ((parseInt(page) - 1) * parseInt(limit))
    try {
        // Database Filtering
        if (_id?.length != 0 && _id !== undefined) {
            _id.forEach(function (part, index, theArray) {
                theArray[index] = ObjectId(String(part))
            });
            match['_id'] = { "$in": _id }
        }
        if (search) {
            var titleArray: Array<any> = []
            search = search.split(" ")
            search.forEach(data => {
                titleArray.push({ title: { $regex: data, $options: 'si' } })

            })
            match.$or = [{ $and: titleArray }]
        }
        match.isActive = true
        match.type = testType.mcq
        // Sorting Database
        sort.createdAt = -1
        if (ascending) sort.createdAt = 1

        let mcqTest_data = await testModel.aggregate([
            { $match: match },
            {
                $facet: {
                    user: [
                        { $sort: sort },
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                _id: 1, title: 1, number_question: 1, duration: 1, marks: 1,
                            }
                        }
                    ],
                    mcqTest_count: [{ $count: "count" }]
                }
            }
        ])
        response.mcqTest_data = mcqTest_data[0].user || []
        response.state = {
            page, limit,
            page_limit: Math.ceil(mcqTest_data[0]?.mcqTest_count[0]?.count / limit)
        }
        res.status(200).json(new apiResponse(200, `Get mcq test successfully`, response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal Server error', {}, {}))
    }
}