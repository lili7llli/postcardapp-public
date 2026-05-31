const senderInput = document.getElementById("sender");
const timeInput = document.getElementById("time");
const receiverInput = document.getElementById("receiver");
const stampcodeInput = document.getElementById("stampcode");
const messageInput = document.getElementById("message");
const imageCanvas = document.getElementById("imageCanvas");
const textCanvas = document.getElementById("textCanvas");
const drawingCanvas = document.getElementById("drawingCanvas");
const imageCtx = imageCanvas.getContext("2d");
const textCtx = textCanvas.getContext("2d");
const drawingCtx = drawingCanvas.getContext("2d");
const canvasContainer = document.querySelector(".canvas-container");
const insertImageBtn = document.getElementById("insert-image-btn");
const imageUpload = document.getElementById("image-upload");
const toggleDrawBtn = document.getElementById("toggle-draw-btn");
const clearDrawBtn = document.getElementById("clear-draw-btn");
const downloadBtn = document.getElementById("downloadBtn");
const shareBtn = document.getElementById("share-btn");

const backgroundImage = new Image();
backgroundImage.src = "images/canvascontainer-bg.jpg";

let dpr = Math.min(window.devicePixelRatio || 1, 2);
let stampImage = null;
let isDrawing = false;
let isDrawingEnabled = false;
let lastPoint = null;
let resizeTimer = null;

function getSize() {
  return {
    width: canvasContainer.clientWidth,
    height: canvasContainer.clientHeight
  };
}

function resizeCanvas(canvas, ctx) {
  const { width, height } = getSize();
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function resizeAllCanvases() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  resizeCanvas(imageCanvas, imageCtx);
  resizeCanvas(textCanvas, textCtx);
  resizeCanvas(drawingCanvas, drawingCtx);
  drawStampLayer();
  drawTextLayer();
  downloadBtn.disabled = false;
}

function scaleX(value) {
  return value * getSize().width / 360;
}

function scaleY(value) {
  return value * getSize().height / 495;
}

function font(size, family = "Songti SC, Noto Serif SC, Microsoft YaHei, SimSun, serif") {
  return `${scaleX(size)}px ${family}`;
}

function drawTextLayer() {
  const { width, height } = getSize();
  textCtx.clearRect(0, 0, width, height);
  textCtx.fillStyle = "#21002a";
  textCtx.textBaseline = "top";

  const sender = senderInput.value.trim() || "寄信人";
  const receiver = receiverInput.value.trim() || "收信人";
  const message = messageInput.value.trim() || "留言";
  const stampcode = stampcodeInput.value.trim();
  const time = timeInput.value.trim();

  textCtx.font = font(10);
  textCtx.textAlign = "right";
  textCtx.fillText(`From: ${sender}`, width - scaleX(24), height - scaleY(48));

  if (time) {
    textCtx.font = font(8);
    textCtx.fillText(time, width - scaleX(28), height - scaleY(34));
  }

  textCtx.textAlign = "left";
  textCtx.font = font(10);
  textCtx.fillText(`To: ${receiver}`, scaleX(176), scaleY(320));

  textCtx.font = font(17);
  let codeX = scaleX(36);
  for (const char of stampcode.slice(0, 6)) {
    textCtx.fillText(char, codeX, scaleY(252));
    codeX += textCtx.measureText(char).width + scaleX(7);
  }

  const boxX = scaleX(176);
  const boxY = scaleY(337);
  const boxWidth = scaleX(134);
  const boxHeight = scaleY(78);
  const lineHeight = scaleY(16);

  textCtx.font = font(10);
  const lines = wrapText(message.slice(0, 50), boxWidth);
  const startY = boxY + Math.max(0, (boxHeight - lines.length * lineHeight) / 2);
  lines.forEach((line, index) => {
    textCtx.fillText(line, boxX, startY + index * lineHeight);
  });
}

function wrapText(text, maxWidth) {
  const lines = [];
  let line = "";
  for (const char of text) {
    const testLine = line + char;
    if (textCtx.measureText(testLine).width > maxWidth && line) {
      lines.push(line);
      line = char;
    } else {
      line = testLine;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 5);
}

function drawStampLayer() {
  const { width, height } = getSize();
  imageCtx.clearRect(0, 0, width, height);
  if (!stampImage) return;

  const stampWidth = scaleX(62);
  const stampHeight = stampWidth * stampImage.height / stampImage.width;
  const x = width - stampWidth - scaleX(34);
  const y = scaleY(70);
  imageCtx.drawImage(stampImage, x, y, stampWidth, stampHeight);
}

function getPoint(event) {
  const rect = drawingCanvas.getBoundingClientRect();
  const touch = event.touches && event.touches[0];
  return {
    x: (touch ? touch.clientX : event.clientX) - rect.left,
    y: (touch ? touch.clientY : event.clientY) - rect.top
  };
}

function startDrawing(event) {
  if (!isDrawingEnabled) return;
  event.preventDefault();
  isDrawing = true;
  lastPoint = getPoint(event);
}

function draw(event) {
  if (!isDrawing || !isDrawingEnabled) return;
  event.preventDefault();
  const point = getPoint(event);
  drawingCtx.strokeStyle = "#2d1238";
  drawingCtx.lineWidth = Math.max(2, scaleX(3));
  drawingCtx.lineCap = "round";
  drawingCtx.lineJoin = "round";
  drawingCtx.beginPath();
  drawingCtx.moveTo(lastPoint.x, lastPoint.y);
  drawingCtx.lineTo(point.x, point.y);
  drawingCtx.stroke();
  lastPoint = point;
}

function stopDrawing() {
  isDrawing = false;
  lastPoint = null;
}

function finalCanvases() {
  const { width, height } = getSize();
  const exportScale = 2;
  const finalCanvas = document.createElement("canvas");
  finalCanvas.width = Math.round(width * exportScale);
  finalCanvas.height = Math.round(height * exportScale);
  const finalCtx = finalCanvas.getContext("2d");
  finalCtx.scale(exportScale, exportScale);

  if (backgroundImage.complete) {
    finalCtx.drawImage(backgroundImage, 0, 0, width, height);
  }
  [imageCanvas, textCanvas, drawingCanvas].forEach((canvas) => {
    finalCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, width, height);
  });
  return finalCanvas;
}

function downloadPostcard() {
  finalCanvases().toBlob((blob) => {
    if (!blob) return;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "E-Postcard.png";
    link.click();
    URL.revokeObjectURL(link.href);
  }, "image/png", 0.92);
}

async function sharePostcard() {
  const finalCanvas = finalCanvases();
  finalCanvas.toBlob(async (blob) => {
    if (!blob) return;
    const file = new File([blob], "E-Postcard.png", { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: "E 路Postcard" });
    } else {
      downloadPostcard();
    }
  }, "image/png", 0.92);
}

[senderInput, timeInput, receiverInput, stampcodeInput, messageInput].forEach((input) => {
  input.addEventListener("input", drawTextLayer);
});

insertImageBtn.addEventListener("click", () => imageUpload.click());
imageUpload.addEventListener("change", (event) => {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const image = new Image();
  image.onload = () => {
    stampImage = image;
    drawStampLayer();
  };
  image.src = URL.createObjectURL(file);
});

toggleDrawBtn.addEventListener("click", () => {
  isDrawingEnabled = !isDrawingEnabled;
  drawingCanvas.classList.toggle("is-drawing", isDrawingEnabled);
  clearDrawBtn.hidden = !isDrawingEnabled;
  toggleDrawBtn.textContent = isDrawingEnabled ? "关闭" : "涂鸦";
});

clearDrawBtn.addEventListener("click", () => {
  drawingCtx.clearRect(0, 0, getSize().width, getSize().height);
});

drawingCanvas.addEventListener("mousedown", startDrawing);
drawingCanvas.addEventListener("mousemove", draw);
drawingCanvas.addEventListener("mouseup", stopDrawing);
drawingCanvas.addEventListener("mouseleave", stopDrawing);
drawingCanvas.addEventListener("touchstart", startDrawing, { passive: false });
drawingCanvas.addEventListener("touchmove", draw, { passive: false });
drawingCanvas.addEventListener("touchend", stopDrawing);
drawingCanvas.addEventListener("touchcancel", stopDrawing);

downloadBtn.addEventListener("click", downloadPostcard);
shareBtn.addEventListener("click", sharePostcard);

window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(resizeAllCanvases, 120);
});

if (backgroundImage.complete) {
  resizeAllCanvases();
} else {
  backgroundImage.onload = resizeAllCanvases;
}
