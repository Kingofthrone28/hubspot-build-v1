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
        const databaseTables = await getHubdbTables(prodKey)
        await postAllHubdbTables(databaseTables, devKey)
        await checkHubdbTableCreation(databaseTables, devKey)
        const existingTables = await getHubdbRows(prodKey)
        setTimeout(async () => {
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
        }, 2000);
    } catch (error) {
        console.error(error)
    }
}

async function getHubdbTables(prodKey) {
    const hubspotClientProd = new hubspot.Client({ accessToken: prodKey });
    const promises = [];
    hubdb_names.forEach(function (name) {
        const promise = hubspotClientProd.cms.hubdb.tablesApi.getTableDetails(name);
        promises.push(promise)
    });
    const hubdbList = await Promise.all(promises);
    console.info('GET hubdb tables complete')
    return hubdbList
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
    const tables = responses.map((response) => response.results)
    console.info('GET hubdb rows complete')
    return tables
}

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