# Tic Tac Toe

A two-player tic-tac-toe page with no runtime dependencies. The rules live in `src/game.js`; the page in `index.html` only renders that state.

## Run the app

From the repository root:

```bash
python3 -m http.server 8080
```

Open http://localhost:8080. X moves first. Click an empty square to play. The status line shows whose turn it is, the winner, or a draw. Reset clears the board and gives the next game to X.

Use a local server. Opening `index.html` directly can block the ES modules the page loads.

## Run the tests

Node.js 20 or newer includes the test runner, so there is nothing to install:

```bash
node --test
```

`npm test` runs the same command. GitHub Actions runs `node --test` on pull requests.
