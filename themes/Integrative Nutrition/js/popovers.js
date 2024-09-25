(() => {
  /**
   * Configure a popover generated with get_popover macro.
   * Programmed to work with a single popover.
   */
  const configurePopover = () => {
    const popover = document.querySelector('.popover');
    const { selector } = popover.dataset;
    const trigger = document.querySelector(selector);

    if (!trigger) {
      console.error(`Failed to find popover trigger element: ${selector}`);
      return;
    }

    const closeButton = popover.querySelector('.close-button');
    const globalCloseTrigger = window;
    const isHidden = () => popover.classList.contains('hidden');

    const closePopover = (event) => {
      if (isHidden()) {
        return;
      }

      event.stopPropagation();
      popover.classList.add('hidden');
      globalCloseTrigger.removeEventListener('click', closePopover);
    };

    const openPopover = (event) => {
      if (!isHidden()) {
        return;
      }

      event.stopPropagation();
      popover.classList.remove('hidden');
      globalCloseTrigger.addEventListener('click', closePopover);
    };

    trigger.addEventListener('click', openPopover);
    closeButton.addEventListener('click', closePopover);
  };

  IIN.helpers.configurePopover = configurePopover;
})();
