import { Router } from 'express'
import { partial_userJWT, userJWT } from '../helpers/jwt'
import { teacherController, adminController, authenticationController } from '../controllers'
import {
    userValidation, cardValidation, teacherValidation, main_categoryValidation,
    downloadValidation, wishlistValidation, categoryValidation,
    libraryValidation,
    orderValidation,
    feedbackValidation,
    contact_usValidation,
    favoriteValidation,
    bookValidation
} from '../validation'

const router = Router()

router.post('/login', userValidation.login, authenticationController.login)
router.post('/otp_verification', userValidation.otp_verification, authenticationController.otp_verification)
router.post('/reset_password', userValidation.reset_password, authenticationController.reset_password)
router.post('/resend_otp', userValidation.resend_otp, authenticationController.resend_otp)
router.post('/forgot_password', userValidation.forgot_password, authenticationController.forgot_password)

router.post('/common_login', userValidation.login, authenticationController.student_teacher_login)


//  ------  Partial Authentication ------  
router.use(partial_userJWT)

//  ------  Home Routes  ------
router.post('/home', teacherController.home_page)
router.post('/filter', teacherController.filter)

//  ------ Required token Authentication ------  
router.use(userJWT)

router.post('/logout', authenticationController.logout)
router.get('/', teacherController.get_profile)
router.put('/profile', teacherValidation.update_profile, teacherController.update_profile)
router.post('/change_password', userValidation.change_password, authenticationController.change_password)

export const facultyRouter = router