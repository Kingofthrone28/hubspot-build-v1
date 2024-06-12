window.dataLayer = window.dataLayer || [];
// Set 6 Tracking -- START

// Accordion Click Tracking
function sendAction(element){
  var action = 'open';
  if (element.classList.contains('active')){
    action = 'close';
  }
  window.dataLayer.push({
      'event':'accordion_click',
      'click_text':element.firstChild.innerText,
      'action':action
      });
  element.classList.toggle('active');
}

const accordion = document.querySelectorAll('div.ex-label');
if (accordion) {
  accordion.forEach(function(link) {
    link.addEventListener('click', function() {
      sendAction(link);
    });
});
}

function viewBio(element) {
  window.dataLayer.push({
    'event':'accordion_click',
    'click_text':element.innerText,
    'action':'open'
  });
}

const viewBioButtons = document.querySelectorAll('.bio-label .bio-closed strong');
if (viewBioButtons) {
  viewBioButtons.forEach(function(button) {
    button.addEventListener('click',function() {
      viewBio(button);
    });
  });
}

function closeBio(element) {
  window.dataLayer.push({
    'event':'accordion_click',
    'click_text':element.innerText,
    'action':'close'
  });
}

const closeBioButtons = document.querySelectorAll('.bio-label .bio-open strong');
if (closeBioButtons) {
  closeBioButtons.forEach(function(button) {
    button.addEventListener('click',function() {
      closeBio(button);
    });
  });
}

function chatOpen() {
  window.dataLayer.push({
    'event':'chat_click',
    'chat_action':'open'
  });
}

function chatClose() {
  window.dataLayer.push({
    'event':'chat_click',
    'chat_action':'close'
  });
}

function socialShare(element) {
  var blogTitle = element.parentElement.previousElementSibling.innerText;
  var shareType;
  if (element.href.includes('facebook')) {
    shareType = 'facebook';
  } else if (element.href.includes('linkedin')) {
    shareType = 'linkedin';
  } else if (element.href.includes('twitter')) {
    shareType = 'twitter';
  } else if (element.href.includes('pinterest')) {
    shareType = 'pinterest';
  } else if (element.href.includes('mailto')) {
    shareType = 'mail';
  }
  window.dataLayer.push({
    'event':'social_share',
    'blog_title':blogTitle,
    'share_type':shareType
  });
}

const socialShareLogos = document.querySelectorAll('.jd-post-share a');
if (socialShareLogos != null) {
  socialShareLogos.forEach(function(logo) {
    logo.addEventListener('click',function() {
      socialShare(logo);
    });
  });
}

// Chat Click Event Tracking
const chatbtn_open = document.querySelector('div#chatbtn');
if (chatbtn_open) {
  chatbtn_open.addEventListener('click',function() {
    chatOpen();
});
}

const inviteDiv = document.querySelector('div#inviteBody');
if (inviteDiv &&inviteDiv.children.length > 3){ 
  const chatbtn_close = inviteDiv.children[3];
  if (chatbtn_close) {
      chatbtn_close.addEventListener('click',function() {
        chatClose();
  });
 }
}

// Set 6 Tracking -- END