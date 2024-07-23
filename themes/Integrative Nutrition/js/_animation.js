// ------------- Animation -----------------
if (!$('html').hasClass('hs-inline-edit')) {
  const animationDuration = 1200;
  const animationInterval = 110;
  const animationOffet = -60;
  const fadeDistance = '100px';
  const slideDistance = '100px';
  const zoomInDistance = '100px';
  const zoomOutDistance = '150px';
  const easingSetting = 'cubic-bezier(0.5, 0, 0, 1)';
  const mobileSetting = true;

  // Fade
  ScrollReveal().reveal('.fade', {
    duration: animationDuration,
    interval: animationInterval,
    viewOffset: {
      top: animationOffet,
    },
    mobile: mobileSetting,
  });

  // Fade Up
  ScrollReveal().reveal('.fadeUp', {
    duration: animationDuration,
    interval: animationInterval,
    distance: fadeDistance,
    origin: 'bottom',
    easing: easingSetting,
    viewOffset: {
      top: animationOffet,
    },
    mobile: mobileSetting,
  });

  // Fade Down
  ScrollReveal().reveal('.fadeDown', {
    duration: animationDuration,
    interval: animationInterval,
    distance: fadeDistance,
    origin: 'top',
    easing: easingSetting,
    viewOffset: {
      top: animationOffet,
    },
    mobile: mobileSetting,
  });

  // Fade Left
  ScrollReveal().reveal('.fadeLeft', {
    duration: animationDuration,
    interval: animationInterval,
    distance: fadeDistance,
    origin: 'left',
    viewOffset: {
      top: animationOffet,
    },
    mobile: mobileSetting,
  });

  // Fade Right
  ScrollReveal().reveal('.fadeRight', {
    duration: animationDuration,
    interval: animationInterval,
    distance: fadeDistance,
    origin: 'right',
    easing: easingSetting,
    viewOffset: {
      top: animationOffet,
    },
    mobile: mobileSetting,
  });

  // ================================================================================================================================================

  // Slide Up
  ScrollReveal().reveal('.slideUp', {
    duration: animationDuration,
    interval: animationInterval,
    distance: slideDistance,
    origin: 'bottom',
    opacity: 1,
    easing: easingSetting,
    viewOffset: {
      top: animationOffet,
    },
    mobile: mobileSetting,
  });

  // Slide Down
  ScrollReveal().reveal('.slideDown', {
    duration: animationDuration,
    interval: animationInterval,
    distance: slideDistance,
    origin: 'top',
    opacity: 1,
    easing: easingSetting,
    viewOffset: {
      top: animationOffet,
    },
    mobile: mobileSetting,
  });

  // Slide Left
  ScrollReveal().reveal('.slideLeft', {
    duration: animationDuration,
    interval: animationInterval,
    distance: slideDistance,
    origin: 'left',
    opacity: 1,
    easing: easingSetting,
    viewOffset: {
      top: animationOffet,
    },
    mobile: mobileSetting,
  });

  // Slide Right
  ScrollReveal().reveal('.slideRight', {
    duration: animationDuration,
    interval: animationInterval,
    distance: slideDistance,
    origin: 'right',
    opacity: 1,
    easing: easingSetting,
    viewOffset: {
      top: animationOffet,
    },
    mobile: mobileSetting,
  });

  // ================================================================================================================================================

  // Zoom In
  ScrollReveal().reveal('.zoomIn', {
    duration: animationDuration,
    interval: animationInterval,
    origin: 'bottom',
    scale: 0.7,
    easing: easingSetting,
    viewOffset: {
      top: animationOffet,
    },
    mobile: mobileSetting,
  });

  // Zoom In Up
  ScrollReveal().reveal('.zoomInUp', {
    duration: animationDuration,
    interval: animationInterval,
    distance: zoomInDistance,
    origin: 'bottom',
    scale: 0.7,
    easing: easingSetting,
    viewOffset: {
      top: animationOffet,
    },
    mobile: mobileSetting,
  });

  // Zoom In Down
  ScrollReveal().reveal('.zoomInDown', {
    duration: animationDuration,
    interval: animationInterval,
    distance: zoomInDistance,
    origin: 'top',
    scale: 0.7,
    easing: easingSetting,
    viewOffset: {
      top: animationOffet,
    },
    mobile: mobileSetting,
  });

  // Zoom In Left
  ScrollReveal().reveal('.zoomInLeft', {
    duration: animationDuration,
    interval: animationInterval,
    distance: zoomInDistance,
    origin: 'left',
    scale: 0.7,
    easing: easingSetting,
    viewOffset: {
      top: animationOffet,
    },
    mobile: mobileSetting,
  });

  // Zoom In Right
  ScrollReveal().reveal('.zoomInRight', {
    duration: animationDuration,
    interval: animationInterval,
    distance: zoomInDistance,
    origin: 'right',
    scale: 0.7,
    easing: easingSetting,
    viewOffset: {
      top: animationOffet,
    },
    mobile: mobileSetting,
  });

  // ================================================================================================================================================

  // Zoom Out
  ScrollReveal().reveal('.zoomOut', {
    duration: animationDuration,
    interval: animationInterval,
    origin: 'bottom',
    scale: 1.3,
    easing: easingSetting,
    viewOffset: {
      top: animationOffet,
    },
    mobile: mobileSetting,
  });

  // Zoom Out Up
  ScrollReveal().reveal('.zoomOutUp', {
    duration: animationDuration,
    interval: animationInterval,
    distance: zoomOutDistance,
    origin: 'bottom',
    scale: 1.3,
    easing: easingSetting,
    viewOffset: {
      top: animationOffet,
    },
    mobile: mobileSetting,
  });

  // Zoom Out Down
  ScrollReveal().reveal('.zoomOutDown', {
    duration: animationDuration,
    interval: animationInterval,
    distance: zoomOutDistance,
    origin: 'top',
    scale: 1.3,
    easing: easingSetting,
    viewOffset: {
      top: -20,
    },
    mobile: mobileSetting,
  });

  // Zoom Out Left
  ScrollReveal().reveal('.zoomOutLeft', {
    duration: animationDuration,
    interval: animationInterval,
    distance: zoomOutDistance,
    origin: 'left',
    scale: 1.3,
    easing: easingSetting,
    viewOffset: {
      top: animationOffet,
    },
    mobile: mobileSetting,
  });

  // Zoom Out Right
  ScrollReveal().reveal('.zoomOutRight', {
    duration: animationDuration,
    interval: animationInterval,
    distance: zoomOutDistance,
    origin: 'right',
    scale: 1.3,
    easing: easingSetting,
    viewOffset: {
      top: animationOffet,
    },
    mobile: mobileSetting,
  });
}
