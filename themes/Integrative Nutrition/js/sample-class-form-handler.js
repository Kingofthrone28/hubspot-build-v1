/**
 * JS Snippet to be added to a page with a Sample Class Form
 * Captures form submit event for sample class form and redirects based upon HTML lang
 * Temporary solution, to be removed once Spanish Sample Class exists on Hubspot
 */

const addSampleClassFormSubmitListener = () => {
  const SAMPLE_CLASS_FORM_ID = '';
  const ENGLISH_SAMPLE_CLASS_URL = '';
  const SPANISH_SAMPLE_CLASS_URL = '';

  window.addEventListener('message', (event) => {
    if (
      event.data.type === 'hsFormCallback' &&
      event.data.eventName === 'onFormSubmitted' &&
      event.data.id === SAMPLE_CLASS_FORM_ID
    ) {
      if (document.documentElement.lang === 'en') {
        window.location.href = ENGLISH_SAMPLE_CLASS_URL;
      } else if (document.documentElement.lang === 'es') {
        window.location.href = SPANISH_SAMPLE_CLASS_URL;
      }
    }
  });
};

addSampleClassFormSubmitListener();
