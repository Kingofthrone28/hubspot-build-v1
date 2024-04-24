/** Cookie session for params in URL */
(() => {
  /** Values are replicated from Drupal settings. */
  const settings = {
    // machine_field_name is not currently used but exists in Drupal
    cookie_tracking_mapping: {
      0: {
        url_param_name: 'affid',
        machine_field_name: 'Affiliate_Referrer__c',
      },
      1: {
        url_param_name: 'erefer',
        machine_field_name: 'eReferrer__c',
      },
      2: {
        url_param_name: 'gclid',
        machine_field_name: 'GCLID__c',
      },
      // 3: {
      //  url_param_name: 'url',
      //  machine_field_name: 'Adwords_Initial_URL__c'
      // },
      4: {
        url_param_name: 'url',
        machine_field_name: 'Adwords_Initial_URL_new__c',
      },
      5: {
        url_param_name: 'adagencytoken',
        machine_field_name: 'AdAgencyToken',
      },
      6: {
        url_param_name: 'ambassadorID',
        machine_field_name: 'Affiliate_Referrer__c',
      },
      7: {
        url_param_name: 'utm_channel',
        machine_field_name: 'Top_level__c',
      },
    },
    custom_cookie_settings: {
      cookie_type: 'persistent',
      cookie_duration: '30',
    },
  };

  const sourceMappings = {
    chopraeducation: 'HealCo',
  };

  const { hostname, search } = window.location;
  const hostnameParts = hostname.split('.');
  const subdomain =
    hostnameParts.length > 2 ? hostnameParts[hostnameParts.length - 3] : '';
  const isSourceSubdomain = Object.entries(sourceMappings).some(
    ([key]) => key === subdomain
  );
  const cookieSettings = settings.custom_cookie_settings;
  const isPersistent = cookieSettings?.cookie_type === 'persistent';
  const urlParams = new URLSearchParams(search);
  const paramSource = urlParams.get('source');
  const excludedParams = ['hs_preview', 'hsLang'];
  const TARGET_URL = 'https://store.integrativenutrition.com';
  const globalDomain = '.integrativenutrition.com';
  const hostnameIsGlobal = hostname.endsWith(globalDomain);
  const cookiePath = '/';
  const cookieDomain = hostnameIsGlobal ? globalDomain : hostname;

  /**
   * Constructs cookie data from URL params.
   * @returns {Object}
   */
  const buildData = () => {
    const data = {};

    urlParams.forEach((value, key) => {
      const isExcluded = excludedParams.some((param) => param === key);

      if (!isExcluded) {
        data[key] = value;
      }
    });

    if (isSourceSubdomain && !paramSource) {
      data.source = sourceMappings[subdomain];
    }

    data.url = window.location.href;

    return data;
  };

  /**
   * Deletes the cookie by setting an empty value and a past expiration date.
   * @param {string} name
   */
  const deleteCookie = (name) => {
    if (!name) {
      return;
    }

    const parts = [
      `${name}=`,
      `domain=${cookieDomain}`,
      `expires=${new Date(null).toUTCString()}`,
      `path=${cookiePath}`,
    ];

    document.cookie = parts.join('; ');
  };

  /**
   * Retrieves named cookie.
   * @param {string} name
   * @returns {string}
   */
  const getCookie = (name) => {
    const cookies = document.cookie.split(`; `);

    return cookies.find((cookie) => cookie.startsWith(`${name}=`));
  };

  /**
   * Extracts value from a cookie.
   * @param {string} name
   * @returns {Object}
   */
  const getCookieData = (name) => {
    let data = null;
    const cookie = getCookie(name);

    if (cookie) {
      const [, value] = cookie.split('=');

      data = JSON.parse(decodeURIComponent(value));
    }

    return data;
  };

  /**
   * Calculates and returns an expiration date.
   * @param {number} [dayCount]
   * @returns {string}
   */
  const getExpirationDate = (dayCount) => {
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
  };

  /**
   * Check for the existence of tracking param from settings.
   * @returns {boolean}
   */
  const hasTrackingParam = () => {
    const mappingData = settings.cookie_tracking_mapping;
    const mappingArray = [];

    Object.entries(mappingData).forEach(([key, value]) => {
      if (Number(key) > -1) {
        mappingArray.push(value);
      }
    });

    return mappingArray.some((mapping) => {
      const param = urlParams.get(mapping.url_param_name);

      return param !== null;
    });
  };

  /**
   * Sets the named cookie.
   * @param {string} name
   * @param {Object} data
   * @param {number} [dayCount]
   */
  const setCookie = (name, data, dayCount) => {
    if (!name) {
      return;
    }

    const parts = [
      `${name}=${encodeURIComponent(JSON.stringify(data))}`,
      `domain=${cookieDomain}`,
      `path=${cookiePath}`,
    ];

    if (isPersistent) {
      parts.push(`expires=${getExpirationDate(dayCount)}`);
    }

    document.cookie = parts.join('; ');
  };

  /**
   * Extends the lifetime of the cookie by resetting the expiration date.
   * @param {string} name
   * @param {number} [dayCount]
   */
  const extendCookie = (name, dayCount) => {
    const data = getCookieData(name);

    deleteCookie(name);
    setCookie(name, data, dayCount);
  };

  /**
   * Sets a hidden field.
   * @param {string} name
   * @param {number|string} value
   * @param {boolean} condition
   */
  const setHiddenField = (name, value) => {
    // Check if 'value' is falsy and return early if true.
    if (!value) {
      return;
    }

    const selector = `input[type='hidden'][name='${name}']`;

    // Get nodes using the constructed selector.
    const fields = document.querySelectorAll(selector);

    // Set the 'value' for each selected field.
    fields.forEach((field) => {
      if (!field.value) {
        // eslint-disable-next-line no-param-reassign
        field.value = value;
      }
    });
  };

  /**
   * Sets hidden fields automatically.
   * @param {Object} data
   */
  const setHiddenFields = (data) => {
    if (!data) {
      return;
    }

    Object.entries(data).forEach(([key, value]) => {
      if (key === 'sldiscountcode') {
        setHiddenField('promo_code', value);
      } else if (key === 'source') {
        setHiddenField('partner_lead_source', value);
      } else {
        setHiddenField(key, value);
      }
    });
  };

  /**
   * Updates a link.
   * @param {Object} link
   * @param {Object} params
   * @param {string} newPathname
   * @return {Object} some value
   */
  const updateLink = (link, params, newPathname) => {
    if (!link || !params) {
      return;
    }

    let newParams;
    let newUrl;
    let oldPathname;

    try {
      const oldUrl = link.href;

      oldPathname = new URL(oldUrl).pathname;
      newUrl = new URL(newPathname ? TARGET_URL : oldUrl);
      newParams = new URLSearchParams(link.search);
    } catch {
      return;
    }

    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      }
    });

    if (newPathname) {
      newUrl.pathname = newPathname;
    } else if (oldPathname) {
      newUrl.pathname = oldPathname;
    }

    newUrl.search = newParams;
    // eslint-disable-next-line no-param-reassign
    link.href = newUrl;
  };

  /**
   * Pass params to a Shopify store.
   * @param {Object} data
   */
  const updateLinks = (data) => {
    if (!data) {
      return;
    }

    const links = document.querySelectorAll(`a[href^='${TARGET_URL}']`);

    links.forEach((link) => updateLink(link, data));
  };

  /**
   * Uses a cookie value.
   * @param {string} itemName
   * @param {string} [cookieName]
   * @param {number} [dayCount]
   * @return {string|null}
   * @todo Refactor to move cookie side effects into new function.
   */
  const useValue = (itemName, cookieName, dayCount) => {
    let data = getCookieData(cookieName) || {};
    // Check localStorage value for backwards compatibility for
    // "ambassadorID" and "sldiscountcode".
    const localValue = localStorage.getItem(itemName);
    const cookieValue = data?.[itemName];

    if (!cookieValue && localValue) {
      data = {
        ...data,
        [itemName]: localValue,
      };

      localStorage.removeItem(itemName);
      deleteCookie(cookieName);
      setCookie(cookieName, data, dayCount);
    }

    return data?.[itemName] || null;
  };

  /**
   * Pass ambassador ID and discount code to a Shopify store.
   * @param {string} cookieName
   */
  const updateSocialLadderTracking = (cookieName) => {
    const ambassadorID = useValue('ambassadorID', cookieName);

    if (!ambassadorID) {
      return;
    }

    const sldiscountcode = useValue('sldiscountcode', cookieName);
    const newPathname = sldiscountcode ? `/discount/${sldiscountcode}` : '';
    const links = document.querySelectorAll(`a[href^='${TARGET_URL}']`);

    links.forEach((link) => {
      const params = { ambassadorID, redirect: link.pathname };

      updateLink(link, params, newPathname);
    });
  };

  /**
   * Update cookie with source value.
   * @param {string} name
   * @param {number} [dayCount]
   */
  const updateCookieSource = (name, dayCount) => {
    const data = getCookieData(name);
    const localSource = data?.source;

    if (!isSourceSubdomain || localSource || !paramSource) {
      return;
    }

    const newData = { ...data, source: sourceMappings[subdomain] };

    deleteCookie(name);
    setCookie(name, newData, dayCount);
  };

  /** After the page loads set the cookie and registers event listeners. */
  window.addEventListener('load', () => {
    const cookieName = 'params';
    const dayCount = parseInt(cookieSettings.cookie_duration);
    let data = getCookieData(cookieName);
    const shouldReset = hasTrackingParam();

    if (data && shouldReset) {
      /** The cookie will be reset after it's been deleted. */
      deleteCookie(cookieName);
    } else if (data) {
      extendCookie(cookieName, dayCount);
    }

    if (!data || shouldReset) {
      data = buildData();

      setCookie(cookieName, data, dayCount);
    } else if (paramSource) {
      updateCookieSource(cookieName, dayCount);
    }

    setHiddenFields(data);
    updateLinks(data);
    updateSocialLadderTracking(cookieName);

    const extensionEvents = ['beforeunload', 'mousedown', 'scroll'];

    extensionEvents.forEach((extensionEvent) => {
      window.addEventListener(extensionEvent, extendCookie);
    });
  });
})();
