import { readFileSync } from 'fs';
import hubspot from '@hubspot/api-client';
import inquirer from 'inquirer';

const fileData = readFileSync('./scripts/file-map.json', 'utf8');
const pageMap = JSON.parse(fileData);
const landingPagesIds = Object.values(pageMap.landingPages);
const sitePagesIds = Object.values(pageMap.webpages);
const blogPagesIds = Object.values(pageMap.blogPosts);
const sourceArg = process.argv[2];
const destinationArg = process.argv[3];
const contentGroupIdArg = process.argv[4];
let hubspotClientProd;
let hubspotClientDev;

if (sourceArg && destinationArg && contentGroupIdArg) {
  const prodKey = sourceArg;
  const devKey = destinationArg;
  const contentGroupId = contentGroupIdArg;
  runImport(prodKey, devKey, contentGroupId);
} else {
  getKeys();
}

async function getKeys() {
  const questions = [
    {
      message: "What's the Access Token: Production (Blogs)?",
      name: 'prodKey',
      type: 'input',
    },
    {
      message: "What's your Access Token: Developer Test Account?",
      name: 'devKey',
      type: 'input',
    },
    {
      message: "What's your contentGroupId: Developer Test Account?",
      name: 'contentGroupId',
      type: 'input',
    },
  ];

  try {
    const { prodKey, devKey, contentGroupId } =
      await inquirer.prompt(questions);
    runImport(prodKey, devKey, contentGroupId);
  } catch (error) {
    if (error.isTtyError) {
      console.error("Prompt couldn't be rendered in the current environment");
    } else {
      console.error('Something else went wrong', error);
    }
  }
}

function createPageObject(data) {
  const pageObject = {};
  const keys = [
    'attachedStylesheets',
    'currentState',
    'featuredImage',
    'featuredImageAltText',
    'htmlTitle',
    'id',
    'includeDefaultCustomCss',
    'metaDescription',
    'name',
    'publishDate',
    'published',
    'slug',
    'state',
    'subcategory',
    'templatePath',
    'themeSettingsValues',
    'useFeaturedImage',
  ];

  keys.forEach((key) => {
    if (data[key]) {
      pageObject[key] = data[key];
    }
  });

  if (data.layoutSections && Object.keys(data.layoutSections)) {
    pageObject.layoutSections = data.layoutSections;
  }
  if (data.widgetContainers && Object.keys(data.widgetContainers)) {
    pageObject.widgetContainers = data.widgetContainers;
  }
  if (data.widgets && Object.keys(data.widgets)) {
    pageObject.widgets = data.widgets;
  }

  return pageObject;
}

function createBlogObject(data, contentGroupId) {
  const blogObject = {};

  blogObject.contentGroupId = contentGroupId;

  const keys = [
    'attachedStylesheets',
    'categoryId',
    'contentTypeCategory',
    'featuredImage',
    'featuredImageAltText',
    'htmlTitle',
    'id',
    'metaDescription',
    'name',
    'postBody',
    'subcategory',
    'templatePath',
    'useFeaturedImage',
  ];

  keys.forEach((key) => {
    if (data[key]) {
      blogObject[key] = data[key];
    }
  });

  if (data.layoutSections && Object.keys(data.layoutSections)) {
    blogObject.layoutSections = data.layoutSections;
  }
  if (data.widgetContainers && Object.keys(data.widgetContainers)) {
    blogObject.widgetContainers = data.widgetContainers;
  }
  if (data.widget && Object.keys(data.widgets)) {
    blogObject.widgets = data.widgets;
  }

  return blogObject;
}

async function runImport(prodKey, devKey, contentGroupId) {
  hubspotClientProd = new hubspot.Client({ accessToken: prodKey });
  hubspotClientDev = new hubspot.Client({ accessToken: devKey });

  try {
    /** Due to rate limiting, we should do these sequentially */
    const pages = await getListPages();
    await postAllPages(pages);
    const landingPages = await getListLandingPages();
    await postAllLandingPages(landingPages);
    const blogPages = await getListBlogs(contentGroupId);
    await postAllBlogs(blogPages);
  } catch (error) {
    console.error(error);
  }
}

async function getListPages() {
  const promises = [];
  for (const id of sitePagesIds) {
    const objectId = id;
    const promise = hubspotClientProd.cms.pages.sitePagesApi.getById(objectId);
    promises.push(promise);
  }
  const sitePagesList = await Promise.allSettled(promises);
  const validPages = sitePagesList.filter(({ status }) => status === 'fulfilled').map(({ value }) => value);
  console.info('GET all site pages complete');
  return validPages.map(createPageObject);
}

async function postAllPages(pages) {
  const formRequests = [];

  for (const page of pages) {
    const promise = hubspotClientDev.cms.pages.sitePagesApi.create(page);
    formRequests.push(promise);
  }

  // eslint-disable-next-line compat/compat
  await Promise.allSettled(formRequests);
  console.info('POST all site pages complete');
  // error handling
}

async function getListLandingPages() {
  const promises = [];
  for (const id of landingPagesIds) {
    const objectId = id;
    const promise =
      hubspotClientProd.cms.pages.landingPagesApi.getById(objectId);
    promises.push(promise);
  }
  const landingPagesList = await Promise.allSettled(promises);
  const validPages = landingPagesList.filter(({ status }) => status === 'fulfilled').map(({ value }) => value);
  console.info('GET all landing pages complete');
  return validPages.map(createPageObject);
}

async function postAllLandingPages(pages) {
  const formRequests = [];

  for (const page of pages) {
    const promise = hubspotClientDev.cms.pages.landingPagesApi.create(page);
    formRequests.push(promise);
  }

  // eslint-disable-next-line compat/compat
  await Promise.allSettled(formRequests);
  // error handling
  console.info('POST all landing pages complete');
}

async function getListBlogs(contentGroupId) {
  const promises = [];
  for (const id of blogPagesIds) {
    const objectId = id;
    const promise =
      hubspotClientProd.cms.blogs.blogPosts.blogPostsApi.getById(objectId);
    promises.push(promise);
  }
  const blogPagesList = await Promise.all(promises);
  console.info('GET all blog pages complete');
  const pages = blogPagesList.map((blog) =>
    createBlogObject(blog, contentGroupId),
  );
  return pages;
}

async function postAllBlogs(blogs) {
  const formRequests = [];
  for (const blog of blogs) {
    const promise =
      hubspotClientDev.cms.blogs.blogPosts.blogPostsApi.create(blog);
    formRequests.push(promise);
  }

  await Promise.all(formRequests);
  console.info('POST all blog pages complete');
}
