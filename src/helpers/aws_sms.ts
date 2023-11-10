"use strict"
import config from 'config'
import AWS from 'aws-sdk'
import { SMS_message } from '../common'
const aws = (config.get('aws') as any)
AWS.config.update({
    accessKeyId: aws.accessKeyId,
    secretAccessKey: aws.secretAccessKey,
    region: aws.region
})
// console.log({
//     accessKeyId: aws.accessKeyId,
//     secretAccessKey: aws.secretAccessKey,
//     region: aws.region
// });

const sns = new AWS.SNS({ apiVersion: '2021-10-21' });
const params = {
    attributes: { DefaultSMSType: 'Transactional', DefaultSenderID: 'E-Book' },
}
const SNS_TOPIC_ARN = 'arn:aws:sns:eu-central-1:189904463882:E-Book';


export const sendOTP = async (number: any, otp: any) => {
    return new Promise(async (resolve, reject) => {
        let countryCode = "91"
        try {
            number = `+${countryCode} ${number}`
            console.log(number);
            // number = `${number}`
            await sns.subscribe(
                {
                    Protocol: 'SMS',
                    TopicArn: SNS_TOPIC_ARN,
                    Endpoint: number,
                },
                async function (error, data) {
                    if (error) {
                        console.log('Error in subscribe');
                        console.log(error);
                    }
                    var params = {
                        Message: SMS_message.OTP_verification + otp,
                        PhoneNumber: number,
                        MessageAttributes: {
                            'AWS.SNS.SMS.SMSType': {
                                DataType: 'String',
                                StringValue: 'Transactional',
                            },
                            'AWS.SNS.SMS.SenderID': { DataType: 'String', StringValue: 'E-Book' }
                        }
                    };
                    // console.log('params:', params);
                    await sns.publish(params, function (err_publish, data) {
                        if (err_publish) {
                            console.log(err_publish);
                            reject(err_publish);
                        } else {
                            // console.log(data);
                            resolve(data);
                        }
                    });
                }
            );
        } catch (error) {
            console.log(error)
            reject(error)
        }
    });
}