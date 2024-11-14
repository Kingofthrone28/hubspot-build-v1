import { readFile, writeFile } from 'node:fs/promises';
import { isMapType } from '../utils/data.mjs';

/**
 * Get a JSON string with newlines and indentations, when applicable
 * @param {object|[]} data JSON data to stringify
 * @returns {string}
 */
const getPrettyJSON = (data) => JSON.stringify(data, null, 2);

/**
 *
 * @param {URL|string} path URL object or string locating file to write
 * @param {any} data data to write
 * @returns {Promise<void>}
 */
export const writePrettyJSON = (path, data) => {
  const isMap = isMapType(data);
  const prettify = isMap ? Object.fromEntries(data) : data;

  return writeFile(path, getPrettyJSON(prettify));
};

/**
 * Return the contents of a file
 * @param {string} path
 * @returns {string}
 */
const parseFile = async (path) => readFile(path, { encoding: 'utf8' });

/**
 * Parse a json file into a js object
 * @param {string} path
 * @returns {object|[]}
 */
export const parseJSON = async (path) => {
  const file = await parseFile(path);
  return JSON.parse(file);
};

/**
 * Get the production Personal Access Token from a file
 * @param {string} tokenPath
 * @returns {string}
 */
const parseKey = async (tokenPath) => {
  const contents = await parseFile(tokenPath);
  return contents.trim();
};

/**
 * Get and check for a Personal Access Token needed to call Hubspot API
 * @returns {string}
 */
export const getAccessToken = async (path) => {
  const accessToken = await parseKey(path);

  if (!accessToken) {
    throw new Error(`No access token provided! Expected at: ${path}`);
  }

  return accessToken;
};
