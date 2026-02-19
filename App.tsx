
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Toolbar } from './components/Toolbar';
import { Editor } from './components/Editor';
import { Sidebar } from './components/Sidebar';
import { DocumentState } from './types';
import { generateHighQualityImage } from './services/imageService';
import { Image, Menu, Eye, EyeOff, Pencil, CheckCircle2, CloudUpload, Share2, RotateCcw, HelpCircle } from 'lucide-react';

const STORAGE_KEY = 'anik_tools_v9_autosave';
const MAX_HISTORY = 50;

const DEFAULT_STATE: DocumentState = {
  title: 'Welcome_to_Anik_Studio',
  content: `
    <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #4f46e1; padding-bottom: 15px;">
      <h1 style="font-size: 42px; font-weight: 900; color: #1e1b4b; margin-bottom: 5px; letter-spacing: -1px;">Welcome to Anik Studio</h1>
      <p style="font-size: 16px; font-weight: 700; color: #4f46e1; text-transform: uppercase; letter-spacing: 3px;">The Ultimate Ultra-HD Design Tool</p>
    </div>

    <div style="margin-bottom: 25px; line-height: 1.6; text-align: justify;">
      <h2 style="font-size: 24px; font-weight: 800; color: #1e293b; margin-bottom: 10px;">✨ Create Without Limits</h2>
      <p>Hello! I am <b>Md Anik Hossain</b>, from <b>Bangladesh</b>. I built this studio to empower creators with high-precision typography and layout tools. Whether you are designing professional documents, social media graphics, or personal letters, Anik Studio provides the flexibility of a canvas with the power of a rich text editor.</p>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
      <div style="background-color: #f1f5f9; padding: 15px; border-radius: 12px; border-top: 4px solid #4f46e1;">
        <h3 style="font-size: 16px; font-weight: 800; color: #1e293b; margin-bottom: 8px;">🚀 Core Features</h3>
        <ul style="margin-left: 15px; font-size: 13px; color: #475569; padding: 0;">
          <li><b>Floating Assets:</b> Drag & drop text/images anywhere.</li>
          <li><b>Live Manipulation:</b> Resize and rotate in real-time.</li>
          <li><b>Ultra-HD Export:</b> 5x resolution PNG downloads.</li>
        </ul>
      </div>
      <div style="background-color: #f1f5f9; padding: 15px; border-radius: 12px; border-top: 4px solid #10b981;">
        <h3 style="font-size: 16px; font-weight: 800; color: #1e293b; margin-bottom: 8px;">🎨 Design Control</h3>
        <ul style="margin-left: 15px; font-size: 13px; color: #475569; padding: 0;">
          <li><b>Pro Typography:</b> 30+ fonts in Bengali & English.</li>
          <li><b>Advanced Effects:</b> Text outlines, weights, and cases.</li>
          <li><b>Global Styles:</b> Line height and letter spacing.</li>
        </ul>
      </div>
    </div>

    <div style="background-color: #4f46e1; color: white; padding: 20px; border-radius: 15px; text-align: center; margin-bottom: 25px;">
      <h3 style="font-size: 20px; font-weight: 800; margin-bottom: 5px;">Ready to start your first design?</h3>
      <p style="font-size: 14px; opacity: 0.9;">Use the toolbar above to explore all the professional features!</p>
    </div>

    <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center;">
      <p style="font-size: 13px; color: #64748b; margin: 0;">Created with ❤️ by <b>Md Anik Hossain</b></p>
      <p style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Bangladesh | anikhossain333877@gmail.com</p>
    </div>
  `,
  fontSize: '16px',
  fontColor: '#0f172a',
  backgroundColor: '#ffffff',
  fontFamily: "'Inter', sans-serif",
  lineHeight: '1.5',
  letterSpacing: '0',
  margin: 20,
  pageSize: 'a4',
  orientation: 'portrait',
  elements: [
    {
      id: 'badge-1',
      type: 'text',
      content: '<div style="background: #fbbf24; color: #000; padding: 10px 20px; border-radius: 50px; font-weight: 900; font-size: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">NEW VERSION 1.0</div>',
      x: 550,
      y: 50,
      width: 160,
      height: 40,
      rotation: 15,
      opacity: 100,
      zIndex: 100,
    }
  ],
  presets: [],
  watermark: {
    text: 'ANIK TOOLS',
    opacity: 10,
    rotation: -45,
    fontSize: 100,
    enabled: false
  }
};

export const App: React.FC = () => {
  const [docState, setDocState] = useState<DocumentState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_STATE;
  });

  const [history, setHistory] = useState<DocumentState[]>([]);
  const [redoStack, setRedoStack] = useState<DocumentState[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [canvasScale, setCanvasScale] = useState(1);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSaveStatus('saving');
    const saveToStorage = () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(docState));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    };
    const timeout = setTimeout(saveToStorage, 1000);
    return () => clearTimeout(timeout);
  }, [docState]);

  useEffect(() => {
    const handleResize = () => {
      if (workspaceRef.current) {
        const padding = window.innerWidth < 640 ? 40 : 120;
        const workspaceWidth = workspaceRef.current.clientWidth - padding;
        const pageMM = docState.orientation === 'portrait' 
          ? (docState.pageSize === 'a4' ? 210 : 216) 
          : (docState.pageSize === 'a4' ? 297 : 356);
        const pagePx = pageMM * 3.7795275591; 
        const scale = Math.min(1, workspaceWidth / pagePx);
        setCanvasScale(scale);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [docState.pageSize, docState.orientation, sidebarOpen]);

  const handleDocChange = useCallback((updates: Partial<DocumentState>, pushToHistory = false) => {
    if (pushToHistory) {
      setHistory(h => [...h.slice(-(MAX_HISTORY - 1)), docState]);
      setRedoStack([]);
    }
    setDocState(prev => ({ ...prev, ...updates }));
  }, [docState]);

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const previousState = history[history.length - 1];
    setRedoStack(r => [...r, docState]);
    setHistory(h => h.slice(0, -1));
    setDocState(previousState);
  }, [history, docState]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const nextState = redoStack[redoStack.length - 1];
    setHistory(h => [...h, docState]);
    setRedoStack(r => r.slice(0, -1));
    setDocState(nextState);
  }, [redoStack, docState]);

  const handleDownload = async () => {
    if (!editorRef.current) return;
    setIsExporting(true);
    setSelectedElementId(null);
    setTimeout(async () => {
      try {
        await generateHighQualityImage(editorRef.current!, docState.title);
      } catch (error) {
        alert('Export failed. Please try again.');
      } finally {
        setIsExporting(false);
      }
    }, 400);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset the document? All changes will be lost.')) {
      setDocState(DEFAULT_STATE);
      setHistory([]);
      setRedoStack([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Project link copied to clipboard!');
  };

  const handleHelp = () => {
    alert('Anik Tools Studio Help:\n\n- Use the toolbar to format text.\n- Drag and drop elements to move them.\n- Use the sidebar to add new text boxes or images.\n- Export your design as Ultra-HD PNG using the button in the header.');
  };

  return (
    <div className="flex flex-col h-screen bg-[#f1f5f9] text-slate-900 overflow-hidden relative">
      {!isPreviewMode && (
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm z-[500] shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl lg:hidden transition-all active:scale-90">
              <Menu size={24}/>
            </button>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-700 to-indigo-500 p-2.5 rounded-2xl text-white shadow-xl flex items-center justify-center">
                <Pencil size={22} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <input 
                  type="text" 
                  value={docState.title}
                  onChange={(e) => handleDocChange({ title: e.target.value })}
                  className="text-lg font-black text-slate-900 tracking-tight leading-none bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-indigo-100 rounded px-1 -ml-1"
                />
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-[9px] font-extrabold text-indigo-500 uppercase tracking-widest">Anik Studio Pro</p>
                  {saveStatus === 'saving' && <CloudUpload size={10} className="text-indigo-400 animate-pulse" />}
                  {saveStatus === 'saved' && <CheckCircle2 size={10} className="text-emerald-500" />}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleHelp} className="flex flex-col items-center gap-1 px-2 py-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all" title="Help">
              <HelpCircle size={18} />
              <span className="text-[9px] font-black uppercase">Help</span>
            </button>
            <button onClick={handleShare} className="flex flex-col items-center gap-1 px-2 py-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all" title="Share Project">
              <Share2 size={18} />
              <span className="text-[9px] font-black uppercase">Share</span>
            </button>
            <button onClick={handleReset} className="flex flex-col items-center gap-1 px-2 py-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all" title="Reset Document">
              <RotateCcw size={18} />
              <span className="text-[9px] font-black uppercase text-rose-500">Reset</span>
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1" />
            <button onClick={() => setIsPreviewMode(true)} className="hidden sm:flex flex-col items-center gap-1 px-3 py-1 text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all">
              <Eye size={18} /> <span className="text-[9px] font-black uppercase">Preview</span>
            </button>
            <button onClick={handleDownload} disabled={isExporting} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black shadow-2xl disabled:opacity-50 transition-all hover:bg-indigo-700 active:scale-95">
              {isExporting ? <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div> : <Image size={20} />}
              <span className="text-sm">{isExporting ? 'Processing...' : 'Export PNG'}</span>
            </button>
          </div>
        </header>
      )}

      {isPreviewMode && (
        <button onClick={() => setIsPreviewMode(false)} className="fixed top-8 right-8 z-[10000] bg-slate-900 text-white px-8 py-4 rounded-3xl shadow-2xl hover:bg-black flex items-center gap-2 transition-all font-black uppercase tracking-widest text-xs">
          <EyeOff size={18} /> <span>Back to Editor</span>
        </button>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {!isPreviewMode && (
            <Toolbar 
              docState={docState} 
              onDocChange={(u) => handleDocChange(u, true)} 
              onUndo={handleUndo} 
              onRedo={handleRedo} 
              canUndo={history.length > 0} 
              canRedo={redoStack.length > 0} 
            />
          )}
          <div 
            ref={workspaceRef} 
            className="flex-1 overflow-auto p-4 md:p-16 custom-scrollbar bg-[#f1f5f9]"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setSelectedElementId(null);
            }}
          >
            <div className="max-w-fit mx-auto">
              <Editor 
                ref={editorRef}
                docState={docState}
                onContentChange={(content) => handleDocChange({ content }, false)}
                onElementsChange={(elements) => handleDocChange({ elements }, false)}
                onElementsCommit={(elements) => handleDocChange({ elements }, true)}
                scale={canvasScale}
                selectedElementId={selectedElementId}
                setSelectedElementId={setSelectedElementId}
              />
            </div>
          </div>
        </main>
        {!isPreviewMode && (
          <>
            <div className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9998] lg:hidden transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setSidebarOpen(false)} />
            <div className={`fixed lg:relative top-0 right-0 h-full bg-white z-[9999] transition-transform duration-500 border-l border-slate-200 ${sidebarOpen ? 'w-[320px] md:w-80 translate-x-0' : 'w-0 lg:w-0 translate-x-full lg:translate-x-0 overflow-hidden'}`}>
              <Sidebar 
                docState={docState} 
                onDocChange={(u) => handleDocChange(u, true)} 
                onClose={() => setSidebarOpen(false)} 
                selectedElementId={selectedElementId}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
