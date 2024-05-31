import { useEffect, useRef, useState } from 'react';
import { FaceDetector, Detection } from '@mediapipe/tasks-vision';

interface Props {
  videoRef?: React.MutableRefObject<HTMLVideoElement | null>;
  selectedDeviceId?: string;
}

export default function useMediaPipe({ videoRef, selectedDeviceId }: Props) {
  const liveViewRef = useRef<HTMLDivElement | null>(null);
  const [faceDetector, setFaceDetector] = useState<FaceDetector | null>(null);
  let children: any[] = [];
  const init = async () => {
    const vision = {
      wasmLoaderPath: new URL(
        '../../node_modules/@mediapipe/tasks-vision/wasm/vision_wasm_internal.js',
        import.meta.url
      ).pathname,
      wasmBinaryPath: new URL(
        '../../node_modules/@mediapipe/tasks-vision/wasm/vision_wasm_internal.wasm',
        import.meta.url
      ).pathname,
    };

    await FaceDetector.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: '/models/blaze_face_short_range.tflite',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
    })
      .then((detector) => {
        setFaceDetector(detector);
        predictWebcam();
      })
      .catch((error) => console.error('faceDetecotr init error', error));
  };

  const displayVideoDetections = (detections: Detection[]) => {
    // Remove any highlighting from previous frame.
    console.log('detections', detections);
    if (detections.length < 1) return;

    if (liveViewRef.current !== null) {
      for (let child of children) {
        if (liveViewRef.current) {
          liveViewRef.current.removeChild(child);
        }
      }
      children = [];
    }

    // Iterate through predictions and draw them to the live view
    for (let detection of detections) {
      if (detection.boundingBox && videoRef?.current) {
        const highlighter = document.createElement('div');
        highlighter.className = 'highlighter';
        highlighter.style.position = 'absolute';
        highlighter.style.left = `${
          videoRef?.current.offsetWidth -
          detection.boundingBox.width -
          detection.boundingBox.originX
        }px`;
        // highlighter.style.left = `${detection.boundingBox.originX}px`;
        highlighter.style.top = `${detection.boundingBox.originY}px`;
        highlighter.style.width = `${detection.boundingBox.width}px`;
        highlighter.style.height = `${detection.boundingBox.height}px`;
        highlighter.style.background = 'red';

        if (liveViewRef.current) {
          liveViewRef.current.appendChild(highlighter);
        }

        children.push(highlighter);
      }

      if (videoRef?.current) {
        for (let keypoint of detection.keypoints) {
          const keypointEl = document.createElement('span');
          keypointEl.className = 'key-point';
          keypointEl.style.top = `${keypoint.y * videoRef?.current.offsetHeight - 3}px`;
          keypointEl.style.left = `${
            videoRef?.current.offsetWidth - keypoint.x * videoRef?.current.offsetWidth - 3
          }px`;
          if (liveViewRef.current !== null) liveViewRef.current.appendChild(keypointEl);
          children.push(keypointEl);
        }
      }
    }
  };

  const predictWebcam = () => {
    if (!videoRef || !videoRef.current || !faceDetector) {
      return;
    }

    console.log('faceDetector', faceDetector);
    let startTimeMs = performance.now();
    let lastVideoTime = -1;
    // Detect faces using detectForVideo
    if (videoRef.current.currentTime !== lastVideoTime) {
      lastVideoTime = videoRef.current.currentTime ?? -1;
      const detections = faceDetector.detectForVideo(videoRef.current, startTimeMs).detections;

      displayVideoDetections(detections);
    }

    // Call this function again to keep predicting when the browser is ready
    window.requestAnimationFrame(predictWebcam);
  };

  useEffect(() => {
    if (!videoRef || !videoRef.current || !faceDetector) {
      return;
    }

    // predictWebcam();
  }, [faceDetector, videoRef, selectedDeviceId]);

  useEffect(() => {
    init();
  }, []);

  return { liveViewRef };
}
