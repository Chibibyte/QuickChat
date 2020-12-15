import { BaseFunc } from "./BaseFunc.js";
import * as util from './util.js';

let chatWindow = document.getElementById('chatWindow');
let usernameInput = document.getElementById('username-input');
let msgInput = document.getElementById('msg-input');
let sendButton = document.getElementById('sendButton');
let roomtimer = document.getElementById('roomtimer');
let roomTitle = document.getElementById('roomTitle'); //chatrooms[key].name

let url = new URL(window.location.href);
let room = url.searchParams.get('room');
let name = url.searchParams.get('name');
let roomOpen = false;
roomTitle.innerHTML = name;
let nameRand = Math.random();
usernameInput.value = nameRand <= 0.5 ? 'Ron Swanson' : 'Leslie Knope';

/**
 * Calculates a random hex value
 */
export function randomHexValChar() {
    let hex = Math.round(Math.random() * 15);
    let hexChar = hex.toString(16);
    return hexChar;
}

/**
 * Generates a string of random hex values of length @keyLength
 */
export function generateHexKey(keyLength = 20) {
    let key = "";
    for (let i = 0; i < keyLength; i++) {
        key += randomHexValChar();
    }
    return key;
}

/**
 * Array that contains the randomly generated keys of the clients messages
 * for comparison once the server sends the messages back
 */
let keyArr = [];

// login
let socket;
fetch('/myuserid', {
    method: 'POST'
})
    .then(res => res.json())
    .then(data => {
        if (data.userID) {
            let userID = data.userID;
            // path to socket for this room
            let path = `${window.location.pathname}/${room}/${name}`;
            socket = io(`${path}?userID=${userID}`);

            // initialize send button
            let sendButtonFunc = new BaseFunc(sendButton, 'onclick');
            sendButtonFunc.add(() => {
                let errMsg = false;
                if (!roomOpen) errMsg = 'This room is closed';
                else if (!usernameInput.value || usernameInput.value.trim() == "") errMsg = 'Username missing';
                else if (!msgInput.value || msgInput.value.trim() == "") errMsg = `Can't send empty message`;
                if (errMsg) return util.createToast(errMsg, 'bottom', chatWindow);

                // generate a key for each send message for later comparison
                let key = generateHexKey();
                keyArr.push(key);
                socket.emit('chat', {
                    username: usernameInput.value,
                    msg: msgInput.value,
                    key
                })

                // clear msg & set focus to msgInput
                msgInput.value = "";
                msgInput.focus();
            }, "default")

            socket.on('connect', function () {
                // initialize chat functionality once the connection is established
                console.log("connection established");
                roomOpen = true;
                msgInput.onkeydown = e => {
                    if (event.ctrlKey && event.code === 'Enter') {
                        sendButton.click();
                    }
                };
                msgInput.focus();
            })

            // react to chat messages
            socket.on('chat', function (data) {
                addChatMsg(data);
                chatWindow.scrollTop = chatWindow.scrollHeight;
            })

            // react to room timer updates
            socket.on('roomtimer', function (data) {
                let rt = data.roomtimer;
                let min = Math.floor(rt / 60);
                let sek = rt - min * 60;
                roomtimer.innerHTML = `${min}:${sek > 9 ? sek : ('0' + sek)}`;
                if (rt == 0) {
                    roomtimer.classList.add('roomtimer-roomclosed');
                    roomtimer.innerHTML = "";
                }
                else if (rt < 60) {
                    roomtimer.classList.add('roomtimer-roomclosing');
                }
            })

            socket.on('closing', function () {
                console.log("connection terminated");
                roomOpen = false;
            })
        }
    })

/**
 * Handles the display of the message @data
 * 
 * @param {object} data 
 */
function addChatMsg(data) {
    let msgContainer = document.createElement('div');
    let nameP = document.createElement('p');
    let msgP = document.createElement('p');

    if (keyArr.length > 0 && keyArr[keyArr.length - 1] && data.key === keyArr[keyArr.length - 1]) {
        msgContainer.classList.add('msgContainer-right');
        keyArr.pop();
    } else msgContainer.classList.add('msgContainer-left');
    msgContainer.classList.add('msgContainer');
    nameP.classList.add('nameP');
    msgP.classList.add('msgP');

    msgContainer.appendChild(nameP);
    msgContainer.appendChild(msgP);

    nameP.innerHTML = data.username;
    msgP.innerHTML = data.msg.replace(/\n/g, '<br>');

    chatWindow.appendChild(msgContainer);
}
