window.dataLayer = window.dataLayer || [];

function formView(element) {
  const formName =
    element.querySelector('input[name="leadsource"]').getAttribute('value') ||
    '';
  window.dataLayer.push({
    event: 'form_view',
    form_name: formName,
  });
}

function handleIntersection(entries, observer) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const form = entry.target.closest('form');
      const hiddenInput = form.querySelector('input[name="leadsource"]');
      if (hiddenInput && form.dataset.tracked !== 'true') {
        setTimeout(() => {
          formView(form);
        }, 1000);
        observer.unobserve(form);
        form.dataset.tracked = 'true';
      }
    }
  });
}

const observer = new IntersectionObserver(handleIntersection, {
  root: null,
  rootMargin: '50px',
  threshold: 0.5,
});

function debounce(fn, delay) {
  let timeout;
  return function () {
    const context = this;
      const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(context, args), delay);
  };
}

const debouncedCheckForms = debounce(() => {
  const newForms = document.querySelectorAll('form');
  newForms.forEach((form) => {
    const hiddenInput = form.querySelector('input[name="leadsource"]');
    if (hiddenInput && form.dataset.tracked !== 'true') {
      observer.observe(form);
    }
  });
}, 200);

const mutationObserver = new MutationObserver(debouncedCheckForms);
mutationObserver.observe(document.body, { childList: true, subtree: true });

function formInitiate(element) {
  const formName =
    element.querySelector('input[name="leadsource"]').getAttribute('value') ||
    '';
  window.dataLayer.push({
    event: 'form_initiate',
    form_name: formName,
  });
}
function formFallout(form, fieldName) {
  const formName =
    form.querySelector('input[name="leadsource"]').getAttribute('value') || '';
  window.dataLayer.push({
    event: 'form_fallout',
    form_name: formName,
    form_field_name: fieldName,
  });
}
function handleFormLastField(event) {
  const form = event.target.closest('form');
  if (
    event.target.type === 'text' ||
    event.target.type === 'email' ||
    event.target.type === 'tel'
  ) {
    form.dataset.lastField = event.target.id.split('-')[0];
  } else {
    form.dataset.lastField = event.target.value;
  }
  const submitButton = form.querySelector('input[type="submit"]');
  let isSubmitting = false;
  let isTabSwitched = false;
  if (submitButton) {
    submitButton.addEventListener('click', () => {
      isSubmitting = true;
    });
  }
  document.addEventListener('visibilitychange', () => {
    isTabSwitched = document.hidden;
  });
  setTimeout(() => {
    if (
      form.dataset.startTracked &&
      form.dataset.lastField &&
      !isTabSwitched &&
      !isSubmitting
    ) {
      formFallout(form, form.dataset.lastField);
    }
  }, 100);
}
function handleFormInitiate(event) {
  const form = event.target.closest('form');
  const hiddenInput = form.querySelector('input[name="leadsource"]');
  if (hiddenInput && form.dataset.startTracked !== 'true') {
    formInitiate(form);
    event.target.removeEventListener('focus', handleFormInitiate);
    form.dataset.startTracked = 'true';
  }
}

function addFormInitiateListener(form) {
  const inputs = form.querySelectorAll('input');
  const hiddenInput = form.querySelector('input[name="leadsource"]');
  if (hiddenInput) {
    inputs.forEach((input) => {
      input.addEventListener('focus', handleFormInitiate);
      input.addEventListener('focusout', handleFormLastField);
    });
  }
}

const debouncedAddListeners = debounce(() => {
  const newForms = document.querySelectorAll('form');
  newForms.forEach((form) => {
    if (!form.dataset.startTracked) {
      addFormInitiateListener(form);
    }
  });
}, 200);

const listenerMutationObserver = new MutationObserver(debouncedAddListeners);
listenerMutationObserver.observe(document.body, {
  childList: true,
  subtree: true,
});

const formCache = {};
function cacheFormData(
  data_form_id,
  firstName,
  lastName,
  email,
  country,
  phone,
  city,
  region,
  streetAddress,
  postalCode,
) {
  const selector = `form[data-form-id="${data_form_id}"]`;
  const hs_form = document.querySelector(selector);
  if (hs_form) {
    const formName =
      hs_form.querySelector('input[name="leadsource"]').getAttribute('value') ||
      '';
    formCache[data_form_id] = {
      formName,
      firstName,
      lastName,
      email,
      country,
      phone,
      city,
      region,
      streetAddress,
      postalCode,
    };
  }
}
document.addEventListener(
  'input',
  (event) => {
    if (event.target.closest('form')) {
      const form = event.target.closest('form');
      const data_form_id = form.getAttribute('data-form-id');
      const firstName =
        form.querySelector('input[id^="firstname"]')?.value || '';
      const lastName = form.querySelector('input[id^="lastname"]')?.value || '';
      const email = form.querySelector('input[id^="email"]')?.value || '';
      const country = form.querySelector('select[id^="phone"]')?.value || '';
      const phone =
        form.querySelector('input[id^="phone"]')?.value.replace(/\s+/g, '') ||
        '';
      const city = form.querySelector('input[id^="city"]')?.value || '';
      const region = form.querySelector('input[id^="state"]')?.value || '';
      const streetAddress =
        form.querySelector('input[id^="address"]')?.value || '';
      const postalCode = form.querySelector('input[id^="post"]')?.value || '';
      cacheFormData(
        data_form_id,
        firstName,
        lastName,
        email,
        country,
        phone,
        city,
        region,
        streetAddress,
        postalCode,
      );
    }
  },
  true,
);
function formSubmit(data_form_id, refer_url) {
  const cachedData = formCache[data_form_id];
  window.dataLayer.push({
    event: 'form_submit_DL',
    form_name: cachedData.formName,
    form_referrer_url: refer_url,
    first_name: cachedData.firstName,
    last_name: cachedData.lastName,
    email: cachedData.email,
    country: cachedData.country,
    phone: cachedData.phone,
    city: cachedData.city,
    region: cachedData.region,
    street_address: cachedData.streetAddress,
    postal_code: cachedData.postalCode,
  });
  delete formCache[data_form_id];
}
window.addEventListener('message', (event) => {
  if (
    event.data.type === 'hsFormCallback' &&
    event.data.eventName === 'onFormSubmitted'
  ) {
    const data_form_id = event.data.id;
    const form_referrer_url = window.location.href;
    formSubmit(data_form_id, form_referrer_url);
  }
});
