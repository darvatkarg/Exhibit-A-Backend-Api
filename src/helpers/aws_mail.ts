"use strict"
import config from 'config'
import moment from 'moment-timezone'
import AWS from 'aws-sdk'
import nodemailer from 'nodemailer'
const timeZone: any = config.get('timeZone')
const aws: any = config.get("aws")
AWS.config.update({
    accessKeyId: aws.new_accessKeyId,
    secretAccessKey: aws.new_secretAccessKey,
    region: aws.region
})
const ses = new AWS.SES()

// export const forgot_password_mail = (user, otp) => {
//     return new Promise(async (resolve, reject) => {
//         var params = {
//             Destination: {
//                 ToAddresses: [user.email]
//             },
//             Message: {
//                 Body: {
//                     Html: {
//                         Charset: "UTF-8",
//                         Data: `<html lang="en-US">

//                         <head>
//                             <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
//                             <title>Reset Password Email Template</title>
//                             <meta name="description" content="Reset Password Email Template.">
//                             <style type="text/css">
//                                 a:hover {
//                                     text-decoration: underline !important;
//                                 }
//                             </style>
//                         </head>

//                         <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
//                             <!--100% body table-->
//                             <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
//                                 style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
//                                 <tr>
//                                     <td>
//                                         <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0"
//                                             align="center" cellpadding="0" cellspacing="0">
//                                             <tr>
//                                                 <td style="height:80px;">&nbsp;</td>
//                                             </tr>
//                                             <tr>
//                                                 <td style="text-align:center;">
//                                                         <img  width="250px" height="130px" title="logo" alt="logo">
//                                                     </a>
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td style="height:20px;">&nbsp;</td>
//                                             </tr>
//                                             <tr>
//                                                 <td>
//                                                     <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
//                                                         style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
//                                                         <tr>
//                                                             <td style="height:40px;">&nbsp;</td>
//                                                         </tr>
//                                                         <tr>
//                                                             <td style="padding:0 35px;">
//                                                                 <h1
//                                                                     style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">
//                                                                     Exhibit forgot password</h1>
//                                                                 <span
//                                                                     style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
//                                                                 <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
//                                                                     Hi ${user.name}
//                                                                     <br>
//                                                                     Someone, hopefully you, has requested to reset the password for your
//                                                                    Exhibit account.
//                                                                     <br>
//                                                                     OTP will expire in 10 minutes.
//                                                                     <br>
//                                                                     Verification code: ${otp}
//                                                                     <br>
//                                                                     <br>
//                                                                     Thanks,
//                                                                     <br>
//                                                                    Exhibit
//                                                                 </p>

//                                                             </td>
//                                                         </tr>
//                                                         <tr>
//                                                             <td style="height:40px;">&nbsp;</td>
//                                                         </tr>
//                                                     </table>
//                                                 </td>
//                                             <tr>
//                                                 <td style="height:20px;">&nbsp;</td>
//                                             </tr>
//                                             <tr>
//                                                 <td style="text-align:center;">
//                                                     <strong>www.Exhibit.com</strong></p>
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td style="height:80px;">&nbsp;</td>
//                                             </tr>
//                                         </table>
//                                     </td>
//                                 </tr>
//                             </table>
//                             <!--/100% body table-->
//                         </body>

//                         </html>
//                          `
//                     }
//                 },
//                 Subject: {
//                     Charset: "UTF-8",
//                     Data: "Forgot password"
//                 }
//             },

//             Source: "Exhibit<no-replay@exhibit.com>",
//         };
//         ses.sendEmail(params, function (err, data) {
//             if (err) {
//                 reject(err)
//                 console.log(err, err.stack); // an error occurred
//             }
//             else {
//                 resolve(`Email has been sent to ${user.email}, kindly follow the instructions`)
//                 console.log(data);
//             }      // successful response
//         });
//     })
// }

