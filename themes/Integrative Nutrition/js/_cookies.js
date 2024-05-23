/**
 * A collection of methods for working with cookies.
 * @namespace
 */
IIN.cookies = {
  cookiePath: '/',

  /**
   * Polls for the cookie until it is found or max attempts have been reached.
   * @param {string} name
   * @param {number} [intervalDuration=50]
   * @param {number} [maxAttempts=10]
   * @returns {Promise<void>}
   *
   * @todo These are more or less arbitrary numbers. 50 * 10 ms = 1/2 second.
   */
  checkCookie(name, intervalDuration = 50, maxAttempts = 10) {
    let checkAttempts = 0;

    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        const checkCookie = IIN.cookies.getCookie(name);

        if (!checkCookie) {
          checkAttempts++;
        }

        if (checkCookie || checkAttempts === maxAttempts) {
          clearInterval(checkInterval);
          resolve();
        }
      }, intervalDuration);
    });
  },

  /**
   * Deletes the cookie by setting an empty value and a past expiration date.
   * @param {string} name
   */
  deleteCookie(name) {
    if (!name) {
      return;
    }

    const parts = [
      `${name}=`,
      `domain=${IIN.cookies.getCookieDomain()}`,
      `expires=${new Date(null).toUTCString()}`,
      `path=${IIN.cookies.cookiePath}`,
    ];

    document.cookie = parts.join('; ');
  },

  /**
   * Extends the lifetime of the cookie by resetting the expiration date.
   * @param {string} name
   * @param {number} [dayCount]
   */
  extendCookie(name, dayCount) {
    const cookieObject = IIN.cookies.getCookieObject(name);
    const cookieString = IIN.cookies.getCookieString(name);
    const data = cookieObject || cookieString || '';
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    const encodedData = encodeURIComponent(dataString);

    IIN.cookies.deleteCookie(name);
    IIN.cookies.setCookie(name, encodedData, dayCount);
  },

  /**
   * Retrieves named cookie.
   * @param {string} name
   * @returns {string}
   */
  getCookie(name) {
    const cookies = document.cookie.split(`; `);

    const existingCookie = cookies.find((cookie) =>
      cookie.startsWith(`${name}=`)
    );

    return existingCookie || '';
  },

  /**
   * Selects the appropriate domain for the cookie.
   * @returns {string} Cookie domain.
   */
  getCookieDomain() {
    const { hostname } = window.location;
    const globalDomain = '.integrativenutrition.com';
    const hostnameIsGlobal = hostname.endsWith(globalDomain);
    const cookieDomain = hostnameIsGlobal ? globalDomain : hostname;

    return cookieDomain;
  },

  /**
   * Extracts parsed data from a cookie.
   * @param {string} name
   * @returns {Object} Parsed cookie data.
   */
  getCookieObject(name) {
    let data = null;
    const cookie = IIN.cookies.getCookie(name);

    if (cookie) {
      const [, value] = cookie.split('=');

      try {
        data = JSON.parse(decodeURIComponent(value));
      } catch (e) {
        return data;
      }
    }

    return data;
  },

  /**
   * Extracts string from cookie.
   * @param {string} name
   * @returns {string} Cookie value.
   */
  getCookieString(name) {
    let value = '';
    const cookie = IIN.cookies.getCookie(name);

    if (cookie) {
      [, value] = cookie.split('=');
    }

    return decodeURIComponent(value);
  },

  /**
   * Calculates and returns an expiration date.
   * @param {number} [dayCount]
   * @returns {string} Expiration date.
   */
  getExpirationDate(dayCount) {
    const millisecondsInSecond = 1000;
    const secondsInMinute = 60;
    const minutesInHour = 60;
    const hoursInDay = 24;

    const day =
      hoursInDay * minutesInHour * secondsInMinute * millisecondsInSecond;

    const date = new Date();
    const currentTime = date.getTime();
    const cleanDayCount = Number(dayCount) || 1;
    const expirationTime = currentTime + day * cleanDayCount;

    date.setTime(expirationTime);

    return date.toUTCString();
  },

  /**
   * Sets the named cookie.
   * @param {string} name
   * @param {*} data
   * @param {number} [dayCount]
   * @returns {string} The named cookie.
   */
  setCookie(name, data, dayCount) {
    if (!name || typeof data === 'undefined' || data === null) {
      return '';
    }

    const parts = [
      `${name}=${data}`,
      `domain=${IIN.cookies.getCookieDomain()}`,
      `path=${IIN.cookies.cookiePath}`,
    ];

    if (dayCount > 0) {
      parts.push(`expires=${IIN.cookies.getExpirationDate(dayCount)}`);
    }

    const cookieString = parts.join('; ');

    document.cookie = cookieString;

    return cookieString;
  },

  /**
   * @param {string} itemName
   * @param {string} [cookieName]
   * @return {string|null} Cookie value or null.
   */
  useValue(itemName, cookieName) {
    const cookieObject = IIN.cookies.getCookieObject(cookieName);
    const cookieString = IIN.cookies.getCookieString(cookieName);
    const existingData = cookieObject || cookieString;

    if (typeof existingData === 'string') {
      return existingData || null;
    }

    // existingData is an object!  Parse out the requested value, if available
    const cookieValue = existingData?.[itemName];

    return cookieValue || null;

  },
};

/**
 * Extracts string from cookie.
 * @param {string} cookieName
 * @returns {string} Cookie value.
 *
 * @todo Delete after testing.
 */
function getCookie(cookieName) {
  const name = `${cookieName}=`;
  const decodedCookie = document.cookie;
  const cookieAttributes = decodedCookie.split(';');

  for (let i = 0; i < cookieAttributes.length; i++) {
    let c = cookieAttributes[i];

    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }

    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }

  return '';
}
