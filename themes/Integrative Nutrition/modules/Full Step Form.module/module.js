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
    const firstname = $('input[name="firstname"]').val();
    const lastname = $('input[name="lastname"]').val();
    const email = $('input[name="email"]').val();
    const checkboxes = document.getElementsByName('vertical_hs');
    let vertical = '';

    for (let i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].checked) {
        vertical += `${checkboxes[i].value};`;
      }
    }
    
    // Your HubSpot portal ID and form GUID
    const portalId = '23273748';
    const formId = '560a7049-23c2-4464-b831-4d277001c85e';

    // Endpoint URL for the HubSpot Forms API
    const endpoint = `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`;

    // Form data you want to submit
    const formData = {
      fields: [
        {
          name: 'email',
          value: email
        },
        {
          name: 'firstname',
          value: firstname
        },
        {
          name: 'lastname',
          value: lastname
        },
        {
          name: 'vertical_hs',
          value: vertical
        },
        // ...other form fields here
      ],
      context: {
        // Include the hutk (HubSpot tracking code) if you want to associate this submission with a visitor's cookie.
        hutk: getCookie('hubspotutk'),
        pageUri: window.location.href,
        pageName: document.title
      },
    };
    
    // Submit the form using Fetch API
    fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(formData),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then((response) => response.json())
    .then((data) => {
      // Handle the response data
      // console.log(data);
    })
    .catch((error) => {
      // Handle the error
      console.error(error);
    });
  }

  setTimeout(() => {
    const inputExists = $('input[value="Curious"]').length > 0;

    if (inputExists) {
      $('input[value="Curious"]').next('span').html('Curious<small>I know a little and am ready to continue my journey</small>');
    }
  }, 1000);

  $('.help-me-choose-section .full-step-next').click(() => {
    if ($('.help-me-choose-section .hs_email, .help-me-choose-section .hs_vertical_hs').parent('fieldset').hasClass('full-step-active')) {
      setTimeout(() => {
        submitHelpMeChoose();
      }, 1500);
    }

    if ($('.help-me-choose-section .hs_firstname').parent('fieldset').hasClass('full-step-active')) {
      setTimeout(() => {
        $('.full-step-skip').hide();
      }, 1500);
    } else {
      $('.full-step-skip').show();
    }
  });

  setTimeout(() => {
    if ($('.help-me-choose-section .full-step-active input[name=firstname]').length || $('.help-me-choose-section .full-step-active input[name=email]').length) {
      $('.full-step-skip').hide();
    } else {
      $('.full-step-skip').show();
    }
  }, 1000);
});
