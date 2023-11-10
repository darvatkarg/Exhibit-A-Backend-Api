import async from 'async'
import { mongooseConnection, userModel } from '../../database'
// import msg from '../../../helpers/message';

var _self = {
    startTracking: (socket, nsp) => {
        return (data, CB) => {
            async.waterfall([
                (nextCall) => {
                    if (data && data.userId && data.moverId && data.moveId && data.lat && data.lng) {
                        nextCall(null, data)
                    } else {
                        return nextCall({
                            // "message": msg.SOMETHING_WRONG
                            "message": "Something went wrong!"
                        })
                    }
                },
                async (data, nextCall) => {
                    let getUser = await userModel.findOne({ "_id": data.userId });
                    if (!getUser) {
                        return nextCall({ "message": "User With _id don't exist" });
                    } else if (getUser && !getUser.socketId) {
                        return nextCall({ "message": "User With _id don't exist" });
                    } else {
                        nextCall(null, data, getUser.socketId)
                    }
                },
                async (data, userSocketId, nextCall) => {
                    let getMover = await userModel.findOne({ "_id": data.moverId });
                    if (!getMover) {
                        return nextCall({ "message": "No mover found." });
                    } else if (getMover && !getMover.socketId) {
                        return nextCall({ "message": "No mover found." });
                    } else {
                        nextCall(null, data, userSocketId, getMover.socketId)
                    }
                },
                (data, userSocketId, moverSocketId, nextCall) => {
                    socket.broadcast.to(userSocketId).emit('tracking-receive', data);
                    nextCall(null, data)
                }
            ], (err, response) => {
                if (err) {
                    return CB({
                        status: 400,
                        message: (err && err.message) || "SOMETHING_WRONG",
                        data: {}
                    })
                }
                return CB({
                    status: 200,
                    message: "Success",
                    data: response
                })
            })
        };
    }
}

module.exports = _self;