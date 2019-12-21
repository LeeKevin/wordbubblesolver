const fs = require('fs');
const wordList = fs.readFileSync(require('word-list'), 'utf-8');

const { isWord } = (function setup() {
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
                key: curChar
                , value: key.length === 0 ? null : undefined
                , children: {}
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
        var curNode = this.head
            , curChar = key.slice(0, 1)
            , d = 0;

        key = key.slice(1);

        while (typeof curNode.children[curChar] !== "undefined" && curChar.length > 0) {
            curNode = curNode.children[curChar];
            curChar = key.slice(0, 1);
            key = key.slice(1);
            d += 1;
        }

        if (curNode.value == null && key.length === 0) {
            return {
                depth: d,
                isWord: curNode.isWord,
            };
        } else {
            return null;
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

    return {
        isWord
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

    const wordSets = []

    function findWords([r, c], grid, word, remainingNums, words) {
        const letter = grid[r][c];
        // Check that letter is alphanumeric
        if (!/^[a-z0-9]$/gi.test(letter)) return;

        grid = grid.slice()
        words = words.slice()
        remainingNums = remainingNums.slice()

        // remove letter from grid
        grid[r] = grid[r].replaceAt(c, ' ')

        const newWord = word + letter;
        const hasPrefix = isWord(newWord)
        if (!hasPrefix) return

        // If word is desired length
        const numLengthIndex = remainingNums.findIndex(num => num === newWord.length)

        if (numLengthIndex !== -1) {
            if (isWord(newWord, true)) {
                words.push(newWord)
                remainingNums.splice(numLengthIndex, 1);

                if (!remainingNums.length) {
                    wordSets.push(words)
                    return
                }

                // Move on to other letters
                findWordSet(
                    grid,
                    remainingNums,
                    words
                )

                return
            }
        }

        if (!remainingNums.some((num) => num > newWord.length)) {
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
                    remainingNums,
                    words
                )
            }
        }
    }

    function findWordSet(grid, remainingNums, words) {
        // Initiate findWords for each letter
        grid.forEach((row, i) => {
            Array.from(row).forEach((letter, j) => {
                findWords(
                    [i, j],
                    grid,
                    '',
                    remainingNums,
                    words
                )
            })
        })
    }

    findWordSet(
        letterGrid,
        numLetters.map(num => parseInt(num)),
        []
    )

    return Array.from(Object(
        wordSets.map(set => set.sort()).reduce((sets, set) => ({
            ...sets,
            [String(set)]: set,
        }), {})
    ).values()).sort();
}

module.exports = wordBubbleSolver;

if (require.main === module) {
    if (process.argv.length < 3) {
        throw Error('Please provide valid arguments.');
    }
    console.log(wordBubbleSolver(process.argv[2], ...process.argv.slice(3)));
    process.exit();
}
