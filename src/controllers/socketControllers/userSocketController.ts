import async from 'async'
// import DB from '../../../db';
import { mongooseConnection, userModel, userSessionModel, chat_Message_Receive_StatusModel, chat_ParticipantsModel, chat_historyModel, chat_roomModel, chat_mediaModel } from '../../database';
import _ from 'lodash';
// import msg from '../../../helpers/message'
// import cusHelper from '../../../helpers/customHelper'
// import DS from '../../../services/date';
// import PN from '../../../support/push-notifications/pn'
import config from 'config'
import moment from 'moment';

var _self = {
    userConneccted: (message) => {
        console.log(message);

    }
    // disconnect: function (socket, data, CB) {
    //     console.info('[SUCCESS] Client Disconnected:', socket.id, data)
    // }
}

// var _self = {
//     test: function (socket, nsp, data, CB) {
//         CB({
//             'status': 200,
//             'message': 'Great! Connected to server',
//             'data': data
//         })
//     },

//     userConnected: (socket, nsp) => {
//         return (data, CB) => {
//             if (data && data.userId) {
//                 let userId = data.userId
//                 socket.userId = userId
//                 async.parallel([
//                     (nextCall) => {
//                         chat_ParticipantsModel.find({
//                             where: {
//                                 user_id: userId
//                             }
//                         }).then(participantRooms => {
//                             // if (participantRooms.length == 0) {
//                             //   return nextCall({
//                             //     "message": msg.SOMETHING_WRONG
//                             //   })
//                             // }
//                             _.forEach(participantRooms, r => {
//                                 socket.join(r.room_id)
//                             })
//                             nextCall(null)
//                         }).catch(error => {
//                             return nextCall({
//                                 "message": "SOMETHING WENT WRONG"
//                             })
//                         })
//                     },
//                     async (nextCall) => {
//                         //let getUpdateduser = await userModel.findOneAndUpdate({ _id: userId }).set({ socket_id: socket.id });
//                         let getUpdateduser = await userModel.findOneAndUpdate({ _id: userId })
//                         if (getUpdateduser.length) {
//                             // console.log("user is:::::::::::::::::::",getUpdateduser[0]);
//                             nextCall(null)
//                         } else {
//                             return nextCall({
//                                 "message": "SOMETHING WENT WRONG"
//                             })
//                         }
//                     },
//                     async (nextCall) => {
//                         //console.log("userrr::::::::::",user[0]);
//                         let checkToken = await userSessionModel.find({
//                             user_detail_id: userId
//                         })
//                         // if (checkToken) {
//                         //     console.log("token is:::::::::", checkToken[0]);
//                         //     let checkTokenImage = await DB.UserImage.find({
//                         //         token_id: checkToken[0].id
//                         //     })
//                         //     console.log("token image is::::::::::::", checkTokenImage);
//                         //     if (checkTokenImage == null || checkTokenImage == "") {
//                         //         nextCall(null)
//                         //     } else if (checkTokenImage != null || checkTokenImage != "") {
//                         //         // console.log("set url");
//                         //         let setBaseUrl = "http://202.131.117.92:7088/media/" + checkTokenImage[0].image
//                         //         console.log("set base image is:::::::::", setBaseUrl);
//                         //         let setImage = await DB.Chatparticipant.update({
//                         //             user_id: userId
//                         //         }).set({
//                         //             userImage: setBaseUrl
//                         //         }).fetch();
//                         //         nextCall(null)
//                         //     } else {
//                         //         return nextCall({
//                         //             "message": msg.SOMETHING_WRONG
//                         //         })
//                         //     }
//                         // } else {
//                         //     return nextCall({
//                         //         "message": msg.SOMETHING_WRONG
//                         //     })
//                         // }
//                     },

//                 ], (err) => {
//                     if (err) {
//                         return CB({
//                             'status': 200,
//                             'message': "You are connected to all rooms",
//                             'data': {}
//                         })
//                     }
//                     CB({
//                         'status': 200,
//                         'message': "You are connected to all rooms",
//                         'data': data
//                     })
//                 })
//             } else {
//                 CB({
//                     'status': 400,
//                     'message': "SOMETHING WENT WRONG",
//                     'data': {}
//                 })
//             }
//         }
//     },

//     sendMessage: (socket, nsp) => {
//         return (data, CB) => {
//             if (data && data.roomId && data.userId) {
//                 async.waterfall([
//                     async (nextCall) => {
//                         let myRoom = await chat_ParticipantsModel.findOne({
//                             where: {
//                                 room_id: data.roomId,
//                                 user_id: data.userId
//                             }
//                         });
//                         if (!myRoom) {
//                             return nextCall({
//                                 "message": "SOMETHING WENT WRONG"
//                             })
//                         } else {
//                             nextCall();
//                         }
//                     },
//                     (nextCall) => {
//                         chat_roomModel.findOne({
//                             id: data.roomId
//                         }).then((room) => {
//                             if (!room) {
//                                 return nextCall({
//                                     message: "ROOM NOT FOUND"
//                                 })
//                             } else if (room.isDelete) {
//                                 return nextCall({
//                                     message: "ALREDY END CONVERSATION"
//                                 })
//                             } else {
//                                 nextCall()
//                             }
//                         })
//                     },
//                     (nextCall) => {
//                         chat_ParticipantsModel
//                             .find({
//                                 where: {
//                                     room_id: data.roomId,
//                                     user_id: {
//                                         '!=': data.userId
//                                     }
//                                 }
//                             }).then(participants => {
//                                 // console.log("particapant is::::::::::::::::::::",participants[0]);
//                                 nextCall(null, participants)
//                             }).catch(error => {
//                                 return nextCall({
//                                     "message": "SOMETHING WENT WRONG"
//                                 })
//                             })
//                     },
//                     async (participants, nextCall) => {
//                         // console.log("in heree::::::::::::",data);
//                         if (data.mediaId) {
//                             let chatMedia = await chat_mediaModel.findOne({
//                                 "id": data.mediaId
//                             });
//                             //console.log("chat media iis::::::::::::::::::::::::::::::::::::::::::::",chatMedia);
//                             if (!chatMedia) {
//                                 // console.log("in mediaaa block");
//                                 return nextCall({
//                                     "message": "SOMETHING WENT WRONG"
//                                 })
//                             } else {
//                                 console.log('....', chatMedia)
//                                 // let imageUrl = config.imageUrl
//                                 // chatMedia.media = imageUrl+chatMedia.media
//                                 // chatMedia.thumb = imageUrl+chatMedia.media
//                                 // console.log('..chatmedia**..',chatMedia)

//                                 nextCall(null, participants, chatMedia)
//                             }
//                         } else {
//                             nextCall(null, participants, {})
//                         }
//                     },
//                     async (participants, chatMedia, nextCall) => {
//                         // console.log("chatMedia is:::::::::::::::::::::",chatMedia);
//                         let messageData = {
//                             room_id: data.roomId,
//                             content: data.message,
//                             sender_id: data.userId,
//                             mediaId_id: (chatMedia) ? chatMedia.id : "",
//                             type: (chatMedia) ? chatMedia.type : 'text'
//                         }
//                         // console.log("message data is::::::::::::::::::::::::",messageData);
//                         let chatHistoryObj = await chat_historyModel.create(messageData);
//                         if (!chatHistoryObj) {
//                             return nextCall({
//                                 "message": "SOMETHING WENT WRONG"
//                             })
//                         } else {
//                             nextCall(null, participants, chatHistoryObj)
//                         }
//                     },
//                     (participants, chatHistoryObj, nextCall) => {
//                         //console.log("history is:::::::::::::::::",chatHistoryObj);
//                         chat_historyModel
//                             .findOne({
//                                 id: chatHistoryObj.id
//                             }).populate('mediaId_id').populate('sender_id').then(chatHistoryObj => {
//                                 if (!chatHistoryObj) {
//                                     return nextCall({
//                                         message: 'Invalid request parameters'
//                                     })
//                                 }
//                                 nextCall(null, participants, chatHistoryObj)
//                             }).catch(error => {
//                                 //console.log("in catch block");
//                                 return nextCall({
//                                     "message": "SOMETHING  WRONG"
//                                 })
//                             })
//                     },
//                     (participants, chatHistoryObj, nextCall) => {
//                         chat_ParticipantsModel
//                             .find({
//                                 where: {
//                                     room_id: chatHistoryObj.room_id,
//                                     user_id: {
//                                         '!=': data.userId
//                                     }
//                                 }
//                             }).then(user => {
//                                 nextCall(null, participants, chatHistoryObj, user)
//                             }).catch(error => {
//                                 return nextCall({
//                                     "message": "SOMETHING  WRONG"
//                                 })
//                             })
//                     },
//                     (participants, chatHistoryObj, user, nextCall) => {
//                         // Get not deliver message count
//                         // console.log("user is:::::::::::::::::::::::",user);
//                         // console.log("data is::::::::::::::::::::::::::",data);
//                         chat_Message_Receive_StatusModel
//                             .find({
//                                 where: {
//                                     sender_id: data.userId,
//                                     receiver_id: user[0].user_id,
//                                     status: {
//                                         '!=': 'read'
//                                     }
//                                 }
//                             }).then(getMessageReciveStatus => {
//                                 // console.log("message status is::::::::::::::::::::::::::::",getMessageReciveStatus);
//                                 if (getMessageReciveStatus.length == 0) {
//                                     chatHistoryObj.count = 0;
//                                 } else {
//                                     chatHistoryObj.count = getMessageReciveStatus.length;
//                                 }
//                                 nextCall(null, participants, chatHistoryObj)
//                             }).catch(error => {
//                                 return nextCall({
//                                     "message": "SOMETHING  WRONG"
//                                 })
//                             })
//                     },
//                     async (participants, chatHistoryObj, nextCall) => {
//                         let statusData = _.map(participants, participant => {
//                             return {
//                                 history_id: chatHistoryObj.id,
//                                 sender_id: data.userId,
//                                 receiver_id: participant.user_id
//                             }
//                         })
//                         // let results = await chat_Message_Receive_StatusModel.createEach(statusData).fetch();
//                         let results = await chat_Message_Receive_StatusModel.find(statusData);
//                         if (results.length) {
//                             chatHistoryObj.dbid = data.dbid
//                             chatHistoryObj.message_status_of_participants = results
//                             socket.broadcast.to(data.roomId).emit('server-receive-message', chatHistoryObj)
//                             nextCall(null, participants, chatHistoryObj, results)
//                         } else {
//                             return nextCall({
//                                 "message": "SOMETHING  WRONG"
//                             })
//                         }
//                     },
//                     async (participants, chatHistoryObj, chatMessageReceiveStatusData, nextCall) => {
//                         try {
//                             // let last_message_at_date = DS.now();
//                             // let data1 = await chat_roomModel.findOneAndUpdate({ id: data.roomId }).set({last_message_at: last_message_at_date,}).fetch();
//                             let data1 = await chat_roomModel.findOneAndUpdate({ id: data.roomId });
//                             if (data1.length) {
//                                 nextCall(null, participants, chatHistoryObj, chatMessageReceiveStatusData)
//                             } else {
//                                 return nextCall({
//                                     "message": "SOMETHING_WRONG"
//                                 });
//                             }
//                         } catch (error) {
//                             return nextCall({
//                                 "message": "SOMETHING_WRONG"
//                             });
//                         }
//                     },
//                     async (participants, chatHistoryObj, chatMessageReceiveStatusData, nextCall) => {
//                         // console.log("chat history is::::::::::::::::",chatHistoryObj);
//                         async.mapSeries(participants, async (p, nextObj) => {
//                             let getUserDetails = await userModel.findOne({
//                                 where: {
//                                     id: p.user_id
//                                 }
//                             });

//                             let Userdevicedetails = await userSessionModel.findOne({
//                                 where: {
//                                     user_detail_id: getUserDetails.id
//                                 }
//                             })

//                             let getSenderDetails = await userModel.findOne({
//                                 where: {
//                                     id: chatHistoryObj.sender_id.id
//                                 }
//                             });

//                             let fullName = getSenderDetails.name
//                             let pushObj = {
//                                 "to": Userdevicedetails.device_token,
//                                 "data": {
//                                     "title": fullName,
//                                     "message": chatHistoryObj.content,
//                                     "data": {
//                                         "roomId": data.roomId,
//                                         "name": getSenderDetails.name,
//                                         "message": chatHistoryObj.type == 'text' ? chatHistoryObj.content : `${fullName} has sent you a ${chatHistoryObj.type}`,
//                                         "type": chatHistoryObj.type,
//                                         // "click_action": "FLUTTER_NOTIFICATION_CLICK",

//                                     }
//                                 }
//                             }
//                             //await PN.fcm(pushObj, (pushErr, pushSucc) => { });
//                             // return 1;
//                             nextObj(null, p)
//                         }, (loopErr, loopRes) => {
//                             if (loopErr) {
//                                 nextCall({
//                                     message: "SOMETHING_WRONG"
//                                 })
//                             } else {
//                                 nextCall(null, chatHistoryObj)
//                             }
//                         })
//                     }

//                 ], (err, chatHistoryObj) => {
//                     if (err) {
//                         if (err.message == 'Already end these conversaction.') {
//                             CB({
//                                 'status': 200,
//                                 'message': 'you cannot send these message in room bcz Already end these conversaction.',
//                                 'data': chatHistoryObj
//                             })
//                         }
//                         return CB({
//                             'status': 400,
//                             'message': (err && err.message) || "SOMETHING_WRONG",
//                             'data': {}
//                         })
//                     } else if (chatHistoryObj && chatHistoryObj.id) {
//                         CB({
//                             'status': 200,
//                             'message': "Message sent successfully",
//                             'data': chatHistoryObj
//                         })
//                     } else {
//                         CB({
//                             'status': 200,
//                             'message': "Message sent successfully",
//                             'data': data
//                         })
//                     }
//                 })
//             } else {
//                 CB({
//                     'status': 400,
//                     'message': "SOMETHING_WRONG",
//                     'data': {}
//                 })
//             }
//         }
//     },

//     chatList: (socket, nsp) => {
//         console.log("chat list api");
//         return (data, CB) => {
//             async.waterfall([
//                 (nextCall) => {
//                     if (data && data.userId) {
//                         nextCall(null, data)
//                     } else {
//                         return nextCall({
//                             "message": "SOMETHING_WRONG"
//                         })
//                     }
//                 },
//                 (body, nextCall) => {
//                     console.log("in hheheheh");
//                     chat_ParticipantsModel
//                         .find({
//                             user_id: body.userId
//                         }).then(rooms => {
//                             nextCall(null, body, rooms)
//                         }).catch(error => {
//                             // console.log("error is:::::::::::::::::", error);
//                             return nextCall({
//                                 "message": "SOMETHING_WRONG"
//                             })
//                         })
//                 },
//                 (body, rooms, nextCall) => {
//                     // console.log("body is::::::::::::::::::::::", body);
//                     //console.log("rooms is::::::::::::::::::::::::", rooms);
//                     chat_roomModel
//                         .find({
//                             where: {
//                                 or: _.map(rooms, r => {
//                                     return {
//                                         id: r.room_id,
//                                         isDelete: false
//                                     }
//                                 })
//                             },
//                             sort: 'last_message_at DESC'
//                         })
//                         .populate('history', {
//                             where: {},
//                             sort: [{
//                                 createdAt: 'desc'
//                             }],
//                             limit: 1
//                         })

//                         .populate('participants')
//                         .then(results => {

//                             //console.log("result is::::::::::::::::::::", JSON.parse(JSON.stringify(results)));
//                             if (results.length > 0) {
//                                 nextCall(null, body, JSON.parse(JSON.stringify(results)))
//                             } else {
//                                 return nextCall({
//                                     "message": "Room not found."
//                                 })
//                             }
//                         })
//                         .catch(error => {
//                             console.log("in catch block");
//                             return nextCall({
//                                 "message": "SOMETHING_WRONG"
//                             })
//                         })
//                 },
//                 (body, results, nextCall) => {
//                     if (results.length) {
//                         async.mapSeries(results, async (result, nextObj) => {
//                             let history = await chat_historyModel.find({
//                                 room_id: result.id
//                             })
//                             let historyIds = history.map(h => h.id)
//                             let reciveobj = await chat_Message_Receive_StatusModel
//                                 .find({
//                                     history_id: {
//                                         in: historyIds
//                                     },
//                                     receiver_id: body.userId,
//                                     status: {
//                                         '!=': 'read'
//                                     }
//                                 })
//                             result.count = reciveobj.length
//                             nextObj(null, result)
//                         }, (loopErr, loopRes) => {
//                             if (loopErr) {
//                                 nextCall({
//                                     message: "SOMETHING_WRONG"
//                                 })
//                             } else {
//                                 // console.log("in hereeee");
//                                 async.mapSeries(loopRes, async (result, nextResult) => {
//                                     async.map(result.participants, (participant, nextParticipant) => {
//                                         userModel
//                                             .findOne({
//                                                 id: participant.user_id
//                                             })
//                                             .then(chatUser => {
//                                                 participant = _.merge(participant, _.pick(chatUser, ['name']))
//                                                 nextParticipant()
//                                             })
//                                             .catch(nextParticipant)
//                                     }, nextResult)
//                                 }, (err) => {
//                                     nextCall(null, loopRes)
//                                 })
//                             }
//                         })
//                     }
//                 }
//             ], (err, response) => {
//                 if (err) {
//                     if (err.message == 'Room not found.') {
//                         return CB({
//                             status: 200,
//                             message: 'Room not found',
//                             data: response
//                         })
//                     } else {
//                         return CB({
//                             status: 400,
//                             message: (err && err.message) || "SOMETHING_WRONG",
//                             data: {}
//                         })
//                     }
//                 }
//                 return CB({
//                     status: 200,
//                     message: 'Chat List',
//                     data: {
//                         response,
//                         // imageUrl: config.imageUrl
//                         imageUrl: config
//                     }
//                 })
//             })
//         }
//     },

//     chatHistory: (socket, nsp, data, CB) => {
//         console.log("chat history api");
//         return (data, CB) => {
//             async.waterfall([
//                 (nextCall) => {
//                     if (data && data.userId && data.roomId) {
//                         nextCall(null, data)
//                     } else {
//                         return nextCall({
//                             message: "Missing parameters."
//                         })
//                     }
//                 },
//                 (body, nextCall) => {
//                     chat_roomModel.findOne({
//                         id: body.roomId
//                     }).then((room) => {
//                         if (!room) {
//                             return nextCall({
//                                 message: "ROOM_NOT_FOUND"
//                             })
//                         } else if (room.isDelete) {
//                             return nextCall({
//                                 message: "Already end these conversaction."
//                             })
//                         } else {
//                             nextCall(null, body)
//                         }
//                     })
//                 },
//                 async (body, nextCall) => {
//                     let room = await chat_ParticipantsModel.findOne({
//                         where: {
//                             user_id: data.userId,
//                             room_id: data.roomId
//                         },
//                         select: ["room_id"]
//                     });
//                     if (!room) {
//                         return nextCall({
//                             "message": "SOMETHING_WRONG"
//                         })
//                     } else {
//                         nextCall(null, body, room)
//                     }
//                 },
//                 async (body, room, nextCall) => {
//                     let historys = await chat_historyModel.find({
//                         room_id: data.roomId
//                     })
//                     let historyIds = historys.map(h => h.id)
//                     // let result = await chat_Message_Receive_StatusModel.findOneAndUpdate({receiver_id: data.userId,history_id: {in: historyIds}}).set({status: 'read'}).fetch();
//                     let result = await chat_Message_Receive_StatusModel.findOneAndUpdate({ receiver_id: data.userId, history_id: { in: historyIds } }, { status: "read" });
//                     if (result.length) {
//                         nextCall(null, body, room)
//                     } else {
//                         nextCall(null, body, room)
//                     }
//                 },
//                 (body, room, nextCall) => {
//                     let historyQuery = {
//                         where: {
//                             room_id: body.roomId
//                         },
//                         sort: [{
//                             createdAt: 'desc'
//                         }]
//                     }
//                     // if (_.isNumber(body.skip)) {
//                     //     historyQuery.skip = _.toNumber(body.skip)
//                     // }
//                     // if (_.isNumber(body.limit)) {
//                     //     historyQuery.limit = _.toNumber(body.limit)
//                     // }
//                     chat_historyModel
//                         .find(historyQuery)
//                         .populate('message_status_of_participants')
//                         .populate('mediaId_id')
//                         .populate('sender_id')
//                         .then(results => {
//                             nextCall(null, JSON.parse(JSON.stringify(results)))
//                         })
//                         .catch(error => {
//                             return nextCall({
//                                 "message": "SOMETHING_WRONG"
//                             })
//                         })
//                 },
//                 async (results, nextCall) => {
//                     async.map(results, async (r, nextresult) => {
//                         console.log("result is:::::::::::::::::::::::", r.mediaId_id);
//                         if (r.mediaId_id == null) {
//                             r.mediaId_id = {}
//                         }
//                         let abc = r.sender_id
//                         delete r.sender_id
//                         r.sender_id = {
//                             id: abc.id,
//                             name: abc.name,
//                             age_18: abc.age_18,
//                             gender: abc.gender,
//                             //description:abc.description ? abc.description:null,

//                         }
//                         let currentDate = moment(new Date());
//                         let createPostdate = moment(r.createdAt);
//                         let duration = moment.duration(
//                             currentDate.diff(createPostdate)
//                         );
//                         let seconds = duration.asSeconds();
//                         r.difference = seconds
//                         nextresult(null, r)
//                     }, (err, result) => {

//                         if (err) {
//                             return nextCall(err)
//                         }
//                         // let imageUrl = config.imageUrl
//                         let imageUrl = config
//                         nextCall(null, {
//                             result,
//                             imageUrl: imageUrl
//                         })
//                     })
//                 }
//             ], (err, response) => {
//                 if (err) {
//                     if (err.message == 'Already end these conversaction.') {
//                         CB({
//                             status: 200,
//                             message: 'Already end these conversaction.',
//                             data: response
//                         })
//                     }
//                     return CB({
//                         status: 400,
//                         message: (err && err.message) || "SOMETHING_WRONG",
//                         data: {}
//                     })
//                 }
//                 CB({
//                     status: 200,
//                     message: 'Chat History',
//                     data: response
//                 })
//             })
//         }
//     },

//     userList: (socket, nsp) => {
//         return (data, CB) => {
//             console.log("data is::::::::::::::::::::", data);
//             if (data && data.userId) {
//                 let userId = data.userId
//                 socket.userId = userId
//                 async.parallel([
//                     (nextCall) => {
//                         if (data && data.userId) {
//                             nextCall()
//                         } else {
//                             return nextCall({
//                                 "message": "User id is required."
//                             })
//                         }
//                     },
//                     (nextCall) => {
//                         userModel
//                             .find({
//                                 where: {
//                                     id: {
//                                         '!=': data.userId
//                                     }
//                                 }
//                             }).then((user) => {
//                                 console.log("user is::::::::::::::::::::", user);
//                                 if (user.length > 0) {
//                                     // let imageUrl = config.imageUrl
//                                     let imageUrl = config
//                                     nextCall(null, {
//                                         user,
//                                         imageUrl
//                                     })
//                                 } else {
//                                     return nextCall({
//                                         "message": "Chat user not found."
//                                     })
//                                 }
//                             }).catch((err) => {
//                                 console.log("error is:::::::::::", err);
//                                 return nextCall({
//                                     "message": "SOMETHING_WRONG"
//                                 })
//                             })
//                     }
//                 ], (err, response) => {
//                     if (err) {
//                         console.log("eror is::::::::::::::::", err);
//                         return CB({
//                             'status': 400,
//                             'message': "SOMETHING_WRONG",
//                             'data': {}
//                         })
//                     }
//                     CB({
//                         'status': 200,
//                         'message': "Get all user details successfully.",
//                         'data': response[1]
//                     })
//                 })
//             } else {
//                 console.log('in hereeeeeeeeeeeeee');
//                 CB({
//                     'status': 400,
//                     'message': "SOMETHING_WRONG",
//                     'data': {}
//                 })
//             }
//         }
//     },

//     forwardMessage: (socket, nsp) => {
//         return (data, CB) => {
//             if (data && data.userId && data.reciver_ids) {
//                 data.reciver_ids = (typeof data.reciver_ids == 'string') ? JSON.parse(data.reciver_ids) : data.reciver_ids;
//                 // console.log('data.userId...',data.userId)
//                 // console.log('data.userId...',typeof(data.userId))
//                 // console.log('data.reciverId...',typeof(data.reciver_ids))


//                 async.waterfall([
//                     (nextCall) => {
//                         let reciver_ids = data.reciver_ids
//                         if (reciver_ids.length) {
//                             async.mapSeries(reciver_ids, (r, nextObj) => {
//                                 chat_ParticipantsModel
//                                     .find({
//                                         where: {
//                                             user_id: data.userId,
//                                         }
//                                     }).select('room_id').then(async author => {
//                                         chat_ParticipantsModel
//                                             .find({
//                                                 where: {
//                                                     user_id: r,
//                                                 }
//                                             }).select('room_id').then(async (participents) => {
//                                                 let roomIdAuthor = author.map(a => a.room_id)
//                                                 let roomIdparticipents = participents.map(p => p.room_id)
//                                                 var arrDiff = getArraysIntersection(roomIdAuthor, roomIdparticipents);
//                                                 if (arrDiff.length > 0) {
//                                                     let chatRoom = await chat_roomModel.findOne({
//                                                         id: arrDiff[0],
//                                                         isDelete: false
//                                                     })
//                                                     if (chatRoom) {
//                                                         _self.forwardMultipleMessage(data, arrDiff[0], socket);
//                                                     } else {
//                                                         let insertObj = {
//                                                             author_id: data.userId
//                                                         }
//                                                         // let chatRoom = await chat_roomModel.create(insertObj).fetch();
//                                                         let chatRoom = await chat_roomModel.create(insertObj);
//                                                         let participantsinsetObj = [{
//                                                             room_id: chatRoom.id,
//                                                             user_id: data.userId
//                                                         },
//                                                         {
//                                                             room_id: chatRoom.id,
//                                                             user_id: r
//                                                         }
//                                                         ]
//                                                         // let chatParticipantRes = await chat_ParticipantsModel.createEach(participantsinsetObj).fetch();
//                                                         _self.forwardMultipleMessage(data, chatRoom.id, socket);
//                                                     }
//                                                 } else {
//                                                     let insertObj = {
//                                                         author_id: data.userId
//                                                     }
//                                                     // let chatRoom = await chat_roomModel.create(insertObj).fetch();
//                                                     let chatRoom = await chat_roomModel.create(insertObj);
//                                                     let participantsinsetObj = [{
//                                                         room_id: chatRoom.id,
//                                                         user_id: data.userId
//                                                     },
//                                                     {
//                                                         room_id: chatRoom.id,
//                                                         user_id: r
//                                                     }
//                                                     ]
//                                                     // let chatParticipantRes = await chat_ParticipantsModel.createEach(participantsinsetObj).fetch();
//                                                     _self.forwardMultipleMessage(data, chatRoom.id, socket);
//                                                 }
//                                             }).catch((err) => {
//                                                 console.log(err)
//                                                 nextObj({
//                                                     message: "SOMETHING_WRONG"
//                                                 });
//                                             })
//                                     }).catch(error => {
//                                         nextObj({
//                                             message: "SOMETHING_WRONG"
//                                         });
//                                     })
//                                 nextObj(null, r)
//                             }, (loopErr, loopRes) => {
//                                 if (loopErr) {
//                                     return nextCall({
//                                         "message": "SOMETHING_WRONG"
//                                     })
//                                 } else {
//                                     nextCall(null, loopRes)
//                                 }
//                             })
//                         } else {
//                             nextCall(null, data)
//                         }
//                     }

//                 ], (err, chatHistoryObj) => {
//                     if (err) {
//                         return CB({
//                             'status': 400,
//                             'message': (err && err.message) || "SOMETHING_WRONG",
//                             'data': {}
//                         })
//                     } else if (chatHistoryObj && chatHistoryObj.id) {
//                         CB({
//                             'status': 200,
//                             'message': "Message sent successfully",
//                             'data': chatHistoryObj
//                         })
//                     } else {
//                         CB({
//                             'status': 200,
//                             'message': "Message sent successfully",
//                             'data': data
//                         })
//                     }
//                 })
//             } else {
//                 CB({
//                     'status': 400,
//                     'message': "SOMETHING_WRONG",
//                     'data': {}
//                 })
//             }
//         }
//     },

//     forwardMultipleMessage: (data, roomId, socket) => {
//         data.roomId = roomId
//         // console.log('forwardMultipleMessagedata.userId...',data.userId)
//         // console.log('forwardMultipleMessagedata.userId...',typeof(data.userId))
//         // console.log('forwardMultipleMessagedata.reciverId...',typeof(data.reciver_ids))
//         async.waterfall([
//             async (nextCall) => {
//                 chat_ParticipantsModel
//                     .find({
//                         where: {
//                             room_id: data.roomId,
//                             user_id: {
//                                 '!=': data.userId
//                             }
//                         }
//                     }).then(participants => {
//                         nextCall(null, participants)
//                     }).catch(error => {
//                         return nextCall({
//                             "message": "SOMETHING_WRONG"
//                         })
//                     })
//             },
//             async (participants, nextCall) => {
//                 if (data.mediaId) {
//                     let chatMedia = await chat_mediaModel.findOne({
//                         id: data.mediaId
//                     });
//                     if (!chatMedia) {
//                         return nextCall({
//                             "message": "SOMETHING_WRONG"
//                         })
//                     } else {
//                         nextCall(null, participants, chatMedia)
//                     }
//                 } else {
//                     nextCall(null, participants, {})
//                 }
//             },
//             async (participants, chatMedia, nextCall) => {
//                 let messageData = {
//                     room_id: data.roomId,
//                     content: data.message,
//                     sender_id: data.userId,
//                     mediaId_id: (chatMedia) ? chatMedia.id : null,
//                     type: (chatMedia) ? chatMedia.type : 'text'
//                 }
//                 if (data.type == 'feed') {
//                     messageData = {
//                         ...messageData,
//                         // feedId_id: data.feedId,
//                         type: 'feed'
//                     }
//                 }

//                 // let chatHistoryObj = await chat_historyModel.create(messageData).fetch();
//                 let chatHistoryObj = await chat_historyModel.create(messageData);
//                 if (!chatHistoryObj) {
//                     return nextCall({
//                         "message": "SOMETHING_WRONG"
//                     })
//                 } else {
//                     nextCall(null, participants, chatHistoryObj)
//                 }
//             },
//             async (participants, chatHistoryObj, nextCall) => {
//                 chat_historyModel
//                     .findOne({
//                         id: chatHistoryObj.id
//                     }).populate('mediaId_id').populate('feedId_id').populate('sender_id').then(async chatHistoryObj => {
//                         if (!chatHistoryObj) {
//                             return nextCall({
//                                 message: 'Invalid request parameters'
//                             })
//                         }
//                         if (chatHistoryObj.feedId_id) {
//                             // let feedimage = await DB.PostImage.find({
//                             //     post_id_id: chatHistoryObj.feedId_id.id
//                             // })
//                             // chatHistoryObj.feedId_id.postImages = feedimage
//                         }
//                         nextCall(null, participants, chatHistoryObj)
//                     }).catch(error => {
//                         return nextCall({
//                             "message": "SOMETHING_WRONG"
//                         })
//                     })
//             },
//             (participants, chatHistoryObj, nextCall) => {
//                 chat_ParticipantsModel
//                     .find({
//                         where: {
//                             room_id: chatHistoryObj.room_id,
//                             user_id: {
//                                 '!=': data.userId
//                             }
//                         }
//                     }).then(user => {
//                         nextCall(null, participants, chatHistoryObj, user)
//                     }).catch(error => {
//                         return nextCall({
//                             "message": "SOMETHING_WRONG"
//                         })
//                     })
//             },
//             (participants, chatHistoryObj, user, nextCall) => {
//                 // Get not deliver message count
//                 chat_Message_Receive_StatusModel
//                     .find({
//                         where: {
//                             sender_id: data.userId,
//                             receiver_id: user[0].user_id,
//                             status: {
//                                 '!=': 'read'
//                             }
//                         }
//                     }).then(getMessageReciveStatus => {
//                         if (getMessageReciveStatus.length == 0) {
//                             chatHistoryObj.count = 0;
//                         } else {
//                             chatHistoryObj.count = getMessageReciveStatus.length;
//                         }
//                         nextCall(null, participants, chatHistoryObj)
//                     }).catch(error => {
//                         return nextCall({
//                             "message": "SOMETHING_WRONG"
//                         })
//                     })
//             },
//             async (participants, chatHistoryObj, nextCall) => {
//                 let statusData = _.map(participants, participant => {
//                     return {
//                         history_id: chatHistoryObj.id,
//                         sender_id: data.userId,
//                         receiver_id: participant.user_id
//                     }
//                 })
//                 // let results = await chat_Message_Receive_StatusModel.createEach(statusData).fetch();
//                 let results = await chat_Message_Receive_StatusModel.find(statusData);
//                 if (results.length) {
//                     chatHistoryObj.dbid = data.dbid
//                     chatHistoryObj.message_status_of_participants = results
//                     socket.broadcast.to(roomId).emit('server-receive-message', chatHistoryObj)
//                     nextCall(null, participants, chatHistoryObj, results)
//                 } else {
//                     return nextCall({
//                         "message": "SOMETHING_WRONG"
//                     })
//                 }
//             },
//             async (participants, chatHistoryObj, chatMessageReceiveStatusData, nextCall) => {
//                 try {
//                     // let last_message_at_date = DS.now();
//                     // let data1 = await chat_roomModel.update({ id: data.roomId }).set({ last_message_at: last_message_at_date, }).fetch();
//                     let data1 = await chat_roomModel.findOneAndUpdate({ id: data.roomId });
//                     if (data1.length) {
//                         nextCall(null, participants, chatHistoryObj, chatMessageReceiveStatusData)
//                     } else {
//                         return nextCall({
//                             "message": "SOMETHING_WRONG"
//                         });
//                     }
//                 } catch (error) {
//                     return nextCall({
//                         "message": "SOMETHING_WRONG"
//                     });
//                 }
//             },
//             async (participants, chatHistoryObj, chatMessageReceiveStatusData, nextCall) => {
//                 async.mapSeries(participants, async (p, nextObj) => {
//                     let getUserDetails = await userModel.findOne({
//                         where: {
//                             id: p.user_id
//                         }
//                     });
//                     let Userdevicedetails = await userSessionModel.findOne({
//                         where: {
//                             user_detail_id: Number(getUserDetails.id)
//                         }
//                     })

//                     let getSenderDetails = await userModel.findOne({
//                         where: {
//                             id: chatHistoryObj.sender_id.id
//                         }
//                     });

//                     let fullName = getSenderDetails.first_name && getSenderDetails.last_name ? getSenderDetails.first_name + " " + getSenderDetails.last_name : getSenderDetails.first_name
//                     let pushObj = {
//                         "to": Userdevicedetails.device_token,
//                         "data": {
//                             "title": "New Message",
//                             "message": `New message from ${fullName}`,
//                             "device_type": Userdevicedetails.device_type,
//                             "data": {
//                                 "roomId": data.roomId,
//                                 "profile_picture": getSenderDetails.profile_pic,
//                                 "firstname": getSenderDetails.first_name,
//                                 "lastname": getSenderDetails.last_name,
//                                 "message": chatHistoryObj.type == 'text' ? chatHistoryObj.content : `${fullName} has sent you a ${chatHistoryObj.type}`,
//                                 "type": chatHistoryObj.type,
//                                 // "click_action": "FLUTTER_NOTIFICATION_CLICK",

//                             }
//                         }
//                     }
//                     // await PN.fcm(pushObj, (pushErr, pushSucc) => { });
//                     // return 1;
//                     nextObj(null, p)
//                 }, (loopErr, loopRes) => {
//                     if (loopErr) {
//                         nextCall({
//                             message: "SOMETHING_WRONG"
//                         })
//                     } else {
//                         nextCall(null, chatHistoryObj)
//                     }
//                 })
//             }

//         ], (err, response) => {
//             if (err) {
//                 return response.sendToEncode({
//                     status: 400,
//                     message: (err && err.message) || "SOMETHING_WRONG",
//                     data: {}
//                 })
//             }
//             // console.log('response',response)
//             // return res.sendToEncode({
//             //     status: 200,
//             //     message: msg.SUCC,
//             //     data: response
//             // })
//         })
//     },

//     chatEndConversation: (socket, nsp) => {
//         return (data, CB) => {
//             async.waterfall([
//                 (nextCall) => {
//                     if (data && data.roomId) {
//                         nextCall(null, data)
//                     } else {
//                         return nextCall({
//                             "message": "MISSING_PARAMS"
//                         })
//                     }
//                 },
//                 (body, nextCall) => {
//                     chat_roomModel
//                         .findOne({
//                             id: body.roomId
//                         }).then(rooms => {
//                             if (rooms) {
//                                 nextCall(null, body, rooms)
//                             } else if (rooms.isDelete) {
//                                 return nextCall({
//                                     "message": "ALREDY_END_CONVERSATION"
//                                 })
//                             } else {
//                                 return nextCall({
//                                     "message": "ROOM_NOT_FOUND"
//                                 })
//                             }
//                         }).catch(error => {
//                             return nextCall({
//                                 "message": "SOMETHING_WRONG"
//                             })
//                         })
//                 },
//                 (body, rooms, nextCall) => {
//                     chat_roomModel.findOneAndUpdate({ id: body.roomId }, { isDelete: true }).then((room) => {
//                         nextCall(null)
//                     }).catch((error) => {
//                         return nextCall({
//                             "message": "SOMETHING_WRONG"
//                         })
//                     })
//                 },
//             ], (err, response) => {
//                 if (err) {
//                     return CB({
//                         status: 400,
//                         message: (err && err.message) || "SOMETHING_WRONG",
//                         data: {}
//                     })
//                 }
//                 return CB({
//                     status: 200,
//                     message: 'End conversaction for these room',
//                     data: data
//                 })
//             })
//         }
//     },


//     disconnect: function (socket, data, CB) {
//         console.info('[SUCCESS] Client Disconnected:', socket.id, data)
//     }
// }

module.exports = _self

function getArraysIntersection(a1, a2) {
    return a1.filter(function (n) {
        return a2.indexOf(n) !== -1;
    });
}
