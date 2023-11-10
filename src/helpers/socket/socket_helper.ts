/**
 * @author Pritesh Bhanderi
 */

import { EventNames } from '../../common';
import { logger } from '../winston_logger';
export class SocketHelper {
    // TODO: might need db to maintain connections -Pritesh
    private static connections = [];
    /**
     * Register socket to communication. Must be executed after registerUser.
     * Modify socket object and set field uniqueToken and socketId.
     * Do we need concept of room - Pritesh
     */
    public static registerSocket(uniqueToken: string, socketId: string, socket: any) {
        if (!this.connections[uniqueToken]) {
            this.connections[uniqueToken] = {};
        }

        this.connections[uniqueToken][socketId] = socket;
        logger.info(
            `Registered total ${Object.keys(this.connections[uniqueToken]).length
            } socket for uniqueToken = ${uniqueToken} and connection: ${socketId}***`
        );
    }

    /**
     * Remove connection.
     * @param socket socket to remove.
     */
    public static unregisterSocket(uniqueToken: string, socketId: string) {
        if (this.connections[uniqueToken] && this.connections[uniqueToken][socketId]) {
            logger.info(
                `Removed socket for store= ${uniqueToken} and connection: ${socketId} new total=${Object.keys(this.connections[uniqueToken]).length
                }`
            );
            delete this.connections[uniqueToken][socketId];
        }
    }

    public static roomCreated(uniqueToken, data) {
        this.handleEvent(uniqueToken, data, EventNames.roomCreated);
    }

    private static handleEvent(uniqueToken: number, arg: any, eventName: string) {
        logger.debug(`inside - handleEvent, uniqueToken: ${uniqueToken}`);
        var userConnections = this.connections[uniqueToken];
        if (userConnections) {
            for (var socketId in userConnections) {
                logger.debug(
                    `socketId: ${socketId}, eventName: ${eventName}, arg: ${JSON.stringify(arg)}`
                );
                var socket = userConnections[socketId];
                if (socket != null) {
                    logger.debug(
                        `handling socket event for uniqueToken: ${uniqueToken} socketId: ${socketId}, eventName:${eventName}`
                    );
                    socket.emit(eventName, arg);
                }
            }
        } else {
            logger.info(
                `no live connection found for uniqueToken: ${uniqueToken}, event ${eventName} failed to deliver`
            );
        }
    }
    public static hasSocketConnection(uniqueToken: number): boolean {
        let hasConnection = false;
        var userConnections = this.connections[uniqueToken];
        if (userConnections) {
            for (var socketId in userConnections) {
                var socket = userConnections[socketId];
                if (socket != null) {
                    logger.debug(
                        `hasSocketConnection:uniqueToken ${uniqueToken} has socket connection`
                    );
                    hasConnection = true;
                }
            }
        } else {
            logger.info(
                `hasSocketConnection:no live connection found for uniqueToken: ${uniqueToken}`
            );
        }
        return hasConnection;
    }
}
