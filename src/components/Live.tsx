import { createPortal } from 'react-dom';
import useMediaPipe from '../hooks/use-mediapipe';
import { MutableRefObject, useEffect } from 'react';

interface Props {
  videoRef: MutableRefObject<HTMLVideoElement | null>;
  selectedDeviceId: string;
  mirror: boolean;
  width: number;
  height: number;
  autoPlay: boolean;
  disablePictureInPicture: boolean;
  canvasRef: MutableRefObject<HTMLCanvasElement | null>;
}

export default function Live({
  videoRef,
  canvasRef,
  selectedDeviceId,
  mirror,
  width,
  height,
  autoPlay,
  disablePictureInPicture,
}: Props) {
  const { liveViewRef, highlighter, predictWebcam, clearHightlighter } = useMediaPipe({
    videoRef,
    selectedDeviceId,
    mirror,
  });

  useEffect(() => {
    console.log('videoRef.current', videoRef.current);
    if (videoRef.current) {
      videoRef.current.addEventListener('canplay', (event) => {
        console.log('canplay');
        predictWebcam();
      });

      videoRef.current.addEventListener('abort', (event) => {
        console.log('abort');
        clearHightlighter();
      });
    }
  }, [videoRef]);

  return (
    <div
      id="liveView"
      ref={liveViewRef}
      style={{ position: 'relative', width, height, overflow: 'hidden' }}
    >
      {liveViewRef.current && highlighter && createPortal(highlighter, liveViewRef.current)}
      <video
        id="video"
        ref={videoRef}
        autoPlay={autoPlay}
        disablePictureInPicture={disablePictureInPicture}
        playsInline
        width={width}
        height={height}
        style={{ transform: mirror ? 'rotateY(180deg)' : '', background: 'cadetblue' }}
      />
      {/* canvas for capture screen */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
