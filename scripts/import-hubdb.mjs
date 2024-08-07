import hubspot from '@hubspot/api-client';
import inquirer from 'inquirer';

const hubdb_names = [
  "course_catalog",
  "shopify_bundle_product_recommendations",
  "course_catalog_chopra",
  "top_bar_schedule",
  "course_bundle",
  "taxonomy_overrides"
]

if (process.argv[2] && process.argv[3]) {
  const prodKey = process.argv[2]
  const devKey = process.argv[3]
  main(prodKey, devKey)
} else {
  getKeys();
}

function getKeys() {
  const questions = [
    {
      type: 'input',
      name: 'prodKey',
      message: "What's your prod api key?",
    },
    {
      type: 'input',
      name: 'devKey',
      message: "What's your dev api key?",
    },
  ];

  inquirer
    .prompt(questions)
    .then((answers) => {
      const { prodKey } = answers;
      const { devKey } = answers;
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
    const hubdb_tables = await getHubdbTables(prodKey)
    await postAllHubdbTables(hubdb_tables, devKey)
    const existingTables = await getHubdbRows(prodKey)
    //await postHubdbRows(existingTables);
    const newTables = existingTables.map(table => {
      return {
        inputs: table
      };
    })
    const hubspotClientDev = new hubspot.Client({ accessToken: devKey });
    const createPromises = newTables.map((table, index) => {
      const name = hubdb_names[index];
      return hubspotClientDev.cms.hubdb.rowsBatchApi.createDraftTableRows(name, table);
    })
    const results = await Promise.all(createPromises);
    await publishTables(devKey);
  } catch (error) {
    console.error(error)
  }
}

async function getHubdbTables(prodKey) {
  const hubspotClientProd = new hubspot.Client({ accessToken: prodKey });
  const promises = [];
  const isGetLocalizedSchema = undefined;
  const archived = undefined;
  const includeForeignIds = undefined;
  for (let i = 0; i < hubdb_names.length; i++) {
  //const promise = hubspotClientProd.cms.hubdb.tablesApi.getTableDetails(hubdb_names[i]);
  const promise = hubspotClientProd.cms.hubdb.tablesApi.getTableDetails(hubdb_names[i]);
  promises.push(promise)
  }
  try {
    const hubdbList = await Promise.all(promises);
    console.info('GET hubdb tables complete')
    return hubdbList
  } catch (e) {
    e.message === 'HTTP request failed'
      ? console.error(JSON.stringify(e.response, null, 2))
      : console.error(e)
  }
}

async function postAllHubdbTables(hubdb_tables, devKey) {
  const hubspotClientDev = new hubspot.Client({ accessToken: devKey });
  const formRequest = []
  for (const table of hubdb_tables) {
    const promise = hubspotClientDev.cms.hubdb.tablesApi.createTable(table);
    formRequest.push(promise)
  }

  try {
    await Promise.all(formRequest)
    console.info('POST hubdb tables complete')
  }
  catch (error) {
    console.error('Failed to create hubdb tables: ${error}', error);
    throw error;
  }
}

async function getHubdbRows(prodKey) {
  const hubspotClientProd = new hubspot.Client({ accessToken: prodKey });
  const promises = [];
  for (let i = 0; i < hubdb_names.length; i++) {
    const tableName = hubdb_names[i]
    const promise = hubspotClientProd.cms.hubdb.rowsApi.readDraftTableRows(tableName);
    promises.push(promise)
  }

  try {
    const tables = await Promise.all(promises);
    console.info('GET hubdb rows complete')
    console.log('tables', tables.length)
    return tables.map(response => response.results)
  } catch (e) {
    e.message === 'HTTP request failed'
      ? console.error(JSON.stringify(e.response, null, 2))
      : console.error(e)
  }
}

// async function postHubdbRows(devKey) {
//     try {
//     const newTables = existingTables.map(table => {
//       return {
//         inputs: table
//       };
//     })
//     const hubspotClientDev = new hubspot.Client({ accessToken: devKey });
//     const createPromises = newTables.map((table, index) => {
//       const name = hubdb_names[index];
//       return hubspotClientDev.cms.hubdb.rowsBatchApi.createDraftTableRows(name, table);
//     })
//     const results = await Promise.all(createPromises);
//     }
//     catch (error) {
//         console.error('Failed to create hubdb tables: ${error}', error);
//         throw error;
//       }
// }

async function publishTables(devKey){
    const promises = [];
    const hubspotClientDev = new hubspot.Client({ accessToken: devKey });
    for (let i = 0; i < hubdb_names.length; i++) {
        const promise = hubspotClientDev.cms.hubdb.tablesApi.publishDraftTable(hubdb_names[i]);
        promises.push(promise)
        }
        try {
          await Promise.all(promises);
          console.info('PUBLISH hubdb tables complete')
        } catch (e) {
          e.message === 'HTTP request failed'
            ? console.error(JSON.stringify(e.response, null, 2))
            : console.error(e)
        }
    
  }