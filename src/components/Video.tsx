import useVideo from '../hooks/use-video';
import Live from './Live';

interface Props {
  autoPlay?: boolean;
  disablePictureInPicture?: boolean;
  select?: boolean;
  mirror?: boolean;
  width?: number;
}
export default function Video({
  autoPlay = true,
  select = true,
  mirror = true,
  disablePictureInPicture = true,
  width = 480,
}: Props) {
  const height = (width * 3) / 4;

  const {
    videoRef,
    canvasRef,
    capturedImage,
    capture,
    options,
    selectedDeviceId,
    handleSelectCamera,
    stop,
    play,
    findCamera,
  } = useVideo({
    autoPlay: autoPlay,
    select: select,
    mirror: mirror,
  });

  return (
    <div>
      {select && (
        <select onChange={handleSelectCamera}>
          <option key="0" value="0">
            choose camera
          </option>
          {options.map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}

      <Live
        videoRef={videoRef}
        canvasRef={canvasRef}
        selectedDeviceId={selectedDeviceId}
        mirror={mirror}
        width={width}
        height={height}
        autoPlay={autoPlay}
        disablePictureInPicture={disablePictureInPicture}
      />

      {select && <button onClick={findCamera}>카메라 리스트 찾기</button>}
      <button onClick={play}>카메라 연결</button>
      <button onClick={stop}>정지</button>
      <button onClick={capture}>화면 캡쳐</button>
      {capturedImage && <img src={capturedImage}></img>}
    </div>
  );
}
