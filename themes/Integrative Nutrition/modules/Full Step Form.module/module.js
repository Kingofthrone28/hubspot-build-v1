$(() => {
  function getCookie(name) {
    const cookieArr = document.cookie.split(';');

    for (let i = 0; i < cookieArr.length; i++) {
      const cookiePair = cookieArr[i].split('=');

      if (name === cookiePair[0].trim()) {
        // Decode the cookie value and return
        return decodeURIComponent(cookiePair[1]);
      }
    }

    // Return null if not found
    return null;
  }

  function submitHelpMeChoose() {
    const verticalInputs = document.getElementsByName('vertical_hs');
    const verticalValues = [];

    for (let i = 0; i < verticalInputs.length; i++) {
      if (verticalInputs[i].checked) {
        verticalValues.push(verticalInputs[i].value);
      }
    }

    // Your HubSpot portal ID and form GUID
    const portalID = IIN.config.portalID;
    const formId = '560a7049-23c2-4464-b831-4d277001c85e';

    // Endpoint URL for the HubSpot Forms API
    const endpoint = `https://api.hsforms.com/submissions/v3/integration/submit/${portalID}/${formId}`;

    // Form data you want to submit
    const formData = {
      fields: [
        {
          name: 'email',
          value: $('input[name="email"]').val(),
        },
        {
          name: 'firstname',
          value: $('input[name="firstname"]').val(),
        },
        {
          name: 'lastname',
          value: $('input[name="lastname"]').val(),
        },
        {
          name: 'phone',
          value: $('input[name="phone"]').val(),
        },
        {
          name: 'vertical_hs',
          value: verticalValues.join(';'),
        },
        // ...other form fields here
      ],
      context: {
        // Include the hutk (HubSpot tracking code) if you want to associate this submission with a visitor's cookie.
        hutk: getCookie('hubspotutk'),
        pageUri: window.location.href,
        pageName: document.title,
      },
    };

    // Submit the form using Fetch API
    fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(formData),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        // Handle the response data
        console.log('Full Step Form JS response data:', data);
      })
      .catch((error) => {
        // Handle the error
        console.error(error);
      });
  }

  setTimeout(() => {
    const inputExists = $('input[value="Curious"]').length > 0;

    if (inputExists) {
      $('input[value="Curious"]')
        .next('span')
        .html(
          'Curious<small>I know a little and am ready to continue my journey</small>',
        );
    }
  }, 1000);

  $('.help-me-choose-section .full-step-next').click(() => {
    if (
      $(
        '.help-me-choose-section .hs_email, .help-me-choose-section .hs_vertical_hs',
      )
        .parent('fieldset')
        .hasClass('full-step-active')
    ) {
      setTimeout(() => {
        submitHelpMeChoose();
      }, 1500);
    }

    if (
      $('.help-me-choose-section .hs_firstname')
        .parent('fieldset')
        .hasClass('full-step-active')
    ) {
      setTimeout(() => {
        $('.full-step-skip').hide();
      }, 1500);
    } else {
      $('.full-step-skip').show();
    }
  });

  setTimeout(() => {
    if (
      $('.help-me-choose-section .full-step-active input[name=firstname]')
        .length ||
      $('.help-me-choose-section .full-step-active input[name=email]').length
    ) {
      $('.full-step-skip').hide();
    } else {
      $('.full-step-skip').show();
    }
  }, 1000);
});
