/**
 * Weglot is used to dynamically translate content.
 * @see {@link https://developers.weglot.com/javascript/javascript#initialization-code WeGlot Getting Started}
 */
(() => {
  const weglotApiKeys = {
    course: 'wg_8ba62aec1c27a90846ee8a15c4acf00d8',
    info: 'wg_9a4056032062028e8fdd8b0aa75aae418',
    www: 'wg_22f91c0430456d0d120ff3f524319edf0'
  };

  const { hostname } = window.location;
  const subdomains = hostname.split('.').slice(0, -2);
  const lastSubdomain = subdomains[subdomains.length - 1];
  const weglotSubdomain = lastSubdomain || 'www';

  Weglot.initialize({ api_key: weglotApiKeys[weglotSubdomain] });
})();
