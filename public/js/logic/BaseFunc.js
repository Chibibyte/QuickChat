/**
 * BaseFunc
 * 
 * Handles the functionality of one Listener to a DOM-Element.
 * You can easily add, remove or change different functions for the same listener.
 * This is done by collecting all functions in an array and running them all when the listener
 * is activated.
 * If you add the dom-class 'disabled' to the element instead of the attribute you can also add
 * functions that react only on a disabled element.
 */
export class BaseFunc {
    /**
     * 
     * @param {DOM-Element} element         Element to listen to
     * @param {string} listenerName         Name of Listener (e.g. 'onmouseover')
     */
    constructor(element, listenerName) {
        this.element = element;
        this.functions = {};
        this.onDisabledFunctions = {};
        this.element[listenerName] = e => this.run(e);
    }

    /**
     * Runs all added functions for the listener in the current state (enabled/disabled)
     * 
     * @param {event} e 
     */
    run(e) {
        if (this.isEnabled()) this.runFuncArr(this.functions, e);
        else this.runFuncArr(this.onDisabledFunctions, e)

    }

    /**
     * Runs a specific function
     * 
     * @param {string} name 
     * @param {event} e 
     */
    runSingle(name, e) {
        this.functions[name](e);
    }

    /**
     * Runs all functions in an array with event @e as a parameter
     * 
     * @param {array} funcArr 
     * @param {event} e 
     */
    runFuncArr(funcArr, e) {
        let keys = Object.keys(funcArr);
        keys.forEach(key => {
            funcArr[key](e)
        });
    }

    /**
     * Adds function @func under the name @name
     * 
     * @param {function} func 
     * @param {string} name 
     */
    add(func, name) {
        this.functions[name] = func;
    }

    /**
     * Removes the function stored under the name @name
     * 
     * @param {string} name 
     */
    remove(name) {
        delete this.functions[name];
    }

    /**
     * Adds function @func under the name @name
     * to the functions running when the DOM-element is disabled
     * 
     * @param {function} func 
     * @param {string} name 
     */
    addOnDisabled(func, name) {
        this.onDisabledFunctions[name] = func;
    }

    /**
     * Removes the function stored under the name @name
     * from the functions running when the DOM-element is disabled
     * 
     * @param {string} name 
     */
    removeOnDisabled(name) {
        delete this.onDisabledFunctions[name];
    }

    /**
     * Enables a the DOM-element
     */
    enable() {
        this.element.classList.remove("disabled");
    }

    /**
     * Disables a the DOM-element
     */
    disable() {
        this.element.classList.add("disabled");
    }

    /**
     * Checks if DOM-element is enabled
     */
    isEnabled() {
        return !this.element.classList.contains("disabled");
    }
}