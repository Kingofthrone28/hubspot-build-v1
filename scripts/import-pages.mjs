import { lstat, readFileSync } from 'fs';
import hubspot from '@hubspot/api-client';
import inquirer from 'inquirer';

// const questions = [
//   {
//     type: 'input',
//     name: 'key',
//     message: "What's your development api key?",
//   },
// ];

// inquirer
//   .prompt(questions)
//   .then((answers) => {
//     const accessToken = answers.key;
//     postAllPages(accessToken); // Call the function here
//     postAllLandingPages(accessToken);
//   })
//   .catch((error) => {
//     if (error.isTtyError) {
//       console.error("Prompt couldn't be rendered in the current environment");
//     } else {
//       console.error('Something else went wrong', error);
//     }
//   });

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



// async function postAllLandingPages(accessToken) {
//   const data = readFileSync('landingPageData.json', 'utf8');
//   const response = JSON.parse(data);
//   const pages = response.map(createPageObject);
//   const hubspotClientDev = new hubspot.Client({ accessToken });
//   for (const page of pages) {
//     console.log(page.name, ' successfully imported');
//     try {
//       postLandingPage(page);
//     } catch (error) {
//       console.error('Failed to create page: ${error}', error);
//     }
//   }
// }

// async function postLandingPage(page) {
//   await hubspotClientDev.cms.pages.sitePagesApi.create(page);
// }


//landing pages
// const landingPages = [

// "Kaveh LP_Sample Class form Test (A) (Clone)",
// "Health Coaching Guide",
// "test-sam-LP_Sample Class form Test (A)",
// "Thank You Intent Form",
// "Cristina Cuomo Scholarship Thank You",
// "Cristina Cuomo HCTP Scholarship",
// "Stef Jung Mindful Eating Scholarship",
// "Stef Jung Mindful Eating Scholarship Thank You",
// "Learning Center - Module O - Summary (Option 2)",
// "Victoria Repa HCTP Scholarship",
// "Victoria Repa HCTP Scholarship Thank You",
// "Giselle Orentas Scholarship Thank You",
// "Giselle Orentas Scholarship",
// "Melissa Ambrosini 5 Secrets to Grow Your Business",
// "Healthy Skincare Guide",
// "Sample the IIN student experience accreditation",
// "Sample the IIN student experience nutrition",
// "IIN’s Ultimate Wellness Gift Guide",
// "Free Sample Class",
// "Sample the IIN student experience health coaching",
// "Mark's LP_Sample Class form Test (A)",
// "Sample Class",
// "Healthy Halloween Guide",
// "Mental Wellness Sale",
// "Abundance Guide",
// ]
const landingPagesIds = [
"166095729283",
"172834539413",
"171407084655",
"172422406456",
"172038762617",
"172021452085",
"171698873485",
"171699094188",
"167407951995",
"169905341795",
"169905341962",
"164773338288",
"164772232834",
"167525067141",
"159679753218",
"137036642959",
"137036647319",
"164170478098",
"137036646485",
"137036647076",
"156704991788",
"130357386505",
"159711671122",
"139705417637",
"159963522472"
]

//site pages"
// const sitePages = [
// "Webinars (Main)",
// "The Health Coach Training Program",
// "Chopra Coaching Certification",
// "What is a Health Coach",
// "Nutrition for Life",
// "Mindful Eating Course",
// "Gut Health Course",
// "Hormone Health",
// "Whole Person Health Course",
// "Detox Your Life",
// "Chopra Ayurvedic Health Certification",
// "Chopra Yoga 200-Hour Certification",
// "Chopra Yoga Foundations",
// "Deepening Your Practice: Chopra Meditation Enrichment",
// "Chopra Meditation Foundations",
// "Ayurveda for Balance: Chopra Health Enrichment",
// "Chopra Ayurvedic Health Foundations",
// "Launch Your Dream Book",
// "Coaching Intensive Practicum",
// "Shopify Enrollment Agreement",
// "Bundle course test",
// "Contact Us",
// "Chopra Coaching, IIN Sample Lesson",
// "Step Form",
// "Chopra Meditation Certification Download Syllabus Thank You"
// ]

const sitePagesIds = [
"131374501698",
"126932344965",
"127858949636",
"131416922172",
"128454847823",
"128048488316",
"128001646913",
"129063785734",
"128770284598",
"128866095380",
"128145895073",
"128371454887",
"128868704151",
"128360917654",
"128872775059",
"129238224813",
"128877446795",
"128907592067",
"128173611345",
"121320042302",
"132227331613",
"92103162004",
"134124428915",
"128048146031",
"135110345768"
]


async function getListPages(){
  let sitePagesList = [];
  let promises = [];
  const accessToken = 'pat-na1-682d2280-801e-4168-b990-15bee3ac9238'
  const hubspotClientProd = new hubspot.Client({ accessToken });
  const archived = undefined;
  const property = undefined;
  for (let id of sitePagesIds){
    let objectId = id;
    let promise = hubspotClientProd.cms.pages.sitePagesApi.getById(objectId, archived, property);
    promises.push(promise)
  }
  try {
    sitePagesList = await Promise.all(promises)
  } catch (e) {
    e.message === 'HTTP request failed'
      ? console.error(JSON.stringify(e.response, null, 2))
      : console.error(e)
  }

  let formRequest = []
  const pages = sitePagesList.map(createPageObject);
  const hubspotClientDev = new hubspot.Client({"accessToken":"pat-na1-c9e94014-e8f0-4670-b660-ac0bc7cb3a7d"});
  for (const page of pages) {
    let promise = hubspotClientDev.cms.pages.sitePagesApi.create(page)
    formRequest.push(promise)
  }
  try {
    await Promise.all(formRequest)
  } 
  catch (error) {
    console.error('Failed to create page: ${error}', error);
  }
}

getListPages();
//postAllPages();

// async function postAllPages() {

// }