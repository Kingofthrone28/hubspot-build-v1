const datalayerurl = "{{ get_asset_url("/Integrative Nutrition/js/datalayer.js") }}"
//Control of code starts here.
document.addEventListener('DOMContentLoaded', function () {
  // DLTest - inside dataLayerToggle JS...
  renderAnalyticsDatalayerJS();
});

// Function to set a Cookie based on the presence of 'analytics-test' in the URL
// if URL matches and cookie doesn't exist then create cookie & load datalayer JS
// if URL matches and cookie already exists then load datalayer JS

function renderAnalyticsDatalayerJS() {
  if (isTestingEnabled()) {
    if (!checkCookie("analyticstest")) {
      // DLTest - Setting a cookie and loading datalayer JS...
      document.cookie = "analyticstest=true;domain=.integrativenutrition.com";
    }
    window.dataLayer = window.dataLayer || [];
    // Requirement from GTM to indicate the preview mode to choose gtm bucket
    window.dataLayer.unshift({
        'env_name': 'preview'
    });

    loadScript(datalayerurl);
    // DLTest - Successfully loaded datalayer JS...
  } else if (isTestingDisabled()) {
    // DLTest - Setting a cookie to disable datalayer
    document.cookie = "analyticstest=;Path=/;domain=.integrativenutrition.com;expires=Thu, 01 Jan 1970 00:00:01 GMT;";
  } else if (checkCookie("analyticstest")) { 
    //handles pages with no matching analytics-test param. example; prod or other preview urls.
    // DLTest - cookie already exists so loading datalayer JS...
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.unshift({
      'env_name': 'preview'
    });
    loadScript(datalayerurl);
    // DLTest - Successfully loaded datalayer JS...
  } 
}

// Function to check if the current environment is a testing enabled
function isTestingEnabled() {
  return window.location.href.includes('hs_preview=') && window.location.href.includes('analytics-test=true');
}

// Function to check if the current environment is a testing disabled
function isTestingDisabled() {
  return window.location.href.includes('analytics-test=false');
}


// Function to check if a cookie exists
function checkCookie(cookieName) {
  return document.cookie.includes(cookieName);
}

function loadScript(scriptURL) {
  const script = document.createElement('script');
  script.src = scriptURL;
  document.head.appendChild(script);
}
