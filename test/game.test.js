import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  WIN_LINES,
  createGame,
  makeMove,
  resetGame,
  statusMessage,
} from "../src/game.js";

function play(moves) {
  return moves.reduce((state, index) => makeMove(state, index), createGame());
}

describe("new game", () => {
  it("starts with an empty board and X to move", () => {
    const state = createGame();
    assert.deepEqual(state.board, Array(9).fill(null));
    assert.equal(state.currentPlayer, "X");
    assert.equal(state.winner, null);
    assert.equal(state.isDraw, false);
    assert.equal(state.winningLine, null);
    assert.equal(statusMessage(state), "X's turn");
  });
});

describe("turn order", () => {
  it("lets X move first and then alternates", () => {
    let state = createGame();
    state = makeMove(state, 0);
    assert.equal(state.board[0], "X");
    assert.equal(state.currentPlayer, "O");
    assert.equal(statusMessage(state), "O's turn");

    state = makeMove(state, 1);
    assert.equal(state.board[1], "O");
    assert.equal(state.currentPlayer, "X");

    state = makeMove(state, 4);
    assert.equal(state.board[4], "X");
    assert.equal(state.currentPlayer, "O");
    assert.deepEqual(state.board, ["X", "O", null, null, "X", null, null, null, null]);
  });
});

describe("occupied cells", () => {
  it("does not overwrite a mark or change the turn", () => {
    const afterFirst = makeMove(createGame(), 0);
    const blocked = makeMove(afterFirst, 0);
    assert.equal(blocked, afterFirst);
    assert.equal(blocked.board[0], "X");
    assert.equal(blocked.currentPlayer, "O");

    const afterSecond = makeMove(blocked, 4);
    const blockedAgain = makeMove(afterSecond, 4);
    assert.equal(blockedAgain, afterSecond);
    assert.equal(blockedAgain.board[4], "O");
    assert.equal(blockedAgain.currentPlayer, "X");
  });

  it("ignores indexes outside the board", () => {
    const state = createGame();
    for (const index of [-1, 9, 1.5, Number.NaN]) {
      assert.equal(makeMove(state, index), state);
    }
  });
});

describe("win lines", () => {
  const xWins = [
    { line: [0, 1, 2], moves: [0, 3, 1, 4, 2] },
    { line: [3, 4, 5], moves: [3, 0, 4, 1, 5] },
    { line: [6, 7, 8], moves: [6, 0, 7, 1, 8] },
    { line: [0, 3, 6], moves: [0, 1, 3, 2, 6] },
    { line: [1, 4, 7], moves: [1, 0, 4, 2, 7] },
    { line: [2, 5, 8], moves: [2, 0, 5, 1, 8] },
    { line: [0, 4, 8], moves: [0, 1, 4, 2, 8] },
    { line: [2, 4, 6], moves: [2, 0, 4, 1, 6] },
  ];

  const oWins = [
    { line: [0, 1, 2], moves: [3, 0, 6, 1, 4, 2] },
    { line: [3, 4, 5], moves: [0, 3, 2, 4, 6, 5] },
    { line: [6, 7, 8], moves: [0, 6, 1, 7, 4, 8] },
    { line: [0, 3, 6], moves: [1, 0, 2, 3, 4, 6] },
    { line: [1, 4, 7], moves: [0, 1, 2, 4, 3, 7] },
    { line: [2, 5, 8], moves: [0, 2, 1, 5, 3, 8] },
    { line: [0, 4, 8], moves: [1, 0, 2, 4, 3, 8] },
    { line: [2, 4, 6], moves: [0, 2, 1, 4, 3, 6] },
  ];

  it("knows the eight lines", () => {
    assert.equal(WIN_LINES.length, 8);
    const keys = WIN_LINES.map((line) => [...line].sort().join(""));
    assert.equal(new Set(keys).size, 8);
  });

  for (const { line, moves } of xWins) {
    it(`announces X for line ${line.join("-")} and rejects later moves`, () => {
      const state = play(moves);
      assert.equal(state.winner, "X");
      assert.equal(state.isDraw, false);
      assert.deepEqual(state.winningLine, line);
      assert.equal(statusMessage(state), "X wins");
      for (const index of line) {
        assert.equal(state.board[index], "X");
      }

      const empty = state.board.findIndex((cell) => cell === null);
      assert.notEqual(empty, -1);
      assert.equal(makeMove(state, empty), state);
    });
  }

  for (const { line, moves } of oWins) {
    it(`announces O for line ${line.join("-")} and rejects later moves`, () => {
      const state = play(moves);
      assert.equal(state.winner, "O");
      assert.equal(state.isDraw, false);
      assert.deepEqual(state.winningLine, line);
      assert.equal(statusMessage(state), "O wins");
      for (const index of line) {
        assert.equal(state.board[index], "O");
      }

      const empty = state.board.findIndex((cell) => cell === null);
      assert.notEqual(empty, -1);
      assert.equal(makeMove(state, empty), state);
    });
  }

  it("prefers a win over a draw when the last square finishes a line", () => {
    const state = play([0, 2, 4, 5, 1, 6, 3, 7, 8]);
    assert.equal(state.board.filter(Boolean).length, 9);
    assert.equal(state.winner, "X");
    assert.equal(state.isDraw, false);
    assert.deepEqual(state.winningLine, [0, 4, 8]);
    assert.equal(statusMessage(state), "X wins");
    assert.equal(makeMove(state, 0), state);
  });
});

describe("draw", () => {
  it("reports a draw when the board is full and nobody has three in a row", () => {
    const state = play([0, 1, 2, 4, 3, 5, 7, 6, 8]);
    assert.deepEqual(state.board, ["X", "O", "X", "X", "O", "O", "O", "X", "X"]);
    assert.equal(state.winner, null);
    assert.equal(state.isDraw, true);
    assert.equal(state.winningLine, null);
    assert.equal(statusMessage(state), "Draw");
    assert.equal(makeMove(state, 0), state);
  });
});

describe("reset", () => {
  it("clears a game in progress and returns the turn to X", () => {
    const mid = play([0, 4, 8]);
    const fresh = resetGame(mid);
    assert.deepEqual(fresh, createGame());
    assert.equal(statusMessage(fresh), "X's turn");
  });

  it("clears a finished win and a draw", () => {
    assert.deepEqual(resetGame(play([0, 3, 1, 4, 2])), createGame());
    assert.deepEqual(resetGame(play([0, 1, 2, 4, 3, 5, 7, 6, 8])), createGame());
  });
});
