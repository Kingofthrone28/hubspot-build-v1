/**
 *  Ticket SM-1099
 *  Due to fact hidden fields are not successfully constructed in the hubspot CTA iframes, we must manually create and populate the form fields.
 *  We check the DOM for CTA iframes at some interval using setTimeout.
 *  The iframes use the hubspot host instead of our Integrative Nutrition domain, so we must rewrite their source to do this.
 *  Due to the DOM manipulation, we use setTimeout to access the DOM elements after they have been modified or created.

    For more info on the iframe load event:
    https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#error_and_load_event_behavior
 */
(() => {
  let framePollsRemaining = 20;

  /**
   * Update a CTA form with hidden fields and values
   * @param {HTMLIFrameElement} frame
   * @returns {Promise<Error|undefined>}
   */
  const modifyFrameForm = (frame) => {
    const { trackingCookie } = IIN.cookies;
    const cookieObject = IIN.cookies.getCookieObject(trackingCookie);

    if (!cookieObject || !Object.keys(cookieObject).length) {
      return Promise.reject(
        new Error(`No cookie data in cookie: ${trackingCookie}`)
      );
    }

    const taxonomyOverrides = JSON.parse(sessionStorage['taxonomy_overrides'])

    const intervalDelay = 100;
    let formPollsRemaining = 20;

    return new Promise((resolve, reject) => {
      const formIntervalId = setInterval(() => {
        if (!formPollsRemaining) {
          clearInterval(formIntervalId);
          reject(new Error('No form polls remaining'));
          return;
        }

        formPollsRemaining -= 1;

        const frameDocument = frame.contentDocument;

        if (!frameDocument) {
          return;
        }

        const forms = frameDocument.getElementsByTagName('form');

        if (!forms.length) {
          return;
        }

        clearInterval(formIntervalId);

        Array.from(forms).forEach((form) => {
          const formId = form.getAttribute('data-instance-id');
          const hubspotForm =
            frame.contentWindow.HubSpotForms.getFormByInstanceId(formId);

          // Might be possible to use hubspotForm._getState().fields
          // We are assuming hidden fields were not added correctly in the iframe
          const fieldsToAdd = hubspotForm
            .getFields()
            .filter(({ hidden }) => hidden)
            .map(({ name }) => name);

          if (!fieldsToAdd.length) {
            return;
          }

          // Create, append, and fill hidden fields
          fieldsToAdd.forEach((field) => {
            const cookieKey = IIN.cookies.getTrackingCookieKey(field);
            let data = cookieObject[cookieKey];

            if (!data) {
              data = taxonomyOverrides[field]
            }

            if (!data) {
              return;
            }


            const mappedKey = IIN.cookies.getTrackingFormKey(field);
            const input = frameDocument.createElement('input');
            input.setAttribute('type', 'hidden');
            input.setAttribute('name', mappedKey);
            input.setAttribute('value', data);

            // Make the input easily targetable with js
            input.classList.add('appended-input');
            form.appendChild(input);
            hubspotForm.setFieldValue(mappedKey, data);
          });
        });

        resolve();
      }, intervalDelay);
    });
  };

  /**
   * Run modify frame and catch any errors
   */
  const tryModifyFrame = async (frame) => {
    try {
      await modifyFrameForm(frame);
    } catch (error) {
      console.log(error)
    }
  };

  /**
   * Replace the sources' host in a number of frames
   * @param {HTMLIFrameElement[]} frames
   */
  const replaceHosts = (frames) => {
    const parentHost = window.location.host;

    frames.forEach((frame) => {
      frame.addEventListener('load', () => {
        tryModifyFrame(frame);
      });

      const source = frame.getAttribute('src');

      try {
        const url = new URL(source);
        url.host = parentHost;
        frame.setAttribute('src', url.href);
      } catch (error) {
        console.error(error);
        console.error(`replaceHosts failed on ${source}`);
      }
    });
  };

  /**
   * Find CTA iframes, and add hidden fields and values
   */
  const managePopupCookies = () => {
    const retryDelay = 300;
    const allFrames = document.getElementsByTagName('iframe');

    if (!framePollsRemaining) {
      return;
    }

    framePollsRemaining -= 1;

    if (!allFrames.length) {
      setTimeout(managePopupCookies, retryDelay);
      return;
    }

    const hubspotFrames = Array.from(allFrames).filter((node) => {
      const source = node.getAttribute('src') || '';
      const title = node.getAttribute('title') || '';
      return source.includes('hs-sites.com') && title.includes('CTA');
    });

    if (!hubspotFrames.length) {
      setTimeout(managePopupCookies, retryDelay);
      return;
    }

    replaceHosts(hubspotFrames);
  };

  managePopupCookies();
})();
