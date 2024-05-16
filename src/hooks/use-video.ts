import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";

interface Props {
  autoPlay: boolean;
}
export default function useVideo({ autoPlay }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  // const stream = useRef<MediaStream | null>(null);
  // const streamTracks = useRef<MediaStreamTrack[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");

  const [options, setOptions] = useState<
    {
      value: string;
      label: string;
      selected: boolean;
    }[]
  >([]);

  const connect = async () => {
    try {
      // stream 찾기
      const constraints: MediaStreamConstraints = {
        video: true,
      };

      if (selectedDeviceId) {
        constraints.video = { deviceId: { exact: selectedDeviceId } };
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      // 전체 카메라들 찾기
      const currentCamera = stream.getVideoTracks()[0];
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter((device) => device.kind === "videoinput");

      const options = cameras.map((camera) => {
        const selected = currentCamera.label === camera.label ? true : false;

        return {
          value: camera.deviceId,
          selected,
          label: camera.label,
        };
      });
      setOptions(options);

      play(stream);
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const play = (stream: MediaStream) => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  };

  const stop = () => {};

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.width;
      canvas.height = video.height;
      const context = canvas.getContext("2d");

      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL("image/jpeg");
        setCapturedImage(imageData);
      }
    }
  };

  const handleSelectCamera = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedDeviceId(e.target.value);
  };

  useEffect(() => {
    if (autoPlay) {
      connect();
    }

    // Study: useEffect Return
    return () => {
      // Clean up: stop video stream
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [autoPlay]);

  useEffect(() => {
    if (selectedDeviceId) connect();
  }, [selectedDeviceId]);

  return {
    videoRef,
    canvasRef,
    capturedImage,
    options,
    selectedDeviceId,
    connect,
    play,
    stop,
    capture,
    handleSelectCamera,
  };
}
