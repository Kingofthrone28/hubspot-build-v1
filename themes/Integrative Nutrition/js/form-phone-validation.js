(function () {
  function validatePhones(formId, event) {
    let allNumbersValid = true;

    // Validate each intl phone field
    $(`${formId} .hs-fieldtype-intl-phone`).each(function () {
      const countryCode = $(this).find('select').first().val();
      const numberInput = $(this).find('input[type=tel]').first();
      let isValid = false;

      // phoneUtils comes from libphonenumber.js
      try {
        isValid = phoneUtils.isValidNumber(
          numberInput.val().replace(/[^0-9+]/g, ''),
          countryCode,
        );
      } catch (error) {
        console.log(error);
      }

      if (isValid) {
        $(this).closest('.hs-form-field').find('.lpn-invalid-msg').hide();
        numberInput.removeClass('invalid');
        numberInput.removeClass('error');
      } else {
        allNumbersValid = false;
        $(this).closest('.hs-form-field').find('.lpn-invalid-msg').show();
        numberInput.addClass('invalid');
        numberInput.addClass('error');
      }
    });

    // Prevent default if any phone field is invalid
    if (!allNumbersValid) {
      event.preventDefault();
    }
  }

  window.addEventListener('message', (event) => {
    // Form ready event callback
    if (
      event.data.type === 'hsFormCallback' &&
      event.data.eventName === 'onFormReady'
    ) {
      const formId = `#hsForm_${event.data.id}_${event.target.options.formInstanceId}`;

      // Bind listeners if form contains intl phone number field
      if ($(`${formId} .hs-fieldtype-intl-phone`).length) {
        // Input button click
        $(`${formId} input[type=submit]`).click((e) => {
          validatePhones(formId, e);
        });

        // Enter key pressed
        $(`${formId}`).on('keypress', (e) => {
          if (e.keyCode === 13) {
            validatePhones(formId, e);
          }
        });

        // Add custom invalid message
        $(`${formId} .hs-fieldtype-intl-phone`).each(function () {
          $(this)
            .closest('.input')
            .after(
              '<div style="display:none" class="lpn-invalid-msg">The phone number entered is invalid</div>',
            );
        });
      }
    }
  });
})();
