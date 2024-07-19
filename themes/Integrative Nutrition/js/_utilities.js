/**
 * A collection of utility methods for converting data formats.
 * @namespace
 */
IIN.utilities = {
  /**
   * Gets encoded params from cookie data.
   * @param {string} cookieName
   * @param {string} [separator]
   * @returns {Object} Encoded params.
   */
  getEncodedCookieParams(cookieName, separator = '&') {
    const encodedParams = {};
    const keyValue = IIN.cookies.getCookieString(cookieName);
    const cookieParams = this.makeObjectFromKeyValueString(keyValue, separator);

    Object.entries(cookieParams).forEach(([key, value]) => {
      encodedParams[key] = encodeURIComponent(value);
    });

    return encodedParams;
  },

  /**
   * Utility function to check for a non-empty string
   * @param {*} value
   * @returns {boolean}
   */
  isStringWithLength(value) {
    return typeof value === 'string' && Boolean(value.length);
  },

  /**
   * Makes a key/value string from an object.
   * @param {Object} data
   * @param {string} [separator]
   * @returns {string} Key/value string.
   */
  makeKeyValueStringFromObject(data, separator = '&') {
    return Object.entries(data)
      .map(([key, value]) => `${key}=${value}`)
      .join(separator);
  },

  /**
   * Makes an object from a key/value string.
   * @param {string} keyValueString
   * @param {string} [separator]
   * @returns {Object} Decoded key/value object.
   */
  makeObjectFromKeyValueString(keyValueString, separator = '&') {
    const cleanObject = {};

    if (!keyValueString) {
      return cleanObject;
    }

    const decodedValue = decodeURIComponent(keyValueString);

    let pairs = [];

    try {
      const parsedValues = JSON.parse(decodedValue);

      Object.entries(parsedValues).forEach(([key, value]) => {
        pairs.push(`${key}=${value}`);
      });
    } catch (e) {
      pairs = decodedValue?.split(separator) || [];
    }

    pairs.forEach((pair) => {
      try {
        if (typeof pair === 'string') {
          const [key, ...values] = pair.split('=');

          cleanObject[key] = decodeURIComponent(values.join('='));
        } else {
          throw new Error('Key/value pair could not be constructed.');
        }
      } catch (e) {
        console.error(e);
      }
    });

    return cleanObject;
  },

  /**
   * Appends data extracted from cookies to the URL as params.
   * @param {string} baseURL
   * @param {string[]} cookieNames
   * @param {string[]} [separator]
   * @returns {string} A URL.
   */
  makeURLFromCookieParams(baseURL, cookieNames, separator = '&') {
    if (!baseURL) {
      return '';
    }

    if (!Array.isArray(cookieNames)) {
      return baseURL;
    }

    const encodedURL = new URL(baseURL);
    const encodedParams = {};

    cookieNames.forEach((cookieName) => {
      const cookieParams = this.getEncodedCookieParams(cookieName, separator);

      Object.entries(cookieParams).forEach(([key, value]) => {
        encodedParams[key] = value;
      });
    });

    encodedURL.search = encodedParams.toString();

    return encodedURL.toString();
  },
};
