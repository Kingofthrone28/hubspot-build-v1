/**
 * Batch an array into smaller groups
 * @param {any[]} data an array of data
 * @param {number} size size of batches
 * @returns {Array<any[]>}
 */
export const batch = (data, size) =>
  data.reduce(
    (batches, datum) => {
      const lastBatch = batches[batches.length - 1];

      if (lastBatch.length < size) {
        lastBatch.push(datum);
      } else {
        batches.push([datum]);
      }

      return batches;
    },
    [[]],
  );

/**
 * Use toString to get the type of a value
 * @param {any} value value to check
 * @returns {string}
 */
export const getDataType = (value) => Object.prototype.toString.call(value);

/**
 * Check if value is a Map
 * @param {any} value value to check
 * @returns {boolean}
 */
export const isMapType = (value) => getDataType(value) === '[object Map]';
