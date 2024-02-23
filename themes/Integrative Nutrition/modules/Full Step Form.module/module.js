$(document).ready(function() {
  setTimeout(function() {
    let inputExists = $('input[value="Curious"]').length > 0;
    if(inputExists) {
      $('input[value="Curious"]').next('span').html('Curious<small>I know a little and am ready to continue my journey</small>');
    }
  }, 1000);

// Your HubSpot portal ID and form GUID
const portalId = '23273748';
const formId = '560a7049-23c2-4464-b831-4d277001c85e';
  $(".help-me-choose-section .full-step-next").click(function(){
    if ($('.help-me-choose-section .hs_email, .help-me-choose-section .hs_vertical__c').parent('fieldset').hasClass('full-step-active')) {
      setTimeout(function() {
        SubmitHelpmeChoose(portalId, formId);
      }, 1500);
    }
    if ($('.help-me-choose-section .hs_firstname').parent('fieldset').hasClass('full-step-active')) {
      setTimeout(function() {
       $(".full-step-skip").hide();
      }, 1500);
    } else {
      $(".full-step-skip").show();
    }
  });
  setTimeout(function() {
    if ($(".help-me-choose-section .full-step-active input[name=firstname]").length || $(".help-me-choose-section .full-step-active input[name=email]").length) {
      $(".full-step-skip").hide();
    } else {
      $(".full-step-skip").show();
    }
  }, 1000);
});

function SubmitHelpmeChoose(portalId, formId) {
  let firstname = $('input[name="firstname"]').val();
  let lastname = $('input[name="lastname"]').val();
  let email = $('input[name="email"]').val();
  let checkboxes = document.getElementsByName('vertical__c');
  var vertical_c_data = "";
  for (var i = 0; i < checkboxes.length; i++) {
    if (checkboxes[i].checked) {
      vertical_c_data += checkboxes[i].value + ";";
    }
  }
  
    // Endpoint URL for the HubSpot Forms API
  const endpoint = `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`;

  // Form data you want to submit
  const formData = {
    fields: [
      {
        name: "email",
        value: email
      },
      {
        name: "firstname",
        value: firstname
      },
      {
        name: "lastname",
        value: lastname
      },
      {
        name: "vertical__c",
        value: vertical_c_data
      },
      // ...other form fields here
    ],
    context: {
      // Include the hutk (HubSpot tracking code) if you want to associate this submission with a visitor's cookie.
      hutk: getCookie("hubspotutk"),
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
  .then(response => response.json())
  .then(data => {
//     console.log(data); // Handle the response data
  })
  .catch(error => {
//     console.error(error); // Handle the error
  });
//   console.log('API Method Call');
}

function getCookie(name) {
  let cookieArr = document.cookie.split(";");
  for(let i = 0; i < cookieArr.length; i++) {
    let cookiePair = cookieArr[i].split("=");
    if(name == cookiePair[0].trim()) {
      // Decode the cookie value and return
      return decodeURIComponent(cookiePair[1]);
    }
  }
  // Return null if not found
  return null;
}
