import { logger } from '../../helpers/winston_logger'
const SocketIO = require('support/socket.io')
// const UserController = require('../socketControllers/userSocketController.js')
const UserController = require('../socket/userSocketController.js')
const DecodeSocketRequestPolicy = require('../policies/decodeSocketRequest.js')

exports.init = function (app, apiBase) {
    SocketIO.on('io', function (io) {
        let nsp = io.of(apiBase + '/chat')
        // console.log("nsp is:::::::::::::::",nsp);
        nsp.on('connection', function (socket) {
            console.info('client connection established :->', socket.id)

            // to decode request parameters
            // socket.use(DecodeSocketRequestPolicy)
            socket.emit('connected', 'You are connected.')
            socket.on('client-user-connected', UserController.userConnected(socket, nsp))
            socket.on('client-send-message', UserController.sendMessage(socket, nsp))
            //socket.on('client-forward-message', UserController.forwardMessage(socket, nsp))
            socket.on('client-chat-listing', UserController.chatList(socket, nsp))
            socket.on('client-chat-history', UserController.chatHistory(socket, nsp))
            socket.on('client-user-listing', UserController.userList(socket, nsp))
            socket.on('client-end-conversation', UserController.chatEndConversation(socket, nsp))
            socket.on('test', UserController.test.bind(null, socket, nsp))
            socket.on('disconnect', UserController.disconnect.bind(null, socket))
        })
    })
}
