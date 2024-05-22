/** Cookie session for params in URL */
(() => {
  /**
   * Replicates the Drupal settings from the old site to keep the logic in sync
   * while both are being maintained.
   */
  const settings = {
    /**
     * The "machine_field_name" property is not currently used but it may be
     * useful in the future to know what the Salesforce mappings were in Drupal.
     *
     * Only "ambassadorID" and "utm_channel" are present in SocialLadder
     * referral links.
     */
    cookie_tracking_mapping: [
      {
        url_param_name: 'adagencytoken',
        // machine_field_name: 'AdAgencyToken',
      },
      {
        url_param_name: 'affid',
        // machine_field_name: 'Affiliate_Referrer__c',
      },
      {
        url_param_name: 'ambassadorID',
        // machine_field_name: 'Affiliate_Referrer__c',
      },
      {
        url_param_name: 'erefer',
        // machine_field_name: 'eReferrer__c',
      },
      {
        url_param_name: 'gclid',
        // machine_field_name: 'GCLID__c',
      },
      {
        url_param_name: 'utm_channel',
        // machine_field_name: 'Top_level__c',
      },
      {
        url_param_name: 'url',
        // machine_field_name: 'Adwords_Initial_URL_new__c',
      },
    ],
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
  const defaultCookieName = 'params';
  const defaultDayCount = parseInt(cookieSettings.cookie_duration) || 1;
  const queryString = search.startsWith('?') ? search.slice(1) : search;
  const urlParams = IIN.utilities.makeObjectFromKeyValueString(queryString);
  const paramSource = urlParams?.source;
  const excludedParams = ['hs_preview', 'hsLang'];
  const TARGET_URL = 'https://store.integrativenutrition.com';

  /**
   * Constructs cookie data from URL params.
   * @returns {Object}
   */
  const buildCookieData = () => {
    const data = {};

    Object.entries(urlParams).forEach(([key, value]) => {
      const isExcluded = excludedParams.some((param) => param === key);

      if (!isExcluded) {
        data[key] = value;
      }
    });

    if (isSourceSubdomain && !paramSource) {
      data.source = sourceMappings[subdomain];
    }

    const { host, pathname, protocol } = window.location;

    data.url = `${protocol}//${host}${pathname}`;

    return data;
  };

  /**
   * Check for the existence of tracking param from settings.
   * @returns {boolean}
   */
  const hasTrackingParam = () =>
    settings.cookie_tracking_mapping.some((mapping) => {
      const param = urlParams[mapping.url_param_name];
      const hasParam = Boolean(param) || param === 0;

      return hasParam;
    });

  /**
   * Sets a hidden field.
   * @param {string} name
   * @param {number|string} value
   * @param {boolean} condition
   */
  const setHiddenField = (name, value) => {
    /** Checks if 'value' is falsy and return early if true. */
    if (!value) {
      return;
    }

    const selector = `input[type='hidden'][name='${name}']`;

    /** Gets nodes using the constructed selector. */
    const fields = document.querySelectorAll(selector);

    /** Sets the 'value' for each selected field. */
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
      let hiddenKey = key;

      if (key === 'sldiscountcode') {
        hiddenKey = 'promo_code';
      } else if (key === 'source') {
        hiddenKey = 'partner_lead_source';
      }

      setHiddenField(hiddenKey, value);
    });
  };

  /**
   * Updates a link.
   * @param {Object} link
   * @param {Object} params
   * @param {string} newPathname
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

      const linkQuery = link.search.startsWith('?')
        ? link.search.slice(1)
        : link.search;

      newParams = IIN.utilities.makeObjectFromKeyValueString(linkQuery);
      newUrl = new URL(newPathname ? TARGET_URL : oldUrl);
      oldPathname = new URL(oldUrl).pathname;
    } catch {
      return;
    }

    Object.entries(params).forEach(([key, value]) => {
      if (value || value === 0) {
        newParams[key] = value;
      }
    });

    if (newPathname) {
      newUrl.pathname = newPathname;
    } else if (oldPathname) {
      newUrl.pathname = oldPathname;
    }

    newUrl.search = IIN.utilities.makeKeyValueStringFromObject(newParams);
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
   * Pass ambassador ID and discount code to a Shopify store.
   * @param {string} cookieName
   */
  const updateSocialLadderTracking = (cookieName) => {
    const ambassadorID = IIN.cookies.useValue('ambassadorID', cookieName);

    if (!ambassadorID) {
      return;
    }

    const sldiscountcode = IIN.cookies.useValue('sldiscountcode', cookieName);
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
    const data = IIN.cookies.getCookieObject(name);
    const localSource = data?.source;

    if (!isSourceSubdomain || localSource || !paramSource) {
      return;
    }

    const newData = encodeURIComponent(
      JSON.stringify({
        ...data,
        source: sourceMappings[subdomain],
      })
    );

    IIN.cookies.deleteCookie(name);
    IIN.cookies.setCookie(name, newData, dayCount);
  };

  /**
   * Update cookie data.
   * @param {string} name
   */
  const updateCookieData = (name) => {
    const existingData = IIN.cookies.getCookieObject(name);
    const shouldReset = hasTrackingParam();

    if (existingData && shouldReset) {
      /** The cookie will be reset after it's been deleted. */
      IIN.cookies.deleteCookie(name);
    } else if (existingData) {
      IIN.cookies.extendCookie(name, defaultDayCount);
    }

    if (!existingData || shouldReset) {
      const newData = buildCookieData();
      const encodedData = encodeURIComponent(JSON.stringify(newData));

      IIN.cookies.setCookie(name, encodedData, defaultDayCount);
    } else if (paramSource) {
      updateCookieSource(name, defaultDayCount);
    }

    const updatedData = IIN.cookies.getCookieObject(name);

    return updatedData;
  };

  const cookieData = updateCookieData(defaultCookieName);

  /** After the page loads set the cookie and registers event listeners. */
  window.addEventListener('DOMContentLoaded', () => {
    setHiddenFields(cookieData);
    updateLinks(cookieData);
    updateSocialLadderTracking(defaultCookieName);
  });

  const extensionEvents = ['beforeunload', 'mousedown', 'scroll'];

  extensionEvents.forEach((extensionEvent) => {
    window.addEventListener(extensionEvent, () => {
      IIN.cookies.extendCookie(defaultCookieName, defaultDayCount);
    });
  });
})();
