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
   * Extract cents from currency.
   * @param {number} value
   * @returns {number}
   */
  const extractCents = (value) => {
    let cents = 0;

    if (value) {
      const decimals = String(value)?.split('.')[1];

      if (decimals) {
        cents = parseFloat(decimals);
      }
    }

    return cents;
  };

  /**
   * Format currency with option to remove decimal places for zero cents.
   * @param {number|string>} amount
   * @param {boolean} [includeZeroCents]
   * @returns {string} A formatted currency amount.
   */
  const formatCurrency = (amount, includeZeroCents) => {
    const currency = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);

    return includeZeroCents ? currency : currency.replace('.00', '');
  };

  /**
   * Toggles the specified classes on the given element.
   * @param {HTMLElement} element - The element to toggle classes on.
   * @param {string} action - Action to be performed ('add' or 'remove').
   * @param {string[]} classNames - An array of class names to be toggled.
   */
  const updateClasses = (element, action, classNames) => {
    if (!element) {
      return;
    }
    classNames.forEach((className) => {
      element.classList[action](className);
    });
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
        return undefined;
      }

      previousTime = now;
      return func(...args);
    };
  };

  /**
   * A collection of commonly used helper methods.
   * @namespace
   */
  IIN.helpers = {
    debounce,
    extractCents,
    formatCurrency,
    throttle,
    updateClasses,
  };
})();
