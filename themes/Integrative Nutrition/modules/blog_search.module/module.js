const hsSearch = function (_instance) {
  const TYPEAHEAD_LIMIT = 3;
  let searchTerm = '';
  const searchForm = _instance;
  const searchField = _instance.querySelector('.hs-search-field__input');
  const searchResults = _instance.querySelector(
    '.hs-search-field__suggestions',
  );

  const searchOptions = function () {
    const formParams = [];
    const form = _instance.querySelector('form');

    for (
      let i = 0;
      i < form.querySelectorAll('input[type=hidden]').length;
      i++
    ) {
      const e = form.querySelectorAll('input[type=hidden]')[i];

      if (e.name !== 'limit') {
        formParams.push(
          `${encodeURIComponent(e.name)}=${encodeURIComponent(e.value)}`,
        );
      }
    }

    const queryString = formParams.join('&');

    return queryString;
  };

  const debounce = function (func, wait, immediate) {
    let timeout;

    return function (...args) {
      const context = this;

      const later = function () {
        timeout = null;

        if (!immediate) {
          func.apply(context, args);
        }
      };

      const callNow = immediate && !timeout;

      clearTimeout(timeout);
      timeout = setTimeout(later, wait || 200);

      if (callNow) {
        func.apply(context, args);
      }
    };
  };

  const emptySearchResults = function () {
    searchResults.innerHTML = '';
    searchField.focus();
    searchForm.classList.remove('hs-search-field--open');
  };

  const fillSearchResults = function (response) {
    const items = [];

    items.push(
      `<li id='results-for'>Results for "${response.searchTerm}"</li>`,
    );

    response.results.forEach((val, index) => {
      items.push(
        `<li id='result${index}'><a href='${val.url}'>${val.title}</a></li>`,
      );
    });

    emptySearchResults();
    searchResults.innerHTML = items.join('');
    searchForm.classList.add('hs-search-field--open');
  };

  const trapFocus = function () {
    const tabbable = [searchField];
    const tabbables = searchResults.getElementsByTagName('A');

    for (let i = 0; i < tabbables.length; i++) {
      tabbable.push(tabbables[i]);
    }

    const firstTabbable = tabbable[0];
    const lastTabbable = tabbable[tabbable.length - 1];

    const tabResult = function (e) {
      if (e.target === lastTabbable && !e.shiftKey) {
        e.preventDefault();
        firstTabbable.focus();
      } else if (e.target === firstTabbable && e.shiftKey) {
        e.preventDefault();
        lastTabbable.focus();
      }
    };

    const nextResult = function (e) {
      e.preventDefault();

      if (e.target === lastTabbable) {
        firstTabbable.focus();
      } else {
        tabbable.forEach((el) => {
          if (el === e.target) {
            tabbable[tabbable.indexOf(el) + 1].focus();
          }
        });
      }
    };

    const lastResult = function (e) {
      e.preventDefault();

      if (e.target === firstTabbable) {
        lastTabbable.focus();
      } else {
        tabbable.forEach((el) => {
          if (el === e.target) {
            tabbable[tabbable.indexOf(el) - 1].focus();
          }
        });
      }
    };

    searchForm.addEventListener('keydown', (e) => {
      switch (e.which) {
        case 9:
          tabResult(e);
          break;
        case 27:
          emptySearchResults();
          break;
        case 38:
          lastResult(e);
          break;
        case 40:
          nextResult(e);
          break;
        default:
      }
    });
  };

  const getSearchResults = function () {
    const request = new XMLHttpRequest();
    const requestUrl = `/_hcms/search?&term=${encodeURIComponent(
      searchTerm,
    )}&limit=${encodeURIComponent(
      TYPEAHEAD_LIMIT,
    )}&autocomplete=true&analytics=true&${searchOptions()}`;

    request.open('GET', requestUrl, true);

    request.onload = function () {
      if (request.status >= 200 && request.status < 400) {
        const data = JSON.parse(request.responseText);
        if (data.total > 0) {
          fillSearchResults(data);
          trapFocus();
        } else {
          emptySearchResults();
        }
      } else {
        console.error('Server reached, error retrieving results.');
      }
    };

    request.onerror = function () {
      console.error('Could not reach the server.');
    };

    request.send();
  };

  const isSearchTermPresent = debounce(() => {
    searchTerm = searchField.value;

    if (searchTerm.length > 2) {
      getSearchResults();
    } else if (!searchTerm.length) {
      emptySearchResults();
    }
  }, 250);

  (function () {
    searchField.addEventListener('input', (e) => {
      if (
        e.which !== 9 &&
        e.which !== 40 &&
        e.which !== 38 &&
        e.which !== 27 &&
        searchTerm !== searchField.value
      ) {
        isSearchTermPresent();
      }
    });
  })();
};

if (
  document.attachEvent
    ? document.readyState === 'complete'
    : document.readyState !== 'loading'
) {
  const searchResults = document.querySelectorAll('.hs-search-field');

  Array.prototype.forEach.call(searchResults, (el) => {
    const hsSearchModule = hsSearch(el);
  });
} else {
  document.addEventListener('DOMContentLoaded', () => {
    const searchResults = document.querySelectorAll('.hs-search-field');

    Array.prototype.forEach.call(searchResults, (el) => {
      const hsSearchModule = hsSearch(el);
    });
  });
}
