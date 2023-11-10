/**
 * @author Mukund Khunt
 * @description Server and REST API config
 */
import * as bodyParser from 'body-parser';
import express, { Request, Response } from 'express';
import http from 'http';
import socketio from 'socket.io';
import { logger } from './helpers/winston_logger'
import cors from 'cors'
import * as packageInfo from '../package.json'
import { mongooseConnection, webSessionModel, userModel, userSessionModel } from './database'
import { v4 as uuidv4 } from 'uuid'
import jwt from 'jsonwebtoken'
import { router } from './routes'
import config from 'config'
import { onConnect } from './helpers/socket'

const app = express();

const CronJob = require('cron').CronJob
const ObjectId = require('mongoose').Types.ObjectId
const jwt_token_secret = config.get('jwt_token_secret')
const refresh_jwt_token_secret = config.get('refresh_jwt_token_secret')

app.use(mongooseConnection)

let server = new http.Server(app);
let io = require('socket.io')(server, {
    cors: true,
})
io.on('connection', onConnect);

app.use(cors())
app.use(bodyParser.json({ limit: '200mb' }))
app.use(bodyParser.urlencoded({ limit: "200mb", extended: true, parameterLimit: 200000 }))
app.use(express.static(__dirname + '/public'))

const health = (req, res) => {
    return res.status(200).json({
        message: "Exhibit Node.js Server is Running",
        app: packageInfo.name,
        version: packageInfo.version,
        description: packageInfo.description,
        author: packageInfo.author,
        license: packageInfo.license,
        homepage: packageInfo.homepage,
        repository: packageInfo.repository,
        contributors: packageInfo.contributors
    })
}
app.get('/', health);
app.get('/health', health);
app.get('/isServerUp', (req, res) => {
    res.send('Server is running ');
});
app.use(router)


export default server;