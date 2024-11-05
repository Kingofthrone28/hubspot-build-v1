/* eslint-disable import/prefer-default-export -- will add debounce and throttle eventually */
/**
 * Delay code execution by some time
 * @param {number} duration duration in milliseconds
 * @returns {Promise<void>}
 */
export const wait = async (duration) =>
  new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
