import { BaseFunc } from "./BaseFunc.js";
import * as util from './util.js';

// info button and info modal
let helpButton = document.getElementsByClassName('helpButton')[0];
let infoModal = document.getElementById('infoModal');
helpButton.onclick = () => {
    infoModal.classList.remove('hidden');
}
let confirmButton = document.getElementsByClassName('confirmButton')[0];
confirmButton.onclick = () => {
    infoModal.classList.add('hidden');
}

// formdata
let nameInput = document.getElementById('nameInput');
let passwordInput = document.getElementById('passwordInput');
let password2Input = document.getElementById('password2Input');
let createButton = document.getElementById('createButton');
let form = new FormData(document.getElementById('form'));
let roomLinkInput = document.getElementById('roomLinkInput');
let roomLinkCopyButton = document.getElementById('copyButton');
let roomLinkOpenButton = document.getElementById('openButton');
let showButtons = document.getElementsByClassName('showButton');
let showButton1 = showButtons[0];
let showButton2 = showButtons[1];
let formWrapper = document.getElementsByClassName('formWrapper')[0];

// initialize listeners
let createButtonFunc = new BaseFunc(createButton, 'onclick');
let roomLinkCopyButtonFunc = new BaseFunc(roomLinkCopyButton, 'onclick');
let roomLinkOpenButtonFunc = new BaseFunc(roomLinkOpenButton, 'onclick');
let showButton1Func = new BaseFunc(showButton1, 'onclick');
let showButton2Func = new BaseFunc(showButton2, 'onclick');
let nameInputFunc = new BaseFunc(nameInput, 'oninput');
let passwordInputFunc = new BaseFunc(passwordInput, 'oninput');
let password2InputFunc = new BaseFunc(password2Input, 'oninput');

// set default values for faster room creation
nameInput.value = 'Testroom';
passwordInput.value = '1234';
password2Input.value = '1234';

/**
 * Toggles visibility of a password in @inputObj
 * 
 * @param {obj} inputObj 
 */
function togglePWVisible(inputObj) {
    if (inputObj.type === "password") {
        inputObj.type = "text";
    } else {
        inputObj.type = "password";
    }
}

// set listeners for showing/hiding password buttons
showButton1Func.add(() => {
    togglePWVisible(passwordInput);
}, 'default')

showButton2Func.add(() => {
    togglePWVisible(password2Input);
}, 'default')

/**
 * Checks if form is filled and disables/enables buttons accordingly
 */
function formfilled() {
    createButton.disabled = true;
    if (nameInput.value.trim().length > 0 &&
        passwordInput.value.trim().length > 0 &&
        password2Input.value.trim().length > 0 &&
        passwordInput.value == password2Input.value
    ) createButton.disabled = false;
}

// Check form completion on each input
nameInputFunc.add(() => {
    formfilled();
}, "default")

passwordInputFunc.add(() => {
    formfilled();
}, "default")

password2InputFunc.add(() => {
    formfilled();
}, "default")

/**
 * on create, collect form data and request chatroom creation on server
 * on success: enables copy and open link buttons
 */
createButtonFunc.add(e => {
    e.preventDefault();
    let body = {};
    body.name = nameInput.value;
    body.password = passwordInput.value;
    body.password2 = password2Input.value;
    fetch('/createChatroom', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(res => res.json())
        .then(data => {
            if (data.status && data.status != 200) {
                let toast = util.createToast(data.msg);
                formWrapper.appendChild(toast);
            } else if (data.link) {
                roomLinkInput.value = data.link;
                roomLinkCopyButton.disabled = false;
                roomLinkOpenButton.disabled = false;
            }
        })
}, "default")

/**
 * Saves link to clipboard
 */
function copyLink() {
    roomLinkInput.select();
    roomLinkInput.setSelectionRange(0, 99999); /*For mobile devices*/
    document.execCommand("copy");
}

// on button press, save link to clipboard
roomLinkCopyButtonFunc.add(() => {
    copyLink();
}, "default")

// on button press, save link to clipboard and open link
roomLinkOpenButtonFunc.add(() => {
    open(roomLinkInput.value);
}, "default")