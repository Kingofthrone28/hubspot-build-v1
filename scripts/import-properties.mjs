import hubspot from '@hubspot/api-client';
import inquirer from 'inquirer';

let hubspotClientProd;
let hubspotClientDev;
const sourceArg = process.argv[2];
const destinationArg = process.argv[3];

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
      type: 'input',
      name: 'prodKey',
      message: "What's the Access Token: Production (Properties)?",
    },
    {
      type: 'input',
      name: 'devKey',
      message: "What's your Access Token: Developer Test Account",
    },
  ];

  try {
    const { prodKey, devKey } = await inquirer.prompt(questions);
    runImport(prodKey, devKey);
  } catch (error) {
    if (error.isTtyError) {
      console.error("Prompt couldn't be rendered in the current environment");
    } else {
      console.error(error);
    }
  }
}

async function runImport(prodKey, devKey) {
  hubspotClientProd = new hubspot.Client({ accessToken: prodKey });
  hubspotClientDev = new hubspot.Client({ accessToken: devKey });
  try {
    const objectType = 'contacts';
    const archived = false;
    const properties = undefined;
    const response = await hubspotClientProd.crm.properties.coreApi.getAll(
      objectType,
      archived,
      properties,
    );
    const contacts = response.results.map(createContactObject);
    await postContacts(contacts);
  } catch (error) {
    console.error(error);
  }
}

// https://developers.hubspot.com/docs/api/crm/properties#tab-1
function createContactObject({
  hidden,
  displayOrder,
  description,
  label,
  type,
  formField,
  groupName,
  referencedObjectType,
  name,
  options,
  calculationFormula,
  hasUniqueValue,
  fieldType,
  externalOptions,
}) {
  return {
    hidden,
    displayOrder,
    description,
    label,
    type,
    formField,
    groupName,
    referencedObjectType,
    name,
    options,
    calculationFormula,
    hasUniqueValue,
    fieldType,
    externalOptions,
  };
}

async function postContacts(contacts) {
  const objectType = 'contacts';
  const formRequests = [];
  try {
    for (const contact of contacts) {
      const apiResponse = hubspotClientDev.crm.properties.coreApi.create(
        objectType,
        contact,
      );
      formRequests.push(apiResponse);
    }
    await Promise.allSettled(formRequests);
  } catch (error) {
    console.error(error);
  }
}
