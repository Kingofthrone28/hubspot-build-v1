/** A collection of form methods. */
(() => {
  /**
   * Embed an existing HubSpot form.
   * @param {string} portalID
   * @param {string} formID
   * @param {string} target
   * @param {Object} [options={}]
   * @param {string} [options.sampleClassGate]
   * @param {Object} [options.taxonomyOverrides]
   * @see {@link https://developers.hubspot.com/beta-docs/guides/cms/content/forms#using-the-form-embed-code}
   */
  const embedForm = (
    portalID,
    formID,
    target,
    { sampleClassGate, taxonomyOverrides } = {},
  ) => {
    if (!portalID) {
      console.error('embedForm requires portal ID to get paths.');
      return;
    }

    if (!formID) {
      console.error('embedForm requires form ID to select form.');
      return;
    }

    if (!target) {
      console.error('embedForm requires target selector to render form.');
      return;
    }

    const configuration = {
      region: 'na1',
      portalId: portalID,
      formId: formID,
      target,
    };

    const onReadyPredicateFunctions = [];
    const onSubmittedPredicateFunctions = [];

    if (sampleClassGate) {
      const processSampleClassGate = () => {
        const days = 30;
        const name = `${sampleClassGate}_sc_opt_in`;
        const value = true;

        IIN.cookies.setCookie(name, value, days);
      };

      onSubmittedPredicateFunctions.push(processSampleClassGate);
    }

    if (taxonomyOverrides) {
      /* Map data to inputs and filter out properties with falsy values. */
      const overrides = [
        ['campaign_idnum__c', taxonomyOverrides.page_campaignid?.trim()],
        ['leadsource', taxonomyOverrides.page_lead_source?.trim()],
        ['product_type_hs', taxonomyOverrides.product_type?.name],
        ['vertical_hs', taxonomyOverrides.vertical?.name],
      ].filter(([, value]) => Boolean(value));

      const processTaxonomyOverrides = ($form) => {
        overrides.forEach(([key, value]) => {
          const input = $form.context.querySelector(
            `input[type="hidden"][name="${key}"]`,
          );

          if (input) {
            input.value = value;
          }
        });
      };

      if (overrides.length) {
        onReadyPredicateFunctions.push(processTaxonomyOverrides);
      }
    }

    if (onReadyPredicateFunctions.length) {
      configuration.onFormReady = ($form) =>
        onReadyPredicateFunctions.forEach((predicateFunction) =>
          predicateFunction($form),
        );
    }

    if (onSubmittedPredicateFunctions.length) {
      configuration.onFormSubmitted = ($form) =>
        onSubmittedPredicateFunctions.forEach((predicateFunction) =>
          predicateFunction($form),
        );
    }

    hbspt.forms.create(configuration);
  };

  IIN.forms = { embedForm };
})();
