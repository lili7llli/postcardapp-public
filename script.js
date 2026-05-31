document.addEventListener("DOMContentLoaded", function () {
  const transitionContainer = document.getElementById("transition-container");

  if (performance.navigation.type === 1) {
      // 刷新时直接隐藏
      transitionContainer.style.display = "none";
  } else {
      // 外部进入时，播放动画
      setTimeout(() => {
          transitionContainer.classList.add("fade-out");
      }, 4500); // 4秒后开始淡出动画

      setTimeout(() => {
          transitionContainer.style.display = "none";
      }, 5500); // 5秒后完全隐藏（确保动画完成）
  }
});

// 获取表单和输入框
const form = document.getElementById('postcard-form'); // 获取明信片表单
const senderInput = document.getElementById('sender');
const timeInput = document.getElementById('time');
const receiverInput = document.getElementById('receiver');
const stampcodeInput = document.getElementById('stampcode');
const messageInput = document.getElementById('message');
// 获取文字层、图片层、涂鸦层的 canvas 元素
const textCanvas = document.getElementById('textCanvas');  // 获取文字层 canvas
const imageCanvas = document.getElementById('imageCanvas');  // 获取图片层 canvas
const drawingCanvas = document.getElementById('drawingCanvas');  // 获取涂鸦层 canvas
// 获取对应的 2d 上下文
const textCtx = textCanvas.getContext('2d');  // 获取文字层的上下文
const imageCtx = imageCanvas.getContext('2d');  // 获取图片层的上下文
const drawingCtx = drawingCanvas.getContext('2d');  // 获取涂鸦层的上下文
// 获取涂鸦开关和清除按钮
const toggleDrawBtn = document.getElementById('toggle-draw-btn'); // 涂鸦开关
const clearDrawBtn = document.getElementById('clear-draw-btn'); // 清除按钮
// 获取插入图片、下载和分享按钮
const insertImageBtn = document.getElementById('insert-image-btn');
const downloadBtn = document.getElementById('downloadBtn');
const shareBtn = document.getElementById('share-btn');
// 获取 Canvas和container
const canvasContainer = document.querySelector('.canvas-container'); // 获取用于存放 Canvas 的容器
const container = document.querySelector('.container');  // 父级容器
// 获取 container 的 padding 值
const computedStyle = window.getComputedStyle(container);
const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
const paddingRight = parseFloat(computedStyle.paddingRight) || 0;

// 获取设备像素比（适配高清屏幕）
const dpr = window.devicePixelRatio || 1;

// 创建背景图片对象
const backgroundImage = new Image();
backgroundImage.src = 'images/canvascontainer-bg.jpg?' + new Date().getTime();
backgroundImage.crossOrigin = "Anonymous";

// 当背景图片加载完成时，调整 canvas 大小
backgroundImage.onload = function() {
  // 计算 canvasContainer 宽高
  const canvasContainerWidth = Math.max(container.clientWidth - (paddingLeft || 0) - (paddingRight || 0), 0);
  const aspectRatio = backgroundImage.height / backgroundImage.width;
  const newHeight = canvasContainerWidth * aspectRatio;

  // 设置 canvasContainer 尺寸
  canvasContainer.style.width = `${canvasContainerWidth}px`;
  canvasContainer.style.height = `${newHeight}px`;

  // 设置所有 canvas 层的分辨率和显示尺寸
  document.querySelectorAll('.layer').forEach(canvas => {
    canvas.width = canvasContainerWidth * dpr;
    canvas.height = newHeight * dpr;
    canvas.style.width = `${canvasContainerWidth}px`;
    canvas.style.height = `${newHeight}px`;

    // 确保 Canvas 居中
  canvas.style.position = 'absolute';
  canvas.style.top = '50%';
  canvas.style.left = '50%';
  canvas.style.transform = 'translate(-50%, -50%)';

    // 适配高分辨率屏幕
    const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0); // 先重置变换
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
  });

  // 启用下载按钮
  const downloadBtn = document.getElementById("downloadBtn");
  if (downloadBtn) downloadBtn.disabled = false;
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function updateTextLayer() {
  // 适配高分辨率屏幕
  textCanvas.width = canvasContainer.clientWidth * devicePixelRatio;
  textCanvas.height = canvasContainer.clientHeight * devicePixelRatio;
  textCanvas.style.width = canvasContainer.clientWidth + "px";
  textCanvas.style.height = canvasContainer.clientHeight + "px";

  // 清空并重置 scale
  textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);
  textCtx.setTransform(1, 0, 0, 1, 0, 0); // 先重置变换
  textCtx.scale(devicePixelRatio, devicePixelRatio); // 再次缩放

  generatePostcard(senderInput.value, receiverInput.value, messageInput.value, stampcodeInput.value, timeInput.value);
}

// 监听输入框变化，实时更新 textCanvas
senderInput.addEventListener('input', updateTextLayer);
receiverInput.addEventListener('input', updateTextLayer);
messageInput.addEventListener('input', updateTextLayer);
stampcodeInput.addEventListener('input', updateTextLayer);
timeInput.addEventListener('input', updateTextLayer);

// 获取表单输入值
const sender = senderInput.value || '寄信人';
const receiver = receiverInput.value || '收件人';
const message = messageInput.value || '留言';
const stampcode = stampcodeInput.value || '邮政编码';
const time = timeInput.value || '日期';

//生成明信片
function generatePostcard(sender, receiver, message, stampcode, time) {
  // 清空画布
  textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);

    // 绘制寄件人
    textCtx.font = `11px 汉仪瘦金书简, Roboto, PingFang, simsun`;
    textCtx.textAlign = 'right';
    textCtx.textBaseline = 'bottom';
    textCtx.fillText(`From: ${sender}`, (textCanvas.width / devicePixelRatio) - 32, (textCanvas.height / devicePixelRatio) - 50);
    // 绘制日期
    textCtx.font = `8px 汉仪瘦金书简, Roboto, PingFang, simsun`;
    textCtx.textAlign = 'right';
    textCtx.textBaseline = 'bottom';
    textCtx.fillText(`${time}`, (textCanvas.width / devicePixelRatio) - 35, (textCanvas.height / devicePixelRatio) - 40);
    // 绘制收件人
    textCtx.font = `11px 汉仪瘦金书简, Roboto, PingFang, simsun`;
    textCtx.textAlign = 'left';
    textCtx.textBaseline = 'top';
    textCtx.fillText(`To: ${receiver}`, 178, 322);
    // 绘制邮票编码
    textCtx.font = `18px 汉仪瘦金书简, Roboto, PingFang, simsun`;
    textCtx.fillStyle = 'rgb(54, 0, 45)';
    let x = 36;
    const y = 254
    const spacing = 7.2;
    for (let i = 0; i < stampcode.length; i++) {
        textCtx.fillText(stampcode[i], x, y);
        x += textCtx.measureText(stampcode[i]).width + spacing;
    }

    // 计算留言框的 messageBoxX 和 messageBoxY
    const messageBoxWidth = 130;
    const messageBoxHeight = 70;
    const messageBoxX = 178;
    const messageBoxY = 335;

    // 绘制留言框背景
    textCtx.fillStyle = 'rgb(77, 10, 98, 0)'; // 透明背景
    textCtx.fillRect(messageBoxX, messageBoxY, messageBoxWidth, messageBoxHeight);

    // 最大字数限制
    const maxWords = 50;
    const processedMessage = message.slice(0, maxWords);

    // 留言文本设置
    textCtx.fillStyle = 'black';
    textCtx.font = `10px 汉仪瘦金书简`;
    textCtx.textAlign = 'left';

    // 计算留言文本的最大宽度
    const maxTextWidth = messageBoxWidth;

    // 将文本逐字符分行
    let lines = []; // 用于存储每一行的文本
    let currentLine = ''; // 当前行的文本 
    for (let i = 0; i < processedMessage.length; i++) { // 遍历每个字符
        const testLine = currentLine + processedMessage[i]; // 试验当前行加上新的字符
        const testWidth = textCtx.measureText(testLine).width; // 测量当前行的宽度
    // 如果当前行宽度超出最大宽度，则开始新的一行
    if (testWidth > maxTextWidth && currentLine !== '') { // 判断是否超出最大宽度
        lines.push(currentLine); // 将当前行加入行数组
        currentLine = processedMessage[i]; // 新的一行从当前字符开始
    } else {
    currentLine = testLine; // 继续添加字符到当前行
    }
}
// 如果有剩余文本，将其加入到行中
if (currentLine) lines.push(currentLine); // 将最后一行文本加入行数组

// 计算每行的垂直位置，使文本在矩形区域内居中
const lineHeight = 14; // 每行之间的高度
const totalTextHeight = lines.length * lineHeight; // 所有行的总高度
const messageY = messageBoxY + (messageBoxHeight - totalTextHeight) / 2 + lineHeight / 2 - 5; // 垂直居中位置
// 绘制每一行文本
lines.forEach((line, index) => {
  textCtx.fillText(line, messageBoxX, messageY + index * lineHeight);
});
}

//抖动机制来限制用户快速输入时的更新频率
let debounceTimeout;
function debounceGeneratePostcard() {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(updateTextLayer, 500);
}
senderInput.addEventListener('input', debounceGeneratePostcard);
receiverInput.addEventListener('input', debounceGeneratePostcard);
messageInput.addEventListener('input', debounceGeneratePostcard);

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 确保 DOM 加载完成
document.addEventListener("DOMContentLoaded", function () {
  // 获取按钮、文件上传控件、画布
  const insertImageBtn = document.getElementById('insert-image-btn');
  const imageUpload = document.getElementById('image-upload');
  const imageCanvas = document.getElementById('imageCanvas'); 
  const imageCtx = imageCanvas.getContext('2d');

  // 监听“插入邮票”按钮，触发文件选择
  insertImageBtn.addEventListener('click', function () {
      imageUpload.click();
  });

  // 监听文件选择
  imageUpload.addEventListener('change', function (event) {
      const file = event.target.files[0];
      if (file) {
          console.log("已选择文件：" + file.name);

          const reader = new FileReader();
          reader.onload = function (event) {
              const stampImage = new Image();
              stampImage.src = event.target.result;

              stampImage.onload = function () {
                  drawStamp(stampImage);
              };
          };
          reader.readAsDataURL(file);
      }
  });

  // 绘制邮票（图片 + 外框）到 `imageCanvas`
  function drawStamp(stampImage) {
    imageCtx.setTransform(1, 0, 0, 1, 0, 0); // 防止缩放叠加
    imageCtx.clearRect(0, 0, imageCanvas.width, imageCanvas.height); // 清除旧的绘制内容
    
    const aspectRatio = stampImage.width / stampImage.height;
    let newWidth = 105; // 逻辑宽度
    let newHeight = newWidth / aspectRatio; // 逻辑高度

    // 计算邮票的绘制位置
    const drawX = (imageCanvas.width / devicePixelRatio - newWidth) / 2 + 684; // 居中 + 水平偏移
    const drawY = (imageCanvas.height / devicePixelRatio - newHeight) / 2 + 616; // 居中 + 垂直偏移

    // 加载外框图片
    const frameImage = new Image();
    frameImage.src = 'images/frame.png';  // 确保路径正确
    frameImage.onload = function () {
        imageCtx.drawImage(stampImage, drawX, drawY, newWidth, newHeight); // 绘制邮票
        imageCtx.drawImage(frameImage, drawX, drawY, newWidth, newHeight); // 绘制外框
    };
  }
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 初始化状态
let isDrawing = false; // 是否正在绘制
let isDrawingEnabled = false; // 是否开启涂鸦模式
let lastX = 0, lastY = 0; // 记录上次的坐标

// 绑定涂鸦开关
clearDrawBtn.style.display = 'none'; // 默认隐藏清除按钮

toggleDrawBtn.addEventListener('click', () => {
  isDrawingEnabled = !isDrawingEnabled;
  
  if (isDrawingEnabled) {
      toggleDrawBtn.textContent = '[OFF]';
      clearDrawBtn.style.display = 'inline-block'; // 显示清除按钮
      drawingCanvas.style.backgroundColor = 'rgba(255, 255, 255, 0.5)'; // 设置半透明背景
      
      document.body.style.overflow = 'hidden';// 阻止页面滚动
      document.addEventListener('touchmove', preventScroll, { passive: false });
  } else {
      toggleDrawBtn.textContent = '涂鸦';
      clearDrawBtn.style.display = 'none'; // 隐藏清除按钮
      drawingCanvas.style.backgroundColor = 'rgba(0, 0, 0, 0)'; // 恢复透明

      document.body.style.overflow = 'auto'; // 恢复页面滚动
      document.removeEventListener('touchmove', preventScroll);
  }
});


// 绑定清除按钮
clearDrawBtn.addEventListener('click', () => {
  drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height); // 清除涂鸦
});

// 1. 确保 draw 函数在所有事件监听器之前被声明和定义
function draw(x, y) {
  drawingCtx.beginPath();
  drawingCtx.moveTo(lastX, lastY);
  drawingCtx.lineTo(x, y);
  drawingCtx.stroke();

  [lastX, lastY] = [x, y];
  
  // 创建纹理填充
  let pattern = drawingCtx.createPattern(textureImage, 'repeat'); // 使用图片创建纹理，'repeat'是重复模式

  // 模拟铅笔效果
  drawingCtx.strokeStyle = pattern; // 使用纹理填充样式
  drawingCtx.lineWidth = 4
  drawingCtx.lineCap = 'round'; // 线条末端圆滑
  drawingCtx.strokeStyle = pattern || 'black'; // 避免 pattern 为空时报错
}

  // 线条纹理图片加载
  let textureImage = new Image();
  textureImage.src = 'images/Yeah-16.jpg'; // 替换为你的图片路径
  let pattern = null;


// 2. 绑定绘制相关事件，确保事件中能够访问到 draw 函数
function handleDrawStart(e) {
  if (!isDrawingEnabled) return; // 如果未开启涂鸦模式，则不进行绘制
  isDrawing = true;
  const rect = drawingCanvas.getBoundingClientRect();
  const x = (e.clientX || e.touches[0].clientX) - rect.left;
  const y = (e.clientY || e.touches[0].clientY) - rect.top;
  [lastX, lastY] = [x, y];
}

function handleDrawing(e) {
  if (!isDrawing || !isDrawingEnabled) return; // 如果没有按下鼠标或未开启涂鸦模式，则不绘制
  const rect = drawingCanvas.getBoundingClientRect();
  const x = (e.clientX || e.touches[0].clientX) - rect.left;
  const y = (e.clientY || e.touches[0].clientY) - rect.top;
  draw(x, y);
}

function handleDrawEnd() {
  isDrawing = false; // 停止绘制
}

// 绑定鼠标和触摸事件
drawingCanvas.addEventListener('mousedown', handleDrawStart);
drawingCanvas.addEventListener('mousemove', handleDrawing);
drawingCanvas.addEventListener('mouseup', handleDrawEnd);
drawingCanvas.addEventListener('mouseout', handleDrawEnd);

// 触摸事件处理
drawingCanvas.addEventListener('touchstart', handleDrawStart);
drawingCanvas.addEventListener('touchmove', handleDrawing);
drawingCanvas.addEventListener('touchend', handleDrawEnd);
drawingCanvas.addEventListener('touchcancel', handleDrawEnd);

///////////////////////////////////////////////////////////////////////////////////////////////////
function finalCanvases() {
  const exportScale = 2; // 提高导出清晰度
  const finalCanvas = document.createElement('canvas');

  // 设置导出尺寸
  finalCanvas.width = canvasContainer.clientWidth * dpr * exportScale;
  finalCanvas.height = canvasContainer.clientHeight * dpr * exportScale;
  finalCanvas.style.width = `${canvasContainer.clientWidth}px`;
  finalCanvas.style.height = `${canvasContainer.clientHeight}px`;

  const finalCtx = finalCanvas.getContext('2d');
  finalCtx.setTransform(1, 0, 0, 1, 0, 0); // 防止 scale 叠加
  finalCtx.scale(exportScale, exportScale); // 统一放大

  // **确保背景图片已加载**
  if (backgroundImage.complete) {
    finalCtx.drawImage(
      backgroundImage,
      0, 0, finalCanvas.width / exportScale, finalCanvas.height / exportScale
    );
  } else {
    console.warn("❌ 背景图片未加载完成，可能导致背景丢失");
  }

  // **调整 canvas 叠加，确保所有层的尺寸按 exportScale 适配**
  [imageCanvas, textCanvas, drawingCanvas].forEach(canvas => {
    finalCtx.drawImage(
      canvas,
      0, 0, canvas.width, canvas.height, // 原始尺寸
      0, 0, finalCanvas.width / exportScale, finalCanvas.height / exportScale // 目标尺寸
    );
  });

  console.log("✅ finalCanvas 合成完成！");
  return finalCanvas;
}

// **下载按钮点击事件**
document.addEventListener("DOMContentLoaded", function () {
  console.log("✅ 所有元素已加载，绑定事件！");

  const downloadBtn = document.getElementById("downloadBtn");
  if (!downloadBtn) {
    console.error("❌ 未找到下载按钮！");
    return;
  }

  downloadBtn.addEventListener("click", function() {
    const finalCanvas = finalCanvases();  // 先合成
    if (finalCanvas) {
      console.log("下载的图片尺寸：", finalCanvas.width + " x " + finalCanvas.height);

      // **使用 toBlob() 下载，兼容 iOS**
      finalCanvas.toBlob((blob) => {
        if (blob) {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = 'E-Postcard.png';
          link.click();
          URL.revokeObjectURL(link.href);
        } else {
          console.error("❌ Blob 生成失败");
        }
      }, 'image/png', 1); // 质量设为最高
    } else {
      console.error("❌ 合成失败，无法下载");
    }
  });
});

// 分享按钮点击事件
shareBtn.addEventListener('click', function() {
    const finalCanvas = finalCanvases();
    if (finalCanvas) {
      const imageURL = finalCanvas.toDataURL('image/png');
      const shareUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(imageURL)}&title=${encodeURIComponent(shareMessage)}`;
      window.open(shareUrl, '_blank');
    } else {
    console.error("❌ 合成失败，无法分享");
  }
});