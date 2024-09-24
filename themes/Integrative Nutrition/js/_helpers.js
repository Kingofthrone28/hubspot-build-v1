(() => {
  /**
 * Delays the execution of a function
 * @param {Function} func
 * @param {number=300} [timeout]
 * @returns {Function} A debounced function.
 */
  const debounce = (func, timeout = 300) => {
    let timeoutID;

    return (...args) => {
      if (timeoutID) {
        clearTimeout(timeoutID);
      }

      timeoutID = setTimeout(() => {
        func.apply(this, args);
      }, timeout);
    };
  };

  /**
  * Limits the execution of a function by a certain minimum time
  * @param {Function} func Function to limit execution rate of
  * @param {number=100} [timeout] Minimum time to pass before allowing execution
  * @returns {Function} A throttled function
  */
  const throttle = (func, delay = 100) => {
    let previousTime = 0;

    return (...args) => {
      const now = Date.now();

      if (now - previousTime < delay) {
        return;
      }

      previousTime = now;
      return func(...args);
    }
  };

  /**
 * A collection of commonly used helper methods.
 * @namespace
 */
  IIN.helpers = {
    debounce,
    throttle,
  };
})();
