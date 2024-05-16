import { useEffect, useRef } from "react";
import useMediaPipe from "../hooks/use-mediapipe";
import useVideo from "../hooks/use-video";

interface Props {
  autoPlay?: boolean;
  disablePictureInPicture?: boolean;
  width: number;
  height: number;
}
export default function Video({
  autoPlay = true,
  disablePictureInPicture,
  width,
  height,
}: Props) {
  const {
    videoRef,
    canvasRef,
    capturedImage,
    capture,
    options,
    handleSelectCamera,
  } = useVideo({
    autoPlay,
  });

  useEffect(() => {
    setTimeout(() => {
      capture();
    }, 3000);
  }, []);
  return (
    <>
      <select onChange={handleSelectCamera}>
        {options.map((option) => (
          <option key={option.label} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <video
        ref={videoRef}
        autoPlay={autoPlay}
        disablePictureInPicture={disablePictureInPicture}
        playsInline
        width={width}
        height={height}
        style={{ transform: "rotateY(180deg)" }}
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />
      {capturedImage}
    </>
  );
}
