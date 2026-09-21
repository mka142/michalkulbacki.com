// This file contains the JavaScript code for the PWA. It handles the functionality of the application, including the fader interaction and time series data management.

const timeseries = [];
window.timeseries = timeseries;

const VALUES_RANGE = 10;

const isLastValueRepeat = (value) =>
  timeseries.length > 0 &&
  timeseries[timeseries.length - 1].value === value;

function addTimeseries(time, value) {
  if ([VALUES_RANGE, 0].includes(value) && isLastValueRepeat(value)) {
    return;
  }
  timeseries.push({ time, value });
}

const fader = document.getElementById("fader");
const mixingBoard = document.getElementById("mixing-board");
let isMouseDown = false;
let isMouseOver = false;

fader.style.top = mixingBoard.getBoundingClientRect().height - 128 + "px";

document.addEventListener("mouseup", () => {
  isMouseDown = false;
  isMouseOver = false;
});
document.addEventListener("touchend", () => {
  isMouseDown = false;
  isMouseOver = false;
});

function isFaderUnderClientCoordinates(clientX, clientY) {
  const faderRect = fader.getBoundingClientRect();
  return (
    clientX >= faderRect.left &&
    clientX <= faderRect.right &&
    clientY >= faderRect.top &&
    clientY <= faderRect.bottom
  );
}

document.addEventListener("mousemove", (e) => {
  if (isMouseDown && !isMouseOver) {
    isMouseOver = isFaderUnderClientCoordinates(e.clientX, e.clientY);
  }
});
document.addEventListener("touchmove", (e) => {
  if (isMouseDown && !isMouseOver) {
    isMouseOver = isFaderUnderClientCoordinates(
      e.touches[0].clientX,
      e.touches[0].clientY
    );
  }
});

document.addEventListener("mousedown", () => {
  isMouseDown = true;
});
document.addEventListener("touchstart", () => {
  isMouseDown = true;
});

function onCursorMove(clientX, clientY) {
  if (isMouseOver && isMouseDown) {
    const faderRect = fader.getBoundingClientRect();
    const mixingBoardRect = mixingBoard.getBoundingClientRect();
    const top = clientY - mixingBoardRect.top - faderRect.height / 2;
    const time = Date.now();
    if (top < 0) {
      fader.style.top = "0px";
      addTimeseries(time, VALUES_RANGE);
    } else if (top > mixingBoardRect.height - faderRect.height) {
      fader.style.top = mixingBoardRect.height - faderRect.height + "px";
      addTimeseries(time, 0);
    } else {
      fader.style.top = top + "px";
      addTimeseries(
        time,
        (
          VALUES_RANGE -
          (top / mixingBoardRect.height) * VALUES_RANGE
        ).toFixed(2)
      );
    }
  }
}

document.addEventListener("mousemove", (e) => {
  onCursorMove(e.clientX, e.clientY);
});
document.addEventListener("touchmove", (e) => {
  onCursorMove(e.touches[0].clientX, e.touches[0].clientY);
});

function exportTimeSeriesToJsonFile() {
  const dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(timeseries));
  const downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "timeseries.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}