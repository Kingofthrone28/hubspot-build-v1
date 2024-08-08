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

/*
1. get table schema from existing tables
2. create the tables with the schema in the lower env
3. get the row data from higher region
4. create the rows in the newly created tables
5. publish tables
*/

async function main(prodKey, devKey) {

    try {
        // 1
        const databaseTables = await getHubdbTables(prodKey)

        // 2 
        await postAllHubdbTables(databaseTables, devKey)
        await checkHubdbTableCreation(databaseTables, devKey)
        // 3
        const existingTables = await getHubdbRows(prodKey)
        //await postHubdbRows(existingTables);

        setTimeout(async () => {
            //     // 4
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

            // 5
            await publishTables(devKey);

        }, 2000);

    } catch (error) {
        console.error(error)
    }
}

async function getHubdbTables(prodKey) {
    const hubspotClientProd = new hubspot.Client({ accessToken: prodKey });
    const promises = [];
    //   const isGetLocalizedSchema = undefined;
    //   const archived = undefined;
    //   const includeForeignIds = undefined;
    hubdb_names.forEach(function (name) {
        const promise = hubspotClientProd.cms.hubdb.tablesApi.getTableDetails(name);
        promises.push(promise)
    });
    // for (let i = 0; i <= hubdb_names.length; i++) {

    // }
    const hubdbList = await Promise.all(promises);
    console.info('GET hubdb tables complete')
    //, hubdbList.map(({ name }) => name))
    return hubdbList
    //   try {
    //   } catch (e) {
    //     e.message === 'HTTP request failed'
    //       ? console.error(JSON.stringify(e.response, null, 2))
    //       : console.error(e)
    //   }
}

async function postAllHubdbTables(tables, devKey) {
    const hubspotClientDev = new hubspot.Client({ accessToken: devKey });
    const formRequest = [];

    for (const table of tables) {
        const promise = hubspotClientDev.cms.hubdb.tablesApi.createTable(table);
        formRequest.push(promise)
    }

    const responses = await Promise.all(formRequest)
    console.info('POST hubdb tables complete')
    //, responses.map(({ name }) => name))
    // return new Promise((resolve, reject) => {})

}

async function getHubdbRows(prodKey) {
    const hubspotClientProd = new hubspot.Client({ accessToken: prodKey });
    const promises = [];
    for (let i = 0; i < hubdb_names.length; i++) {
        const tableName = hubdb_names[i]
        const promise = hubspotClientProd.cms.hubdb.rowsApi.readDraftTableRows(tableName);
        promises.push(promise)
    }

    const responses = await Promise.all(promises);
    //console.log('res', responses[0])
    const tables = responses.map((response) => response.results)
    console.info('GET hubdb rows complete')
    //, tables.map(({ id }) => id))
    return tables
    // try {
    //     console.log('tables', tables.length)
    //     return tables.map(response => response.results)
    // } catch (e) {
    //     e.message === 'HTTP request failed'
    //         ? console.error(JSON.stringify(e.response, null, 2))
    //         : console.error(e)
    // }
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

async function publishTables(devKey) {
    const hubspotClientDev = new hubspot.Client({ accessToken: devKey });
    const promises = [];
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

async function checkHubdbTableCreation(tables, devKey) {
    const hubspotClientDev = new hubspot.Client({ accessToken: devKey });

    const promises = tables.map(({ name }) => hubspotClientDev.cms.hubdb.tablesApi.getTableDetails(name))
    const getTableResponses = await Promise.allSettled(promises);
    const createResponses = getTableResponses.map((response, index) => {
        if (response.status === 'rejected') {
            const table = tables[index]
            return hubspotClientDev.cms.hubdb.tablesApi.createTable(table);
        }
    })

    await Promise.all(createResponses)
    console.info('create in checkHubdbTableCreation complete')
}