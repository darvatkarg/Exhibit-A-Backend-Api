import { Router } from 'express'
import { userJWT } from '../helpers/jwt'
import { teacherController, adminController, authenticationController, schoolController } from '../controllers'
import { userValidation, adminValidation, teacherValidation, main_categoryValidation, categoryValidation, sub_categoryValidation, bookValidation, schoolValidation } from '../validation'

const router = Router()

router.post('/login', userValidation.login, authenticationController.login)
router.post('/otp_verification', userValidation.otp_verification, schoolController.otp_verification)
router.post('/reset_password', userValidation.reset_password, schoolController.reset_password)
router.post('/resend_otp', userValidation.resend_otp, authenticationController.resend_otp)
router.post('/forgot_password', userValidation.forgot_password, schoolController.forgot_password)

//  ------   Authentication ------  
router.use(userJWT)

router.post('/logout', authenticationController.logout)

router.get('/', schoolController.get_profile)
router.put('/profile', schoolValidation.update_profile, schoolController.update_profile)
//router.post('/change_password', userValidation.change_password, schoolController.change_password)

//  ------   Student Routes  ------
router.get('/student', schoolController.get_student)

//  -----   teacher Routes   --------
router.get('/teacher', schoolController.get_teacher)
router.post('/teacher/add', teacherValidation.add, schoolController.add_teacher)
router.put('/teacher/update', teacherValidation.update, schoolController.update_teacher)
router.get('/teacher/:id', teacherValidation.by_id, schoolController.by_id_teacher)
router.delete('/teacher/delete/:id', teacherValidation.by_id, schoolController.delete_teacher)



export const schoolRouter = router