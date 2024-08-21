/**
 * If irclickid exists in query params set _irclickid cookie
 * If _irclickid cookie exists set it as a hidden field on all forms
 * */
(() => {
  const urlParams = new URLSearchParams(window.location.search);
  let irclickid = urlParams.get('irclickid');
  if (irclickid) {
    IIN.cookies.setCookie('_irclickid', irclickid, 30);
  } else {
    irclickid = IIN.cookies.getCookieString('_irclickid');
  }

  if (irclickid !== '') {
    HubSpotForms.getForms().forEach((form) => {
      form.onFormReady((formElements) => {
        const input = document.createElement('input');
        input.setAttribute('type', 'hidden');
        input.setAttribute('name', '_irclickid');
        input.setAttribute('value', irclickid);
        formElements[0].appendChild(input);
      });
    });
  }
})();
