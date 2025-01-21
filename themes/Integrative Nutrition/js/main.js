{% include './_plugins.js' %}
{% include './_marketing.js' %}
{% include './libphonenumber.js' %}
{% include './form-phone-validation.js' %}
{% include './blog.js' %}
{% include './datalayer.js' %}

$(function () {
  $('.load-parent').each(function () {
    var load_type = $(this).data('load'),
      load_target = $(this).data('target');
    $(this)
      .closest('.dnd-' + load_target)
      .addClass(load_type);
  });

  {% include './_animation.js' %}
});

/* Set inferred time zone */
$(function () {
  setInferredTimeZone();
});

$(function () {
  var currentDomain = window.location.hostname;
  var language = 'preferred_language__c';
  // Check if the current domain includes the string "example"
  setTimeout(function () {
    if (currentDomain.indexOf('es.') !== -1) {
      $('input[name="hs_language"]').val('es');
      $(`input[name="${language}"`).val('es');
    } else {
      $('input[name="hs_language"]').val('en');
      $(`input[name="${language}"`).val('en');
    }
  }, 1000);
});

// Populate adwords field with Full before for submission
// Get the current host domain
$(function () {
  const getCurrentHost = window.location.href;
  const hostDomain = getCurrentHost;

  setTimeout(function () {
    const hiddenField = $('input[name="adwords_initial_url_new__c"]');
    if (!hiddenField) return;
    if (hiddenField) {
      hiddenField.val(hostDomain);
    }
  }, 2000);
});

// Configure header hide/show on scroll
$(() => {
  const headerWrapClasses =
    document.querySelector('.jd-header-wrap')?.classList;

  if (!headerWrapClasses) {
    return;
  }

  let previousScrollTop = 0;

  const onScroll = () => {
    const currentScrollTop = window.scrollY;

    // Check if previousScrollTop is less than 0
    if (previousScrollTop < 0) {
      // Safari allows a bounce at the top of the page that can be negative
      headerWrapClasses.remove('ishidden');
    } else if (currentScrollTop > previousScrollTop) {
      // Scrolling Down
      headerWrapClasses.add('ishidden');
      IIN.helpers.closeMenus();
    } else {
      // Scrolling Up
      headerWrapClasses.remove('ishidden');
    }

    previousScrollTop = currentScrollTop;
  };

  window.addEventListener('scroll', IIN.helpers.throttle(onScroll));
});

$(function () {
  /* Team Card */
  $('.team-bio-pop-wrap').each(function () {
    $(this).appendTo($('body'));
  });

  $('.team-bio-link').click(function (e) {
    e.preventDefault();
    $('#team-bio-' + $(this).data('id')).addClass('show-bio');
  });

  $('.team-bio-card-link').click(function (e) {
    e.preventDefault();
    $('#' + $(this).data('id')).addClass('show-bio-card');
  });

  $('.team-card-back .close').click(function () {
    $(this).parent().parent().removeClass('show-bio-card');
  });

  $('.team-bio-pop .close').click(function () {
    $(this).parent().parent().removeClass('show-bio');
  });

  /* Video Pop */
  $('.video-slider .video-card').click(function () {
    if (VidyardV4) {
      $('#video-pop-' + $(this).data('id') + ' .video-pop-player')
        .contents()
        .each(function (index, node) {
          if (node.nodeType == 8) {
            $(node).replaceWith(node.nodeValue);
          }
        });

      VidyardV4.api.renderPlayer(
        $('#video-pop-' + $(this).data('id') + ' .video-pop-player img')[0],
      );
    }
    $('#video-pop-' + $(this).data('id')).addClass('show-bio');
  });

  $('.video-close').click(function () {
    VidyardV4.players.forEach(function (player) {
      player.pause();
    });
    $;
  });

  /* Price Options */
  $('.price-options .video-card').click(function () {
    $(this).parent().find('.option-pop').addClass('show-option-pop');
  });

  $('.price-options .option-pop').click(function () {
    $(this).removeClass('show-option-pop');
  });

  {% include './course-catalog.js' %}

  /* Style request info course topic dropdwon */
  setTimeout(function () {
    $('.hs-custom-form .hs_vertical__c>label').on('click', function () {
      $('.hs-custom-form .hs-vertical__c div.input').toggle();
    });
  }, 2000);
});

function setInferredTimeZone() {
  let inferred_timezone_field = 'inferred_time_zone__c';
  let country_name = '';

  setTimeout(function () {
    // Create two Date objects: one for now and one for Eastern Time
    const now = new Date();
    const easternTime = new Date(
      now.toLocaleString('en-US', {
        timeZone: 'America/New_York',
      }),
    );

    // Calculate the difference in milliseconds and convert to hours
    const diffInHours = (now - easternTime) / 1000 / 60 / 60;
    const inferred_timezone_value = Math.round(diffInHours * 10) / 10;
    const country_code = $('div[data-hubspot-country]').attr(
      'data-hubspot-country',
    );

    if (country_code) {
      let regionNames = new Intl.DisplayNames(['en'], {
        type: 'region',
      });
      let countryName = regionNames.of(country_code);

      if (formatNumber(inferred_timezone_value) == 0) {
        $(`input[name="${inferred_timezone_field}"`).val(
          countryName + ' (Eastern Time)',
        );
      } else {
        $(`input[name="${inferred_timezone_field}"`).val(
          countryName +
            ' (' +
            formatNumber(inferred_timezone_value) +
            ' hours from Eastern Time)',
        );
      }
    }
  }, 1000);
}

function formatNumber(num) {
  return (num > 0 ? '+' : '') + num;
}
  
/* Font Awesome Pro */
window.FontAwesomeKitConfig = {
  asyncLoading: { enabled: true },
  autoA11y: { enabled: true },
  baseUrl: 'https://kit-pro.fontawesome.com',
  detectConflictsUntil: null,
  license: 'pro',
  method: 'css',
  minify: { enabled: true },
  v4FontFaceShim: { enabled: true },
  v4shim: { enabled: true },
  version: 'latest',
};

!(function () {
    function r(e) {
        var t,
            n = [],
            i = document,
            o = i.documentElement.doScroll,
            r = "DOMContentLoaded",
            a = (o ? /^loaded|^c/ : /^loaded|^i|^c/).test(i.readyState);
        a ||
            i.addEventListener(
                r,
                (t = function () {
                    for (i.removeEventListener(r, t), a = 1; (t = n.shift()); ) t();
                })
            ),
            a ? setTimeout(e, 0) : n.push(e);
    }
    !(function () {
        if (!(void 0 === window.Element || "classList" in document.documentElement)) {
            var e,
                t,
                n,
                i = Array.prototype,
                o = i.push,
                r = i.splice,
                a = i.join;
            (d.prototype = {
                add: function (e) {
                    this.contains(e) || (o.call(this, e), (this.el.className = this.toString()));
                },
                contains: function (e) {
                    return -1 != this.el.className.indexOf(e);
                },
                item: function (e) {
                    return this[e] || null;
                },
                remove: function (e) {
                    if (this.contains(e)) {
                        for (var t = 0; t < this.length && this[t] != e; t++);
                        r.call(this, t, 1), (this.el.className = this.toString());
                    }
                },
                toString: function () {
                    return a.call(this, " ");
                },
                toggle: function (e) {
                    return this.contains(e) ? this.remove(e) : this.add(e), this.contains(e);
                },
            }),
                (window.DOMTokenList = d),
                (e = Element.prototype),
                (t = "classList"),
                (n = function () {
                    return new d(this);
                }),
                Object.defineProperty ? Object.defineProperty(e, t, { get: n }) : e.__defineGetter__(t, n);
        }
        function d(e) {
            for (var t = (this.el = e).className.replace(/^\s+|\s+$/g, "").split(/\s+/), n = 0; n < t.length; n++) o.call(this, t[n]);
        }
    })();
    function a(e) {
        var t, n, i, o;
        (prefixesArray = e || ["fa"]),
            (prefixesSelectorString = "." + Array.prototype.join.call(e, ",.")),
            (t = document.querySelectorAll(prefixesSelectorString)),
            Array.prototype.forEach.call(t, function (e) {
                (n = e.getAttribute("title")),
                    e.setAttribute("aria-hidden", "true"),
                    (i = !e.nextElementSibling || !e.nextElementSibling.classList.contains("sr-only")),
                    n && i && (((o = document.createElement("span")).innerHTML = n), o.classList.add("sr-only"), e.parentNode.insertBefore(o, e.nextSibling));
            });
    }
    var d = function (e, t) {
            var n = document.createElement("link");
            (n.href = e),
                (n.media = "all"),
                (n.rel = "stylesheet"),
                (n.id = "font-awesome-5-kit-css"),
                t && t.detectingConflicts && t.detectionIgnoreAttr && n.setAttributeNode(document.createAttribute(t.detectionIgnoreAttr)),
                document.getElementsByTagName("head")[0].appendChild(n);
        },
        c = function (e, t) {
            !(function (e, t) {
                var n,
                    i = (t && t.before) || void 0,
                    o = (t && t.media) || void 0,
                    r = window.document,
                    a = r.createElement("link");
                if ((t && t.detectingConflicts && t.detectionIgnoreAttr && a.setAttributeNode(document.createAttribute(t.detectionIgnoreAttr)), i)) n = i;
                else {
                    var d = (r.body || r.getElementsByTagName("head")[0]).childNodes;
                    n = d[d.length - 1];
                }
                var c = r.styleSheets;
                (a.rel = "stylesheet"),
                    (a.href = e),
                    (a.media = "only x"),
                    (function e(t) {
                        if (r.body) return t();
                        setTimeout(function () {
                            e(t);
                        });
                    })(function () {
                        n.parentNode.insertBefore(a, i ? n : n.nextSibling);
                    });
                var s = function (e) {
                    for (var t = a.href, n = c.length; n--; ) if (c[n].href === t) return e();
                    setTimeout(function () {
                        s(e);
                    });
                };
                function l() {
                    a.addEventListener && a.removeEventListener("load", l), (a.media = o || "all");
                }
                a.addEventListener && a.addEventListener("load", l), (a.onloadcssdefined = s)(l);
            })(e, t);
        },
        e = function (e, t, n) {
            var i = t && void 0 !== t.autoFetchSvg ? t.autoFetchSvg : void 0,
                o = t && void 0 !== t.async ? t.async : void 0,
                r = t && void 0 !== t.autoA11y ? t.autoA11y : void 0,
                a = document.createElement("script"),
                d = document.scripts[0];
            (a.src = e),
                void 0 !== r && a.setAttribute("data-auto-a11y", r ? "true" : "false"),
                i && (a.setAttributeNode(document.createAttribute("data-auto-fetch-svg")), a.setAttribute("data-fetch-svg-from", t.fetchSvgFrom)),
                o && a.setAttributeNode(document.createAttribute("defer")),
                n && n.detectingConflicts && n.detectionIgnoreAttr && a.setAttributeNode(document.createAttribute(n.detectionIgnoreAttr)),
                d.parentNode.appendChild(a);
        };
    function s(e, t) {
        var n = (t && t.addOn) || "",
            i = (t && t.baseFilename) || e.license + n,
            o = t && t.minify ? ".min" : "",
            r = (t && t.fileSuffix) || e.method,
            a = (t && t.subdir) || e.method;
        return e.baseUrl + "/releases/" + ("latest" === e.version ? "latest" : "v".concat(e.version)) + "/" + a + "/" + i + o + "." + r;
    }
    var t, n, i, o, l;
    try {
        if (window.FontAwesomeKitConfig) {
            var u,
                f = window.FontAwesomeKitConfig,
                m = {
                    detectingConflicts: f.detectConflictsUntil && new Date() <= new Date(f.detectConflictsUntil),
                    detectionIgnoreAttr: "data-fa-detection-ignore",
                    detectionTimeoutAttr: "data-fa-detection-timeout",
                    detectionTimeout: null,
                };
            "js" === f.method &&
                ((o = m),
                (l = { async: (i = f).asyncLoading.enabled, autoA11y: i.autoA11y.enabled }),
                "pro" === i.license && ((l.autoFetchSvg = !0), (l.fetchSvgFrom = i.baseUrl + "/releases/" + ("latest" === i.version ? "latest" : "v".concat(i.version)) + "/svgs")),
                i.v4shim.enabled && e(s(i, { addOn: "-v4-shims", minify: i.minify.enabled })),
                e(s(i, { minify: i.minify.enabled }), l, o)),
                "css" === f.method &&
                    (function (e, t) {
                        var n,
                            i = a.bind(a, ["fa", "fab", "fas", "far", "fal", "fad"]);
                        e.autoA11y.enabled && (r(i), (n = i), "undefined" != typeof MutationObserver && new MutationObserver(n).observe(document, { childList: !0, subtree: !0 })),
                            e.v4shim.enabled && (e.license, e.asyncLoading.enabled ? c(s(e, { addOn: "-v4-shims", minify: e.minify.enabled }), t) : d(s(e, { addOn: "-v4-shims", minify: e.minify.enabled }), t));
                        e.v4FontFaceShim.enabled && (e.asyncLoading.enabled ? c(s(e, { addOn: "-v4-font-face", minify: e.minify.enabled }), t) : d(s(e, { addOn: "-v4-font-face", minify: e.minify.enabled }), t));
                        var o = s(e, { minify: e.minify.enabled });
                        e.asyncLoading.enabled ? c(o, t) : d(o, t);
                    })(f, m),
                m.detectingConflicts &&
                    ((u = document.currentScript.getAttribute(m.detectionTimeoutAttr)) && (m.detectionTimeout = u),
                    document.currentScript.setAttributeNode(document.createAttribute(m.detectionIgnoreAttr)),
                    (t = f),
                    (n = m),
                    r(function () {
                        var e = document.createElement("script");
                        n && n.detectionIgnoreAttr && e.setAttributeNode(document.createAttribute(n.detectionIgnoreAttr)),
                            n && n.detectionTimeoutAttr && n.detectionTimeout && e.setAttribute(n.detectionTimeoutAttr, n.detectionTimeout),
                            (e.src = s(t, { baseFilename: "conflict-detection", fileSuffix: "js", subdir: "js", minify: t.minify.enabled })),
                            (e.async = !0),
                            document.body.appendChild(e);
                    }));
        }
    } catch (e) {}
})();

(function () {
  var HIDE_FOCUS_STYLES_CLASS = 'disable-focus-styles';
  var SHOW_FOCUS_STYLES_CLASS = 'enable-focus-styles';

  var firstLanguageSwitcherItem = document.querySelector(
    '.header__language-switcher .lang_list_class li:first-child',
  );

  var languageSwitcherList = document.querySelector(
    '.header__language-switcher .lang_list_class',
  );

  var Nav = document.querySelector('.header__navigation');
  var LangSwitcher = document.querySelector('.header__language-switcher');
  var Search = document.querySelector('.header__search');

  var allToggles = document.querySelectorAll('.header--toggle');
  var navToggle = document.querySelector('.header__navigation--toggle');
  var langToggle = document.querySelector('.header__language-switcher--toggle');
  var searchToggle = document.querySelector('.header__search--toggle');
  var closeToggle = document.querySelector('.header__close--toggle');

  var allElements = document.querySelectorAll(
    '.header--element, .header--toggle',
  );

  function domReady(callback) {
    if (['interactive', 'complete'].indexOf(document.readyState) >= 0) {
      callback();
    } else {
      document.addEventListener('DOMContentLoaded', callback);
    }
  }

  function showFocusOutline() {
    document.body.classList.add(SHOW_FOCUS_STYLES_CLASS);
    document.body.classList.remove(HIDE_FOCUS_STYLES_CLASS);
  }

  function hideFocusOutline() {
    document.body.classList.add(HIDE_FOCUS_STYLES_CLASS);
    document.body.classList.remove(SHOW_FOCUS_STYLES_CLASS);
  }

  // adds hover effects to the pseduoelement triangle on the menu
  // for design continutity
  function hoverLanguageSwitcher() {
    languageSwitcherList.classList.add('first-active');
  }

  function unhoverLanguageSwitcher() {
    languageSwitcherList.classList.remove('first-active');
  }

  function toggleNav() {
    allToggles.forEach(function (toggle) {
      toggle.classList.toggle('hide');
    });

    Nav.classList.toggle('open');
    navToggle.classList.toggle('open');
    closeToggle.classList.toggle('show');
  }

  function toggleLang() {
    allToggles.forEach(function (toggle) {
      toggle.classList.toggle('hide');
    });

    LangSwitcher.classList.toggle('open');
    langToggle.classList.toggle('open');
    closeToggle.classList.toggle('show');
  }

  function toggleSearch() {
    allToggles.forEach(function (toggle) {
      toggle.classList.toggle('hide');
    });

    Search.classList.toggle('open');
    searchToggle.classList.toggle('open');
    closeToggle.classList.toggle('show');
  }

  function closeAll() {
    allElements.forEach(function (element) {
      element.classList.remove('hide', 'open');
    });

    closeToggle.classList.remove('show');
  }

  document.addEventListener('keyup', showFocusOutline);
  document.addEventListener('mouseover', hideFocusOutline);
  document.addEventListener('touchstart', hideFocusOutline);
})();

// search stay open on focus
$('.mb-custom-header .hs-search-field__input').focus(function () {
  $('.nav-search .hs-search-field').addClass('focus');
});

$('.mb-custom-header .hs-search-field__input').focusout(function () {
  $('.nav-search .hs-search-field').removeClass('focus');
});

window.addEventListener('load', function () {
  // mobile menu
  var mobileHeight = $('#main-header').outerHeight();

  $('.mobile-click').click(function () {
    if ($('body').hasClass('open')) {
      $('body').removeClass('open');
      $('#main-header').animate(
        {
          height: mobileHeight,
        },
        500,
        function () {
          // Animation complete.
        },
      );
    } else {
      $('body').addClass('open');
      $('#main-header').animate(
        {
          height: '100vh',
        },
        500,
        function () {
          // Animation complete.
        },
      );
    }
  });

  // Mobile Children
  $('.mb-mobile-nav .dropdown-toggle').click(function () {
    if ($(this).hasClass('open')) {
      $(this).removeClass('open');
      $(this).siblings('.dropdown-menu').slideUp('fast');
    } else {
      $('.mb-mobile-nav .dropdown-toggle').removeClass('open');
      $('.mb-mobile-nav .dropdown-menu').slideUp('fast');
      $(this).addClass('open');
      $(this).siblings('.dropdown-menu').slideDown('fast');
    }
  });

  // Mobile Children
  $('.overlay-cta').each(function () {
    var children = $(this).find('.hs_cos_wrapper > div').length;

    if (children >= 1) {
      $(this).parents('.odl-cta-wrapper').addClass('has-content');
    }
  });

  // Jump to section
  $('.jump-button').click(function () {
    var section = $(this).data('target');
    $('html, body').animate({ scrollTop: $(section).offset().top - 160 }, 500);
  });

  // Parallax Drop Shadow
  function parallax_ds() {
    $('.item-dropshadow.par-true').each(function () {
      var elementTop = $(this).parent().offset().top,
        elementHeight = $(this).parent().outerHeight(),
        containerTop = $(window).scrollTop(),
        containerHeight = $(window).height(),
        animate =
          (elementTop +
            elementHeight / 2 -
            (containerTop + containerHeight / 2)) /
          10;

      if ($(this).hasClass('bottom_right')) {
        $(this).css({
          '-webkit-transform': 'translate(30px,' + (animate + 30) + 'px)',
        });
      } else if ($(this).hasClass('bottom_left')) {
        $(this).css({
          '-webkit-transform': 'translate(-30px,' + (animate + 30) + 'px)',
        });
      } else if ($(this).hasClass('top_right')) {
        animate = animate * -1;
        $(this).css({
          '-webkit-transform': 'translate(30px,' + (animate - 30) + 'px)',
        });
      } else {
        animate = animate * -1;
        $(this).css({
          '-webkit-transform': 'translate(-30px,' + (animate - 30) + 'px)',
        });
      }
    });
  }

  $(window).scroll(function () {
    parallax_ds();
  });

  // accordian section
  $('.ex-item .ex-label').click(function () {
    if ($(this).parent('.ex-item').hasClass('open')) {
      $(this).parent('.ex-item').removeClass('open');
      $(this).siblings('.ex-text').slideUp('fast');
    } else {
      $(this).parent('.ex-item').addClass('open');
      $(this).siblings('.ex-text').slideDown('fast');
    }
  });

  // open resource pop-up
  $('.mb-resource .open-popup').click(function () {
    var pop_up = $(this).data('open'),
      form_id = $('#' + pop_up + ' .mb-form').data('form'),
      form_redirect = $('#' + pop_up + ' .mb-form').data('redirect');

    hbspt.forms.create({
      css: '',
      portalId: '249181',
      formId: form_id,
      redirectUrl: form_redirect,
      target: '#' + pop_up + ' .mb-form',
    });
    $('#' + pop_up).addClass('open');
  });

  $('.close').click(function () {
    $('.re-pop-wrapper').removeClass('open');
  });

  // open pop-up
  $('.open-popup').click(function () {
    var pop_up = $(this).data('open');
    $('#' + pop_up).addClass('open');
  });

  // Sticky header change
  const $stickyTrue = $('.sticky-true');

  if ($stickyTrue.length) {
    $(document).scroll(function () {
      var scrollAmount = $(window).scrollTop(),
        height = $stickyTrue.outerHeight();

      if (scrollAmount >= height) {
        $stickyTrue.addClass('scroll');
      } else {
        $stickyTrue.removeClass('scroll');
      }
    });
  }

  // Tab Sections
  $('.dnd-section.vert-tabs').each(function () {
    var path = $(this).find(
      '.row-fluid > .dnd-column > .dnd-row[class*="background-color"] > .row-fluid',
    );

    $(this)
      .find(
        '.row-fluid > .dnd-column > .dnd-row[class*="background-color"] > .row-fluid > .dnd-column:nth-child(1)',
      )
      .addClass('nav');

    $(this)
      .find(
        '.row-fluid > .dnd-column > .dnd-row[class*="background-color"] > .row-fluid > .dnd-column:nth-child(2)',
      )
      .addClass('body');

    path
      .find('.dnd-column:nth-child(1) > .dnd-row:nth-child(1)')
      .addClass('selected');

    path
      .find('.dnd-column:nth-child(2) > .dnd-row:nth-child(1)')
      .addClass('selected');

    $($('.nav > .dnd-row')).click(function () {
      if (!$(this).hasClass('selected')) {
        path.find('.selected').removeClass('selected');
        $(this).addClass('selected');
        var index = $(this).index() + 1;
        path
          .find('.dnd-column:nth-child(2) > .dnd-row:nth-child(' + index + ')')
          .addClass('selected');
      }
    });
  });

  $('.dnd-section.hrz-tabs').each(function () {
    var parent = $(this),
      path = $(this).find(
        '.row-fluid > .dnd-column > .dnd-row > .row-fluid > .dnd-column[class*="background-color"] > .dnd-row:nth-child(1)',
      ),
      half = $(this).find(
        '.row-fluid > .dnd-column > .dnd-row > .row-fluid > .dnd-column[class*="background-color"]',
      );

    path.addClass('selected');

    $($('.ui-widget-header')).click(function () {
      if (!$(this).hasClass('ui-state-highlight')) {
        half.find('.selected').removeClass('selected');
        parent.find('.ui-state-highlight').removeClass('ui-state-highlight');
        $(this).addClass('ui-state-highlight');
        var index = $(this).index() + 1,
          pos = $(this).data('pos');
        parent.find('.draggable').css('left', pos + '%');
        half.find('.dnd-row:nth-child(' + index + ')').addClass('selected');
      }
    });
  });

  // Filter Section

  function loadPage(pageNum, content, filter_location, search) {
    $('#' + content).removeClass('stagger-show');

    var filters = {};

    $('#' + filter_location + ' input[type=checkbox]:checked').each(
      function () {
        if (!filters[$(this).attr('name')]) {
          filters[$(this).attr('name')] = '';
        }

        filters[$(this).attr('name')] += $(this).val() + ',';
      },
    );

    var query = '?';

    for (var filter in filters) {
      if (filters.hasOwnProperty(filter)) {
        query += filter + '=' + filters[filter] + '&';
      }
    }

    if (pageNum) {
      query += 'page=' + pageNum + '&';
    }

    var searchQ = $('#' + search + ' input[name=search]').val();

    if (searchQ) {
      query += 'search=' + searchQ;
    }

    var url = window.location.href.split('?')[0];

    $('#' + content).load(
      url + query + ' #' + content + ' .stagger-grid-wrap-inner',

      function () {
        $('#' + content).addClass('stagger-show');
        $('#' + content + ' .pagi-num').click(function () {
          loadPage($(this).data('num'), content, filter_location, search);
        });
      },
    );
  }

  $('.dnd-section.filter-section').each(function () {
    var filters = $(this).find('.stagger-filters-inner').attr('id'),
      content = $(this).find('.stagger-grid-wrap').attr('id'),
      search = $(this).find('.stagger-search').attr('id');

    $('#' + filters + ' input[type=checkbox]').change(function () {
      loadPage(1, content, filters, search);
    });

    $('#' + content + ' .pagi-num').click(function () {
      loadPage($(this).data('num'), content, filters, search);
    });

    $('#' + search).submit(function (e) {
      e.preventDefault();
      loadPage(1, content, filters, search);
    });
  });

  $('#needle-invite-english-page').click(function (e) {
    e.preventDefault();
    needleInviteEnglishPage();
  });

  function needleInviteEnglishPage() {
    Needle.PageUpdate('R', '&vdata=skill%3d');
    Needle.cm = 'chatreq';
    Needle.iid = 'englishLink';
    Needle.campaign = 'nt|englishLInk';
    Needle.wid = '{{WIN_ID}}';
    Needle.partner = 'Integrative Nutrition';
    Needle.cucoPosition = 'Left';
    Needle.style = 'Theme1';
    Needle.inviteClick(1, '&ct=ndchat', Needle.initInline); //inline chat window
    return false; //prevents event bubbling
  }

  var checkNeedleEn = $('.jd-header-main a.needle-invite-english');
  var checkNeedleEnMobile = $('.jd-mobile-menu a.needle-invite-english');

  if (checkNeedleEn || checkNeedleEnMobile) {
    setTimeout(alertFunc, 10);
    function alertFunc() {
      checkNeedleEn.removeClass('needle-invite-english');
      checkNeedleEnMobile.removeClass('needle-invite-english');
    }
  }

  // $(window).bind('pageshow', function (event) {
  //   if (event.originalEvent.persisted) {
  //     window.location.reload();
  //   }
  // });
});
