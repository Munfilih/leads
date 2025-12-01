// Case-insensitive word matcher
function normalizeWord(word) {
  return word.toLowerCase().trim();
}

function areWordsEqual(word1, word2) {
  return normalizeWord(word1) === normalizeWord(word2);
}

function findMatchingWords(wordArray, targetWord) {
  const normalized = normalizeWord(targetWord);
  return wordArray.filter(word => normalizeWord(word) === normalized);
}

function getUniqueWords(wordArray) {
  const seen = new Set();
  return wordArray.filter(word => {
    const normalized = normalizeWord(word);
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}

// Example usage:
console.log(areWordsEqual("Hello", "HELLO")); // true
console.log(areWordsEqual("World", "world")); // true
console.log(findMatchingWords(["Apple", "APPLE", "banana", "Banana"], "apple")); // ["Apple", "APPLE"]
console.log(getUniqueWords(["Test", "TEST", "test", "Example", "EXAMPLE"])); // ["Test", "Example"]