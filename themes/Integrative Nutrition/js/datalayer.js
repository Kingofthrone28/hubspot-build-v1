window.dataLayer = window.dataLayer || [];
// Set 6 Tracking -- START

// Accordion Click Tracking
function sendAction(element) {
  let action = 'open';
  if (element.classList.contains('active')) {
    action = 'close';
  }
  window.dataLayer.push({
    'event': 'accordion_click',
    'click_text': element.firstChild.innerText,
    'action': action
  });
  element.classList.toggle('active');
}

const accordion = document.querySelectorAll('div.ex-label');
if (accordion) {
  accordion.forEach((link) => {
    link.addEventListener('click', () => {
      sendAction(link);
    });
  });
}

function viewBio(element) {
  window.dataLayer.push({
    'event': 'accordion_click',
    'click_text': element.innerText,
    'action': 'open'
  });
}

const viewBioButtons = document.querySelectorAll('.bio-label .bio-closed strong');
viewBioButtons.forEach((button) => {
  button.addEventListener('click', () => {
    viewBio(button);
  });
});

function closeBio(element) {
  window.dataLayer.push({
    'event': 'accordion_click',
    'click_text': element.innerText,
    'action': 'close'
  });
}

const closeBioButtons = document.querySelectorAll('.bio-label .bio-open strong');
closeBioButtons.forEach((button) => {
  button.addEventListener('click', () => {
    closeBio(button);
  });
});

function openChat() {
  window.dataLayer.push({
    'event': 'chat_click',
    'chat_action': 'open'
  });
}

function closeChat() {
  window.dataLayer.push({
    'event': 'chat_click',
    'chat_action': 'close'
  });
}

function socialShare(element) {
  const blogTitle = element.parentElement.previousElementSibling.innerText;
  let shareType;
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
    'event': 'social_share',
    'blog_title': blogTitle,
    'share_type': shareType
  });
}

const socialShareLogos = document.querySelectorAll('.jd-post-share a');
if (socialShareLogos != null) {
  socialShareLogos.forEach((logo) => {
    logo.addEventListener('click', () => {
      socialShare(logo);
    });
  });
}

// Chat Click Event Tracking
const chatbtnOpen = document.querySelector('div#chatbtn');
if (chatbtnOpen) {
  chatbtnOpen.addEventListener('click', () => {
    openChat();
  });
}

const inviteDiv = document.querySelector('div#inviteBody');
if (inviteDiv && inviteDiv.children.length > 3) {
  const chatbtnClose = inviteDiv.children[3];
  if (chatbtnClose) {
    chatbtnClose.addEventListener('click', () => {
      closeChat();
    });
  }
}
// Set 6 Tracking -- END
