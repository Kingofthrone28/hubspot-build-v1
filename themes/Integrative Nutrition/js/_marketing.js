/**
 * Custom JS logic for marketing features (forms, lead capture etc).
 */

$(() => {
  function callback(records) {
    records.forEach((record) => {
      const list = record.addedNodes;
      let i = list.length - 1;

      for (; i > -1; i--) {
        if (list[i].nodeName.toLowerCase() === 'iframe') {
          const src = $(list[i]).attr('src');

          if (src) {
            const params = window.location.search.substring(1);
            const delimiter = src.indexOf('?') > 0 ? '&' : '?';

            $(list[i]).attr('src', src + delimiter + params);
          }
        }
      }
    });
  }

  const observer = new MutationObserver(callback);
  const targetNode = document.querySelector('body');

  observer.observe(targetNode, { childList: true, subtree: true });
});
