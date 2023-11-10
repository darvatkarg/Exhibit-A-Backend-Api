import { Router } from 'express'
import { userJWT, partial_userJWT, deleteJWT } from '../helpers/jwt'
import { authenticationController, studentController, teacherController, adminController } from '../controllers'
import {
    userValidation, studentValidation, downloadValidation, topicValidation, contact_usValidation, contentValidation, mcq_answerValidation,
    theory_questionValidation, videoTrainingLogValidation, wishlistValidation, reminderValidation, teacherValidation, resultValidation, course_subjectValidation,
    feedbackValidation, libraryValidation, favoriteValidation, cardValidation, orderValidation, bookValidation, training_optionValidation, schedule_timeSlotValidation, question_bankValidation, formValidation, time_slotValidation, reviewAnswerValidation, feedbackAnswerValidation
} from '../validation'

const router = Router()

router.post('/signUp', userValidation.signUp, authenticationController.signUp)
router.post('/login', userValidation.login, authenticationController.login)
router.post('/otp_verification', userValidation.otp_verification, authenticationController.otp_verification)
router.post('/reset_password', userValidation.reset_password, authenticationController.reset_password)
router.post('/resend_otp', authenticationController.resend_otp)
router.post('/forgot_password', userValidation.forgot_password, authenticationController.forgot_password)
router.post('/verify', userValidation.verify, authenticationController.verify)
router.post('/google', studentController.google_SL)
router.post('/facebook', studentController.facebook_SL)
router.get('/testing_msg', studentController.temp_testing_msg)
router.get('/testing_email', studentController.temp_testing_email_v1)
router.get('/temp_testing_v1', studentController.temp_testing_v1)
router.delete('/deleteAccount', deleteJWT, studentController.delete_account)
router.post('/common_login', userValidation.login, authenticationController.student_teacher_login)

//  ------   test   ------
router.get('/exam_not_given_user', studentController?.not_given_exam_user_list)
router.get('/export_certified_teacher', studentController?.export_certified_teacher)

//  ------   country state city   ------
router.get('/get_country', studentController.get_country)
router.post('/get_country_state_city', studentController.get_country_state_city)

// --------  school dropdown -----------
router.get('/get_school_data', studentController.get_school_dropdown)

//  ------  Partial Authentication ------  
router.use(partial_userJWT)

//  ------  Dashboard Routes  ------
router.post('/home', teacherController.home_page)

//  ------   Main Category Routes  ------  
router.get('/main_category', adminController.get_main_category)
router.post('/main_category/get_main_category', adminController.get_filter_main_category)

//  ------   Category Routes  ------
router.get('/category', adminController.get_all_category)
router.post('/category/get_category', adminController.get_filter_category)

//  ------   sub Category Routes  ------
router.get('/sub_category', adminController.get_sub_category)
router.post('/sub_category/get_sub_category', adminController.get_filter_sub_category)

//  ------   Genre Routes  ------
router.get('/genre', adminController.get_genre)
router.post('/genre/get_genre', adminController.get_filter_genre)

//  ------   Book Routes  ------
router.get('/book', adminController.get_book)
router.post('/book/get_book', adminController.get_filter_book)
router.post('/book/get_free_book', adminController.get_filter_free_book)
router.post('/book/get_paid_book', adminController.get_filter_paid_book)
router.post('/book/get_popular_book', adminController.get_filter_popular_book)
router.post('/book/get_recommend_book', adminController.get_recommend_book)
router.post('/book/get_similar_book', adminController.get_similar_book)
router.get('/book/:id', bookValidation.by_id, adminController.by_id_book)
router.post('/book/detail/:id', teacherValidation.by_id, adminController.book_details)

//  ------   Contact Us Routes  ------
router.get('/contact_us', teacherController.get_contact_us)
router.post('/contact_us/add', contact_usValidation.add, teacherController.add_contact_us)
router.post('/contact_us/response', contact_usValidation.response, teacherController.get_response)

//  ------   Subject Routes  ------
router.get('/course_subject', adminController.get_subject)
router.get('/course_subject/:id', course_subjectValidation.by_id, adminController.get_subject_by_id)
router.get('/course_subject/content/:id', course_subjectValidation.by_id, adminController.get_content_by_subject_id)
router.get('/course_subject/video/:id', course_subjectValidation.by_id, adminController.get_content_by_subject_id_for_video)

//  ------   Content Routes  ------
router.get('/content', adminController.get_content)
router.get('/content/:id', contentValidation.by_id, adminController.get_by_content)

//  ------   Training Option Router ------
router.get('/training_type/list', adminController.get_training_type)

//  ------- Topic -------
router.get('/topic', adminController.get_topic)
router.get('/topic/mcq', adminController.get_mcq_que)
router.get('/topic/theory', adminController.get_theory_que)
router.get('/topic/:id', topicValidation.by_id, adminController.get_topic_by_id)

//  ------   Authentication ------  
router.use(userJWT)

router.post('/logout', authenticationController.logout)
router.get('/', studentController.get_profile)
router.put('/profile', studentValidation.update_profile, studentController.update_profile)
router.post('/change_password', userValidation.change_password, authenticationController.change_password)

//  ------   feedback Routes  ------
router.get('/feedback', teacherController.get_feedback)
router.post('/feedback/add', feedbackValidation.add_feedback, teacherController.feedback)
router.put('/feedback/update', feedbackValidation.update_feedback, teacherController.update_feedback)
router.get('/feedback/:id', feedbackValidation.by_id, teacherController.by_id_feedback)
router.delete('/feedback/delete/:id', feedbackValidation.by_id, teacherController.delete_feedback)

//  ------  Free Book Download Routes  ------
router.get('/download/history', teacherController.download_history)
router.post('/download/add/:id', downloadValidation.by_id, teacherController.download_free)

//  ------   library History Routes  ------
router.get('/library', teacherController.get_library)
router.post('/library/add', libraryValidation.add, teacherController.add_library)
router.post('/library/books', teacherController.get_filter_library)
router.get('/library/getlibrarybook', teacherController.get_filter_library_book)
router.delete('/library/delete/:id', libraryValidation.by_id, teacherController.delete_library)

//  ------   My library Routes  ------
router.post('/myLibrary', teacherController.my_library)

//  ------   Favorite Routes  ------
router.get('/favorite', teacherController.get_favorite)
router.post('/favorite/add', favoriteValidation.add, teacherController.add_favorite)
router.post('/favorite/books', teacherController.get_filter_favorite)
router.delete('/favorite/delete/:id', favoriteValidation.by_id, teacherController.delete_favorite)

//  ------   wishlist Routes  ------
router.get('/wishlist', teacherController.get_wishlist)
router.post('/wishlist/add', wishlistValidation.add, teacherController.add_wishlist)
router.get('/wishlist/:id', wishlistValidation.by_id, teacherController.by_id_wishlist)
router.delete('/wishlist/delete/:id', wishlistValidation.by_id, teacherController.delete_wishlist)

//  ------   Card Routes  ------
router.get('/card', teacherController.get_card)
router.post('/card/add', cardValidation.add, teacherController.add_card)
router.put('/card/update', cardValidation.update, teacherController.update_card)
router.get('/card/:id', cardValidation.by_id, teacherController.get_by_id_card)
router.delete('/card/delete/:id', cardValidation.by_id, teacherController.delete_card)

//  ------   Order Routes  ------
router.get('/order', teacherController.get_order)
router.post('/order/add', orderValidation.add, teacherController.add_order)
router.delete('/order/delete/:id', orderValidation.by_id, teacherController.delete_order)

//  ------   Payment Routes  ------
router.get('/payment', teacherController.payment)

//  ------   Result Router ------
router.get('/result', studentController.get_computer_result)
router.post('/result/add', resultValidation.add, studentController.add_result)
router.get('/result/subject/:id', course_subjectValidation.by_id, studentController.get_subject_result)
router.get('/result/sub/:id', course_subjectValidation.by_id, studentController.get_sub_result)
router.get('/result/certificate/:id', course_subjectValidation.by_id, studentController.download_certificate)

//  ------   Question Bank Routes  ------
router.get('/question_bank', adminController.get_question_bank)
router.post('/question_bank/get_question', adminController.get_filter_question_bank)
router.get('/question_bank/:id', question_bankValidation.by_id, adminController.get_by_id_question_bank)
// router.get('/question_bank/subject/:id', question_bankValidation.by_id, adminController.get_by_subject)
router.get('/question_bank/subject/:id', question_bankValidation.by_id, studentController.get_computer_answer)

//------ Test Answer Router------
router.get('/answer', studentController.get_question_answered)
router.post('/answer/add', mcq_answerValidation.add, studentController.add_answer)
router.put('/answer/update', mcq_answerValidation.update, studentController.update_answer)
router.post('/answer/get_question', adminController.get_filter_question_bank)
router.delete('/answer/delete/:id', mcq_answerValidation.by_id, studentController.delete_answer)
router.get('/answer/question/:id', mcq_answerValidation.by_id, studentController.by_id_answer)
router.get('/answer/subject/:id', mcq_answerValidation.by_id, studentController.get_question_answered)

//------ Test result Router------
router.post('/exam/start', resultValidation.start, studentController.start_exam)


//  ------   Theory Test Answer Router ------
router.get('/theory_question/answer/:id', theory_questionValidation.by_id, studentController.get_theory_ans)
router.get('/theory_question/question/:id', theory_questionValidation.by_id, studentController.get_theory)

//  ------   Training Option Router ------
router.get('/training_option', studentController.get_training)
router.get('/training_option/list', studentController.get_type)
router.post('/training_option/add', training_optionValidation.add, studentController.add_training)
router.put('/training_option/update', training_optionValidation.update, studentController.update_training)
router.get('/training_option/subject/:id', training_optionValidation.by_id, studentController.by_id_subject)
router.get('/training_type/subject/:id', adminController.get_training_type_by_course_subject)

//  ------   Schedule Time Slot Router ------
// router.get('/schedule_timeSlot', studentController.get__slot)
// router.post('/schedule_timeSlot/add', schedule_timeSlotValidation.add, studentController.add_slot)
// router.get('/schedule_timeSlot/subject/:id', schedule_timeSlotValidation.by_id, studentController.get_slot_subjectId)

//  ------   Test History Routes  ------
router.get('/test_history', studentController.test_history)

//  ------   reminder Routes  ------
router.get('/reminder', studentController.get_reminder)
router.post('/reminder/add', reminderValidation.add, studentController.add_reminder)
router.put('/reminder/update', reminderValidation.update, studentController.update_reminder)
router.delete('/reminder/delete/:id', reminderValidation.by_id, studentController.delete_reminder)

//  ------   Slot Routes  ------
router.get('/time_slot', adminController.get_slot)
router.get('/time_slot/subject/:id', time_slotValidation.by_id, adminController.get_slot_by_scbject)

//  ------   form Routes  ------
router.get('/form', studentController.get_form)
router.post('/form/add', formValidation.add_form, studentController.add_form)
router.get('/form/:id', formValidation.by_id, studentController.get_by_id)
router.get('/form/subject/:id', formValidation.by_id, studentController.get_by_subject_id)

//  ------- Video Training Logs Routes -----------
router.get('/video_training_log/:id', videoTrainingLogValidation.by_id, studentController.get_video_training)
router.post('/video_training_log/add', videoTrainingLogValidation.add, studentController.add_video_training_log)

//  ------- User Batch Time Date Routes  --------
router.get('/user_batch/subject/:id', studentController.get_batch_date_time)

//  ------- MCQ Question Topic Wise  --------
router.get('/mcq_question/topic/:id', topicValidation.by_id, studentController.get_mcq_question);

//  ------- Theory Question Topic Wise  --------
router.get('/theory_question/topic/:id', topicValidation.by_id, studentController.get_theory_question);

//  ------- Review Question Topic Wise  --------
router.get('/review_question', studentController.get_review_Question);
router.post('/review_answer/add', reviewAnswerValidation.add, studentController.add_review_answer);

//  ------- feedback Question Topic Wise  --------
router.get('/feedback_question', studentController.get_feedback_Question);
router.post('/feedback_answer/add', feedbackAnswerValidation.add, studentController.add_feedback_answer);
router.put('/feedback_answer/update', feedbackAnswerValidation.update, studentController.update_feedback_answer);

//  ------- OTP verification during exam  --------
router.post('/send_otp_during_exam', studentController.send_otp_during_exam);
router.post('/otp_verification_during_exam', studentController.otp_verification_during_exam);

export const studentRouter = router