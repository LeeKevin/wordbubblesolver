# Word Bubble Solver

## Introduction

This app can be used to identify English words within a grid of letters. It does this by finding combinations of adjacent letters (think of a path within the grid) that form valid words.

It is inspired by the [WordBubbles!](https://itunes.apple.com/ca/app/wordbubbles!/id922488002?mt=8) game.

## Installation

Ensure that you have [node](https://nodejs.org/en/download/) installed on your machine. You can also use [homebrew](http://brew.sh) if it is already installed: `brew install node`. 

Clone the app using Terminal with `git clone https://github.com/LeeKevin/wordbubblesolver`

In the project directory, install dependencies with `npm install`

## Usage
Pass a string representation of our grid to our function, separating each row of letters with `|`. To find words with specific number of characters, add the desired word length as a second argument.

e.g.

``` node index.js "rst|eno|pal" 4 ```

``` 
[ ['rest'],
  ['rens'],
  ['rent'],
   ... ]
```

When a space (or a non-alphabetic character) is included in the grid of letters, it will not be considered when looking for word combinations. However, it will still occupy a space in the grid.

e.g.

```node index.js "r e| no| al" 5```

```
[ ['alone'] ]
```

Note that 'loner' is not a valid word because the space prevents a path from forming between the 'e' and the 'r'.


Add more word lengths as arguments to find additional words that match all word lengths in the grid.

e.g.

```node index.js "ree|tso|dal" 5 4```

```
[ 
  [ 'dater', 'lose' ],
  [ 'load', 'trees' ],
  [ 'loads', 'tree' ],
  ...
]
```
