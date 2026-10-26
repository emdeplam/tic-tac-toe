/**
 * Pure tic-tac-toe rules. No DOM access, so the module can run in Node tests
 * and in the browser.
 *
 * Cells are numbered row-major:
 *  0 1 2
 *  3 4 5
 *  6 7 8
 */

export const PLAYERS = Object.freeze(["X", "O"]);

export const WIN_LINES = Object.freeze([
  Object.freeze([0, 1, 2]),
  Object.freeze([3, 4, 5]),
  Object.freeze([6, 7, 8]),
  Object.freeze([0, 3, 6]),
  Object.freeze([1, 4, 7]),
  Object.freeze([2, 5, 8]),
  Object.freeze([0, 4, 8]),
  Object.freeze([2, 4, 6]),
]);

export function createGame() {
  return {
    board: Array(9).fill(null),
    currentPlayer: "X",
    winner: null,
    isDraw: false,
    winningLine: null,
  };
}

export function isGameOver(state) {
  return state.winner !== null || state.isDraw;
}

/**
 * Place the current player's mark. Invalid moves (bad index, occupied cell,
 * or a finished game) return the same state unchanged.
 */
export function makeMove(state, index) {
  if (!Number.isInteger(index) || index < 0 || index > 8) {
    return state;
  }
  if (isGameOver(state) || state.board[index] !== null) {
    return state;
  }

  const board = state.board.slice();
  board[index] = state.currentPlayer;

  const winningLine =
    WIN_LINES.find((line) => {
      const [a, b, c] = line;
      return board[a] !== null && board[a] === board[b] && board[a] === board[c];
    }) ?? null;
  const winner = winningLine ? board[winningLine[0]] : null;
  const isDraw = winner === null && board.every((cell) => cell !== null);

  return {
    board,
    currentPlayer:
      winner || isDraw ? state.currentPlayer : state.currentPlayer === "X" ? "O" : "X",
    winner,
    isDraw,
    winningLine,
  };
}

export function resetGame() {
  return createGame();
}

export function statusMessage(state) {
  if (state.winner) {
    return `${state.winner} wins`;
  }
  if (state.isDraw) {
    return "Draw";
  }
  return `${state.currentPlayer}'s turn`;
}
