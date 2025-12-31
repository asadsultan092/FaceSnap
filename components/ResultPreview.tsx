
import React, { useState, useEffect, useRef } from 'react';
import { Download, ChevronLeft, Image as ImageIcon, CheckCircle2, Copy, Layers, Maximize, Sliders } from 'lucide-react';
import { ExportFormat } from '../types';

interface ResultPreviewProps {
  image: string;
  onBack: () => void;
}

const ResultPreview: React.FC<ResultPreviewProps> = ({ image, onBack }) => {
  const [format, setFormat] = useState<ExportFormat>('png');
  const [scale, setScale] = useState<number>(1);
  const [quality, setQuality] = useState<number>(0.92);
  const [downloaded, setDownloaded] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Get original dimensions
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setDimensions({ width: img.width, height: img.height });
    };
    img.src = image;
  }, [image]);

  const handleDownload = () => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        if (format === 'jpeg') {
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          const link = document.createElement('a');
          link.href = canvas.toDataURL('image/jpeg', quality);
          link.download = `face_snap_${Math.round(quality * 100)}q_${scale}x_${Date.now()}.jpg`;
          link.click();
        } else {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const link = document.createElement('a');
          link.href = canvas.toDataURL('image/png');
          link.download = `face_snap_${scale}x_${Date.now()}.png`;
          link.click();
        }
      }
      
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    };
    img.src = image;
  };

  const finalWidth = Math.round(dimensions.width * scale);
  const finalHeight = Math.round(dimensions.height * scale);

  return (
    <div className="w-full max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="flex-grow flex flex-col gap-4 w-full">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ChevronLeft size={20} />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Extraction Result</h2>
              <p className="text-xs text-slate-500">Previewing at {scale}x scale in {format.toUpperCase()} format</p>
            </div>
          </div>

          <div className="bg-slate-200 rounded-3xl p-4 md:p-12 flex items-center justify-center min-h-[400px] shadow-inner relative overflow-hidden">
             {/* Decorative background pattern */}
             <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
             
             <div className="relative group z-10">
                <img 
                  src={image} 
                  alt="Extracted face" 
                  style={{ width: `${scale * 100}%`, maxWidth: '100%', height: 'auto' }}
                  className="rounded-xl shadow-2xl transition-all duration-300 ring-4 ring-white/50"
                />
             </div>
          </div>
        </div>

        <div className="w-full lg:w-96 flex flex-col gap-6 shrink-0">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
            <div className="mb-6">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                <Sliders size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Output Settings</h3>
              <p className="text-sm text-slate-500 mt-1">Fine-tune the quality and size before saving.</p>
            </div>

            <div className="space-y-6">
              {/* Format Toggle */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">File Format</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                  <button 
                    onClick={() => setFormat('png')}
                    className={`py-2 text-sm font-bold rounded-lg transition-all ${format === 'png' ? 'bg-white shadow-sm text-indigo-600 border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    PNG (Lossless)
                  </button>
                  <button 
                    onClick={() => setFormat('jpeg')}
                    className={`py-2 text-sm font-bold rounded-lg transition-all ${format === 'jpeg' ? 'bg-white shadow-sm text-indigo-600 border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    JPG (Photo)
                  </button>
                </div>
              </div>

              {/* Scaling Options */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Resolution Scale</label>
                <div className="grid grid-cols-3 gap-2">
                  {[0.5, 1, 2].map((s) => (
                    <button 
                      key={s}
                      onClick={() => setScale(s)}
                      className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all ${scale === s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}
                    >
                      {s === 1 ? 'Original' : `${s}x`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality Slider (Visible for JPEG) */}
              {format === 'jpeg' && (
                <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-end">
                    <label className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Compression Quality</label>
                    <span className="text-sm font-mono font-bold text-indigo-600">{Math.round(quality * 100)}%</span>
                  </div>
                  <input 
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.01"
                    value={quality}
                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium px-1">
                    <span>Small file</span>
                    <span>Best quality</span>
                  </div>
                </div>
              )}

              {/* Info Box */}
              <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600 mt-0.5">
                    <Layers size={14} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-500 font-medium w-full min-w-[140px]">
                      <span>Final Dimensions:</span>
                      <span className="text-slate-800 font-bold ml-2">{finalWidth} × {finalHeight}</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {scale > 1 ? 'Upscaling uses high-quality interpolation.' : 'Resolution optimized for web.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <button 
                onClick={handleDownload}
                className={`group w-full py-4 px-6 rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95
                  ${downloaded ? 'bg-emerald-600 text-white shadow-emerald-100' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100'}`}
              >
                {downloaded ? (
                  <>
                    <CheckCircle2 size={20} className="animate-bounce" />
                    Downloaded!
                  </>
                ) : (
                  <>
                    <Download size={20} className="group-hover:-translate-y-1 transition-transform" />
                    Download {format.toUpperCase()}
                  </>
                )}
              </button>
              
              <button 
                onClick={() => {
                   navigator.clipboard.writeText(image);
                   alert("Base64 copied to clipboard!");
                }}
                className="w-full py-3 px-6 rounded-2xl font-semibold text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <Copy size={16} />
                Copy Data URI
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultPreview;
