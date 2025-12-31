
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Scissors, Sparkles, Play, Pause, ChevronLeft, Search } from 'lucide-react';
import { BoundingBox } from '../types';
import { detectFacesWithAI } from '../services/geminiService';

interface FaceSelectorProps {
  videoUrl: string;
  onExtract: (imageData: string) => void;
  onBack: () => void;
}

const FaceSelector: React.FC<FaceSelectorProps> = ({ videoUrl, onExtract, onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selection, setSelection] = useState<BoundingBox>({ x: 0.35, y: 0.25, width: 0.3, height: 0.3 });
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current?.paused) {
      videoRef.current.play();
    } else {
      videoRef.current?.pause();
    }
  };

  const handleCapture = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to the selection area size in actual pixels
    const cropWidth = video.videoWidth * selection.width;
    const cropHeight = video.videoHeight * selection.height;
    const cropX = video.videoWidth * selection.x;
    const cropY = video.videoHeight * selection.y;

    canvas.width = cropWidth;
    canvas.height = cropHeight;

    ctx.drawImage(
      video,
      cropX, cropY, cropWidth, cropHeight,
      0, 0, cropWidth, cropHeight
    );

    onExtract(canvas.toDataURL('image/png'));
  }, [selection, onExtract]);

  const handleSmartDetect = async () => {
    const video = videoRef.current;
    if (!video) return;

    setIsAnalyzing(true);
    video.pause();

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High quality capture for AI
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
    const aiBox = await detectFacesWithAI(base64);

    if (aiBox) {
      setSelection(aiBox);
    } else {
      alert("No faces detected in this frame. Try another frame!");
    }
    setIsAnalyzing(false);
  };

  const handleMouseDown = (e: React.MouseEvent, type: 'move' | 'resize') => {
    if (type === 'move') setIsDragging(true);
    else setIsResizing(true);
    
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging && !isResizing) return;
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const dx = (e.clientX - dragStart.x) / rect.width;
    const dy = (e.clientY - dragStart.y) / rect.height;

    setDragStart({ x: e.clientX, y: e.clientY });

    setSelection(prev => {
      if (isDragging) {
        return {
          ...prev,
          x: Math.max(0, Math.min(1 - prev.width, prev.x + dx)),
          y: Math.max(0, Math.min(1 - prev.height, prev.y + dy))
        };
      } else {
        return {
          ...prev,
          width: Math.max(0.05, Math.min(1 - prev.x, prev.width + dx)),
          height: Math.max(0.05, Math.min(1 - prev.y, prev.height + dy))
        };
      }
    });
  };

  const stopInteraction = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  return (
    <div className="w-full flex flex-col md:flex-row gap-8 items-start">
      <div className="flex-grow w-full">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Identify the Face</h2>
            <p className="text-sm text-slate-500">Move and scale the selection box over the face.</p>
          </div>
        </div>

        <div 
          ref={containerRef}
          className="relative bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video select-none group"
          onMouseMove={handleMouseMove}
          onMouseUp={stopInteraction}
          onMouseLeave={stopInteraction}
        >
          <video 
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-contain"
          />

          {/* Selection Overlay */}
          <div 
            className="absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] cursor-move z-10"
            style={{
              left: `${selection.x * 100}%`,
              top: `${selection.y * 100}%`,
              width: `${selection.width * 100}%`,
              height: `${selection.height * 100}%`
            }}
            onMouseDown={(e) => handleMouseDown(e, 'move')}
          >
            {/* Grid lines */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-30 pointer-events-none">
              <div className="border border-white/40"></div>
              <div className="border border-white/40"></div>
              <div className="border border-white/40"></div>
              <div className="border border-white/40"></div>
              <div className="border border-white/40"></div>
              <div className="border border-white/40"></div>
              <div className="border border-white/40"></div>
              <div className="border border-white/40"></div>
              <div className="border border-white/40"></div>
            </div>

            {/* Resize Handle */}
            <div 
              className="absolute -right-2 -bottom-2 w-5 h-5 bg-white rounded-full border-2 border-indigo-600 cursor-se-resize flex items-center justify-center"
              onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'resize'); }}
            >
              <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
            </div>

            {/* Label */}
            <div className="absolute -top-8 left-0 bg-white/90 backdrop-blur text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
              <Search size={10} />
              CROP REGION
            </div>
          </div>

          {/* Video Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex flex-col gap-2 transition-opacity opacity-0 group-hover:opacity-100">
             <div className="flex items-center gap-4 text-white">
                <button onClick={togglePlay} className="hover:text-indigo-400 transition-colors">
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>
                <input 
                  type="range"
                  min="0"
                  max={duration || 0}
                  step="0.01"
                  value={currentTime}
                  onChange={(e) => { if(videoRef.current) videoRef.current.currentTime = parseFloat(e.target.value); }}
                  className="flex-grow accent-indigo-500 h-1.5 rounded-full appearance-none bg-white/20"
                />
                <span className="text-xs font-mono tabular-nums">
                  {Math.floor(currentTime)}s / {Math.floor(duration)}s
                </span>
             </div>
          </div>

          {/* Loading Indicator for AI */}
          {isAnalyzing && (
            <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
              <div className="relative mb-4">
                <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles size={16} className="text-indigo-400 animate-pulse" />
                </div>
              </div>
              <p className="font-medium animate-pulse">AI is detecting faces...</p>
            </div>
          )}
        </div>
      </div>

      <div className="w-full md:w-80 flex flex-col gap-4">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-indigo-500" />
            Selection Tools
          </h3>
          
          <div className="space-y-3">
            <button 
              onClick={handleSmartDetect}
              disabled={isAnalyzing}
              className="w-full py-3 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all border border-indigo-200"
            >
              <Sparkles size={18} />
              Smart Auto-Detect
            </button>
            <p className="text-[10px] text-slate-400 text-center italic">
              Powered by Gemini 3 Flash
            </p>
          </div>

          <hr className="my-6 border-slate-100" />

          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-slate-500">Output Quality</span>
              <span className="text-indigo-600">Original Resolution</span>
            </div>
            
            <button 
              onClick={handleCapture}
              className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Scissors size={20} />
              Extract Face Image
            </button>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl text-white">
          <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">Tips</h4>
          <ul className="text-sm space-y-3 text-slate-300">
            <li className="flex gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0"></div>
              <span>Pause on a clear frame for best results.</span>
            </li>
            <li className="flex gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0"></div>
              <span>Drag the corners to adjust selection size.</span>
            </li>
            <li className="flex gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0"></div>
              <span>Auto-detect works best with front-facing portraits.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FaceSelector;
