
import React, { useState } from 'react';
import { Download, ChevronLeft, Image as ImageIcon, CheckCircle2, Copy } from 'lucide-react';
import { ExportFormat } from '../types';

interface ResultPreviewProps {
  image: string;
  onBack: () => void;
}

const ResultPreview: React.FC<ResultPreviewProps> = ({ image, onBack }) => {
  const [format, setFormat] = useState<ExportFormat>('png');
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    // If format is PNG, we can use the base64 as is. If JPEG, we might need a quick conversion canvas.
    const link = document.createElement('a');
    
    if (format === 'jpeg') {
        const canvas = document.createElement('canvas');
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                link.href = canvas.toDataURL('image/jpeg', 0.92);
                link.download = `extracted_face_${Date.now()}.jpg`;
                link.click();
            }
        };
        img.src = image;
    } else {
        link.href = image;
        link.download = `extracted_face_${Date.now()}.png`;
        link.click();
    }
    
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-8 items-stretch">
        <div className="flex-grow flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-lg font-semibold text-slate-800">Extraction Result</h2>
          </div>

          <div className="bg-slate-200 rounded-3xl p-4 md:p-8 flex items-center justify-center min-h-[300px] shadow-inner">
             <div className="relative group">
                <img 
                  src={image} 
                  alt="Extracted face" 
                  className="max-h-[500px] rounded-xl shadow-2xl transition-transform group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 border-4 border-white/20 rounded-xl pointer-events-none"></div>
             </div>
          </div>
        </div>

        <div className="w-full md:w-80 flex flex-col gap-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col h-full">
            <div className="mb-8">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                <ImageIcon size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Ready to Save</h3>
              <p className="text-sm text-slate-500 mt-1">Select your preferred format and download your high-quality extract.</p>
            </div>

            <div className="space-y-6 flex-grow">
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 block uppercase tracking-wider">Format</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
                  <button 
                    onClick={() => setFormat('png')}
                    className={`py-2 text-sm font-semibold rounded-lg transition-all ${format === 'png' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    PNG
                  </button>
                  <button 
                    onClick={() => setFormat('jpeg')}
                    className={`py-2 text-sm font-semibold rounded-lg transition-all ${format === 'jpeg' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    JPG
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex justify-between text-xs text-slate-500 mb-2 font-medium">
                  <span>Dimension</span>
                  <span className="text-slate-800">Automatic</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500 font-medium">
                  <span>Compression</span>
                  <span className="text-slate-800">{format === 'png' ? 'None' : 'High Quality'}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <button 
                onClick={handleDownload}
                className={`w-full py-4 px-6 rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95
                  ${downloaded ? 'bg-emerald-600 text-white shadow-emerald-100' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100'}`}
              >
                {downloaded ? (
                  <>
                    <CheckCircle2 size={20} />
                    Downloaded!
                  </>
                ) : (
                  <>
                    <Download size={20} />
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
