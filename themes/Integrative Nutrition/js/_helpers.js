/**
 * A collection of commonly used helper methods.
 * @namespace
 */
IIN.helpers = {
  /**
   * Delays the execution of a function
   * @param {Function} func
   * @param {number=300} [timeout]
   * @returns {Function} A debounced function.
   */
  debounce(func, timeout = 300) {
    let timeoutID;

    return (...args) => {
      if (timeoutID) {
        clearTimeout(timeoutID);
      }

      timeoutID = setTimeout(() => {
        func.apply(this, args);
      }, timeout);
    };
  },
};
