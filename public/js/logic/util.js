/**
 * Creates a "toast"-object similar to tablets/android phones
 * 
 * @param {string} msg toast message
 * @param {string} position Position in @parent
 * @param {DOM-object} parent parent element to append toast to
 */
export function createToast(msg, position = 'bottom', parent = false) {
    let toast = document.createElement('div');
    let p = document.createElement('p');
    p.innerHTML = msg;
    toast.appendChild(p);
    toast.classList.add('toast', `toast-${position}`);
    setTimeout(() => {
        toast.remove();
    }, 3000)
    if (parent) parent.appendChild(toast);
    return toast;
}

