// import { verifyJwt } from '../jwt.helper'; 
import { logger } from '../winston_logger';
import { SocketHelper } from './socket_helper';

export const onConnect = socket => {
    socket.emit('new_user', { name: "Naitika", message: "Hello New User" })
    console.log("Connected to Socket");

    //videos
    socket.emit('message', 'Welcome to chat!')

    let uniqueTokenString;
    /**
     * On registered socket from client.
     */
    socket.on('register', async (uniqueToken: string) => {
        logger.debug(`register::uniqueToken: ${uniqueToken}`);
        try {
            uniqueTokenString = uniqueToken;
            logger.info(`register called with store id= ${uniqueToken}`);
            SocketHelper.registerSocket(uniqueToken, socket.id, socket);
        } catch (error) {
            logger.error(`error while registering the socket`);
            console.log(error);
        }
    });
    /**
     * On registered socket from client.
     */
    // socket.on('unregister', async (uniqueToken: string) => {
    //     logger.debug(`unregister::jwtToken: ${uniqueToken}`);
    //     try {
    //         logger.info(`unregister called with store id= ${uniqueToken}`);
    //         SocketHelper.unregisterSocket(uniqueToken, socket.id);
    //         socket.disconnect(true);
    //     } catch (error) {
    //         logger.error(`error while un-registering the socket ${JSON.stringify(error)}`);
    //     }
    // });
    // socket.on('error', error => {
    //     logger.error(`error in socket connection ${JSON.stringify(error)}`);
    // });

    // socket.on('disconnect', reason => {
    //     try {
    //         SocketHelper.unregisterSocket(uniqueTokenString, socket.id);
    //     } catch (error) {
    //         logger.error(`error while disconnect has called with reason=${reason}`);
    //         console.log(error);
    //     }
    // });





};
