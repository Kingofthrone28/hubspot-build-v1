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
  const groups = await getPropertyGroups();
  await postPropertyGroups(groups);
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
  console.info('creating contacts... (not efficiently, please improve)');
  const objectType = 'contacts';
  // const formRequests = [];

  for (const contact of contacts) {
    try {
      const apiResponse = await hubspotClientDev.crm.properties.coreApi.create(
        objectType,
        contact,
      );
    } catch (error) {
      // console.error(contact.name + " exists");
    }
    // formRequests.push(apiResponse);
  }
  console.info('contact properties imported');
  // await Promise.allSettled(formRequests);
}

async function getPropertyGroups() {
  const objectType = 'contacts';
  const apiResponse =
    await hubspotClientProd.crm.properties.groupsApi.getAll(objectType);
  const groups = apiResponse.results;
  return groups;
}

async function postPropertyGroups(groups) {
  const formRequests = [];
  const objectType = 'contacts';

  for (const group of groups) {
    try {
      const apiResponse = await hubspotClientDev.crm.properties.groupsApi.create(
        objectType,
        group,
      );
    } catch (error) {
      //console.info(group.name + "already exists");
    }
  }
}
