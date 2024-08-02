import {readFileSync} from 'fs';
import hubspot from '@hubspot/api-client';
import inquirer from 'inquirer';

const data = readFileSync('./file-map.json', 'utf8')
// console.log('after', data)
const pageMap = JSON.parse(data)
const landingPagesIds = Object.values(pageMap.landingPages);
const sitePagesIds = Object.values(pageMap.webpages);
const blogPagesIds = Object.values(pageMap.blogPosts);

if (process.argv[2] && process.argv[3] && process.argv[4]) {
  const prodKey = process.argv[2]
  const devKey = process.argv[3]
  const contentGroupId = process.argv[4]
  main(prodKey, devKey, contentGroupId)
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
    {
      type: 'input',
      name: 'contentGroupId',
      message: "What's your contentGroupId?",
    },
  ];

  inquirer
  .prompt(questions)
  .then((answers) => {
    const {prodKey} = answers;
    const {devKey} = answers;
    const {contentGroupId} = answers;
    main(prodKey, devKey, contentGroupId)
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
  if (data.attachedStylesheets.length > 1) {
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
  if (data.published) {
    pageObject.published = data.published;
  }
  if (data.subcategory) {
    pageObject.subcategory = data.subcategory;
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
  if (Object.keys(data.layoutSections).length > 0) {
    pageObject.layoutSections = data.layoutSections;
  }
  if (Object.keys(data.widgetContainers).length > 0) {
    pageObject.widgetContainers = data.widgetContainers;
  }
  if (Object.keys(data.widgets).length > 0) {
    pageObject.widgets = data.widgets;
  }

  return pageObject;
}

function createBlogObject(data, contentGroupId) {
  const blogObject = {};

  blogObject.contentGroupId = contentGroupId;
  
  if (data.name) {
    blogObject.name = data.name;
  }
  if (data.metaDescription) {
    blogObject.metaDescription = data.metaDescription;
  }
  if (data.categoryId) {
    blogObject.categoryId = data.categoryId;
  }
  if (data.contentTypeCategory) {
    blogObject.contentTypeCategory = data.contentTypeCategory;
  }
  if (data.templatePath) {
    blogObject.templatePath = data.templatePath;
  }
  if (data.postBody) {
    blogObject.postBody = data.postBody;
  }
  if (data.postBody) {
    blogObject.postBody = data.postBody;
  }
  if (Object.keys(data.layoutSections).length > 0) {
    blogObject.layoutSections = data.layoutSections;
  }
  if (Object.keys(data.widgetContainers).length > 0) {
    blogObject.widgetContainers = data.widgetContainers;
  }
  if (Object.keys(data.widgets).length > 0) {
    blogObject.widgets = data.widgets;
  }
  if (data.attachedStylesheets.length > 1) {
    blogObject.attachedStylesheets = data.attachedStylesheets;
  }
  if (data.subcategory) {
    blogObject.subcategory = data.subcategory;
  }
  if (data.featuredImage) {
    blogObject.featuredImage = data.featuredImage;
  }
  if (data.featuredImageAltText) {
    blogObject.featuredImageAltText = data.featuredImageAltText;
  }
  if (data.useFeaturedImage) {
    blogObject.useFeaturedImage = data.useFeaturedImage;
  }
  if (data.htmlTitle) {
    blogObject.htmlTitle = data.htmlTitle;
  }
  if (data.id) {
    blogObject.id = data.id;
  }
  return blogObject
  // blogs are not published becuase author does not exist
  //  if (data.authorName) {
  //   blogObject.authorName = data.authorName;
  // }
  // if (data.blogAuthorId) {
  //   blogObject.blogAuthorId = data.blogAuthorId;
  // }

  // if (data.createdById) {
  //   blogObject.createdById = data.createdById;
  // }

  // if (data.slug) {
  //   blogObject.slug = data.slug;
  // }
  // if (data.state) {
  //   blogObject.state = data.state;
  // }
  // if (data.currentState) {
  //   blogObject.currentState = data.currentState;
  // }
  // if (data.published) {
  //   blogObject.published = data.published;
  // }
  // return blogObject;
   }

async function main(prodKey, devKey, contentGroupId) {
  try {
    //console.log('pagesp', pages)
    const pages = await getListPages(prodKey);
    await postAllPages(pages, devKey)
    const landingPages = await getListLandingPages(prodKey);
    await postAllLandingPages(landingPages, devKey);
    const blogPages = await getListBlogs(prodKey, contentGroupId);
    await postAllBlogs(blogPages, devKey);
  } catch (error) {
    console.error(error)
  }
}

async function getListPages(prodKey) {
  const hubspotClientProd = new hubspot.Client({ accessToken: prodKey });
  const promises = [];
  const archived = undefined;
  const property = undefined;
  for (const id of sitePagesIds) {
    const objectId = id;
    const promise = hubspotClientProd.cms.pages.sitePagesApi.getById(objectId, archived, property);
    promises.push(promise)
  }
  try {
    const sitePagesList = await Promise.all(promises);
    console.info('GET all site pages complete')
    const pages = sitePagesList.map(createPageObject);
    return pages
  } catch (e) {
    e.message === 'HTTP request failed'
      ? console.error(JSON.stringify(e.response, null, 2))
      : console.error(e)
  }
}

async function postAllPages(pages, devKey) {
  const hubspotClientDev = new hubspot.Client({ accessToken: devKey });
  const formRequest = []

  for (const page of pages) {
    const promise = hubspotClientDev.cms.pages.sitePagesApi.create(page)
    formRequest.push(promise)
  }
  
  try {
    await Promise.all(formRequest)
    console.info('POST all site pages complete')
  }
  catch (error) {
    console.error('Failed to create page: ${error}', error);
    throw error;
  }
}

async function getListLandingPages(prodKey) {
  // const func = getSitePages 
  //   ? hubspotClientProd.cms.pages.sitePagesApi.getById
  //   : hubspotClientProd.cms.pages.landingPagesApi.getById;
  const hubspotClientProd = new hubspot.Client({ accessToken: prodKey });
  const promises = [];
  const archived = undefined;
  const property = undefined;
  for (const id of landingPagesIds) {
    const objectId = id;
    const promise = hubspotClientProd.cms.pages.landingPagesApi.getById(objectId, archived, property);
    promises.push(promise)
  }
  try {
    const landingPagesList = await Promise.all(promises);
    console.info('GET all landing pages complete')
    const pages = landingPagesList.map(createPageObject);
    return pages
  } catch (e) {
    e.message === 'HTTP request failed'
      ? console.error(JSON.stringify(e.response, null, 2))
      : console.error(e)
  }
}

async function postAllLandingPages(pages, devKey) {
  const hubspotClientDev = new hubspot.Client({ accessToken: devKey });
  const formRequest = []

  for (const page of pages) {
    const promise = hubspotClientDev.cms.pages.landingPagesApi.create(page)
    formRequest.push(promise)
  }
  
  try {
    await Promise.all(formRequest)
    console.info('POST all landing pages complete')
  }
  catch (error) {
    console.error('Failed to create page: ${error}', error);
    throw error;
  }
}

async function getListBlogs(prodKey, contentGroupId) {
  const hubspotClientProd = new hubspot.Client({ accessToken: prodKey });
  const promises = [];
  const archived = undefined;
  const property = undefined;
  for (const id of blogPagesIds) {
    const objectId = id;
    const promise = hubspotClientProd.cms.blogs.blogPosts.blogPostsApi.getById(objectId, archived, property);
    promises.push(promise)
  }
  try {
    const blogPagesList = await Promise.all(promises);
    console.info('GET all blog pages complete')
    const pages = blogPagesList.map( (blog) =>createBlogObject(blog, contentGroupId)
    );
    return pages
  } catch (e) {
    e.message === 'HTTP request failed'
      ? console.error(JSON.stringify(e.response, null, 2))
      : console.error(e)
    throw e;
  }
}

async function postAllBlogs(blogs, devKey) {
  const hubspotClientDev = new hubspot.Client({ accessToken: devKey });
  const formRequest = []
  for (const blog of blogs) {
    const promise = hubspotClientDev.cms.blogs.blogPosts.blogPostsApi.create(blog)
    formRequest.push(promise)
  }
  
  try {
    await Promise.all(formRequest)
    console.info('POST all blog pages complete')
  }
  catch (error) {
    console.error('Failed to create page: ${error}', error);
    throw error;
  }
}