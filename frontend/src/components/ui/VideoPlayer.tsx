import React, { useEffect, useRef } from 'react';
import { Plyr, type APITypes } from 'plyr-react';
import 'plyr-react/plyr.css';

interface VideoPlayerProps {
  url: string;
  onEnded?: () => void;
  onProgress?: (progress: number) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

export default function VideoPlayer({ url, onEnded, onProgress, onContextMenu }: VideoPlayerProps) {
  const ref = useRef<APITypes>(null);

  const handleTimeUpdate = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    if (onProgress) {
      const videoElement = event.target as HTMLVideoElement;
      if (videoElement.duration) {
        const progress = (videoElement.currentTime / videoElement.duration) * 100;
        onProgress(progress);
      }
    }
  };

  // For URLs from YouTube or Vimeo, Plyr detects them automatically if type is set correctly,
  // but for raw video URLs, 'video' type with 'video/mp4' works well.
  const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
  const isVimeo = url.includes('vimeo.com');

  let videoSource: any = {
    type: 'video',
    sources: [
      {
        src: url,
        type: 'video/mp4', 
      },
    ],
  };

  if (isYouTube) {
    videoSource = { type: 'video', sources: [{ src: url, provider: 'youtube' }] };
  } else if (isVimeo) {
    videoSource = { type: 'video', sources: [{ src: url, provider: 'vimeo' }] };
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-black" onContextMenu={onContextMenu}>
      <Plyr 
        ref={ref} 
        source={videoSource} 
        options={{
          controls: ['play-large', 'play', 'progress', 'current-time', 'duration', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'],
          settings: ['quality', 'speed', 'loop'],
          autoplay: true,
        }} 
        onEnded={onEnded}
        onTimeUpdate={handleTimeUpdate}
      />
    </div>
  );
}
