require('./config.js');
const express = require('express');
const bodyParser = require("body-parser");
const socketIO = require('socket.io');
const session = require('express-session');
const { genError } = require('./public/js/logic/errorHandling.js');

const app = express();

module.exports = { app };

let port = 4000;

let server = process.env.port ? process.server : app.listen(port, () => console.log(`QuickChatTest listening on port ${port}` + ` ${typeof true}`));
let serverIO = process.serverIO ? process.serverIO : socketIO(server);

// settings
const {
    MAX_ROOMS = 20,
    MAX_USERS_PER_ROOM = 10,
    MAX_ROOMTIME = 1, // 5 minutes in ms
    FAKE_USER = false
} = process.conf;

let chatrooms = {};
const responseData = {};    // responses for certain planned server issues, that are no errors
responseData['roomlimit'] = { status: 423, msg: 'roomlimit exceeded.<br>Come back later.' };
responseData['userlimit'] = { status: 423, msg: 'userlimit exceeded.<br>Come back later.' };
const users = {};

/**
 * Calculates a random hex value
 */
function randomHexValChar() {
    let hex = Math.round(Math.random() * 15);
    let hexChar = hex.toString(16);
    return hexChar;
}

/**
 * Generates a string of random hex values of length @keyLength
 */
function generateHexKey(keyLength = 20) {
    let key = "";
    for (let i = 0; i < keyLength; i++) {
        key += randomHexValChar();
    }
    return key;
}

/**
 * Sets a response value @res for a @responseName
 * 
 * @param {string} responseName 
 * @param {string} res 
 */
function setRes(responseName, res) {
    let resData = responseData[responseName];
    res.status(resData.status).send(resData);

}

/**
 * Generates a room key to identify the chatroom
 * 
 * @param {number} length 
 */
function generateKey(length = 1) {
    function genValue() {
        let rVal = Math.round(Math.random() * 15); // 15 for hex
        let rHex = rVal.toString(16);
        return rHex;
    }

    let safetyCount = 1000;
    while (safetyCount) {
        let hexString = "";
        for (let i = 0; i < length; i++) {
            hexString += genValue();
        }
        if (!chatrooms[hexString]) return hexString;
    }
    return false;
}

// Server Settings
const {
    NODE_ENV = 'development',

    SESS_NAME = 'sid',
    SESS_SECRET = '29euf298g7iwu7fdkigewfzigdf',
    SESS_LIFETIME = 1000 * 60 * 60 * 2
} = process.env
const IN_PROD = NODE_ENV === 'production';

// Session Settings
app.use(session({
    name: SESS_NAME,
    resave: false,
    rolling: true,
    secret: SESS_SECRET,
    saveUninitialized: false,
    cookie: {
        maxAge: SESS_LIFETIME,
        sameSite: true,
        secure: IN_PROD
    }
}))

// Middleware
app.use(bodyParser.json());

// Checks form data of request, creates a chatroom and sends the room data back to the client
app.post(`/createChatroom`, (req, res, next) => {
    if (Object.keys(chatrooms).length >= MAX_ROOMS) {
        return setRes('roomlimit', res);
    }
    let { name, password, password2 } = req.body;
    if (!name) return res.status(400).send(genError('mName'));
    if (!password) return res.status(400).send(genError('mPW'));
    if (!password2) return res.status(400).send(genError('mPW2'));
    if (name.trim().length == 0) return res.status(400).send(genError('eName'));
    if (password.trim().length == 0) return res.status(400).send(genError('ePW'));
    if (password2.trim().length == 0) return res.status(400).send(genError('ePW2'));
    if (password != password2) return res.status(400).send(genError('uneqPW'));

    let key = generateKey(40);
    if (!key) return res.status(500).send('server error');

    addRoom(key, name, password);
    res.send({ link: `http://${req.get('host')}/chatroom?room=${key}&name=${name}` })
})

/**
 * Authenticates a user via cookie for a room
 * 
 * @param {string} room 
 * @param {string} userID 
 */
function authenticate(room, userID) {
    if (room.users[userID]) return true;
    return false;
}

// Sends the clients userID on request
app.post('/myuserid', (req, res, next) => {
    if (req.session.userID) return res.send({ status: 200, userID: req.session.userID })
    res.status(400).send('not ok');
})

/**
 * Checks user authentication for a room via cookie
 * SUCCESS: redirect to chatroom
 * FAILURE: redirect home
 */
app.use(`/chatroom`, (req, res, next) => {
    let url = new URL(req.protocol + '://' + req.get('host') + req.originalUrl);
    let room = url.searchParams.get('room');
    let name = url.searchParams.get('name');

    if (chatrooms[room] && chatrooms[room].name == name) {
        if (authenticate(chatrooms[room], req.session.userID)) res.sendFile(__dirname + '/public/chatroom.html');
        else res.redirect(`/login?room=${room}&name=${chatrooms[room].name}`);
    }
    else res.redirect("/");
})

/**
 * Checks user login data
 * SUCCESS: sends ok message
 * FAILURE: sends error message
 */
app.use('/confirmLogin', (req, res, next) => {
    let { room, password } = req.body;
    if (chatrooms[room] && chatrooms[room].password == password) {
        if (!(req.session.userID && chatrooms[room].users[req.session.userID]) && Object.keys(chatrooms[room].users).length >= MAX_USERS_PER_ROOM) {
            return setRes('userlimit', res);
        }
        if (!req.session.userID) {
            // save user cookie in room data
            let userID = generateHexKey();
            while (users[userID]) userID = generateHexKey();
            req.session.userID = userID;
            users[userID] = true;
        }
        chatrooms[room].users[req.session.userID] = true;
        return res.send('ok');
    }
    if (!chatrooms[room]) return res.status(400).send(genError('noRoom'));
    res.status(400).send(genError('wrongPW'));
})

/**
 * Checks request to login page via cookie
 * SUCCESS: sends login page
 * FAILURE: loads chatroom since user is already logged in
 */
app.use(`/login`, (req, res, next) => {
    let url = new URL(req.protocol + '://' + req.get('host') + req.originalUrl);
    let room = url.searchParams.get('room');
    let name = url.searchParams.get('name');
    // if already logged in redirect to chatroom
    if (req.session.userID && chatrooms[room].users[req.session.userID]) {
        return res.redirect(`http://${req.get('host')}/chatroom?${room}&name=${name}`);
    }
    // if room doesn't exist, redirect to noroom.html
    if (!chatrooms[room]) return res.redirect('/noroom');
    res.sendFile(__dirname + '/public/login.html');
})

// noroom.html is the 'room not found'-page
app.use(`/noroom`, (req, res, next) => {
    res.sendFile(__dirname + '/public/noroom.html');
})

// direct request of chatroom.html will be redirected to home
app.use(`/chatroom.html`, (req, res, next) => {
    res.redirect("/");
})

// direct request of .html files will be redirected to home
app.use(`/*.html`, (req, res, next) => {
    res.redirect("/");
})

// static server
app.use(express.static(__dirname + "/public"));

// redirect home on every other request
app.use("*", (req, res, next) => {
    res.redirect("/");
})

// sockets

/**
 * Creates room and adds it to @chatrooms array.
 * Opens and initializes socket to created chatroom
 * 
 * @param {string} roomKey id for room
 * @param {string} name room name
 * @param {string} password password for room
 */
function addRoom(roomKey, name, password) {
    chatrooms[roomKey] = {
        roomIO: serverIO.of(`/chatroom/${roomKey}/${name}`),
        name,
        password,
        users: {}
    }
    let chatroom = chatrooms[roomKey].roomIO;

    // chatrooms are open for MAX_ROOMTIME milliseconds
    let roomtimer = MAX_ROOMTIME / 1000;
    let itv = setInterval(() => {
        roomtimer--;
        if (roomtimer <= 0) {
            chatroom.emit('roomtimer', { roomtimer: 0 });
            console.log(`closing room: "${chatroom.key}:${chatroom.name}"`);
            removeRoom(roomKey);
            clearInterval(itv);
        } else {
            chatroom.emit('roomtimer', { roomtimer });
        }
    }, 1000)

    // Socket Middleware for authentication on connection
    chatroom.use((socket, next) => {
        let userID = socket.handshake.query.userID;
        if (chatrooms[roomKey].users[userID]) return next();
        next(new Error('authentication error'));
    })

    chatroom.on('connection', function (socket) {
        console.log('user connected');
        socket.on('disconnect', () => {
            console.log("user disconnected");
        })
        socket.on('chat', function (msg) {
            if (!msg.username || msg.username.trim() == "") return;
            if (!msg.msg || msg.msg.trim() == "") return;

            console.log("msg received", msg)
            chatroom.emit('chat', msg);

            // chatbot for testing
            if (FAKE_USER) setTimeout(() => {
                chatroom.emit('chat', {
                    username: 'chatlord',
                    msg: 'I am a real person.'
                });
            }, 1000);
        })
    })
}

/**
 * Handles complete closing and removal of a room
 * 
 * @param {string} roomKey 
 */
function removeRoom(roomKey) {
    let roomIO = chatrooms[roomKey].roomIO;

    // make inaccessible from client by removing from 'chatrooms'
    delete chatrooms[roomKey];

    // remove all connected sockets
    let socketsIdArr = Object.keys(roomIO.connected);
    socketsIdArr.forEach(socketId => {
        roomIO.emit('closing');
        roomIO.connected[socketId].disconnect();
    });

    roomIO.removeAllListeners();
    delete serverIO.nsps[roomIO.name];
}
