/** 
 * If irclickid exists in query params set _irclickid cookie
 * If _irclickid cookie exists set it as a hidden field on all forms
 * */

(() => {

    const urlParams = new URLSearchParams(window.location.search);
    let irclickid = urlParams.get('irclickid');
    if (irclickid) {
        const date = new Date();
        date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));
        document.cookie = `_irclickid=${irclickid}; expires=${date.toGMTString()}; path=/`;
    } else {
        [irclickid] = (`; ${document.cookie}`).split(`; _irclickid=`).pop().split(';');
    }

    if (irclickid !== '') {
        HubSpotForms.getForms().forEach((form) => {
            form.onFormReady((formElement) => {
                const input = document.createElement('input');
                input.setAttribute('type', 'hidden');
                input.setAttribute('name', 'irclickid');
                input.setAttribute('value', irclickid);
                formElement[0].appendChild(input);
            })
        })
    }

})()