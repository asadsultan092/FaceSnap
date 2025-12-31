
import React, { useRef, useState } from 'react';
import { Upload, FileVideo, ShieldCheck } from 'lucide-react';

interface VideoUploaderProps {
  onUpload: (file: File) => void;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({ onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('video/')) {
      onUpload(file);
    } else {
      alert("Please upload a valid video file.");
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  return (
    <div className="w-full max-w-2xl flex flex-col items-center">
      <div 
        className={`w-full aspect-[16/10] border-2 border-dashed rounded-3xl flex flex-col items-center justify-center p-8 transition-all cursor-pointer group
          ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className={`p-6 rounded-full transition-transform group-hover:scale-110 mb-4
          ${isDragging ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
          <Upload size={48} />
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">Upload your video</h3>
        <p className="text-slate-500 text-center mb-6">
          Drag and drop a video file here, or click to browse.<br/>
          Supports MP4, MOV, WebM, and more.
        </p>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-95">
          Choose Video
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="video/*"
          onChange={(e) => e.target.files && handleFile(e.target.files[0])}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full">
        <div className="flex flex-col items-center text-center">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg mb-3">
            <ShieldCheck size={24} />
          </div>
          <h4 className="font-medium text-slate-800">Private & Secure</h4>
          <p className="text-xs text-slate-500 mt-1">Processing happens locally in your browser.</p>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg mb-3">
            <FileVideo size={24} />
          </div>
          <h4 className="font-medium text-slate-800">HQ Extraction</h4>
          <p className="text-xs text-slate-500 mt-1">Get crystal clear face shots from 4K videos.</p>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="p-3 bg-violet-50 text-violet-600 rounded-lg mb-3">
            <Upload size={24} />
          </div>
          <h4 className="font-medium text-slate-800">Any Device</h4>
          <p className="text-xs text-slate-500 mt-1">Responsive design works on mobile and desktop.</p>
        </div>
      </div>
    </div>
  );
};

export default VideoUploader;
