/**
 * Weglot is used to dynamically translate content.
 * @see {@link https://developers.weglot.com/javascript/javascript#initialization-code WeGlot Getting Started}
 */
(() => {
  const keys = {
    www: 'wg_22f91c0430456d0d120ff3f524319edf0',
  };

  const { hostname } = window.location;
  const subdomains = hostname.split('.').slice(0, -2);
  const lastSubdomain = subdomains[subdomains.length - 1];
  const subdomain = lastSubdomain || 'www';
  const key =  keys[subdomain];

  if (key) {
    Weglot.initialize({ api_key: key });
  }
})();
