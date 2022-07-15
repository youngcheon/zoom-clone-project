import { segment } from "./segment.mjs";
import { addShader } from "./wegbl-transparency.mjs";

const videoElement = document.querySelector("video#remote");
const greenScreenCanvas = document.querySelector("canvas#remoteGreen");
const webglCanvas = document.querySelector("canvas#remotetrans");
const FRAME_RATE = 30;
let videoWidth = 640;
let videoHeight = 480;
let segmentedCanvas;

async function start() {
  // create a stream and send it to replace when its starts playing
  videoElement.onplaying = async () => {
    // use the offscreen canvas when the visible one is hidden for improved performance
    segmentedCanvas = greenScreenCanvas;
    segmentedCanvas.height = videoElement.height;
    segmentedCanvas.width = videoElement.width;

    let lastTime = new Date();

    async function getFrames() {
      const now = videoElement.currentTime;
      if (now > lastTime) {
        await segment(videoElement, segmentedCanvas);
      }
      lastTime = now;
      requestAnimationFrame(getFrames);
    }

    await getFrames();

    addShader(greenScreenCanvas, webglCanvas);
  };
}

start().catch((err) => console.error(err));
