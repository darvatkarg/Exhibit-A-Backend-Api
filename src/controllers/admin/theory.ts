"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { testModel } from '../../database'
import { apiResponse, testType } from '../../common'
import { Request, Response } from 'express'

const ObjectId = require('mongoose').Types.ObjectId

export const add_theory_test = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    req.body.createdBy = (req.header('user') as any)?._id
    try {
        let response = await new testModel(body).save()
        if (response) return res.status(200).json(new apiResponse(200, 'Theory test is added', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while adding theory test', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

// export const get_theory = async (req: Request, res: Response) => {
//     reqInfo(req)
//     let body = req.body
//     try {
//         let response = await testModel.find({ isActive: true, type: testType.theory }, { number_question: 1, duration: 1, marks: 1, title: 1 })
//         if (response) return res.status(200).json(new apiResponse(200, ' get theory test successfully', response, {}))
//         else return res.status(400).json(new apiResponse(400, 'database error getting theory test', {}, {}))

//     } catch (error) {
//         console.log(error);
//         return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
//     }
// }

export const get_by_theory = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    try {
        let response = await testModel.findById({ _id: ObjectId(req.params.id), type: testType.theory, isActive: true }, { number_question: 1, duration: 1, marks: 1, title: 1, type: 1 })
        if (response) return res.status(200).json(new apiResponse(200, 'Get theory test successfully', response, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while getting theory test', {}, {}))

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const update_theory = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        user: any = req.header('user')
    body.updatedBy = user._id
    try {
        let response = await testModel.findByIdAndUpdate({ _id: ObjectId(body.id), type: testType.theory, isActive: true }, body)
        if (response) return res.status(200).json(new apiResponse(200, 'Updated theory test successfully', {}, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while updating theory test', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const delete_theory = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        user: any = req.header('user')
    body.updatedBy = user._id
    try {
        let response = await testModel.findByIdAndUpdate({ _id: ObjectId(req.params.id), type: testType.theory, isActive: true }, { isActive: false })
        if (response) return res.status(200).json(new apiResponse(200, 'Delete theory test successfully', {}, {}))
        else return res.status(400).json(new apiResponse(400, 'Database error while deleting theory test', {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}

export const get_filter_theory_test = async (req: Request, res: Response) => {
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
        match.type = testType.theory
        // Sorting Database
        sort.createdAt = -1
        if (ascending) sort.createdAt = 1

        let theoryTest_data = await testModel.aggregate([
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
                    theoryTest_count: [{ $count: "count" }]
                }
            }
        ])
        response.theoryTest_data = theoryTest_data[0].user || []
        response.state = {
            page, limit,
            page_limit: Math.ceil(theoryTest_data[0]?.theoryTest_count[0]?.count / limit)
        }
        res.status(200).json(new apiResponse(200, `Get theory test successfully`, response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}, {}))
    }
}