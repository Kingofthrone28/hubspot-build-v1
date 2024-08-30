// eslint-disable-next-line
import hubspot from '@hubspot/api-client';

// eslint-disable-next-line
import inquirer from 'inquirer';
let after;
let hubspotClientProd;
let hubspotClientDev;
const sourceArg = process.argv[2];
const destinationArg = process.argv[3];

const wait = (duration) =>
  new Promise((resolve) => {
    setTimeout(resolve, duration);
  });

if (sourceArg && destinationArg) {
  const prodKey = sourceArg;
  const devKey = destinationArg;
  runImport(prodKey, devKey);
} else {
  getKeys();
}

async function getKeys() {
  const questions = [
    {
      message: "What's the Access Token: Production (Data-Aggregation)?",
      name: 'prodKey',
      type: 'input',
    },
    {
      message: "What's your Access Token: Developer Test Account?",
      name: 'devKey',
      type: 'input',
    },
  ];
  try {
    const { prodKey, devKey } = await inquirer.prompt(questions);
    runImport(prodKey, devKey);
  } catch (error) {
    if (error.isTtyError) {
      console.error("Prompt couldn't be rendered in the current environment");
    } else {
      console.error('Something else went wrong', error);
    }
  }
}

// https://developers.hubspot.com/docs/api/marketing/forms
function createFormObject({
  formType,
  name,
  action,
  method,
  cssClass,
  redirect,
  submitText,
  followUpId,
  notifyRecipients,
  leadNurturingCampaignId,
  createdAt,
  updatedAt,
  performableHtml,
  migratedFrom,
  ignoreCurrentValues,
  metaData,
  deletable,
  configuration,
  displayOptions,
  legalConsentOptions,
}) {
  return {
    formType,
    name,
    action,
    method,
    cssClass,
    redirect,
    submitText,
    followUpId,
    notifyRecipients,
    leadNurturingCampaignId,
    createdAt,
    updatedAt,
    performableHtml,
    migratedFrom,
    ignoreCurrentValues,
    metaData,
    deletable,
    fieldGroups: [],
    configuration,
    displayOptions,
    legalConsentOptions,
  };
}

async function runImport(prodKey, devKey) {
  hubspotClientProd = new hubspot.Client({ accessToken: prodKey });
  hubspotClientDev = new hubspot.Client({ accessToken: devKey });
  try {
    await importForms();
  } catch (error) {
    console.error(error);
  }
}

async function postAllForms(forms) {
  try {
    const formRequests = [];
    for (const form of forms) {
      const promise = hubspotClientDev.marketing.forms.formsApi.create(form);
      formRequests.push(promise);
    }
    await Promise.allSettled(formRequests);
    console.info('POST all forms complete');
  } catch (error) {
    console.error(error);
  }
}

async function importForms() {
  const limit = undefined;
  const archived = undefined;
  const formTypes = undefined;
  const delayMilliseconds = 1000;

  const apiResponse = await hubspotClientProd.marketing.forms.formsApi.getPage(
    after,
    limit,
    archived,
    formTypes,
  );

  const forms = apiResponse.results.map(createFormObject);
  await postAllForms(forms);

  if (apiResponse.paging?.next) {
    console.info(`Additional page results...`, apiResponse.paging);
    after = apiResponse.paging.next.after;
    await wait(delayMilliseconds);
    importForms();
  } else {
    console.info('No more pages left to get');
  }
}
