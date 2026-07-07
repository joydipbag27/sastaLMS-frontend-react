import React, { useEffect, useRef } from "react";
import videojs from "video.js";

// Make videojs global so legacy plugins like videojs-hotkeys and videojs-markers resolve it correctly
window.videojs = videojs;

// Import core stylesheet
import "video.js/dist/video-js.css";

// Import Video.js official plugins
import "videojs-contrib-quality-levels";
import "videojs-hls-quality-selector";
import "videojs-seek-buttons";
import "videojs-hotkeys";
import "videojs-mobile-ui";
import "videojs-markers";

// Import official plugin stylesheets
import "videojs-seek-buttons/dist/videojs-seek-buttons.css";
import "videojs-mobile-ui/dist/videojs-mobile-ui.css";
import "videojs-markers/dist/videojs.markers.css";

// Helper to dynamically detect MIME type from video URL, ignoring query parameters
const getVideoType = (url) => {
  if (!url) return "application/x-mpegURL"; // default fallback
  
  try {
    const path = url.split("?")[0].toLowerCase();
    if (path.endsWith(".mp4")) return "video/mp4";
    if (path.endsWith(".m3u8")) return "application/x-mpegURL";
    if (path.endsWith(".webm")) return "video/webm";
    if (path.endsWith(".ogg")) return "video/ogg";
  } catch (e) {
    console.error("Error parsing URL format:", e);
  }
  
  // Backup substring scan
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes(".m3u8")) return "application/x-mpegURL";
  if (lowerUrl.includes(".mp4")) return "video/mp4";
  
  return "application/x-mpegURL";
};

/**
 * Reusable VideoPlayer component configured to use default Video.js layout and styling
 * with official seek-buttons, hotkeys, mobile-ui, and markers plugins.
 */
export const VideoPlayer = ({
  src,
  poster,
  autoplay = false,
  controls = true,
  initialTime = 0,
  markers = [], // Accept timeline keyframe markers
  onPlay,
  onPause,
  onTimeUpdate,
  onSeeked,
  onEnded,
}) => {
  const placeholderRef = useRef(null);
  const playerRef = useRef(null);
  const initialTimeSetRef = useRef(false);

  // Reset the initial position flag when source changes
  useEffect(() => {
    initialTimeSetRef.current = false;
  }, [src]);

  // Main initialization effect
  useEffect(() => {
    // If the placeholder element isn't available, exit
    if (!placeholderRef.current) return;

    // Create the video element dynamically inside the placeholder container
    const videoElement = document.createElement("video-js");
    videoElement.classList.add("vjs-big-play-centered", "vjs-fluid");
    placeholderRef.current.appendChild(videoElement);

    const videoJsOptions = {
      autoplay: autoplay,
      controls: controls,
      responsive: true,
      fluid: true,
      inactivityTimeout: 2000, // Explicitly auto-hide controls after 2s of inactivity
      playbackRates: [0.5, 1, 1.25, 1.5, 2],
      controlBar: {
        playToggle: true,
        volumePanel: true,
        currentTimeDisplay: true,
        timeDivider: true,
        durationDisplay: true,
        progressControl: true,
        playbackRateMenuButton: true,
        pictureInPictureToggle: true,
        fullscreenToggle: true,
      },
      sources: [
        {
          src: src,
          type: getVideoType(src),
        },
      ],
      poster: poster || "",
      html5: {
        vhs: {
          overrideNative: !videojs.browser.IS_SAFARI,
        },
      },
    };

    console.log("[VideoPlayer] Initializing Video.js player for source:", src);

    const player = videojs(videoElement, videoJsOptions, () => {
      console.log("[VideoPlayer] Player is ready");

      // Release button focus trap on click to allow inactivity triggers to fire correctly
      player.on("click", () => {
        if (document.activeElement && document.activeElement.tagName === "BUTTON") {
          document.activeElement.blur();
        }
      });

      // Initialize HLS quality selector plugin
      try {
        player.hlsQualitySelector({
          displayCurrentQuality: true,
        });
      } catch (err) {
        console.warn("[VideoPlayer] HLS Quality Selector failed:", err);
      }

      // Initialize Seek Buttons plugin (10s back/forward)
      try {
        player.seekButtons({
          forward: 10,
          back: 10,
        });
      } catch (err) {
        console.warn("[VideoPlayer] Seek Buttons failed:", err);
      }

      // Initialize Hotkeys plugin
      try {
        player.hotkeys({
          volumeStep: 0.1,
          seekStep: 10,
          enableModifiersForNumbers: false,
        });
      } catch (err) {
        console.warn("[VideoPlayer] Hotkeys failed:", err);
      }

      // Initialize Mobile UI plugin
      try {
        player.mobileUi({
          forceLockedToLandscape: false,
          doubleTapGesture: true,
        });
      } catch (err) {
        console.warn("[VideoPlayer] Mobile UI failed:", err);
      }

      // Initialize Markers plugin
      try {
        player.markers({
          markers: markers || [],
          markerStyle: {
            'width': '6px',
            'border-radius': '30%',
            'background-color': '#0ea5e9', // Sky blue color matching dashboard
          },
        });
      } catch (err) {
        console.warn("[VideoPlayer] Markers failed:", err);
      }

      // Check and apply initial position if ready
      if (initialTime > 0 && !initialTimeSetRef.current) {
        player.currentTime(initialTime);
        initialTimeSetRef.current = true;
      }
    });

    playerRef.current = player;

    // Bind event listeners
    player.on("play", () => {
      if (onPlay) onPlay();
    });

    player.on("pause", () => {
      if (onPause) onPause();
    });

    player.on("timeupdate", () => {
      if (onTimeUpdate) {
        onTimeUpdate(player.currentTime());
      }
    });

    player.on("seeked", () => {
      if (onSeeked) {
        onSeeked(player.currentTime());
      }
    });

    player.on("ended", () => {
      if (onEnded) onEnded();
    });

    player.on("loadedmetadata", () => {
      if (initialTime > 0 && !initialTimeSetRef.current) {
        player.currentTime(initialTime);
        initialTimeSetRef.current = true;
      }
    });

    // Cleanup and dispose of the player when component unmounts
    return () => {
      if (player && !player.isDisposed()) {
        console.log("[VideoPlayer] Disposing Video.js player...");
        player.dispose();
        playerRef.current = null;
      }

      // Clean up placeholder contents to prevent duplicate elements on fast re-renders
      if (placeholderRef.current) {
        placeholderRef.current.innerHTML = "";
      }
    };
  }, []);

  // Update source and poster dynamically when props change
  useEffect(() => {
    const player = playerRef.current;
    if (player && !player.isDisposed()) {
      if (src) {
        const detectedType = getVideoType(src);
        console.log("[VideoPlayer] Source changed, updating player:", src, "Type:", detectedType);
        player.src({ src: src, type: detectedType });
      }
      if (poster) {
        player.poster(poster);
      }
    }
  }, [src, poster]);

  // Sync timeline markers dynamically if they change
  useEffect(() => {
    const player = playerRef.current;
    if (player && !player.isDisposed() && player.markers) {
      try {
        player.markers.removeAll();
        player.markers.add(markers || []);
      } catch (err) {
        console.warn("[VideoPlayer] Failed to update markers dynamically:", err);
      }
    }
  }, [markers]);

  // Update controls and autoplay dynamically if they change
  useEffect(() => {
    const player = playerRef.current;
    if (player && !player.isDisposed()) {
      player.controls(controls);
    }
  }, [controls]);

  useEffect(() => {
    const player = playerRef.current;
    if (player && !player.isDisposed()) {
      player.autoplay(autoplay);
    }
  }, [autoplay]);

  return (
    <div data-vjs-player className="w-full h-full">
      <div ref={placeholderRef} className="w-full h-full" />
    </div>
  );
};

export default VideoPlayer;
