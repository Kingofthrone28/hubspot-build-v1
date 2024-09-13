import inquirer from 'inquirer';

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
      message: "What's the Access Token: Production (Automation)?",
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

// https://developers.hubspot.com/docs/api/marketing/Flows
function createFlowObject({
  type,
  objectTypeId,
  canEnrollFromSalesforce,
  isEnabled,
  flowType,
  name,
  description,
  uuid,
  startActionId,
  actions,
  enrollmentCriteria,
  enrollmentSchedule,
  timeWindows,
  blockedDates,
  customProperties,
  suppressionListIds,
  goalFilterBranch,
  eventAnchor,
}) {
  const flowObject = {};

  if (type) {
    flowObject.type = type;
  }

  if (objectTypeId) {
    flowObject.objectTypeId = objectTypeId;
  }

  if (canEnrollFromSalesforce !== undefined) {
    flowObject.canEnrollFromSalesforce = canEnrollFromSalesforce;
  }

  if (isEnabled !== undefined) {
    flowObject.isEnabled = isEnabled;
  }

  if (flowType) {
    flowObject.flowType = flowType;
  }

  if (name) {
    flowObject.name = name;
  }

  if (description) {
    flowObject.description = description;
  }

  if (uuid) {
    flowObject.uuid = uuid;
  }

  if (startActionId) {
    flowObject.startActionId = startActionId;
  }

  if (actions) {
    flowObject.actions = actions.map((action) => {
      const actionObj = { ...action };

      if (action.type) {
        actionObj.type = action.type;
      }

      if (Array.isArray(action.fields)) {
        actionObj.fields = action.fields.map((field) => {
          const fieldObj = { ...field };

          if (field.type) {
            fieldObj.type = field.type;
          }

          return fieldObj;
        });
      }

      return actionObj;
    });
  }

  if (enrollmentCriteria) {
    flowObject.enrollmentCriteria = enrollmentCriteria;
  }

  if (enrollmentSchedule) {
    flowObject.enrollmentSchedule = enrollmentSchedule;
  }

  if (timeWindows) {
    flowObject.timeWindows = timeWindows;
  }

  if (blockedDates) {
    flowObject.blockedDates = blockedDates;
  }

  if (customProperties) {
    flowObject.customProperties = customProperties;
  }

  if (suppressionListIds) {
    flowObject.suppressionListIds = suppressionListIds;
  }

  if (goalFilterBranch) {
    flowObject.goalFilterBranch = goalFilterBranch;
  }

  if (eventAnchor) {
    flowObject.eventAnchor = eventAnchor;
  }

  return flowObject;
}

async function runImport(prodKey, devKey) {
  try {
    const flowsList = await getFlowIds(prodKey);
    await wait(2000);
    console.info('getting flows...');
    const flows = await getFlows(flowsList, prodKey);
    console.info('get flows finished', flows.length);
    await wait(2000);
    console.info('posting flows...');
    await postAllFlows(flows, devKey);
  } catch (error) {
    console.error(error);
  }
}

/* This function is still in-progress and await logic needs to be refactored */
async function postAllFlows(flows, devKey) {
  // const formRequests = [];

  for (const flow of flows) {
    console.info('Sending flow:', flow.name);
    const url = `https://api.hubapi.com/automation/v4/flows`;
    const options = {
      // Stringify the flow object
      body: JSON.stringify(flow),
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: `Bearer ${devKey}`,
      },
    };

    try {
      // Await the fetch request
      // eslint-disable-next-line no-await-in-loop
      const response = await fetch(url, options);

      if (!response.ok) {
        // eslint-disable-next-line no-await-in-loop
        const errorData = await response.json();
        console.error('Error response:', errorData);
      }

      // formRequests.push(res);
    } catch (error) {
      console.error('Fetch error:', error);
    }
  }

  // await Promise.all(formRequests);
  console.info('POST all Flows complete');
}

async function getFlowIds(prodKey) {
  const url = `https://api.hubapi.com/automation/v4/flows?limit=100`;
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${prodKey}`,
    },
  };

  const response = await fetch(url, options);
  const parsed = await response.json();
  console.info('parsed.results', parsed.results.length);
  return parsed.results;
}

async function getFlows(flowsList, prodKey) {
  const requests = flowsList.map((flow) => {
    const url = `https://api.hubapi.com/automation/v4/flows/${flow.id}`;
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${prodKey}`,
      },
    };
    return fetch(url, options).then((response) => response.json());
  });

  const flows = await Promise.all(requests);
  return flows.map(createFlowObject);
}
