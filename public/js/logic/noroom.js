import { BaseFunc } from "./BaseFunc.js";
import * as util from './util.js';

// countdown until redirection to home
let noroomCountdown = document.getElementById('noroom-countdown');

let count = 3;
noroomCountdown.innerHTML = count;
let itv = setInterval(() => {
    count--;
    noroomCountdown.innerHTML = count;
    if (count == 0) {
        window.location.href = '/';
        clearInterval(itv);
    }
}, 1000);