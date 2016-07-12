var fs = require('fs'),
    util = require('util'),
    wordList = fs.readFileSync(require('word-list'), 'utf-8');

function isWord(word, exact) {
    if (typeof exact == 'undefined') exact = false;
    var re = new RegExp('(?:^|\\n)(' + word + (exact ? '' : '[a-z]*') + ')(?:\\n|$)', 'gi');
    return re.test(wordList)
}

function uniqueArray(a) {
    var seen = {};
    return a.filter(function (item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
}

const defaults = {
    verbose: false,
    numLetters: 0,
};

function wordBubbleSolver(letterGrid, options) {
    var numLetters, wordPaths = [];

    if (typeof options === 'object' && options.hasOwnProperty('numLetters')) {
        numLetters = parseInt(options.numLetters);
    } else {
        numLetters = parseInt(options);
    }
    if (isNaN(numLetters)) numLetters = 0;

    options = util._extend(util._extend({}, defaults), typeof options === 'object' ? options : {});

    if (Object.prototype.toString.call(letterGrid) !== '[object Array]') {
        if (typeof letterGrid !== 'string') {
            throw Error('Please provide a valid grid of letters.');
        }
        letterGrid = letterGrid.split('|');
    }
    if (!letterGrid.length) {
        throw Error('Please provide a valid grid of letters.');
    }

    var words = [];

    function findWords(word, letterChain, nextPos) {
        letterChain = letterChain.slice();

        // Check that nextPos is valid
        if (nextPos[0] < 0 || nextPos[0] >= letterGrid.length || nextPos[1] < 0) return;
        if (nextPos[1] >= letterGrid[nextPos[0]]) return;
        var letter = letterGrid[nextPos[0]][nextPos[1]];

        // Check that letter is alphanumeric
        if (!/^[a-z0-9]$/gi.test(letter)) return;

        // Check that next position is not already in letterChain
        for (var i = 0, length = letterChain.length; i < length; i++) {
            if (nextPos[0] == letterChain[i][0] && nextPos[1] == letterChain[i][1]) return;
        }

        // Append letter to word
        word = word + letterGrid[nextPos[0]][nextPos[1]];

        // If word is desired length
        if (numLetters && word.length == numLetters) {
            // Check if actual word
            if (!isWord(word, true)) return;
            if (options.verbose) wordPaths.push(letterChain);
            return words.push(word);
        } else if (!numLetters && isWord(word, true)) {
            words.push(word);
            if (options.verbose) wordPaths.push(letterChain);
        }

        // Check if word potential
        if (!isWord(word, false)) return;

        // Add letter coordinates to chain
        letterChain.push(nextPos);

        // Recursive for surrounding letters
        for (i = -1; i <= 1; i++) {
            for (var j = -1; j <= 1; j++) {
                if (i == 0 && j == 0) continue; // Skip current letter
                findWords(word, letterChain, [nextPos[0] + i, nextPos[1] + j]);
            }
        }
    }

    // Initiate findWords for each letter
    for (var i = 0; i < letterGrid.length; i++) {
        for (var j = 0; j < letterGrid[i].length; j++) {
            findWords('', [], [i, j]);
        }
    }

    if (options.verbose) {
        var wordsVerbose = [];
        for (var z = 0, wordsLength = words.length; z < wordsLength; z++) {
            wordsVerbose.push([words[z], wordPaths[z]]);
        }
        return wordsVerbose;
    } else {
        return uniqueArray(words);
    }
}

module.exports = wordBubbleSolver;

if (require.main === module) {
    if (process.argv.length < 3) {
        throw Error('Please provide valid arguments.');
    }
    console.log(wordBubbleSolver(process.argv[2], process.argv[3]));
    process.exit();
}
