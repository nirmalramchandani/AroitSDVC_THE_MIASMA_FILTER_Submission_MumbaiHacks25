"use client";
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
// This assumes you have a Navbar component in this location.
import Navbar from "@/components/Navbar";
import Webcam from "react-webcam";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Settings,
  Users,
  Heart,
  Share2,
  MoreVertical,
  TrendingUp,
  Play,
  Square,
  Monitor,
  Music,
  Volume2,
  Bell,
  X,
  AlertTriangle,
  Globe,
  SlidersHorizontal,
} from "lucide-react";
import Image from "next/image";
import { title } from "process";

interface Window {
  webkitAudioContext: typeof AudioContext;
}

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "te", label: "Telugu" },
  { value: "mr", label: "Marathi" },
  { value: "gu", label: "Gujarati" },
  { value: "bn", label: "Bengali" },
  { value: "sd", label: "Sindhi" },
  { value: "sa", label: "Sanskrit" },
  { value: "ur", label: "Urdu" },
  { value: "pa", label: "Punjabi" },
];

// --- SVG Icons ---

const videoConstraints = { width: 640, height: 480, facingMode: "user" };

const InfoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="1 1 22 22"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={` ${props.className || ""}`}
    {...props}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

// Corrected CheckCircleIcon component
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="1 1 22 22"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`${props.className || ""}`}
    {...props}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

// Corrected XCircleIcon component
const XCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="1 1 22 22"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`${props.className || ""}`}
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

// Mock trending data
// const trendingStreams = [
//   {
//     id: 1,
//     title: "Delhi Air Quality Deterioration",
//     viewers: "12.5K",
//     category: "Politics",
//   },
//   {
//     id: 2,
//     title: "Bihar Election & Anant Singh Case",
//     viewers: "8.2K",
//     category: "Weather",
//   },
//   {
//     id: 3,
//     title: "Rajasthan Bus Accident",
//     viewers: "5.7K",
//     category: "Business",
//   },
//   { id: 4,
//     title: "ISRO LVM3 Satellite Launch",
//     viewers: "4.1K",
//     category: "Finance"
//   },
// ];

const recommendedTopics = [
  "Sticker Shock from H-1B visa fees",
  "Punjab Floods",
  "Expansion of Global Capability Centers (GCCs)",
  "GST 2.0 Reforms",
];

// const WS_URL = "wss://buildownstuff.cloud/ws/";  //hardcoded
const WS_URL = "wss://miasmademo-667750779055.asia-south1.run.app/ws/"; //local testing
const USER_AUDIO_SAMPLE_RATE = 16000;
const AI_SAMPLE_RATE = 24000;

const STRIKE_OPTIONS = Array.from({ length: 9 }, (_, i) => i + 2);

interface Notification {
  action: string;
  id: number;
  timestamp: string;
  title: string;
  content: string;
  severity: "success" | "error" | "warning" | "info";
}

export default function HomePage() {
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false); // Re-enabled for the new flow
  const [isVideoOn, setIsVideoOn] = useState<boolean>(true);
  const [isAudioOn, setIsAudioOn] = useState<boolean>(true);
  const [viewerCount, setViewerCount] = useState<number>(1247);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [videoReady, setVideoReady] = useState<boolean>(false);
  const [showWelcomeOverlay, setShowWelcomeOverlay] = useState<boolean>(true);
  const [showTrendingTopics, setShowTrendingTopics] = useState<boolean>(false);
  const [overlayNotification, setOverlayNotification] =
    useState<Notification | null>(null);
  const [falseStatementCount, setFalseStatementCount] = useState<number>(0);
  const [showTerminationModal, setShowTerminationModal] =
    useState<boolean>(false);
  const [strictnessIndex, setStrictnessIndex] = useState(0); // 0 corresponds to 'STRICT'
  const [strikeLimit, setStrikeLimit] = useState<number>(5);
  const FALSE_STATEMENT_LIMIT = strikeLimit;
  const webcamRef = useRef<Webcam | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const webSocket = useRef<WebSocket | null>(null);
  const mediaStream = useRef<MediaStream | null>(null);
  const streamVideoInterval = useRef<NodeJS.Timeout | null>(null);

  const userAudioContext = useRef<AudioContext | null>(null);
  const userAudioProcessor = useRef<ScriptProcessorNode | null>(null);
  const aiAudioContext = useRef<AudioContext | null>(null);
  const aiAudioQueue = useRef<Int16Array[]>([]);
  const isAiAudioPlaying = useRef<boolean>(false);

  const [showIntroVideo, setShowIntroVideo] = useState<boolean>(false);
  const introVideoRef = useRef<HTMLVideoElement | null>(null);

  const [trendingStreams, setTrendingStreams] = useState<
    { id: number; title: string; viewers?: string; category?: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  // --- FIX STARTS HERE ---
  const onClose = () => {
    setShowWelcomeOverlay(false);
  };
  // --- FIX ENDS HERE ---

  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");
  const [isVisualEnhanced, setIsVisualEnhanced] = useState<boolean>(false);

  const [sessionClaims, setSessionClaims] = useState<Notification[]>([]);

  useEffect(() => {
    async function fetchTrending() {
      try {
        setLoading(true);
        const res = await fetch(
          "https://miasmademo-667750779055.asia-south1.run.app/globaltrends",
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );
        const data = await res.json();
        const streams =
          (data?.global ?? []).map((item: any, idx: number) => ({
            id: idx + 1,
            title: item.headline ?? "",
          })) || [];

        console.log(streams);
        setTrendingStreams(streams);
        console.log(trendingStreams);
        setLoading(false);
      } catch (err) {
        setTrendingStreams([]);
      }
    }
    fetchTrending();
  }, []);
  useEffect(() => {
    const welcomeTimer = setTimeout(() => {
      setShowTrendingTopics(true);
      const trendingTimer = setTimeout(
        () => setShowWelcomeOverlay(false),
        2000
      );
      return () => clearTimeout(trendingTimer);
    }, 10000);
    return () => clearTimeout(welcomeTimer);
  }, []);

  const handleSkipIntro = () => setShowWelcomeOverlay(false);

  const stopStreaming = useCallback(() => {
    if (streamVideoInterval.current) clearInterval(streamVideoInterval.current);
    if (webSocket.current?.readyState === WebSocket.OPEN)
      webSocket.current.close();
    if (mediaStream.current)
      mediaStream.current.getTracks().forEach((t) => t.stop());
    if (userAudioProcessor.current) userAudioProcessor.current.disconnect();
    if (userAudioContext.current?.state !== "closed")
      userAudioContext.current?.close();
    if (aiAudioContext.current?.state !== "closed")
      aiAudioContext.current?.close();

    webSocket.current = null;
    mediaStream.current = null;
    streamVideoInterval.current = null;
    userAudioProcessor.current = null;
    userAudioContext.current = null;
    aiAudioContext.current = null;
    aiAudioQueue.current = [];
    isAiAudioPlaying.current = false;

    setIsStreaming(false);
    setIsConnecting(false);
    setVideoReady(false);
    setShowIntroVideo(false);
  }, []);

// Add this function inside export default function HomePage() { ... }
const sendSessionClaims = useCallback(async (claims: Notification[]) => {
  if (claims.length === 0) {
    console.log("No claims to send on stream termination.");
    return;
  }

  // Format the claims to match the required structure for the backend.
  const claimsForBackend = claims.map(c => ({
    timestamp: c.timestamp,
    title: c.title,
    content: c.content,
    severity: c.severity,
  }));

  const payload = {
    // The backend expects the list of claims under the "claims" key.
    claims: claimsForBackend,
  };

  try {
    // NOTE: Use the correct backend URL for the /email endpoint.
    const endpoint = "https://miasmademo-667750779055.asia-south1.run.app/email"; 
    
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      console.log("Session claims successfully sent to backend for email.");
      // You can add a success notification here if you wish
    } else {
      console.error(
        "Failed to send session claims:", 
        res.status, 
        await res.text()
      );
      // Optional: Add an error notification
    }
  } catch (error) {
    console.error("Error sending session claims to backend:", error);
    // Optional: Add an error notification
  }
}, []); 

const addNotification = useCallback(
  (notification: Omit<Notification, "id" | "timestamp">) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      ...notification,
    };

    setNotifications((prev) => [newNotification, ...prev.slice(0, 19)]);
    setOverlayNotification(newNotification);

    if (
      newNotification.severity === "success" ||
      newNotification.severity === "error"
    ) {
      setSessionClaims((prevClaims) => [
        newNotification,
        ...prevClaims,
      ]);
    }

    // --- NEW LOGIC FOR FALSE STATEMENT COUNT ---
    if (newNotification.severity === "error") {
      setFalseStatementCount((prevCount) => {
        const newCount = prevCount + 1;

        if (newCount >= FALSE_STATEMENT_LIMIT) {
          stopStreaming();

          const allClaims = [...sessionClaims, newNotification];
          sendSessionClaims(allClaims);

          setShowTerminationModal(true);

          setTimeout(() => {
            const strikeNotification: Notification = {
              id: Date.now() + 1,
              timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              action: "STRIKE LIMIT REACHED",
              title: "STREAM TERMINATED DUE TO A LOT FALSE STATEMENTS",
              content: `Reached ${FALSE_STATEMENT_LIMIT} false statements. Stream Suspended.`,
              severity: "error",
            };

            setNotifications((prev) =>
              [strikeNotification, ...prev].slice(0, 20)
            );
          }, 50);
        }
        return newCount;
      });
    }
  },
  [stopStreaming, FALSE_STATEMENT_LIMIT, sendSessionClaims, sessionClaims]
);

  const removeNotification = useCallback((id: number) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  const getNotificationStyle = (severity: Notification["severity"]) => {
    switch (severity) {
      case "success":
        return "bg-gradient-to-br from-green-900/90 from-30% to-slate-800/100 border-[#059669]/50";
      case "error":
        return "bg-gradient-to-br from-red-900/90 from-30% to-slate-800/100 border-[#DC2626]/50";
      case "warning":
        return "bg-gradient-to-br from-yellow-800/90 to-slate-800 border-[#F59E0B]/50";
      default:
        return "bg-gradient-to-br from-blue-900/80 to-slate-800 border-[#2B6CB0]/50";
    }
  };

  const getNotificationIcon = (severity: Notification["severity"]) => {
    switch (severity) {
      case "success":
        return <CheckCircleIcon className="h-5 w-5 text-[#059669]" />;
      case "error":
        return <XCircleIcon className="h-5 w-5 text-[#DC2626]" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-[#F59E0B]" />;
      default:
        return <InfoIcon className="h-5 w-5 text-[#3B82F6]" />;
    }
  };

  const sendVideoFrame = useCallback(() => {
    if (webSocket.current?.readyState === WebSocket.OPEN && webcamRef.current) {
      const video = webcamRef.current.video;
      const canvas = canvasRef.current;
      if (!canvas || !video || video.readyState < 3) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (!context) return;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
      const base64Data = dataUrl.split(",")[1];
      webSocket.current.send(
        JSON.stringify({ type: "video", data: base64Data })
      );
    }
  }, []);

  const setupUserAudioStreaming = useCallback(() => {
    try {
      if (!mediaStream.current) return;
      userAudioContext.current = new (window.AudioContext ||
        window.AudioContext)({ sampleRate: USER_AUDIO_SAMPLE_RATE });
      const source = userAudioContext.current.createMediaStreamSource(
        mediaStream.current
      );
      userAudioProcessor.current =
        userAudioContext.current.createScriptProcessor(4096, 1, 1);
      source.connect(userAudioProcessor.current);
      userAudioProcessor.current.connect(userAudioContext.current.destination);
      userAudioProcessor.current.onaudioprocess = (
        event: AudioProcessingEvent
      ) => {
        if (webSocket.current?.readyState === WebSocket.OPEN) {
          const float32Data = event.inputBuffer.getChannelData(0);
          const int16Data = new Int16Array(float32Data.length);
          for (let i = 0; i < float32Data.length; i++) {
            const s = Math.max(-1, Math.min(1, float32Data[i]));
            int16Data[i] = s < 0 ? s * 32768 : s * 32767;
          }
          const base64Data = btoa(
            String.fromCharCode.apply(
              null,
              Array.from(new Uint8Array(int16Data.buffer))
            )
          );
          webSocket.current.send(
            JSON.stringify({ type: "audio", data: base64Data })
          );
        }
      };
    } catch (e) {
      console.error("Audio setup failed", e);
      setErrorMsg("Audio setup failed. Check microphone permission or device.");
    }
  }, []);

  // const playNextAiAudioChunk = useCallback(() => {
  //   if (aiAudioQueue.current.length === 0 || !aiAudioContext.current) {
  //     isAiAudioPlaying.current = false;
  //     return;
  //   }
  //   isAiAudioPlaying.current = true;
  //   const pcmData = aiAudioQueue.current.shift();
  //   if (!pcmData) {
  //     isAiAudioPlaying.current = false;
  //     return;
  //   }
  //   const float32Data = new Float32Array(pcmData.length);
  //   for (let i = 0; i < pcmData.length; i++) {
  //     float32Data[i] = pcmData[i] / 32768.0;
  //   }
  //   const audioBuffer = aiAudioContext.current.createBuffer(
  //     1,
  //     float32Data.length,
  //     AI_SAMPLE_RATE
  //   );
  //   audioBuffer.copyToChannel(float32Data, 0);
  //   const source = aiAudioContext.current.createBufferSource();
  //   source.buffer = audioBuffer;
  //   source.connect(aiAudioContext.current.destination);
  //   source.onended = playNextAiAudioChunk;
  //   source.start();
  // }, []);

  // const handleAiAudio = useCallback(
  //   (base64Data: string) => {
  //     try {
  //       const rawAudio = atob(base64Data);
  //       const rawLength = rawAudio.length;
  //       const array = new Uint8Array(new ArrayBuffer(rawLength));
  //       for (let i = 0; i < rawLength; i++) {
  //         array[i] = rawAudio.charCodeAt(i);
  //       }
  //       const pcmData = new Int16Array(array.buffer);
  //       aiAudioQueue.current.push(pcmData);
  //       if (!isAiAudioPlaying.current) {
  //         playNextAiAudioChunk();
  //       }
  //     } catch (e) {
  //       console.error("Failed to process AI audio data:", e);
  //     }
  //   },
  //   [playNextAiAudioChunk]
  // );

  // const stopStreaming = useCallback(() => {
  //   if (streamVideoInterval.current) clearInterval(streamVideoInterval.current);
  //   if (webSocket.current?.readyState === WebSocket.OPEN)
  //     webSocket.current.close();
  //   if (mediaStream.current)
  //     mediaStream.current.getTracks().forEach((t) => t.stop());
  //   if (userAudioProcessor.current) userAudioProcessor.current.disconnect();
  //   if (userAudioContext.current?.state !== "closed")
  //     userAudioContext.current?.close();
  //   if (aiAudioContext.current?.state !== "closed")
  //     aiAudioContext.current?.close();

  //   webSocket.current = null;
  //   mediaStream.current = null;
  //   streamVideoInterval.current = null;
  //   userAudioProcessor.current = null;
  //   userAudioContext.current = null;
  //   aiAudioContext.current = null;
  //   aiAudioQueue.current = [];
  //   isAiAudioPlaying.current = false;

  //   setIsStreaming(false);
  //   setIsConnecting(false);
  //   setVideoReady(false);
  //   setShowIntroVideo(false);
  // }, []);

  const beginActualStreaming = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia)
        throw new Error("Camera access not supported.");
      if (!isVideoOn && !isAudioOn)
        throw new Error("Please enable either video or audio.");

      const constraints = {
        video: isVideoOn
          ? {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: "user",
              frameRate: { ideal: 30 },
            }
          : false,
        audio: isAudioOn
          ? {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            }
          : false,
      };

      mediaStream.current = await navigator.mediaDevices.getUserMedia(
        constraints
      );

      if (webcamRef.current && isVideoOn) {
        const video = webcamRef.current.video;
        if (video) video.srcObject = mediaStream.current;
      }

      const selectedLangObject = LANGUAGES.find(
        (lang) => lang.value === selectedLanguage
      );

      const languageName = (
        selectedLangObject ? selectedLangObject.label : selectedLanguage
      ).toLowerCase();

      const visualMode = isVisualEnhanced ? "on" : "off";

      const queryParams = new URLSearchParams({
        language_mode: languageName,
        visual_mode: visualMode,
      });

      const finalWsUrl = `${WS_URL}?${queryParams.toString()}`;

      webSocket.current = new WebSocket(finalWsUrl);

      // --- NEW LOGIC ---: onopen now transitions from "Connecting" to playing the intro video.
      webSocket.current.onopen = () => {
        setIsConnecting(false); // Hide the "Connecting..." screen
        setIsStreaming(true); // Mark the stream as ready
        setShowIntroVideo(true); // Now, show the intro video

        // Set up the rest of the stream in the background
        aiAudioContext.current = new (window.AudioContext ||
          window.AudioContext)({ sampleRate: AI_SAMPLE_RATE });
        if (aiAudioContext.current.state === "suspended")
          aiAudioContext.current.resume();

        if (isVideoOn)
          streamVideoInterval.current = setInterval(sendVideoFrame, 100);
        if (isAudioOn) setupUserAudioStreaming();

        addNotification({
          title: "Stream Started",
          content: "You are now live. The Miasma filter is active.",
          severity: "success",
          action: "",
        });
      };

      webSocket.current.onmessage = (event: MessageEvent) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg?.type === "audio") console.log("audio");
          else if (msg?.type === "notification")
            addNotification({
              title: msg.title || "Update",
              content: msg.content || msg.data,
              severity: msg.severity || "info",
              action: "",
            });
          else if (msg?.type === "error")
            setErrorMsg(msg.error || "Server error");
        } catch (e) {
          console.warn("Received non-JSON message:", event.data);
        }
      };

      webSocket.current.onerror = (e: Event) => {
        setErrorMsg("WebSocket connection failed.");
        stopStreaming();
      };

      webSocket.current.onclose = (e: CloseEvent) => {
        if (e.code !== 1000) {
          addNotification({
            title: "Connection Lost",
            content: "Connection was closed unexpectedly.",
            severity: "warning",
            action: "",
          });
        }
        stopStreaming();
      };
    } catch (error) {
      let errorMessage = "Unable to access camera/microphone. ";
      if (error instanceof Error) {
        switch (error.name) {
          case "NotAllowedError":
            errorMessage = "Permission denied. Please allow camera/mic access.";
            break;
          case "NotFoundError":
            errorMessage = "No camera or microphone found.";
            break;
          default:
            errorMessage += error.message;
        }
      }
      setErrorMsg(errorMessage);
      setIsConnecting(false);
    }
  }, [
    isVideoOn,
    isAudioOn,
    sendVideoFrame,
    setupUserAudioStreaming,
    stopStreaming,
    addNotification,
    selectedLanguage,
    isVisualEnhanced,
  ]);

  // --- NEW LOGIC ---: startStreaming now just shows the "Connecting..." screen.
  const startStreaming = () => {
    setErrorMsg(null);
    setIsConnecting(true);
    beginActualStreaming();
    setSessionClaims([]);
  };

  useEffect(() => {
    if (showIntroVideo && introVideoRef.current) {
      introVideoRef.current.play().catch((error) => {
        console.error("Intro video playback failed:", error);
        setShowIntroVideo(false);
      });
    }
  }, [showIntroVideo]);

  // --- NEW LOGIC ---: When the video ends, just hide it to reveal the live stream.
  const handleIntroVideoEnd = () => {
    setShowIntroVideo(false);
  };

  useEffect(() => {
    return () => stopStreaming();
  }, [stopStreaming]);

  const getLatestNotificationText = () => {
    if (notifications.length === 0)
      return "Welcome to Breaking News Live Stream - Stay updated";
    const latest = notifications[0];
    return `${latest.title}: ${latest.content}`;
  };

  useEffect(() => {
    if (!overlayNotification) return;
    const timer = setTimeout(() => {
      setOverlayNotification(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [overlayNotification]);

  return (
    <div className="relative min-h-screen bg-[#0F1419] text-[#E2E8F0]">
      {showWelcomeOverlay && (
        <>
          {/* Full-screen backdrop with a blur and semi-transparent background */}
          <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md" />

          {/* Main Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* This is the main content box. We set its max height and width to control its size */}
            <div className="relative w-[90%] md:w-[80%] max-w-2xl mx-auto rounded-2xl bg-[#161d25]/90 p-8 sm:p-12 border border-[#20293A]/70 shadow-2xl backdrop-blur-sm transform transition-all duration-300 scale-95 opacity-0 animate-scale-in">
              {/* Dynamic Content based on state */}
              {!showTrendingTopics ? (
                <div className="space-y-8 text-center raleway">
                  <h1 className="text-white text-center text-4xl font-semibold mb-6">
                    Say 5 False or fake statements to Trigger Miasma
                  </h1>
                  <h1 className="text-white text-center text-4xl font-semibold mb-6">
                    Miasma Version m1.5.0
                  </h1>
                  <p className="text-lg sm:text-xl text-slate-300">
                    Backend (Google Cloud) :
                    https://the-miasma-filter-345628139165.asia-south1.run.app/globaltrends
                  </p>
                  <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight ">
                    Welcome to the Stream
                  </h1>
                  <p className="text-lg sm:text-xl text-slate-300">
                    Get ready to begin. 5 False/lies Leads to suspension
                  </p>

                  {/* Guide Section */}
                  <div className="bg-[#232b37]/80 rounded-xl border border-[#334155]/40 px-6 py-5 text-left shadow-inner">
                    <h3 className="font-semibold text-white mb-3 text-lg flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-lightbulb"
                      >
                        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1.5.6 2.8 1.5 3.5.8.7 1.3 1.5 1.5 2.5" />
                        <path d="M9 18h6" />
                        <path d="M10 22h4" />
                        <path d="M10 18a2 2 0 1 1 4 0" />
                      </svg>
                      <span>How the Miasma Filter Works</span>
                    </h3>
                    <ul className="list-inside text-slate-400 space-y-3 text-base">
                      <li className="flex items-start">
                        <span className="inline-block mr-2 text-blue-400 font-bold">
                          •
                        </span>
                        <span>
                          After you start your stream, state a series of facts
                          (True or False).
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block mr-2 text-blue-400 font-bold">
                          •
                        </span>
                        <span>
                          Miasma will analyze and validate each statement in
                          real-time.
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block mr-2 text-blue-400 font-bold">
                          •
                        </span>
                        <span>
                          Statements will be automatically marked{" "}
                          <strong className="text-green-400">True</strong> or{" "}
                          <strong className="text-red-400">False</strong> on
                          your screen for your audience.
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-white">
                    Recommended Topics
                  </h2>
                  <p className="text-lg text-slate-300">
                    Try streaming about these trending topics to engage your
                    audience:
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {recommendedTopics.map((topic, idx) => (
                      <span
                        key={idx}
                        className="bg-[#223045] text-blue-100 px-4 py-2 rounded-full text-sm font-medium hover:bg-[#2e405a] transition-colors"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Close button with enhanced styling */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-x"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Button to start stream, with pulsing effect */}
          <button
            onClick={handleSkipIntro}
            className="fixed z-[60] bottom-10 left-1/2 -translate-x-1/2 px-8 py-4 text-lg font-bold rounded-full bg-blue-600 text-white shadow-lg border border-blue-500 hover:bg-blue-700 transition-colors duration-300 animate-pulse-grow"
          >
            Start Streaming
          </button>

          {/* Custom CSS for animations and styles */}
          <style jsx>{`
            @import url("https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,100..900;1,100..900&display=swap");

            .raleway-<uniquifier > {
              font-family: "Raleway", sans-serif;
              font-optical-sizing: auto;
              font-weight: <weight>;
              font-style: normal;
            }

            @keyframes pulse-grow {
              0%,
              100% {
                transform: scale(1);
                box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
              }
              50% {
                transform: scale(1.05);
                box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
              }
            }
            .animate-pulse-grow {
              animation: pulse-grow 2s infinite cubic-bezier(0.4, 0, 0.6, 1);
            }

            @keyframes scale-in {
              from {
                transform: scale(0.95);
                opacity: 0;
              }
              to {
                transform: scale(1);
                opacity: 1;
              }
            }
            .animate-scale-in {
              animation: scale-in 0.3s ease-out forwards;
            }
          `}</style>
        </>
      )}

      <div
        className={`flex flex-col min-h-screen pt-16 px-4 sm:px-8 transition-filter duration-500 ${
          showWelcomeOverlay ? "blur-lg" : ""
        }`}
      >
        <Navbar />
        <div className="flex-1 overflow-auto p-4 lg:grid lg:grid-cols-3 lg:gap-8 xl:grid-cols-9">
          <div className="lg:col-span-2 xl:col-span-6">
            <div className="w-full relative overflow-hidden aspect-video mb-4 bg-black border-2 border-[#4A5568]/40">
              <style jsx>{`
                @keyframes scroll-left {
                  0% {
                    transform: translateX(100%);
                  }
                  100% {
                    transform: translateX(-100%);
                  }
                }
                .marquee-text {
                  animation: scroll-left 20s linear infinite;
                  white-space: nowrap;
                }
                @keyframes fadeIn {
                  from {
                    opacity: 0;
                  }
                  to {
                    opacity: 1;
                  }
                }
                .animate-fadeIn {
                  animation: fadeIn 0.5s ease-out forwards;
                }
              `}</style>

              {showIntroVideo ? (
                <video
                  ref={introVideoRef}
                  src="/intro.mp4"
                  onEnded={handleIntroVideoEnd}
                  className="w-full h-full object-cover"
                  playsInline
                />
              ) : isStreaming ? (
                <div className="w-full h-full bg-black relative">
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    muted={true}
                    videoConstraints={videoConstraints}
                    className="w-full h-full object-cover"
                    onUserMedia={() => setVideoReady(true)}
                    onUserMediaError={(err) => setErrorMsg("Webcam error ")}
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  {!isVideoOn && (
                    <div className="absolute inset-0 flex items-center justify-center text-center z-10 bg-black/70">
                      <VideoOff className="h-16 w-16 text-[#DC2626]" />{" "}
                      <p>Video Off</p>
                    </div>
                  )}
                </div>
              ) : isConnecting ? (
                <div className="absolute w-full h-full inset-0 bg-gradient-to-br from-[#1A202C] to-[#2D3748] flex items-center justify-center">
                  <div className="text-center p-8">
                    <Play className="h-20 w-20 text-[#2B6CB0] mx-auto mb-4 animate-pulse" />
                    <p className="text-white font-semibold text-lg">
                      Connecting...
                    </p>
                    <p className="text-[#9CA3AF] text-sm">
                      Establishing secure connection
                    </p>
                  </div>
                </div>
              ) : (
                <div className="absolute w-full h-full inset-0 bg-gradient-to-br from-[#1A202C] to-[#2D3748] flex items-center justify-center">
                  <div className="text-center p-8">
                    <Play className="h-20 w-20 text-[#2B6CB0] mx-auto mb-4" />
                    <p className="text-white font-semibold text-lg">
                      Stream is Offline
                    </p>
                    <p className="text-[#9CA3AF] text-sm">
                      Click &rdquo;Start Stream&rdquo; to go live
                    </p>
                    {errorMsg && (
                      <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg max-w-md">
                        <p className="text-red-400 text-sm font-medium">
                          {errorMsg}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {overlayNotification && !showIntroVideo && (
                <div className="absolute inset-0 z-30 flex items-center justify-center p-8 animate-fadeIn">
                  <div
                    className={`
        text-center max-w-xl px-4 py-2 rounded-lg drop-shadow-lg
        ${
          overlayNotification.severity === "success"
            ? "bg-white/90" // White background for true notifications
            : "bg-black/50" // Black background for false notifications
        }
      `}
                  >
                    <p
                      className={`
          text-xl md:text-2xl font-bold drop-shadow-lg
          ${
            overlayNotification.severity === "success"
              ? "text-green-600" // Green text for true notifications
              : "text-red-500" // Red text for false notifications
          }
        `}
                    >
                      {overlayNotification.content}
                    </p>
                  </div>
                </div>
              )}

              {isStreaming && !showIntroVideo && (
                <>
                  <div className="absolute top-10 left-4 z-20">
                    <Image src="/logo.jpg" alt="Logo" width={40} height={50} />
                  </div>
                  <div className="absolute top-10 right-4 bg-[#DC2626] px-3 py-1 rounded-md text-sm font-semibold flex items-center space-x-2 text-white shadow-lg z-20">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span>LIVE</span>
                  </div>

                  <div className="absolute top-0 inset-x-0 z-20 flex items-center bg-red-600 h-8 overflow-hidden">
                    {/* This is the container that will scroll continuously */}
                    <div className="marquee-text">
                      <span className="mx-4 text-sm font-bold uppercase tracking-wider">
                        BREAKING NEWS ! BREAKING NEWS ! BREAKING NEWS ! BREAKING
                        NEWS ! BREAKING NEWS ! BREAKING NEWS ! BREAKING NEWS !
                        BREAKING NEWS !
                      </span>
                    </div>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 z-20 flex bg-red-600 backdrop-blur-sm border-t border-[#4A5568]/30 h-[6%] min-h-[32px]">
                    <div className="flex items-end h-full">
                      <img
                        src="/breaking_news.png"
                        alt="Breaking News"
                        className="h-full w-auto object-contain"
                      />
                    </div>
                    <div className="flex-1 flex items-center overflow-hidden pl-4">
                      <div className="marquee-text text-[#E2E8F0] text-sm font-semibold whitespace-nowrap uppercase">
                        {getLatestNotificationText()}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="bg-[#1A202C] border-b border-[#4A5568]/30 p-2 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* ROW 1 ON MOBILE/TAB: Start + Video + Audio */}{" "}
                <div className="flex flex-row items-center justify-between gap-4">
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    <button
                      onClick={
                        isStreaming || isConnecting
                          ? stopStreaming
                          : startStreaming
                      }
                      disabled={isConnecting}
                      className={`flex items-center space-x-2 px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all text-sm sm:text-base ${
                        isStreaming
                          ? "bg-[#DC2626] hover:bg-[#B91C1C] text-white"
                          : isConnecting
                          ? "bg-[#4A5568] text-[#E2E8F0] cursor-not-allowed"
                          : "bg-[#059669] hover:bg-[#047857] text-white"
                      }`}
                    >
                      {isStreaming ? (
                        <Square className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5" />
                      )}
                      <span>
                        {isStreaming
                          ? "Stop Stream"
                          : isConnecting
                          ? "Starting..."
                          : "Start Stream"}
                      </span>
                    </button>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setIsVideoOn(!isVideoOn)}
                        disabled={isStreaming}
                        className={`p-2 sm:p-3 rounded-lg ${
                          isVideoOn ? "bg-[#2D3748]" : "bg-[#DC2626]"
                        } ${
                          isStreaming
                            ? "opacity-60 cursor-not-allowed"
                            : "hover:bg-[#4A5568]"
                        }`}
                      >
                        {isVideoOn ? (
                          <Video className="h-5 w-5 text-[#E2E8F0]" />
                        ) : (
                          <VideoOff className="h-5 w-5 text-white" />
                        )}
                      </button>
                      <button
                        onClick={() => setIsAudioOn(!isAudioOn)}
                        disabled={isStreaming}
                        className={`p-2 sm:p-3 rounded-lg ${
                          isAudioOn ? "bg-[#2D3748]" : "bg-[#DC2626]"
                        } ${
                          isStreaming
                            ? "opacity-60 cursor-not-allowed"
                            : "hover:bg-[#4A5568]"
                        }`}
                      >
                        {isAudioOn ? (
                          <Mic className="h-5 w-5 text-[#E2E8F0]" />
                        ) : (
                          <MicOff className="h-5 w-5 text-white" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                {/* ROW 2 ON MOBILE/TAB: rest of controls + status */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Language Selection Dropdown */}
                    <div
                      className={`flex items-center space-x-2 ${
                        isStreaming || isConnecting
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {/* Hide on small/tab, show on md+ (768px+) */}
                      <Globe className="hidden md:inline-flex h-5 w-5 text-[#9CA3AF] flex-shrink-0" />
                      <select
                        id="language-select"
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        disabled={isStreaming || isConnecting}
                        className={`
        p-2 sm:p-3 bg-[#2D3748] hover:bg-[#4A5568] rounded-lg text-white appearance-none 
        cursor-pointer border border-[#4A5568]/30 focus:outline-none focus:ring-2 
        focus:ring-[#63B3ED] text-sm
        ${isStreaming || isConnecting ? "cursor-not-allowed" : "cursor-pointer"}
        [&>option]:bg-slate-800 [&>option]:text-white
      `}
                      >
                        {LANGUAGES.map((lang) => (
                          <option key={lang.value} value={lang.value}>
                            {lang.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Visual Enhancement Toggle */}
                    <div
                      className={`flex items-center space-x-2 ${
                        isStreaming || isConnecting
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      <div className="flex items-center space-x-4 bg-[#2D3748] hover:bg-[#4A5568] rounded-lg border border-[#4A5568]/30 p-2 sm:p-1.5">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <span className="text-xs font-medium text-[#E2E8F0] whitespace-nowrap leading-none">
                            Visual
                          </span>
                          <span className="text-xs font-medium text-[#E2E8F0] whitespace-nowrap leading-none">
                            Enhancement
                          </span>
                        </div>

                        <button
                          onClick={() => setIsVisualEnhanced(!isVisualEnhanced)}
                          disabled={isStreaming || isConnecting}
                          className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-[#63B3ED] mx-1 ${
                            !isVisualEnhanced
                              ? "bg-[#3d3939e3]"
                              : "bg-[#059669]"
                          } ${
                            isStreaming || isConnecting
                              ? "cursor-not-allowed"
                              : "cursor-pointer"
                          }`}
                          role="switch"
                          aria-checked={isVisualEnhanced}
                          aria-labelledby="visual-enhancement-label"
                        >
                          <span
                            className="sr-only"
                            id="visual-enhancement-label"
                          >
                            Toggle Visual Enhancement
                          </span>
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                              isVisualEnhanced
                                ? "translate-x-5"
                                : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Strictness Selector */}
                    <div className="flex items-center space-x-2">
                      <div title={`Strike Limit: ${FALSE_STATEMENT_LIMIT}`}>
                        {/* Hide on small/tab, show on md+ (768px+) */}
                        <SlidersHorizontal
                          className={`hidden md:inline-flex h-5 w-5 flex-shrink-0 transition-opacity ${
                            isStreaming || isConnecting
                              ? "opacity-50 text-[#9CA3AF]"
                              : "text-[#E2E8F0]"
                          }`}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-[#9CA3AF] whitespace-nowrap">
                          Limit:
                        </span>
                        <span className="text-sm font-bold text-[#63B3ED] whitespace-nowrap w-4 text-center">
                          {FALSE_STATEMENT_LIMIT}
                        </span>

                        <div
                          className={`
          relative w-36 h-10 overflow-x-scroll no-scrollbar flex items-center
          rounded-md border border-[#4A5568]/30 bg-[#2D3748] 
          ${
            isStreaming || isConnecting
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer"
          }
        `}
                          onScroll={(e) => {
                            if (isStreaming || isConnecting) return;
                            const scrollElement =
                              e.currentTarget as HTMLDivElement & {
                                timeout?: NodeJS.Timeout;
                              };
                            const itemWidth = 36;
                            clearTimeout(scrollElement.timeout);
                            scrollElement.timeout = setTimeout(() => {
                              const scrollLeft = scrollElement.scrollLeft;
                              const closestIndex = Math.round(
                                scrollLeft / itemWidth
                              );
                              scrollElement.scrollLeft =
                                closestIndex * itemWidth;
                              const newLimit = STRIKE_OPTIONS[closestIndex];
                              if (
                                newLimit !== undefined &&
                                newLimit !== strikeLimit
                              ) {
                                setStrikeLimit(newLimit);
                              }
                            }, 100);
                          }}
                        >
                          <div className="w-[calc(50%-18px)] flex-shrink-0"></div>

                          {STRIKE_OPTIONS.map((num) => {
                            const isActive = num === FALSE_STATEMENT_LIMIT;
                            return (
                              <div
                                key={num}
                                className={`
                flex items-center justify-center w-9 h-9 flex-shrink-0
                transition-all duration-150 ease-in-out
                ${
                  isActive
                    ? "text-white font-extrabold text-lg"
                    : "text-[#9CA3AF] text-sm opacity-30 hover:opacity-70"
                }
              `}
                                onClick={(e) => {
                                  if (isStreaming || isConnecting) return;
                                  const index = STRIKE_OPTIONS.indexOf(num);
                                  const itemWidth = 36;
                                  const scrollPosition = index * itemWidth;
                                  if (e.currentTarget.parentElement) {
                                    e.currentTarget.parentElement.scrollLeft =
                                      scrollPosition;
                                  }
                                  setStrikeLimit(num);
                                }}
                              >
                                {num}
                              </div>
                            );
                          })}

                          <div className="w-[calc(50%-18px)] flex-shrink-0"></div>
                          <div className="absolute left-1/2 top-0 bottom-0 w-9 -translate-x-1/2 border-x-2 border-[#63B3ED]/50 pointer-events-none"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status indicator (still right on desktop, second row on mobile/tab) */}
                  <div className="flex items-center space-x-2 sm:space-x-4 text-sm text-[#9CA3AF]">
                    <div className="flex items-center space-x-1">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isStreaming
                            ? "bg-[#059669]"
                            : isConnecting
                            ? "bg-[#F59E0B]"
                            : "bg-[#6B7280]"
                        }`}
                      ></div>
                      <span>
                        {isStreaming
                          ? "Live"
                          : isConnecting
                          ? "Connecting"
                          : "Offline"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>{" "}
            </div>

            <div className="bg-[#1A202C] p-3 sm:p-4 mb-4">
              <h2 className="text-xl font-bold mb-2 text-white">
                Breaking News Live - Latest Updates
              </h2>
              <p className="text-[#9CA3AF] mb-3">
                Stay informed with real-time news coverage.
              </p>
            </div>
          </div>
          <div className="lg:col-span-1 xl:col-span-3 flex flex-col h-full">
            <div className="bg-[#1A202C] mb-4 flex flex-col flex-1 min-h-[50vh] max-h-[80vh] lg:max-h-[calc(100vh-16rem)] animate-outter-pulse-glow ">
              <style
                dangerouslySetInnerHTML={{
                  __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes fadeInItem { 
          from { opacity: 0; transform: translateY(10px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        
        .fade-in-item { animation: fadeInItem 0.5s ease-out forwards; }

        /* --- ADDED FOR INNER GLOW --- */
        @keyframes innerPulseGlow {
          0%, 100% {
            box-shadow: inset 0 0 4px rgba(59, 130, 246, 0.4);
          }
          50% {
            box-shadow: inset 0 0 15px rgba(59, 130, 246, 0.7);
          }
        }
        
        .animate-inner-pulse-glow {
          animation: innerPulseGlow 2.5s ease-in-out infinite;
        }

        @keyframes outterPulseGlow {
          0%, 100% {
            box-shadow: 0 0 4px rgba(255, 0, 0, 0.4);
          }

          50% {
            box-shadow: 0 0 15px rgba(255, 0, 0, 0.7);
          }
        }
        
        .animate-outter-pulse-glow {
          animation: outterPulseGlow 2.5s ease-in-out infinite;
        }

        @keyframes outterPulseGlowTrending {
          0%, 100% {
            box-shadow: 0 0 4px rgba(0, 255, 0, 0.4);
          }

          50% {
            box-shadow: 0 0 15px rgba(0, 255, 0, 0.7);
          }
        }
        
        .animate-outter-pulse-glow-trending {
          animation: outterPulseGlowTrending 2.5s ease-in-out infinite;
        }
        /* --- END OF ADDED CODE --- */
      `,
                }}
              />
              <div className="p-4 border-b border-[#4A5568]/30">
                <h3 className="font-semibold text-base sm:text-lg flex items-center space-x-2 text-[#FFFFFF]">
                  <Bell className="h-5 w-5" />
                  <span>Live Feed / Notifications</span>
                </h3>
              </div>
              <div className="flex-1 p-4 space-y-4 overflow-y-auto no-scrollbar">
                {notifications.length === 0 ? (
                  <div className="text-center text-gray-500 pt-10">
                    <p>No notifications yet.</p>
                    <p className="text-sm">Live updates will appear here.</p>
                  </div>
                ) : (
                  notifications.map((item, index) => (
                    <div
                      key={`${item.id}-${index}`}
                      className={`
            fade-in-item p-4 rounded-lg border relative
            ${getNotificationStyle(item.severity)}
            animate-inner-pulse-glow 
          `}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <button
                        onClick={() => removeNotification(item.id)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center">
                          {getNotificationIcon(item.severity)}
                        </div>

                        <div className="flex-1">
                          <p className="font-bold text-white text-base leading-tight pr-4">
                            {item.title}
                          </p>
                          <p className="text-[#E2E8F0] text-sm leading-relaxed mt-1 mb-2">
                            {item.content}
                          </p>
                          <div className="flex justify-between items-center w-full">
                            <p className="text-xs text-gray-400">
                              {item.timestamp}
                            </p>
                          </div>
                          <div className="flex justify-between items-center w-full">
                            <p className="text-xs text-gray-400">
                              {item.action}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div
              className="bg-[#1A202C] flex-1 overflow-auto animate-inner-pulse-glow"
              style={{ maxHeight: "320px" }}
            >
              <div className="p-4 border-b border-[#4A5568]/30">
                <h3 className="font-semibold text-lg flex items-center space-x-2 text-white">
                  <TrendingUp className="h-5 w-5" />
                  <span>Trending Now In India</span>
                </h3>
              </div>
              {/* Scrollable entries container with invisible scrollbar */}
              <div className="p-4">
                <div className="space-y-3 overflow-y-auto max-h-[220px] pr-1 no-scrollbar">
                  {loading ? (
                    <div className="flex items-center justify-center py-6 text-blue-400 font-semibold">
                      Loading trending news...
                    </div>
                  ) : trendingStreams.length === 0 ? (
                    <div className="flex items-center justify-center py-6 text-gray-500 font-semibold">
                      No trending news available.
                    </div>
                  ) : (
                    trendingStreams.map((stream) => (
                      <div
                        key={stream.id}
                        className="
              flex items-center space-x-3 p-2 rounded-md cursor-pointer
              bg-slate-800
              shadow-lg shadow-blue-500/20
              hover:bg-slate-700 hover:shadow-blue-400/40
              transition-all duration-300
            "
                      >
                        <div className="w-12 h-8 bg-[#2B6CB0] rounded flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {stream.title}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
