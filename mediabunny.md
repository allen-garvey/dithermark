# Mediabunny migration

* Add images to video using mediabunny
* for some reason last image is not in video

```js
import { Output, Mp4OutputFormat, BufferTarget, CanvasSource, QUALITY_HIGH } from 'mediabunny';

const output = new Output({
  format: new Mp4OutputFormat(),
  target: new BufferTarget(), 
});

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

const videoSource = new CanvasSource(canvas, {
  codec: 'avc', // H.264
  bitrate: QUALITY_HIGH,
});

const frameRate = 30;

output.addVideoTrack(videoSource, { frameRate });

await output.start();

let frameIndex = 0;
const frameDuration = 1 / frameRate; // Duration of each frame in seconds

// Loop through your image sequence and add frames
for (const img of myImages) {
    ctx.drawImage(img, 0, 0);
    const timestamp = frameIndex * frameDuration;
    videoSource.add(timestamp, frameDuration);
    
    frameIndex++;
}

await output.finalize();

const buffer = output.target.buffer; // This is your .mp4 file

// nullify output and videoSource to free memory
```