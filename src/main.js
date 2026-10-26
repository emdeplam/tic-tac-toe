import { createGame, isGameOver, makeMove, resetGame, statusMessage } from "./game.js";

const boardEl = document.querySelector("#board");
const statusEl = document.querySelector("#status");
const resetButton = document.querySelector("#reset");

let state = createGame();

const cells = Array.from({ length: 9 }, (_, index) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "cell";
  button.dataset.index = String(index);
  const row = Math.floor(index / 3) + 1;
  const column = (index % 3) + 1;
  button.dataset.row = String(row);
  button.dataset.column = String(column);
  button.addEventListener("click", () => {
    const next = makeMove(state, index);
    if (next === state) {
      return;
    }
    state = next;
    render();
  });
  boardEl.append(button);
  return button;
});

resetButton.addEventListener("click", () => {
  state = resetGame();
  render();
});

function render() {
  const winning = new Set(state.winningLine ?? []);
  const finished = isGameOver(state);

  cells.forEach((button, index) => {
    const mark = state.board[index];
    const row = button.dataset.row;
    const column = button.dataset.column;
    button.textContent = mark ?? "";
    button.dataset.mark = mark ?? "";
    button.classList.toggle("win", winning.has(index));
    button.disabled = finished || mark !== null;
    button.setAttribute(
      "aria-label",
      mark ? `Row ${row}, column ${column}, ${mark}` : `Row ${row}, column ${column}, empty`,
    );
  });

  statusEl.textContent = statusMessage(state);
  statusEl.dataset.state = state.winner ? "win" : state.isDraw ? "draw" : "playing";
}

render();
