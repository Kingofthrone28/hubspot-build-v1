import {readFileSync} from 'fs';
import hubspot from '@hubspot/api-client';
import inquirer from 'inquirer';

let after = undefined;
let count = 0;

if (process.argv[2] && process.argv[3]) {
  const prodKey = process.argv[2]
  const devKey = process.argv[3]
  main(prodKey, devKey)
} else {
  getKeys();
}

async function getKeys() {
  const questions = [
    {
      type: 'input',
      name: 'prodKey',
      message: "What's your prod api key?",
    },
    {
      type: 'input',
      name: 'devKey',
      message: "What's your sandbox api key?",
    },
  ];

  inquirer
  .prompt(questions)
  .then((answers) => {
    const {prodKey} = answers;
    const {devKey} = answers;
    main(prodKey, devKey)
  })
  .catch((error) => {
    if (error.isTtyError) {
      console.error("Prompt couldn't be rendered in the current environment");
    } else {
      console.error('Something else went wrong', error);
    }
  });
}



async function main(prodKey, devKey) {
  try {
    await temp(prodKey, devKey);
  } catch (error) {
    console.error(error)
  }
}

async function temp(prodKey, devKey) {
    const hubspotClientProd = new hubspot.Client({ accessToken: prodKey });
    const limit = undefined;
    const archived = undefined;
    const formTypes = undefined;
    const delaySeconds = 1000;

    count += 1;
    console.log('count', count)

    const apiResponse = await hubspotClientProd.marketing.forms.formsApi.getPage(after, limit, archived, formTypes);
    const forms = apiResponse.results;
    await postAllForms(forms, devKey);
    console.log("posting forms!")

    if (apiResponse.paging?.next) {
        console.info(`Additional form results...`, apiResponse.paging)
        after = apiResponse.paging.next.after;
        setTimeout(() => {
            temp(prodKey, devKey);
        }, delaySeconds);
    } else {
        console.log('No more forms left to get')
    }
}

async function postAllForms(forms, devKey) {
  const hubspotClientDev = new hubspot.Client({ accessToken: devKey });
  const formRequest = []
  for (const form of forms) {
    if (form.name ){
        console.log(form)
        const promise = hubspotClientDev.marketing.forms.formsApi.create(form)
        formRequest.push(promise)
    }
    else{
        onsole.log("Baaaaaad" + form)
    }
    }

  try {
    await Promise.allSettled(formRequest)
    console.info('POST site forms complete')
  }
  catch (error) {
    console.error('Failed to create form: ${error}', error);
  }
}



