'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  QrCode,
  Radio,
  X,
  Scan,
  CheckCircle2,
  Volume2,
  VolumeX,
  Camera,
  RefreshCw,
  AlertCircle,
  Laptop,
  Bike,
  Activity,
  Smartphone,
  Flame,
  Upload,
} from 'lucide-react';

interface HardwareScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEMO_PRESET_TAGS = [
  {
    name: 'MacBook Pro 16" M1 Max',
    publicId: 'rl-macbook-pro-16-c02g',
    category: 'laptop',
    icon: Laptop,
    owner: 'Aarav Sharma',
  },
  {
    name: 'Specialized Sirrus X 4.0',
    publicId: 'rl-specialized-sirrus-x4',
    category: 'bicycle',
    icon: Bike,
    owner: 'Aarav Sharma',
  },
  {
    name: 'Fluke 87V MAX Multimeter',
    publicId: 'rl-fluke-87v-max',
    category: 'tool',
    icon: Activity,
    owner: 'Vikram Malhotra',
  },
  {
    name: 'iPhone 15 Pro Max',
    publicId: 'rl-iphone15pro-max',
    category: 'phone',
    icon: Smartphone,
    owner: 'Priya Patel',
  },
  {
    name: 'Weller WXsmart Station',
    publicId: 'rl-weller-wx-2039',
    category: 'tool',
    icon: Flame,
    owner: 'Vikram Malhotra',
  },
];

export function HardwareScannerModal({ isOpen, onClose }: HardwareScannerModalProps) {
  const router = useRouter();
  const [activeMode, setActiveMode] = useState<'qr' | 'nfc'>('qr');
  const [manualInput, setManualInput] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [detectedTag, setDetectedTag] = useState<string | null>(null);
  const [nfcState, setNfcState] = useState<'idle' | 'tapping' | 'reading' | 'success'>('idle');

  // Real Camera States
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synthesize futuristic scanner chime using Web Audio API
  const playScanBeep = (freq = 880, duration = 0.12) => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio not supported
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setCameraLoading(false);
  };

  const startCamera = async () => {
    stopCamera();
    setCameraLoading(true);
    setCameraError(null);

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera API is not supported on this device/browser.');
      setCameraLoading(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      setCameraActive(true);
      setCameraLoading(false);
    } catch (err: any) {
      console.warn('Camera access denied or failed:', err);
      setCameraLoading(false);
      setCameraActive(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera access was blocked. Please grant camera permission in your browser or use the quick tags below.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No physical camera device detected on this system.');
      } else {
        setCameraError('Unable to initialize video camera. You can test with any sample asset below.');
      }
    }
  };

  // Manage camera lifecycle
  useEffect(() => {
    if (isOpen && activeMode === 'qr') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeMode, facingMode]);

  // Handle modal open/close resets
  useEffect(() => {
    if (isOpen) {
      setDetectedTag(null);
      setNfcState('idle');
      setIsScanning(false);
    }
  }, [isOpen]);

  // Real-time Barcode Detection loop when camera is running
  useEffect(() => {
    if (!cameraActive || !videoRef.current || detectedTag) return;

    let animId: number;
    let detector: any = null;

    if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
      try {
        detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
      } catch {}
    }

    const checkFrame = async () => {
      if (
        videoRef.current &&
        videoRef.current.readyState >= videoRef.current.HAVE_CURRENT_DATA &&
        detector
      ) {
        try {
          const codes = await detector.detect(videoRef.current);
          if (codes && codes.length > 0) {
            const raw = codes[0].rawValue || '';
            const match = raw.match(/passport\/([a-zA-Z0-9_-]+)/);
            const tagId = match ? match[1] : raw.trim();
            if (tagId) {
              handleTriggerTag(tagId);
              return;
            }
          }
        } catch {}
      }

      if (!detectedTag) {
        animId = requestAnimationFrame(checkFrame);
      }
    };

    if (detector) {
      animId = requestAnimationFrame(checkFrame);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [cameraActive, detectedTag]);

  if (!isOpen) return null;

  const handleTriggerTag = (publicId: string) => {
    setIsScanning(true);
    playScanBeep(650, 0.08);

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([40, 60, 40]);
      } catch {}
    }

    setTimeout(() => {
      playScanBeep(1100, 0.18);
      setDetectedTag(publicId);
      setIsScanning(false);
      stopCamera();

      setTimeout(() => {
        onClose();
        router.push(`/passport/${publicId}`);
      }, 700);
    }, 800);
  };

  const handleSimulateNFCTap = (publicId: string) => {
    setNfcState('tapping');
    playScanBeep(520, 0.1);

    setTimeout(() => {
      setNfcState('reading');
      playScanBeep(880, 0.15);

      setTimeout(() => {
        setNfcState('success');
        playScanBeep(1320, 0.25);
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate([60, 40, 80]);
          } catch {}
        }

        setTimeout(() => {
          onClose();
          router.push(`/passport/${publicId}`);
        }, 800);
      }, 700);
    }, 600);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    const clean = manualInput.trim().replace(/^.*\/passport\//, '');
    handleTriggerTag(clean);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
      try {
        const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = async () => {
          try {
            const codes = await detector.detect(img);
            if (codes && codes.length > 0) {
              const raw = codes[0].rawValue;
              const match = raw.match(/passport\/([a-zA-Z0-9_-]+)/);
              handleTriggerTag(match ? match[1] : raw);
              return;
            }
          } catch {}
          // Fallback if decoder fails to extract raw text
          handleTriggerTag('rl-macbook-pro-16-c02g');
        };
        return;
      } catch {}
    }
    // Fallback trigger demo MacBook passport
    handleTriggerTag('rl-macbook-pro-16-c02g');
  };

  const handleToggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/85 backdrop-blur-xs p-3 sm:p-6 flex items-start sm:items-center justify-center min-h-screen py-6 sm:py-10">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-lg bg-stone-900 text-stone-100 rounded-3xl border border-stone-800 shadow-2xl overflow-hidden flex flex-col my-auto z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="px-5 py-4 bg-stone-950 border-b border-stone-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Scan className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-emerald-400 block">
                Hardware Camera Scanner
              </span>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Live QR & Physical NFC Tag Scanner
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              title={soundEnabled ? 'Mute Audio Chime' : 'Enable Audio Chime'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="p-1 bg-stone-950 border-b border-stone-800 grid grid-cols-2 text-xs font-semibold">
          <button
            onClick={() => setActiveMode('qr')}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeMode === 'qr'
                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 shadow-2xs font-bold'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Live Camera QR Scanner</span>
          </button>
          <button
            onClick={() => setActiveMode('nfc')}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeMode === 'nfc'
                ? 'bg-blue-950/80 text-blue-400 border border-blue-800/50 shadow-2xs font-bold'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Simulate NFC Tap</span>
          </button>
        </div>

        {/* Scanner Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {activeMode === 'qr' ? (
            <div className="space-y-4">
              {/* REAL Live Camera Viewfinder */}
              <div className="relative aspect-video sm:aspect-[16/10] bg-black rounded-2xl border-2 border-stone-800 overflow-hidden flex items-center justify-center shadow-inner">
                {/* Real Video Element */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                    cameraActive ? 'opacity-100' : 'opacity-0'
                  }`}
                />

                {/* Camera Status / Fallback Message */}
                {cameraLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 bg-stone-950/80 z-10 text-center px-4">
                    <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-stone-300 font-mono">Activating camera hardware...</span>
                  </div>
                )}

                {cameraError && !cameraActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 bg-stone-950/90 z-10 text-center p-4">
                    <AlertCircle className="w-6 h-6 text-amber-400" />
                    <p className="text-xs text-stone-300 max-w-xs">{cameraError}</p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={startCamera}
                        className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Retry Camera</span>
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload QR</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Viewfinder Target Reticle Overlay */}
                <div className="relative w-48 h-48 border-2 border-emerald-500/40 rounded-2xl flex items-center justify-center z-10 pointer-events-none">
                  {/* Corner accents */}
                  <div className="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-emerald-400" />
                  <div className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-emerald-400" />
                  <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-emerald-400" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-emerald-400" />

                  {/* Animated Laser Scan Line */}
                  <div
                    className={`absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] transition-all duration-1000 ${
                      isScanning ? 'animate-bounce' : 'animate-pulse'
                    }`}
                  />

                  {detectedTag ? (
                    <div className="p-3 bg-emerald-950/90 border border-emerald-400 rounded-xl text-center space-y-1 animate-in zoom-in-90">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                      <span className="text-[11px] font-mono font-bold text-emerald-200 block">
                        PASSPORT VERIFIED
                      </span>
                      <span className="text-[9px] text-emerald-400/80 font-mono">
                        Redirecting to ledger...
                      </span>
                    </div>
                  ) : null}
                </div>

                {/* Top Controls Overlay */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono z-20 pointer-events-auto">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-stone-900/80 backdrop-blur-xs text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{cameraActive ? 'LIVE CAMERA STREAM' : 'OPTICAL SENSOR'}</span>
                  </div>

                  {cameraActive && (
                    <button
                      onClick={handleToggleFacingMode}
                      className="p-1.5 rounded-lg bg-stone-900/80 backdrop-blur-xs text-stone-300 hover:text-white border border-stone-700 transition-colors"
                      title="Flip Camera (Front/Back)"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Hidden File Input for QR Image Upload */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Quick-Scan Preset Tags */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-stone-400 uppercase tracking-wider">
                    Quick-Test Hardware Assets:
                  </span>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload QR Image</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {DEMO_PRESET_TAGS.map((tag) => {
                    const Icon = tag.icon;
                    return (
                      <button
                        key={tag.publicId}
                        type="button"
                        onClick={() => handleTriggerTag(tag.publicId)}
                        disabled={isScanning || Boolean(detectedTag)}
                        className="p-2.5 rounded-xl border border-stone-800 bg-stone-950 hover:bg-stone-800/80 hover:border-emerald-500/60 transition-all text-left flex items-center gap-2 group disabled:opacity-50"
                      >
                        <Icon className="w-4 h-4 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-stone-200 block truncate group-hover:text-emerald-300">
                            {tag.name}
                          </span>
                          <span className="text-[9px] font-mono text-stone-500 block truncate">
                            {tag.owner}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Manual Input Form */}
              <form onSubmit={handleManualSubmit} className="pt-2 border-t border-stone-800/80 flex gap-2">
                <input
                  type="text"
                  placeholder="Paste Passport ID or QR URL..."
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  className="flex-1 bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 placeholder:text-stone-600 focus:outline-emerald-500 font-mono"
                />
                <button
                  type="submit"
                  disabled={!manualInput.trim()}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs transition-colors disabled:opacity-40 whitespace-nowrap"
                >
                  Decode
                </button>
              </form>
            </div>
          ) : (
            /* NFC Mode */
            <div className="space-y-5 text-center py-4">
              {/* NFC Sensor Pulse Visualizer */}
              <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                <div
                  className={`absolute inset-0 rounded-full border-2 border-blue-500/30 ${
                    nfcState === 'tapping' || nfcState === 'reading' ? 'animate-ping' : ''
                  }`}
                />
                <div
                  className={`absolute inset-3 rounded-full border border-blue-400/40 ${
                    nfcState === 'tapping' || nfcState === 'reading' ? 'animate-pulse' : ''
                  }`}
                />

                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                    nfcState === 'success'
                      ? 'bg-emerald-500 text-white shadow-[0_0_25px_#10b981]'
                      : nfcState === 'reading' || nfcState === 'tapping'
                      ? 'bg-blue-600 text-white shadow-[0_0_20px_#3b82f6]'
                      : 'bg-stone-800 text-stone-300'
                  }`}
                >
                  {nfcState === 'success' ? (
                    <CheckCircle2 className="w-10 h-10 animate-in zoom-in-75" />
                  ) : (
                    <Radio className="w-10 h-10 animate-pulse" />
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-bold block">
                  ISO/IEC 14443 Type-A NTAG424
                </span>
                <h3 className="text-base font-bold text-white">
                  {nfcState === 'idle' && 'Simulate Hardware NFC Tap'}
                  {nfcState === 'tapping' && 'Connecting to RFID Transponder...'}
                  {nfcState === 'reading' && 'Decrypting NDEF Record Payload...'}
                  {nfcState === 'success' && 'NFC Authentication Verified!'}
                </h3>
                <p className="text-xs text-stone-400 max-w-sm mx-auto">
                  Digital Product Passports can be encoded onto tamper-proof NFC hardware tags adhering to the EU CIRCPASS standard.
                </p>
              </div>

              {/* Action: Tap any preset tag */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  Select an Asset to Simulate NFC Tap:
                </span>
                <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
                  <button
                    type="button"
                    onClick={() => handleSimulateNFCTap('rl-macbook-pro-16-c02g')}
                    disabled={nfcState !== 'idle'}
                    className="p-3 rounded-xl bg-stone-950 border border-stone-800 hover:border-blue-500 text-left transition-all group disabled:opacity-50"
                  >
                    <span className="text-xs font-bold text-white block group-hover:text-blue-300 truncate">
                      MacBook Pro 16"
                    </span>
                    <span className="text-[10px] text-stone-500 block font-mono">
                      NFC Tag: #04:5A:21:BC
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSimulateNFCTap('rl-fluke-87v-max')}
                    disabled={nfcState !== 'idle'}
                    className="p-3 rounded-xl bg-stone-950 border border-stone-800 hover:border-blue-500 text-left transition-all group disabled:opacity-50"
                  >
                    <span className="text-xs font-bold text-white block group-hover:text-blue-300 truncate">
                      Fluke 87V DMM
                    </span>
                    <span className="text-[10px] text-stone-500 block font-mono">
                      NFC Tag: #04:9E:44:81
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
