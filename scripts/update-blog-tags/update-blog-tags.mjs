/* eslint-disable compat/compat -- Don't need to worry about browser compatibility */

/**
 * Script for updating blog tags
 *
 * Add Personal Access Tokens in either ./tmp-dev/dev-key.txt or ./tmp-dev/prod-key.txt
 *
 * From project root, run the following to process a dev environment, i.e.:
 * node ./scripts/update-blog-tags/update-blog-tags.mjs
 *
 * Add --prod for production, i.e.
 * node ./scripts/update-blog-tags/update-blog-tags.mjs --prod
 *
 * Input json is a map of slugs to new tags, e.g.:
 *
 * {
 * "blog/high-electrolyte-foods": "Integrative Nutrition",
 * "blog/gut-health-immune-resilience": "Integrative Health"
 * }
 *
 * Strategy:
 * End need to use the api: { BlogID -> NewTagID }
 *
 * 1) parse from json: { Slug -> NewTagName }
 * 2) generate from 1: NewTag{}
 * 3) generate from api or file: { ExistingTag -> TagID }
 * 4) combine 2 & 3: { NewTagName -> NewTagID }
 * 5) combine 1 & 4: { Slug -> NewTagID }
 * 6) generate from api or file: { Slug -> BlogID }
 * 7) combine 5 & 6: { BlogID -> NewTagID }
 * 8) update via api BlogID with NewTagID
 *
 * Blog Post API Docs: https://developers.hubspot.com/docs/api/cms/blog-post
 * Blog Tag API Docs: https://developers.hubspot.com/beta-docs/reference/api/cms/blogs/blog-tags
 * SDK Docs: https://github.hubspot.com/hubspot-api-nodejs/classes/cms_blogs_blog_posts.BlogPostsApi.html
 */

import hubspot from '@hubspot/api-client';
import { writeFile, access } from 'node:fs/promises';
import { memoryUsage, argv } from 'node:process';
import { getAllDataWithCursor } from '../utils/hubspot.mjs';
import { wait } from '../utils/timing.mjs';
import {
  writePrettyJSON,
  parseJSON,
  getAccessToken,
} from './file-management.mjs';

/** Pass --prod to run on prod */
const IS_PROD = argv[2] === '--prod';

/** Millisecond delay for data requests, to avoid rate limiting */
const CURSOR_INTERVAL = 75;

// Development controls
const READ_DATA_FROM_FILE = false;
const SHOW_WARNINGS = false;

// Base paths
const KEY_PATH = `../../tmp-dev/`;
const ASSETS_BASE = `./assets/`;
const ASSETS_PATH = IS_PROD ? `${ASSETS_BASE}prod/` : `${ASSETS_BASE}dev/`;

// Data paths
const ALL_TAGS_TO_ID_MAP_PATH = `${ASSETS_PATH}all-tags-to-id.json`;
const NEW_TAG_REPORT_PATH = `${ASSETS_PATH}new-tag-report.txt`;
const NO_NEW_TAG_SLUGS_PATH = `${ASSETS_PATH}no-new-tag-slugs.json`;
const POST_ID_TO_NEW_TAG_ID_PATH = `${ASSETS_PATH}blog-slug-id-to-new-tag-id.json`;
const POST_PATH = `${ASSETS_PATH}all-posts.json`;
const SLUG_TO_EXISTING_TAG_ID_PATH = `${ASSETS_PATH}slug-to-existing-tag-id.json`;
const SLUG_TO_NEW_TAG_PATH = `${ASSETS_PATH}slug-to-new-tag.json`;
const RESULTS_PATH = `${ASSETS_PATH}results.json`;

// Key paths
const DEV_KEY_PATH = `${KEY_PATH}dev-key.txt`;
const PROD_KEY_PATH = `${KEY_PATH}prod-key.txt`;

// #region Script functions

/** Get formatted memory usage */
const getMemoryPrint = () =>
  ` [${(memoryUsage.rss() / 1_000_000).toFixed(1)} MB]`;

/**
 * Resolve relative path to this script file.
 * @param {string} path
 * @returns {string}
 */
const resolvePath = (path) => new URL(path, import.meta.url);

/**
 * Resolve path and write formatted json
 * @param {string} path
 * @param {any} data
 * @returns {Promise<void>}
 */
const writeJSONFile = (path, data) => {
  const resolved = resolvePath(path);
  return writePrettyJSON(resolved, data);
};

/**
 * Resolve a relative path and parse a json file
 * @param {string} path
 * @returns {any}
 */
const parseJSONFile = (path) => {
  const resolved = resolvePath(path);
  return parseJSON(resolved);
};

/**
 * Write blog posts to a file
 * @param {[]} posts
 * @returns
 */
const writePostsToFile = async (posts) => writeJSONFile(POST_PATH, posts);

/**
 * Read posts from a file
 * @returns {[]}
 */
const readPostsFromFile = async () => parseJSONFile(POST_PATH);

/**
 * `access()` errors if file doesn't exist, otherwise returns undefined
 * Potential race condition if other files are accessing the same file
 * @param {string} path File path to check
 * @param {*} writeFunc function to call if file doesn't exist
 * @returns {Promise<void>}
 */
const writeIfNotFile = async (path, writeFunc) => {
  const resolvedPath = resolvePath(path);
  console.info(`Checking for file at ${resolvedPath}`);
  try {
    await access(resolvedPath);
    console.info(`Skipping write, file exists`);
    return;
  } catch (error) {
    console.info(`Writing file...`);
  }

  try {
    await writeFunc();
  } catch (error) {
    console.error(error);
  }
};

/**
 * Get the production PAT
 * @returns {string}
 */
const getProdKey = async () => {
  const path = resolvePath(PROD_KEY_PATH);
  return getAccessToken(path);
};

/**
 * Get dev PAT
 * @returns {string}
 */
const getDevKey = async () => {
  const path = resolvePath(DEV_KEY_PATH);
  return getAccessToken(path);
};

/**
 * Get hubspot blog posts
 * For more info: https://developers.hubspot.com/docs/api/cms/blog-post
 * @param {Object} apiClient Hubspot client API interface
 */
const getBlogPostPage = async (apiClient, after) => {
  const archived = undefined;
  const createdAfter = undefined;
  const createdAt = undefined;
  const createdBefore = undefined;
  const limit = 100;
  const property = ['id', 'slug', 'tagIds'];
  const sort = undefined;
  const updatedAfter = undefined;
  const updatedAt = undefined;
  const updatedBefore = undefined;

  return apiClient.getPage(
    createdAt,
    createdAfter,
    createdBefore,
    updatedAt,
    updatedAfter,
    updatedBefore,
    sort,
    after,
    limit,
    archived,
    property,
  );
};

/**
 * Get posts from api or file
 * @returns {{ id: string, slug: string}[]}
 */
const getPosts = async (client) => {
  if (READ_DATA_FROM_FILE) {
    return readPostsFromFile();
  }

  const boundGet = getBlogPostPage.bind(undefined, client);

  console.info(`Calling API for blog posts...`);
  const posts = await getAllDataWithCursor(boundGet, CURSOR_INTERVAL);
  console.info(`Finished API call for blog posts`);

  const boundWrite = writePostsToFile.bind(undefined, posts);
  await writeIfNotFile(POST_PATH, boundWrite);
  return posts;
};

/**
 * Write the all the new tags from the slug to new tag map to a file.
 * @returns {Promise<void>} Success or Error promise
 */
const writeNewTagReport = async (slugMap, writeToFile = false) => {
  const { counter: tagCounter, total: tagTotal } = Object.values(
    slugMap,
  ).reduce(
    ({ counter, total }, tag) => {
      const newTotal = total + 1;
      if (!counter[tag]) counter[tag] = 1;
      else counter[tag] += 1;
      return { counter, total: newTotal };
    },
    { counter: {}, total: 0 },
  );

  let maxLength = 0;
  const sortedTags = Object.keys(tagCounter).sort((a, b) => {
    maxLength = Math.max(maxLength, a.length, b.length);
    if (a === b) {
      return 0;
    }

    if (a < b) {
      return -1;
    }

    return 1;
  });

  const contents = `New Tag Usage\n
${sortedTags.map((tag) => `${tag.padEnd(maxLength)}: ${tagCounter[tag]}`).join('\n')}
${'-'.repeat(maxLength + 2 + String(tagTotal).length)}
${'Total'.padEnd(maxLength)}: ${tagTotal}`;

  if (writeToFile) {
    const filePath = resolvePath(NEW_TAG_REPORT_PATH);
    return writeFile(filePath, contents);
  }

  console.info(contents);
  return Promise.resolve();
};

/**
 * Get a list of blog tags
 * @param {Object} tagsClient hubspot blog tag client
 * @param {Object} param1 configuration object
 * @returns {{ name: string, id: string }[]} Array of tag partials
 */
const getBlogTagPage = async (tagsClient, after) => {
  const createdAt = undefined;
  const createdAfter = undefined;
  const createdBefore = undefined;
  const updatedAt = undefined;
  const updatedAfter = undefined;
  const updatedBefore = undefined;
  const sort = ['name'];
  const limit = 50;
  const archived = false;
  const property = ['id', 'name'];
  return tagsClient.getPage(
    createdAt,
    createdAfter,
    createdBefore,
    updatedAt,
    updatedAfter,
    updatedBefore,
    sort,
    after,
    limit,
    archived,
    property,
  );
};

/**
 * Get map of blog tag names to ids
 * @param {Object} client Hubspot blog tag client
 * @returns {Map<string, string>} Map of tags to ids
 */
const getAllTagsToID = async (client) => {
  const boundGet = getBlogTagPage.bind(undefined, client);
  const tags = await getAllDataWithCursor(boundGet, CURSOR_INTERVAL);
  return tags.reduce((map, { name, id }) => map.set(name, id), new Map());
};

/**
 * Return a map of slugs to new tags
 * @returns {Record<string, string>}
 */
const parseSlugToNewTag = async () => parseJSONFile(SLUG_TO_NEW_TAG_PATH);

/**
 *
 * @param {Map<string, string>} map
 * @returns {Promise<void>}
 */
const writeAllTagsToID = async (map) =>
  writeJSONFile(ALL_TAGS_TO_ID_MAP_PATH, map);

/**
 *
 * @returns {Map<string, string>} Map of tags to ids
 */
const readAllTagsToID = async () => {
  const object = await parseJSONFile(ALL_TAGS_TO_ID_MAP_PATH);
  return new Map(Object.entries(object));
};

/**
 * Write slugs without new tags to a file if it doesn't exist
 * @param {string[]} slugs slugs without new tags
 */
const writeNoNewTagSlugs = async (slugs) => {
  const noNewSlugWrite = writeJSONFile.bind(
    undefined,
    NO_NEW_TAG_SLUGS_PATH,
    slugs,
  );
  await writeIfNotFile(NO_NEW_TAG_SLUGS_PATH, noNewSlugWrite);
};

/**
 * Write the final post ids to new new tag ids to a file if it doesnt exist
 * @param {Map<string, string>} map map of post ids to new tag ids
 * @returns {Promise<void>}
 */
const writePostIDsToNewTagIDs = async (map) => {
  const postIDToNewTagIDWrite = writeJSONFile.bind(
    undefined,
    POST_ID_TO_NEW_TAG_ID_PATH,
    map,
  );
  return writeIfNotFile(POST_ID_TO_NEW_TAG_ID_PATH, postIDToNewTagIDWrite);
};

// #endregion

/** Main function to run async code */
const main = async () => {
  const border = '*'.repeat(28);

  console.info(`${border}\nStarting blog tag updates...\n${border}`);

  const accessToken = IS_PROD ? await getProdKey() : await getDevKey();
  const hubspotClient = new hubspot.Client({ accessToken });
  const blogPostClient = hubspotClient.cms.blogs.blogPosts.blogPostsApi;
  const tagClient = hubspotClient.cms.blogs.tags.blogTagsApi;

  // 1) parse from json: { Slug -> NewTagName }
  const slugToNewTag = await parseSlugToNewTag();
  const newTags = Object.values(slugToNewTag);
  const writeNewTagReportBound = writeNewTagReport.bind(
    undefined,
    slugToNewTag,
    true,
  );
  await writeIfNotFile(NEW_TAG_REPORT_PATH, writeNewTagReportBound);
  console.info(
    `Posts to get new tag count: ${newTags.length}${getMemoryPrint()}`,
  );

  // 2) generate from 1: NewTag{}
  const newTagSet = new Set(newTags);
  console.info(`Unique new tag count: ${newTagSet.size}${getMemoryPrint()}`);

  // 3) generate from api or file: { ExistingTag -> TagID }
  const existingTagToIDMap = READ_DATA_FROM_FILE
    ? await readAllTagsToID()
    : await getAllTagsToID(tagClient);

  console.info(
    `All tags in env count: ${existingTagToIDMap.size}${getMemoryPrint()}`,
  );
  await writeIfNotFile(
    ALL_TAGS_TO_ID_MAP_PATH,
    writeAllTagsToID.bind(undefined, existingTagToIDMap),
  );

  // 4) combine 2 & 3: { NewTagName -> NewTagID }
  const newTagToIDMap = [...newTagSet].reduce(
    (map, tag) =>
      existingTagToIDMap.has(tag)
        ? map.set(tag, existingTagToIDMap.get(tag))
        : map,
    new Map(),
  );

  console.info(
    `New tag to ID map count: ${newTagToIDMap.size}${getMemoryPrint()}`,
  );

  // 5) combine 1 & 4: { Slug -> NewTagID }
  const slugToNewTagID = Object.entries(slugToNewTag).reduce(
    (map, [slug, tag]) => {
      if (!newTagToIDMap.has(tag)) {
        console.warn(`Failed to find ID for new tag: ${tag}`);
      } else {
        map.set(slug, newTagToIDMap.get(tag));
      }

      return map;
    },
    new Map(),
  );

  console.info(
    `slugToNewTagID size: ${slugToNewTagID.size}${getMemoryPrint()}`,
  );

  // 6) generate from api or file: { Slug -> BlogID }
  const posts = await getPosts(blogPostClient);
  console.info(`posts count: ${posts.length}${getMemoryPrint()}`);

  const postIDToTag = posts.reduce(
    (map, { slug, tagIds }) => map.set(slug, tagIds[0]),
    new Map(),
  );

  await writeJSONFile(SLUG_TO_EXISTING_TAG_ID_PATH, postIDToTag);

  const slugToIDs = posts.reduce(
    (map, { slug, id }) => map.set(slug, id),
    new Map(),
  );

  console.info(`slugToIDs count: ${slugToIDs.size}${getMemoryPrint()}`);

  // 7) combine 5 & 6: { BlogID -> NewTagID }
  const noTagSlugs = [];
  console.info(`Checking retrieved slugs for new tag...`);

  // Iterate all slugs retrieved and check for new tags
  const slugIDToNewTagID = slugToIDs.entries().reduce((map, [slug, slugID]) => {
    if (slugToNewTagID.has(slug)) {
      map.set(slugID, slugToNewTagID.get(slug));
    } else {
      if (SHOW_WARNINGS) {
        console.warn(`No new tag found for post: ${slugID} at ${slug}`);
      }

      noTagSlugs.push(slug);
    }

    return map;
  }, new Map());

  console.info(
    `slugIDToNewTagID size: ${slugIDToNewTagID.size}${getMemoryPrint()}`,
  );
  console.info(`noTagSlug size: ${noTagSlugs.length}${getMemoryPrint()}`);

  await writeNoNewTagSlugs(noTagSlugs);
  await writePostIDsToNewTagIDs(slugIDToNewTagID);

  // 8) update via api BlogID with NewTagID
  // Couldn't get the batch update API working properly, so we have to update them one at a time.
  const updates = slugIDToNewTagID.entries().reduce((arr, [postID, tagID]) => {
    arr.push([postID, { tagIds: [Number(tagID)] }]);
    return arr;
  }, []);

  console.info(`Updates length: ${updates.length}`);

  const resultsObject = {};

  for (const [postID, update] of updates) {
    try {
      /* eslint-disable-next-line no-await-in-loop -- Trying to get this done */
      const response = await blogPostClient.update(postID, update);
      const { tagIds, slug } = response;
      resultsObject[postID] = { newTag: tagIds[0], slug };
    } catch (error) {
      console.info('Error');
      console.error(error.message);
      resultsObject[postID] = { postID, error: error.message };
    }

    /* eslint-disable-next-line no-await-in-loop -- Avoiding rate limits; this is about 15/s */
    await wait(65);
  }

  await writeJSONFile(RESULTS_PATH, resultsObject);
  console.info('\nDone!');
};

main();
