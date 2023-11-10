import { Request, Router, Response } from 'express'
import { userStatus } from '../common'
import { userRouter } from './user'
import { adminRouter } from './admin'
import { teacherRouter } from './teacher'
import { sub_adminRouter } from './sub_admin'
import { schoolRouter } from './school'
import { uploadValidation } from '../validation'
import { compress_image, image_compress_response, uploadS3 } from '../helpers/S3'
import { userJWT } from '../helpers/jwt'
import { studentRouter } from './student'
import { auditorRouter } from './auditor'
import { facultyRouter } from './faculty'

const router = Router()
const accessControl = (req: Request, res: Response, next: any) => {
    req.headers.userType = userStatus[req.originalUrl.split('/')[1]]
    next()
}

router.use('/user', accessControl, userRouter)
router.use('/admin', accessControl, adminRouter)
router.use('/teacher', accessControl, teacherRouter)
router.use('/faculty', accessControl, facultyRouter)
router.use('/sub_admin', accessControl, sub_adminRouter)
router.use('/school', accessControl, schoolRouter)
router.use('/student', accessControl, studentRouter)
router.use('/auditor', accessControl, auditorRouter)
router.post('/upload/:file', accessControl, userJWT, uploadValidation.file_type, compress_image.single('image'), image_compress_response)
router.post('/upload/file_upload/:file', accessControl, userJWT, uploadValidation.file_type, uploadS3.single('file'), image_compress_response)

export { router }