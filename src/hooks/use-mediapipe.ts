import { createElement, ReactElement, useEffect, useRef, useState } from 'react';
import { FaceDetector, Detection } from '@mediapipe/tasks-vision';

interface Props {
  videoRef?: React.MutableRefObject<HTMLVideoElement | null>;
  selectedDeviceId?: string;
  mirror?: boolean;
}

export default function useMediaPipe({ videoRef, selectedDeviceId, mirror }: Props) {
  const liveViewRef = useRef<HTMLDivElement | null>(null);
  const detectorRef = useRef<FaceDetector | null>(null);
  const [highlighter, setHighlighter] = useState<ReactElement | null>(null);
  let lastVideoTime = -1;
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

    let faceDetector = await FaceDetector.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: '/models/blaze_face_short_range.tflite',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
    });
    await faceDetector.setOptions({ runningMode: 'VIDEO' });

    detectorRef.current = faceDetector;
  };

  // const startDetection = () => {
  //   if (videoRef && videoRef.current && videoRef.current.srcObject) {
  //     predictWebcam();
  //   }
  // };

  const displayVideoDetections = (detections: Detection[]) => {
    // Remove any highlighting from previous frame.
    if (detections.length < 1) {
      return;
    }

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
        const highlighter = createElement('div', {
          className: 'highlighter',
          style: {
            position: 'absolute',
            top: `${detection.boundingBox.originY - detection.boundingBox.height / 2}px`,
            left: mirror
              ? `${
                  videoRef?.current.offsetWidth -
                  (detection.boundingBox.originX + detection.boundingBox.width / 2)
                }px`
              : `${detection.boundingBox.originX - detection.boundingBox.width / 2}px`,
            width: `${detection.boundingBox.width}px`,
            height: `${detection.boundingBox.height}px`,
            border: '1px solid red',
            borderRadius: '50%',
          },
        });
        setHighlighter(highlighter);
      }

      // if (videoRef?.current) {
      //   for (let keypoint of detection.keypoints) {
      //     const keypointEl = document.createElement('span');
      //     keypointEl.className = 'key-point';
      //     keypointEl.style.top = `${keypoint.y * videoRef?.current.offsetHeight - 3}px`;
      //     keypointEl.style.left = `${
      //       videoRef?.current.offsetWidth - keypoint.x * videoRef?.current.offsetWidth - 3
      //     }px`;
      //     if (liveViewRef.current !== null) liveViewRef.current.appendChild(keypointEl);
      //     children.push(keypointEl);
      //   }
      // }
    }
  };

  const predictWebcam = () => {
    if (!videoRef || !videoRef.current || !detectorRef.current || !videoRef.current.srcObject) {
      console.error('error predictWebcam');
      return;
    }

    let startTimeMs = performance.now();

    // Detect faces using detectForVideo
    if (videoRef.current.currentTime > lastVideoTime && videoRef.current.currentTime > 0) {
      lastVideoTime = videoRef.current.currentTime;

      const { detections } = detectorRef.current.detectForVideo(videoRef.current, startTimeMs);

      displayVideoDetections(detections);
    }

    // Call this function again to keep predicting when the browser is ready
    window.requestAnimationFrame(predictWebcam);
  };

  const clearHightlighter = () => {
    console.log('clear');
    setHighlighter(null);
  };

  // useEffect(() => {
  //   if (!videoRef || !videoRef.current || !faceDetector) {
  //     return;
  //   }

  //   // predictWebcam();
  // }, [faceDetector, videoRef, selectedDeviceId]);

  useEffect(() => {
    console.log('init');
    init();
  }, []);

  // useEffect(() => {
  //   videoRef?.current?.srcObject && init();
  // }, [videoRef?.current?.srcObject, videoRef, videoRef?.current]);

  return { liveViewRef, highlighter, predictWebcam, clearHightlighter };
}
