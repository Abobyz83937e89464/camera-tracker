const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
  });

video.addEventListener("loadedmetadata", () => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
});

function processVideo() {
  if (typeof cv === "undefined") {
    requestAnimationFrame(processVideo);
    return;
  }

  let src = new cv.Mat(canvas.height, canvas.width, cv.CV_8UC4);
  let hsv = new cv.Mat();
  let mask = new cv.Mat();

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  src.data.set(imageData.data);

  cv.cvtColor(src, hsv, cv.COLOR_RGBA2RGB);
  cv.cvtColor(hsv, hsv, cv.COLOR_RGB2HSV);

  // Красный цвет (пример)
  let low = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [0, 120, 70, 0]);
  let high = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [10, 255, 255, 255]);

  cv.inRange(hsv, low, high, mask);

  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  cv.findContours(mask, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

  for (let i = 0; i < contours.size(); i++) {
    let cnt = contours.get(i);
    let rect = cv.boundingRect(cnt);
    ctx.strokeStyle = "lime";
    ctx.lineWidth = 3;
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
  }

  src.delete();
  hsv.delete();
  mask.delete();
  low.delete();
  high.delete();
  contours.delete();
  hierarchy.delete();

  requestAnimationFrame(processVideo);
}

setTimeout(() => {
  processVideo();
}, 2000);
