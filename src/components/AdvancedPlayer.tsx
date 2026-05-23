import { useEffect, useRef } from "react";
import Hls from "hls.js";
import "plyr/dist/plyr.css";
const AdvancedPlayer = ({ lecture }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !lecture?.qualities) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const source = lecture.qualities.master || lecture.qualities.original;
    if (!source) {

      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;



      hls.loadSource(source);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {

      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {

      video.src = source;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [lecture.id]);

  return (
    <video
      ref={videoRef}
      className="w-full rounded-2xl"
      controls
      playsInline
      autoPlay
    />
  );
};

export default AdvancedPlayer;
