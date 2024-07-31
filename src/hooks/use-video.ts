import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import useMediaPipe from './use-mediapipe';

interface Props {
  autoPlay?: boolean;
  select?: boolean;
  mirror?: boolean;
}
export default function useVideo({ autoPlay, select, mirror }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  // const stream = useRef<MediaStream | null>(null);
  // const streamTracks = useRef<MediaStreamTrack[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [options, setOptions] = useState<
    {
      value: string;
      label: string;
      selected: boolean;
    }[]
  >([]);

  const findCamera = async () => {
    try {
      // stream 찾기
      const constraints: MediaStreamConstraints = {
        video: true,
      };

      // 전체 카메라들 찾기
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(
        (device) => device.kind === 'videoinput' && device.label.indexOf('Virtual') === -1
      );

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (stream.getTracks()[0].label.indexOf('Virtual') !== -1) {
        // 연결된 스트림이 가상 카메라일 경우
        // 다른 카메라로 재연결(selectbox 선택된 카메라)
        setSelectedDeviceId(cameras[0].deviceId);
        return;
      }

      const currentCamera = stream.getVideoTracks()[0];

      if (select) {
        const options = cameras.map((camera) => {
          const selected = currentCamera.label === camera.label ? true : false;

          return {
            value: camera.deviceId,
            selected,
            label: camera.label,
          };
        });
        setOptions(options);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const play = async () => {
    try {
      const constraints: MediaStreamConstraints = {
        video: selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : true,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        console.log('stream연결', stream);
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener('canplay', (event) => {
          videoRef.current?.play();
        });
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stop = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.width;
      canvas.height = video.height;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        if (mirror) {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        } else {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
        const imageData = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageData);
      }
    }
  };

  const handleSelectCamera = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedDeviceId(e.target.value);
  };

  useEffect(() => {
    if (autoPlay) {
      findCamera();
      play();
    }
  }, [autoPlay]);

  useEffect(() => {
    if (selectedDeviceId) play();
  }, [selectedDeviceId]);

  useEffect(() => {
    findCamera();

    return () => {
      stop();
    };
  }, []);

  return {
    videoRef,
    canvasRef,
    capturedImage,
    options,
    selectedDeviceId,
    findCamera,
    play,
    stop,
    capture,
    handleSelectCamera,
  };
}
