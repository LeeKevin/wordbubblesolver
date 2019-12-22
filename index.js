const fs = require('fs');
const wordList = fs.readFileSync(require('word-list'), 'utf-8');

const {
    isWord,
    getCombinations,
} = (function setup() {
    function Trie() {
        this.head = {
            key: '',
            children: {},
        }
    }

    Trie.prototype.add = function (key) {
        var curNode = this.head
            , newNode = null
            , curChar = key.slice(0, 1);

        key = key.slice(1);

        while (
            typeof curNode.children[curChar] !== "undefined"
            && curChar.length > 0
            ) {
            curNode = curNode.children[curChar];
            curChar = key.slice(0, 1);
            key = key.slice(1);
        }

        while (curChar.length > 0) {
            newNode = {
                key: curChar,
                children: {}
            };

            curNode.children[curChar] = newNode;

            curNode = newNode;

            curChar = key.slice(0, 1);
            key = key.slice(1);
        }

        if (curNode) {
            curNode.isWord = true;
        }
    };

    Trie.prototype.search = function (key) {
        const originalSearch = key
        let curNode = this.head
        let curChar = key.slice(0, 1)
        let d = 0;

        key = key.slice(1);

        while (true) {
            if (typeof curNode.children[curChar] !== "undefined" && curChar.length > 0) {
                curNode = curNode.children[curChar];
                curChar = key.slice(0, 1);
                key = key.slice(1);
                d += 1;
            } else if (curChar) {
                return null
            } else {
                return {
                    depth: d,
                    isWord: curNode.isWord,
                }
            }
        }
    }

    String.prototype.replaceAt = function (index, replacement) {
        return this.substr(0, index) + replacement + this.substr(index + replacement.length);
    }

    Object.prototype.values = function () {
        return Object.keys(this).map(k => this[k])
    }

    Array.prototype.some = function (callback) {
        for (let i = 0; i < this.length; i++) {
            if (callback(this[i], i)) return true;
        }

        return false;
    }

    const trie = new Trie();
    wordList.split('\n').forEach(word => trie.add(word))

    function isWord(word, exact) {
        if (typeof exact == 'undefined') exact = false
        const result = trie.search(word)

        if (exact && result && !result.isWord) return false
        return !!result
    }

    function getCombinations(combinations, arrays, callback) {
        if (!arrays.length) return combinations

        const nextArray = arrays[0]
        const remaining = arrays.slice(1)

        if (!combinations.length) {
            combinations = nextArray
            return getCombinations(combinations, remaining, callback)
        } else {
            const nextCombinations = []
            combinations.forEach((a) => {
                nextArray.forEach((b) => {
                    const validCombination = callback(a, b)
                    if (validCombination) {
                        nextCombinations.push(validCombination)
                    }
                })
            })

            return getCombinations(nextCombinations, remaining, callback)
        }
    }

    return {
        isWord,
        getCombinations,
    }
})()

function wordBubbleSolver(letterGrid, ...numLetters) {
    if (Object.prototype.toString.call(letterGrid) !== '[object Array]') {
        if (typeof letterGrid !== 'string') {
            throw Error('Please provide a valid grid of letters.');
        }
        letterGrid = letterGrid.split('|');
    }
    if (!letterGrid.length) {
        throw Error('Please provide a valid grid of letters.');
    }

    const validWordLengths = new Set(numLetters.map(num => parseInt(num)))
    const maxWordLength = Math.max(Array.from(validWordLengths))

    const wordPaths = {}

    function addWord(word, path) {
        if (!wordPaths[word.length]) {
            wordPaths[word.length] = []
        }

        wordPaths[word.length].push([[word], new Set(path.map(position => String(position)))]);
    }

    function findWords(position, grid, word, path) {
        const [r, c] = position
        const letter = grid[r][c];
        // Check that letter is alpha
        if (!/^[a-z]$/gi.test(letter)) return;

        const newWord = word + letter;
        const hasPrefix = isWord(newWord)
        if (!hasPrefix) return

        grid = grid.slice()
        path = path.slice()

        // remove letter from grid
        grid[r] = grid[r].replaceAt(c, ' ')
        path.push(position)

        // If word is desired length
        if (validWordLengths.has(newWord.length)) {
            if (isWord(newWord, true)) {
                addWord(newWord, path)
            }
        }

        if (newWord.length > maxWordLength) {
            return
        }

        // Get next positions
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue; // Skip current letter

                const nextRow = r + i
                const nextCol = c + j
                if (nextRow < 0 || nextRow >= letterGrid.length) continue;
                if (nextCol < 0 || nextCol >= letterGrid[nextRow].length) continue;
                findWords(
                    [nextRow, nextCol],
                    grid,
                    newWord,
                    path
                )
            }
        }
    }

    function findWordSet(grid) {
        // Initiate findWords for each letter
        grid.forEach((row, i) => {
            Array.from(row).forEach((letter, j) => {
                findWords(
                    [i, j],
                    grid,
                    '',
                    []
                )
            })
        })

        // Now we have all the found words in wordPaths, find valid combinations
        return getCombinations(
            [],
            numLetters.map(num => wordPaths[num] || []),
            ([wordSetA, positionsA], [wordSetB, positionsB]) => {
                if (Array.from(positionsB).some(pos => positionsA.has(pos))) {
                    // overlap: invalid combination
                    return null
                }

                return [wordSetA.concat(wordSetB), new Set([...positionsA, ...positionsB])]
            }
        )
    }

    const wordSets = findWordSet(letterGrid)

    return wordSets.map(([words, positions]) => words);
}

module.exports = wordBubbleSolver;

if (require.main === module) {
    if (process.argv.length < 3) {
        throw Error('Please provide valid arguments.');
    }
    console.log(wordBubbleSolver(process.argv[2], ...process.argv.slice(3)));
    process.exit();
}
