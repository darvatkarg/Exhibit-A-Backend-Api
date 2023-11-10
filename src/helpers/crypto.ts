"use strict"
import crypto from 'crypto'
import config from 'config'
const ENCRYPTION_KEY = (config.get('crypto_key') as any)
const IV_LENGTH = 16 // For AES, this is always 16

export const encrypt = async (text: any) => {
    let iv = crypto.randomBytes(IV_LENGTH)
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv)
    let encrypted = cipher.update(text)

    encrypted = Buffer.concat([encrypted, cipher.final()])

    return iv.toString('hex') + ':' + encrypted.toString('hex')
}

export const decrypt = async (text: any) => {
    let textParts = text.split(':')
    let iv = Buffer.from(textParts.shift(), 'hex')
    let encryptedText = Buffer.from(textParts.join(':'), 'hex')
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv)
    let decrypted = decipher.update(encryptedText)

    decrypted = Buffer.concat([decrypted, decipher.final()])

    return decrypted.toString()
}

