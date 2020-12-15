import { BaseFunc } from "./BaseFunc.js";
import * as util from './util.js';

// form
let passwordInput = document.getElementById('passwordInput');
let loginButton = document.getElementById('loginButton');
let formWrapper = document.getElementsByClassName('formWrapper')[0];

/**
 * check form data on server
 * SUCCESS: send to chatroom
 * FAILURE: error message
 */
let loginButtonFunc = new BaseFunc(loginButton, 'onclick');
passwordInput.focus();
loginButtonFunc.add(e => {
    e.preventDefault();
    let url = new URL(window.location.href);
    let room = url.searchParams.get('room');
    let name = url.searchParams.get('name');
    // send to chatroom if data correct
    fetch(`confirmLogin`, {
        method: 'POST',
        body: JSON.stringify({
            password: passwordInput.value,
            room
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(res => res.status == 200 ? res.text() : res.json())
        .then(data => {
            // client data ok but not accepted by server userID
            if (data.status && data.status != 200) {
                return util.createToast(data.msg, 'bottom', formWrapper);
            }
            let roomURL = `http://${window.location.hostname}:${window.location.port}/chatroom?room=${room}&name=${name}`;
            if (data.error) {
                if (data.error.code == 'alreadyLoggedIn') {
                    return open(roomURL, '_self');
                } else {
                    return util.createToast(data.error.msg, 'bottom', formWrapper);
                }
            }
            if (data == 'ok') return open(roomURL, '_self');
        })
        .catch(err => console.error(err))
}, 'default')