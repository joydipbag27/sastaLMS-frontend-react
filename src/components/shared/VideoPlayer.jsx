import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import Plyr from "plyr";

export const VideoPlayer = ({
  src,
  poster,
  autoplay = false,
  controls = true,
  initialTime = 0,
  onPlay,
  onPause,
  onTimeUpdate,
  onSeeked,
  onEnded,
}) => {
  const videoRef = useRef(null);
  const plyrRef = useRef(null);
  const hlsRef = useRef(null);
  const initialTimeSetRef = useRef(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initialTimeSetRef.current = false;
    setIsReady(false);
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hlsInstance = null;
    let plyrInstance = null;

    const setupPlayer = (availableQualities = [], onQualityChange = null) => {
      const plyrOptions = {
        autoplay,
        controls: controls ? [
          "play-large",
          "play",
          "progress",
          "current-time",
          "duration",
          "mute",
          "volume",
          "captions",
          "settings",
          "pip",
          "airplay",
          "fullscreen",
        ] : [],
        settings: ["quality", "speed", "loop"],
        speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
        keyboard: { focused: true, global: true },
        tooltips: { controls: true, seek: true },
        i18n: {
          qualityLabel: {
            0: "Auto",
          },
        },
      };

      if (availableQualities.length > 0) {
        plyrOptions.quality = {
          default: 0, // Auto
          options: [0, ...availableQualities],
          forced: true,
          onChange: onQualityChange,
        };
      }

      plyrInstance = new Plyr(video, plyrOptions);
      plyrRef.current = plyrInstance;

      // Event bindings
      plyrInstance.on("play", () => onPlay?.());
      plyrInstance.on("pause", () => onPause?.());

      let lastTime = 0;
      plyrInstance.on("timeupdate", () => {
        const currentTime = plyrInstance.currentTime;
        if (Math.abs(currentTime - lastTime) >= 0.5) {
          lastTime = currentTime;
          onTimeUpdate?.(currentTime);
        }
      });

      plyrInstance.on("seeked", () => {
        onSeeked?.(plyrInstance.currentTime);
      });

      plyrInstance.on("ended", () => onEnded?.(plyrInstance.duration));

      plyrInstance.on("ready", () => {
        setIsReady(true);
        if (initialTime > 0 && !initialTimeSetRef.current) {
          plyrInstance.currentTime = initialTime;
          initialTimeSetRef.current = true;
        }
      });
    };

    const isHls = src.includes(".m3u8") || src.split("?")[0].endsWith(".m3u8");

    if (isHls && Hls.isSupported()) {
      hlsInstance = new Hls({
        capLevelToPlayerSize: true,
      });
      hlsRef.current = hlsInstance;

      hlsInstance.loadSource(src);
      hlsInstance.attachMedia(video);

      hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
        const qualities = hlsInstance.levels.map((l) => l.height).filter(Boolean);
        const uniqueQualities = [...new Set(qualities)].sort((a, b) => b - a);

        setupPlayer(uniqueQualities, (newQuality) => {
          if (newQuality === 0) {
            hlsInstance.currentLevel = -1; // Auto
          } else {
            const levelIndex = hlsInstance.levels.findIndex((l) => l.height === newQuality);
            hlsInstance.currentLevel = levelIndex;
          }
        });
      });

      hlsInstance.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error("Fatal network error encountered, trying to recover...");
              hlsInstance.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error("Fatal media error encountered, trying to recover...");
              hlsInstance.recoverMediaError();
              break;
            default:
              console.error("Fatal error encountered, cannot recover", data);
              break;
          }
        }
      });
    } else {
      video.src = src;
      setupPlayer();
    }

    return () => {
      if (plyrInstance) {
        plyrInstance.destroy();
      }
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    };
  }, [src, poster, autoplay, controls]);

  return (
    <div className={`absolute inset-0 w-full h-full rounded-2xl overflow-hidden shadow-lg border border-slate-100 bg-black plyr-theme-custom transition-opacity duration-300 ${isReady ? "opacity-100" : "opacity-0"}`}>
      <video
        ref={videoRef}
        playsInline
        poster={poster}
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default VideoPlayer;
