import {readFileSync} from 'fs';
import hubspot from '@hubspot/api-client';
import inquirer from 'inquirer';

const data = readFileSync('./file-map.json', 'utf8')
const pageMap = JSON.parse(data)
const landingPagesNames = Object.keys(pageMap.landingPages);
const sitePagesNames = Object.keys(pageMap.webpages);
let after = undefined;
let count = 0;

if (process.argv[2] && process.argv[3]) {
  const prodKey = process.argv[2]
  const stagingKey = process.argv[3]
  main(prodKey, stagingKey)
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
      name: 'stagingKey',
      message: "What's your sandbox api key?",
    },
  ];

  inquirer
  .prompt(questions)
  .then((answers) => {
    const {prodKey} = answers;
    const {stagingKey} = answers;
    main(prodKey, stagingKey)
  })
  .catch((error) => {
    if (error.isTtyError) {
      console.error("Prompt couldn't be rendered in the current environment");
    } else {
      console.error('Something else went wrong', error);
    }
  });
}

function createPageObject(data) {
  const pageObject = {};
  if (data.name) {
    pageObject.name = data.name;
  }
  if (data.attachedStylesheets) {
    pageObject.attachedStylesheets = data.attachedStylesheets;
  }
  if (data.slug) {
    pageObject.slug = data.slug;
  }
  if (data.state) {
    pageObject.state = data.state;
  }
  if (data.currentState) {
    pageObject.currentState = data.currentState;
  }
  if (data.includeDefaultCustomCss) {
    pageObject.includeDefaultCustomCss = data.includeDefaultCustomCss;
  }
  if (data.published) {
    pageObject.published = data.published;
  }
  if (data.subcategory) {
    pageObject.subcategory = data.subcategory;
  }
  if (data.themeSettingsValues) {
    pageObject.themeSettingsValues = data.themeSettingsValues;
  }
  if (data.metaDescription) {
    pageObject.metaDescription = data.metaDescription;
  }
  if (data.featuredImage) {
    pageObject.featuredImage = data.featuredImage;
  }
  if (data.featuredImageAltText) {
    pageObject.featuredImageAltText = data.featuredImageAltText;
  }
  if (data.useFeaturedImage) {
    pageObject.useFeaturedImage = data.useFeaturedImage;
  }
  if (data.id) {
    pageObject.id = data.id;
  }
  if (data.htmlTitle) {
    pageObject.htmlTitle = data.htmlTitle;
  }
  if (data.templatePath) {
    pageObject.templatePath = data.templatePath;
  }
  if (data.publishDate) {
    pageObject.publishDate = data.publishDate;
  }
  if (Object.keys(data.layoutSections)) {
    pageObject.layoutSections = data.layoutSections;
  }
  if (Object.keys(data.widgetContainers)) {
    pageObject.widgetContainers = data.widgetContainers;
  }
  if (Object.keys(data.widgets)) {
    pageObject.widgets = data.widgets;
  }

  return pageObject;
}

async function main(prodKey, stagingKey) {
  try {
    //console.log('pagesp', pages)
    // await getListPages(prodKey, stagingKey);
    await temp(prodKey, stagingKey);
    //await postAllPages(pages[0], stagingKey)
    //await postAllPages(pages[1], stagingKey)
    //await postAllPages(pages[2], stagingKey)
    //await getListLandingPages(prodKey, stagingKey);
    //await postAllLandingPages(Lpages, stagingKey)
  } catch (error) {
    console.error(error)
  }
}

async function temp(prodKey, stagingKey) {
    const hubspotClientProd = new hubspot.Client({ accessToken: prodKey });
    const createdAt = undefined;
    const createdAfter = undefined;
    const createdBefore = undefined;
    const updatedAt = undefined;
    const updatedAfter = undefined;
    const updatedBefore = undefined;
    const sort = undefined;
    const limit = undefined
    const archived = undefined;
    const property = undefined;
    const delaySeconds = 10000;

    count += 1;
    console.log('count', count)

    const apiResponse = await hubspotClientProd.cms.pages.sitePagesApi.getPage(createdAt, createdAfter, createdBefore, updatedAt, updatedAfter, updatedBefore, sort, after, limit, archived, property);
    const pages = apiResponse.results.map(createPageObject);
    await postAllPages(pages, stagingKey);

    if (apiResponse.paging?.next) {
        console.info(`Additional page results...`, apiResponse.paging)
        after = apiResponse.paging.next.after;
        setTimeout(() => {
            temp(prodKey, stagingKey);
        }, delaySeconds);
    } else {
        console.log('No more pages left to get')
    }
}

async function getListPages(prodKey, stagingKey) {
    const hubspotClientProd = new hubspot.Client({ accessToken: prodKey });
  
    
      const createdAt = undefined;
      const createdAfter = undefined;
      const createdBefore = undefined;
      const updatedAt = undefined;
      const updatedAfter = undefined;
      const updatedBefore = undefined;
      const sort = undefined;
      let after = undefined;
      const limit = undefined;
      const archived = undefined;
      const property = undefined;
  
      //do {
          try {
              const apiResponse = await hubspotClientProd.cms.pages.sitePagesApi.getPage(createdAt, createdAfter, createdBefore, updatedAt, updatedAfter, updatedBefore, sort, after, limit, archived, property);
              const pages = apiResponse.results.map(createPageObject);
              //console.log(pages.length)
              setTimeout(async () => {
                postAllPages(pages, stagingKey)
                console.info('1')
            }, 100000);
              //after = apiResponse.paging.next.after;
              //console.log(after)
              
          }
          catch (e) {
              //after = "stop"
            }
            try {
                after = 'MTAw'
                const apiResponse = await hubspotClientProd.cms.pages.sitePagesApi.getPage(createdAt, createdAfter, createdBefore, updatedAt, updatedAfter, updatedBefore, sort, after, limit, archived, property);
                const pages = apiResponse.results.map(createPageObject);
                //console.log(pages.length)
                setTimeout(async () => {
                  postAllPages(pages, stagingKey)
                  console.info('2')
              }, 100000);
                //after = apiResponse.paging.next.after;
                //console.log(after)
                
            }
            catch (e) {
                //after = "stop"
              }
              try {
                after = 'MjAw'
                const apiResponse = await hubspotClientProd.cms.pages.sitePagesApi.getPage(createdAt, createdAfter, createdBefore, updatedAt, updatedAfter, updatedBefore, sort, after, limit, archived, property);
                const pages = apiResponse.results.map(createPageObject);
                //console.log(pages.length)
                setTimeout(async () => {
                  postAllPages(pages, stagingKey)
                  console.info('3')
              }, 100000);
                //after = apiResponse.paging.next.after;
                //console.log(after)
                
            }
            catch (e) {
                //after = "stop"
              }
      //}while (after != "stop")
  
      //console.info('GET all site pages complete')
  
  
      //return [pages, pages1. pages2]
  }
  


async function postAllPages(pages, stagingKey) {
  const hubspotClientStaging = new hubspot.Client({ accessToken: stagingKey });
  const formRequest = []
  for (const page of pages) {
    if (sitePagesNames.includes(page.name)){
        //console.log(page.name + " exists")

    }
    else {
        const promise = hubspotClientStaging.cms.pages.sitePagesApi.create(page)
        formRequest.push(promise)
    }
  }
  
  try {
    await Promise.all(formRequest)
    console.info('POST site pages complete')
  }
  catch (error) {
    console.error('Failed to create page: ${error}', error);
  }
}

async function getListLandingPages(prodKey, stagingKey) {
    const hubspotClientProd = new hubspot.Client({ accessToken: prodKey });
  
    try {
      const createdAt = undefined;
      const createdAfter = undefined;
      const createdBefore = undefined;
      const updatedAt = undefined;
      const updatedAfter = undefined;
      const updatedBefore = undefined;
      const sort = undefined;
      let after = undefined;
      const limit = undefined;
      const archived = undefined;
      const property = undefined;
  
      do {
          try {
              const apiResponse = await hubspotClientProd.cms.pages.landingPagesApi.getPage(createdAt, createdAfter, createdBefore, updatedAt, updatedAfter, updatedBefore, sort, after, limit, archived, property);
              const pages = apiResponse.results.map(createPageObject);
              //console.log(pages.length)
              setTimeout(async () => {
                postAllLandingPages(pages, stagingKey)
            }, 10000);
              after = apiResponse.paging.next.after;
              //console.log(after)
              
          }
          catch (e) {
              after = "stop"
            }
      }while (after != "stop")
  
      console.info('GET all landing pages complete')
  
  
      //return [pages, pages1. pages2]
    } catch (e) {
      e.message === 'HTTP request failed'
        ? console.error(JSON.stringify(e.response, null, 2))
        : console.error(e)
    }
  }
  


async function postAllLandingPages(pages, stagingKey) {
  const hubspotClientStaging = new hubspot.Client({ accessToken: stagingKey });
  const formRequest = []
  for (const page of pages) {
    if (landingPagesNames.includes(page.name)){
        console.log(page.name + " exists")

    }
    else {
        const promise = hubspotClientStaging.cms.pages.landingPagesApi.create(page)
        formRequest.push(promise)
    }
  }
  
  try {
    await Promise.allSettled(formRequest)
    console.info('POST site pages complete')
  }
  catch (error) {
    console.error('Failed to create page: ${error}', error);
    throw error;
  }
}

