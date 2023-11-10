import gcm from 'node-gcm'
import config from 'config'
import { resolve } from 'path/posix'
import { rejects } from 'assert'

const sender = new gcm.Sender(config.get('fcmKey'))

export const notification_to_user = async (sender_user_data, data, notification) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (sender_user_data && data && notification) {
                let message = new gcm.Message({
                    data: data,
                    notification: notification
                });
                sender.send(message, {
                    registrationTokens: sender_user_data?.deviceToken
                }, function (err, response) {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(response)
                    }
                })
            }
            else {
                resolve(true)
            }
        } catch (error) {
            reject(error)
        }
    })
}