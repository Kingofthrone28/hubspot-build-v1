/* eslint-disable import/prefer-default-export -- More functions will be added as time allows */
import { wait } from './timing.mjs';

/**
 * @name HubspotDataRetrieval
 * @function
 * @param {String} cursor A string cursor that identifies a next page for data retrieval.
 */

/**
 * Get data from a Hubspot API and follow cursor to get all data (in memory)
 * API rate limit is 190 calls per 10 seconds for most endpoints, or 19/s
 * @param {HubspotDataRetrieval} callAPIFunction Hubspot API function bound with its client
 * @param {number} [interval=75] Delay between calls in milliseconds. 75 gives ~13/s
 * @returns {any[]}
 */
export const getAllDataWithCursor = async (
  callAPIFunction,
  interval = 75,
  logger = console.info,
) => {
  logger('getAllDataWithCursor starting...');
  const startTime = Date.now();

  // Initial call
  let callCount = 1;
  const data = [];
  let response = await callAPIFunction();
  const { results, paging } = response;
  data.push(...results);

  const logData = () => {
    logger(
      `getAllDataWithCursor: call #${callCount}: object count: ${data.length}`,
    );
  };

  logData();

  // Subsequent calls
  let cursor = paging?.next?.after;

  while (cursor) {
    /* eslint-disable-next-line no-await-in-loop -- Need to wait to avoid rate limiting */
    await wait(interval);
    callCount += 1;

    /* eslint-disable-next-line no-await-in-loop -- Need to wait for response to check for cursor */
    response = await callAPIFunction(cursor);
    const { results: secondaryResults, paging: secondaryPaging } = response;
    data.push(...secondaryResults);
    logData();
    cursor = secondaryPaging?.next?.after;
  }

  const elapsedSeconds = ((Date.now() - startTime) / 1_000).toFixed(3);
  logger('getAllDataWithCursor finished');
  logger(`Retrieved ${data.length} objects in ${elapsedSeconds} seconds`);

  return data;
};
