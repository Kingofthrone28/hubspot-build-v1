/**
 * JS Snippet to be added to a page with a Sample Class Form
 * Include via the Page Advanced Settings Head HTML:
 * 
 *  <script src="{{ get_asset_url('../../js/sample-class-form-handler.js') }}"></script>
    <script>
        const SAMPLE_CLASS_FORM_ID = '123';
        const ENGLISH_SAMPLE_CLASS_URL = '123.com';
        const SPANISH_SAMPLE_CLASS_URL = 'UnoDosTres.com';
        addSampleClassFormSubmitListener(SAMPLE_CLASS_FORM_ID, ENGLISH_SAMPLE_CLASS_URL, SPANISH_SAMPLE_CLASS_URL);
    </script>
 * 
 * Captures onFormSubmitted event for sample class form and redirects based upon HTML lang
 * Temporary solution, to be removed once Spanish Sample Class exists on Hubspot
 */

const addSampleClassFormSubmitListener = (
  sampleClassId,
  englishUrl,
  spanishUrl,
) => {
  window.addEventListener('message', (event) => {
    if (
      event.data.type === 'hsFormCallback' &&
      event.data.eventName === 'onFormSubmitted' &&
      event.data.id === sampleClassId
    ) {
      if (document.documentElement.lang === 'en') {
        window.location.href = englishUrl;
      } else if (document.documentElement.lang === 'es') {
        window.location.href = spanishUrl;
      }
    }
  });
};
