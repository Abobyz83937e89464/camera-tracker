const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

async function startCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "user" }
  });
  video.srcObject = stream;

  video.onloadedmetadata = () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    waitForOpenCV();
  };
}

function waitForOpenCV() {
  if (typeof cv !== "undefined" && cv.Mat) {
    processVideo();
  } else {
    setTimeout(waitForOpenCV, 100);
  }
}

function processVideo() {
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  let src = cv.imread(canvas);
  let hsv = new cv.Mat();
  let mask = new cv.Mat();

  cv.cvtColor(src, hsv, cv.COLOR_RGBA2RGB);
  cv.cvtColor(hsv, hsv, cv.COLOR_RGB2HSV);

  let low = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [0,120,70,0]);
  let high = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [10,255,255,255]);

  cv.inRange(hsv, low, high, mask);

  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();

  cv.findContours(mask, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

  for (let i = 0; i < contours.size(); i++) {
    let rect = cv.boundingRect(contours.get(i));
    cv.rectangle(src,
      new cv.Point(rect.x, rect.y),
      new cv.Point(rect.x + rect.width, rect.y + rect.height),
      [0,255,0,255],
      2
    );
  }

  cv.imshow(canvas, src);

  src.delete();
  hsv.delete();
  mask.delete();
  low.delete();
  high.delete();
  contours.delete();
  hierarchy.delete();

  requestAnimationFrame(processVideo);
}
