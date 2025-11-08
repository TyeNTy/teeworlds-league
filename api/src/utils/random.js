/**
 * Random utility functions for array manipulation and selection.
 * Provides functions for shuffling, random selection, and combinations.
 */

/**
 * Shuffles an array in place using the Fisher-Yates algorithm.
 * This algorithm provides a uniform distribution of permutations.
 *
 * @param {Array} array - The array to shuffle (will be modified in place)
 * @returns {Array} The same array reference, now shuffled
 *
 * @example
 * const arr = [1, 2, 3, 4, 5];
 * shuffle(arr); // arr is now shuffled, e.g., [3, 1, 5, 2, 4]
 */
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Creates a shuffled copy of an array without modifying the original.
 *
 * @param {Array} array - The array to shuffle
 * @returns {Array} A new array with shuffled elements
 *
 * @example
 * const original = [1, 2, 3, 4, 5];
 * const shuffledCopy = shuffled(original);
 * // original is unchanged: [1, 2, 3, 4, 5]
 * // shuffledCopy might be: [3, 1, 5, 2, 4]
 */
function shuffled(array) {
  return shuffle([...array]);
}

/**
 * Selects a random element from an array.
 *
 * @param {Array} array - The array to select from
 * @returns {*} A random element from the array
 * @throws {Error} If the array is empty
 *
 * @example
 * const colors = ['red', 'blue', 'green'];
 * const randomColor = randomElement(colors); // might return 'blue'
 */
function randomElement(array) {
  if (array.length === 0) {
    throw new Error("Cannot select random element from empty array");
  }
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

/**
 * Generates all possible combinations of elements from an array.
 * Uses recursion to compute combinations of a specified size.
 *
 * @param {Array} array - The array to generate combinations from
 * @param {number} size - The size of each combination
 * @returns {Array<Array>} An array of all possible combinations
 *
 * @example
 * generateCombinations([1, 2, 3], 2);
 * // Returns: [[1, 2], [1, 3], [2, 3]]
 */
function generateCombinations(array, size) {
  if (size === 0) return [[]];
  if (array.length === 0) return [];

  const [first, ...rest] = array;
  const withFirst = generateCombinations(rest, size - 1).map((combo) => [first, ...combo]);
  const withoutFirst = generateCombinations(rest, size);

  return [...withFirst, ...withoutFirst];
}

module.exports = {
  shuffle,
  shuffled,
  randomElement,
  generateCombinations,
};
