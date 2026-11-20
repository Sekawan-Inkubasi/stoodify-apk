import { useEffect, useRef, useState } from "react";
import { Vibration } from "react-native";

// Remote CDN audio URL for ambient focus music (streamed on-demand, not bundled into APK)
const DEFAULT_REMOTE_AMBIENT_URL =
  "https://res.cloudinary.com/hpukknei/video/upload/v1795132569/study-ambient.mp3";

const ambientAudioSource = {
  uri: process.env.EXPO_PUBLIC_AMBIENT_AUDIO_URL || DEFAULT_REMOTE_AMBIENT_URL,
};

// Resolve local audio assets (lightweight bell kept locally)
let bellAsset = null;
try {
  bellAsset = require("../../assets/sound/bell.mp3");
} catch (e) {
  console.warn("[useFocusAudio] bell.mp3 asset not found:", e?.message);
}

// Safely require expo-audio to prevent crash if native module is not linked
let expoAudioModule = null;
try {
  expoAudioModule = require("expo-audio");
} catch (e) {
  console.warn(
    "[useFocusAudio] expo-audio native module is not linked in current binary:",
    e?.message
  );
}

export default function useFocusAudio({
  visible = false,
  active = false,
  ambient = false,
  isCompleted = false,
}) {
  const [isSupported, setIsSupported] = useState(Boolean(expoAudioModule?.createAudioPlayer));
  const ambientPlayerRef = useRef(null);
  const bellPlayerRef = useRef(null);
  const hasPlayedBellRef = useRef(false);

  // Initialize audio players once if expo-audio is supported
  useEffect(() => {
    if (!expoAudioModule?.createAudioPlayer) {
      setIsSupported(false);
      return undefined;
    }

    try {
      if (ambientAudioSource?.uri && !ambientPlayerRef.current) {
        const player = expoAudioModule.createAudioPlayer(ambientAudioSource);
        player.loop = true;
        player.volume = 0.55;
        ambientPlayerRef.current = player;
      }
      if (bellAsset && !bellPlayerRef.current) {
        const player = expoAudioModule.createAudioPlayer(bellAsset);
        player.loop = false;
        player.volume = 0.85;
        bellPlayerRef.current = player;
      }
      setIsSupported(true);
    } catch (err) {
      console.warn("[useFocusAudio] Failed to initialize audio players:", err?.message || err);
      setIsSupported(false);
    }

    return () => {
      try {
        if (ambientPlayerRef.current) {
          ambientPlayerRef.current.pause();
          ambientPlayerRef.current.remove?.();
          ambientPlayerRef.current = null;
        }
        if (bellPlayerRef.current) {
          bellPlayerRef.current.pause();
          bellPlayerRef.current.remove?.();
          bellPlayerRef.current = null;
        }
      } catch (_) {}
    };
  }, []);

  // Handle ambient sound playback based on timer active state and user toggle
  useEffect(() => {
    const ambientPlayer = ambientPlayerRef.current;
    if (!ambientPlayer) return;

    try {
      if (visible && active && ambient && !isCompleted) {
        ambientPlayer.play();
      } else {
        ambientPlayer.pause();
      }
    } catch (err) {
      console.warn("[useFocusAudio] Error toggling ambient playback:", err?.message || err);
    }
  }, [visible, active, ambient, isCompleted]);

  // Handle completion bell chime & haptic feedback when timer hits 00:00
  useEffect(() => {
    if (!visible || !isCompleted) {
      hasPlayedBellRef.current = false;
      return;
    }

    if (hasPlayedBellRef.current) return;
    hasPlayedBellRef.current = true;

    // Stop ambient sound
    try {
      if (ambientPlayerRef.current) {
        ambientPlayerRef.current.pause();
      }
    } catch (_) {}

    // Play bell chime
    try {
      if (bellPlayerRef.current) {
        bellPlayerRef.current.seekTo(0);
        bellPlayerRef.current.play();
      }
    } catch (err) {
      console.warn("[useFocusAudio] Error playing completion bell:", err?.message || err);
    }

    // Always provide tactile haptic vibration as reliable fallback
    try {
      Vibration.vibrate([0, 500, 200, 500]);
    } catch (_) {}
  }, [visible, isCompleted]);

  // Stop all sounds if modal is closed
  useEffect(() => {
    if (!visible) {
      try {
        if (ambientPlayerRef.current) {
          ambientPlayerRef.current.pause();
        }
        if (bellPlayerRef.current) {
          bellPlayerRef.current.pause();
        }
      } catch (_) {}
    }
  }, [visible]);

  return { isSupported };
}
