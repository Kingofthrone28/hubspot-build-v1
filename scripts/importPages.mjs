import * as fs from 'fs';
import axios from 'axios';
import hubspot from '@hubspot/api-client';
import inquirer from 'inquirer';


const questions = [
    {
      type: 'input',
      name: 'key',
      message: "What's your development api key?",
    },
  ];
  
  inquirer
  .prompt(questions)
  .then(answers => {
    const accessToken = answers.key;
    postAllPages(accessToken);  // Call the function here
    postAllLandingPages(accessToken);
  })
  .catch(error => {
    if (error.isTtyError) {
      console.error("Prompt couldn't be rendered in the current environment");
    } else {
      console.error("Something else went wrong", error);
    }
  });

    function createPageObject(data) {
        let pageObject = {};
        if (data.name !== undefined && data.name !== '') pageObject.name = data.name;
        if (data.attachedStylesheets.length > 1) pageObject.attachedStylesheets = data.attachedStylesheets;
        if (data.slug !== undefined && data.slug !== '') pageObject.slug = data.slug;
        if (data.subcategory !== undefined && data.subcategory !== '') pageObject.subcategory = data.subcategory;
        if (data.metaDescription !== undefined && data.metaDescription !== '') pageObject.metaDescription = data.metaDescription;
        if (data.featuredImage !== undefined && data.featuredImage !== '') pageObject.featuredImage = data.featuredImage;
        if (data.featuredImageAltText !== undefined && data.featuredImageAltText !== '') pageObject.featuredImageAltText = data.featuredImageAltText;
        if (data.useFeaturedImage !== undefined && data.useFeaturedImage !== '') pageObject.useFeaturedImage = data.useFeaturedImage;
        if (data.id !== undefined && data.id !== '') {
            pageObject.id = data.id;
        }
        if (data.htmlTitle !== undefined && data.htmlTitle !== '') pageObject.htmlTitle = data.htmlTitle;
        if (data.templatePath !== undefined && data.templatePath !== '') pageObject.templatePath = data.templatePath;
        if (Object.keys(data.layoutSections).length > 0) pageObject.layoutSections = data.layoutSections;
        if (Object.keys(data.widgetContainers).length > 0) pageObject.widgetContainers = data.widgetContainers;
        if (Object.keys(data.widgets).length > 0) pageObject.widgets = data.widgets;
    
        return pageObject;
    }

    async function postAllPages(accessToken) {
            const data = fs.readFileSync('pageData.json', 'utf8');
            const response = JSON.parse(data);
            const pages = response.map(createPageObject);
            const hubspotClientDev = new hubspot.Client({ accessToken: accessToken });
            for (let page of pages) {
                console.log(page.name, ' successfully imported')
                try {                
                    const result = await hubspotClientDev.cms.pages.sitePagesApi.create(page);
    
                } catch (error) {
                    console.error(error)
                    console.error(`Failed to create page: ${error}`);
                }
            }
        }

        async function postAllLandingPages(accessToken) {
          const data = fs.readFileSync('landingPageData.json', 'utf8');
          const response = JSON.parse(data);
          const pages = response.map(createPageObject);
          const hubspotClientDev = new hubspot.Client({ accessToken: accessToken });
          for (let page of pages) {
            console.log(page.name, ' successfully imported')
              try {                
                  const result = await hubspotClientDev.cms.pages.landingPagesApi.create(page);
  
              } catch (error) {
                  console.error(error)
                  console.error(`Failed to create page: ${error}`);
              }
          }
      }


