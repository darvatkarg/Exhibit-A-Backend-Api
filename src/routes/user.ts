import { Router } from 'express'
import { authenticationController, studentController } from '../controllers'
import { userJWT } from '../helpers/jwt'
import { userValidation } from '../validation'
const router = Router()

router.post('/signUp', userValidation.signUp, authenticationController.signUp)
router.get('/deleteUser', studentController.temp_delete_user)
router.get('/sms_testing', studentController.temp_testing_sms_v1)
router.get('/temp_testing_email_v1', studentController.temp_testing_email_v1)
router.get('/temp_testing_email', studentController.temp_testing_email)
router.get('/export_csv', studentController.export_csv)
router.get('/export_excel', studentController.export_excel)
router.get('/find_duplicate_data', studentController.find_duplicate_data)
router.get('/addNewField', studentController.addNewField)
router.get('/user_form', studentController.user_form_download)
router.get('/user_profile', studentController.user_profile_image_download)

//  ------   Authentication ------  
router.use(userJWT)

//sub Admin
router.post('/add')

export const userRouter = router
