import React, { useState } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, 
  Calendar, PenTool, Type, AlignJustify, Undo2, Redo2, Palette, PaintBucket,
  ChevronDown, Highlighter, List, ListOrdered, Indent, Outdent, Superscript, 
  Subscript, Eraser, Minus, FileText, Share2, Printer, Square, Sparkles, LayoutList, Plus, Save, Trash2, Check
} from 'lucide-react';
import { DocumentState, TextStylePreset } from '../types';

interface ToolbarProps {
  docState: DocumentState;
  onDocChange: (updates: Partial<DocumentState>) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const FONT_SIZES = [
  '8px', '9px', '10px', '11px', '12px', '14px', '16px', '18px', '20px', '22px', '24px', 
  '26px', '28px', '32px', '36px', '40px', '44px', '48px', '54px', '60px', '66px', '72px', '80px', '88px', '96px'
];

export const Toolbar: React.FC<ToolbarProps> = ({ docState, onDocChange, onUndo, onRedo, canUndo, canRedo }) => {
  const [activeTab, setActiveTab] = useState<'text' | 'paragraph' | 'effects' | 'insert'>('text');
  const [outlineColor, setOutlineColor] = useState('#000000');
  const [outlineWidth, setOutlineWidth] = useState('1px');
  const [currentColor, setCurrentColor] = useState('#0f172a');
  const [currentFontWeight, setCurrentFontWeight] = useState('400');
  const [currentFontFamily, setCurrentFontFamily] = useState(docState.fontFamily);
  const [currentFontSize, setCurrentFontSize] = useState(docState.fontSize);

  const QUICK_COLORS = [
    '#000000', '#ffffff', '#4f46e1', '#ef4444', '#10b981', '#f59e0b', '#6366f1', '#8b5cf6', '#ec4899'
  ];

  const execCommand = (command: string, value?: string) => {
    onDocChange({}); // Push current state to history before change
    document.execCommand(command, false, value);
  };

  const insertDate = () => {
    onDocChange({});
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    execCommand('insertHTML', `<span>${date}</span>`);
  };

  const insertSignature = () => {
    onDocChange({});
    const sig = `<div style="margin-top: 50px; border-top: 1px solid #000; width: 180px; padding-top: 5px; font-size: 0.9em; font-family: 'Inter', sans-serif;">Signature</div>`;
    execCommand('insertHTML', sig);
  };

  const handlePrint = () => {
    window.print();
  };

  const savePreset = () => {
    const name = prompt('Enter a name for this style preset:');
    if (!name) return;

    const newPreset: TextStylePreset = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      fontFamily: currentFontFamily,
      fontSize: currentFontSize,
      fontWeight: currentFontWeight,
      color: currentColor,
      outlineColor: outlineColor,
      outlineWidth: outlineWidth,
    };

    onDocChange({ presets: [...(docState.presets || []), newPreset] });
  };

  const applyPreset = (preset: TextStylePreset) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    
    if (selectedText) {
      onDocChange({}); // Push to history
      const style = `
        font-family: ${preset.fontFamily};
        font-size: ${preset.fontSize};
        font-weight: ${preset.fontWeight};
        color: ${preset.color};
        -webkit-text-stroke: ${preset.outlineWidth} ${preset.outlineColor};
      `.replace(/\s+/g, ' ').trim();
      
      const span = `<span style="${style}">${selectedText}</span>`;
      document.execCommand('insertHTML', false, span);
    }
  };

  const deletePreset = (id: string) => {
    if (confirm('Delete this preset?')) {
      onDocChange({ presets: (docState.presets || []).filter(p => p.id !== id) });
    }
  };

  const applyCustomStyle = (property: string, value: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    if (selectedText) {
      onDocChange({}); // Push to history
      const span = `<span style="${property}: ${value}">${selectedText}</span>`;
      document.execCommand('insertHTML', false, span);
    }
  };

  const LINE_HEIGHTS = ['1.0', '1.2', '1.4', '1.5', '1.6', '1.8', '2.0', '2.5', '3.0'];
  const LETTER_SPACINGS = ['-1', '-0.5', '0', '0.5', '1', '1.5', '2', '3', '4', '5'];
  const FONT_WEIGHTS = ['100', '200', '300', '400', '500', '600', '700', '800', '900'];
  const OUTLINE_WIDTHS = ['0px', '0.5px', '1px', '1.5px', '2px', '3px', '4px', '5px'];

  return (
    <div className="bg-white border-b border-slate-200 flex flex-col shadow-sm shrink-0 z-[400]">
      {/* Tab Navigation */}
      <div className="flex items-center px-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex bg-slate-100/50 rounded-t-lg p-1 gap-1 mt-1">
          <button 
            onClick={() => setActiveTab('text')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-t-md text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'text' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Type size={12} /> Text
          </button>
          <button 
            onClick={() => setActiveTab('paragraph')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-t-md text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'paragraph' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <LayoutList size={12} /> Paragraph
          </button>
          <button 
            onClick={() => setActiveTab('effects')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-t-md text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'effects' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Sparkles size={12} /> Effects
          </button>
          <button 
            onClick={() => setActiveTab('insert')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-t-md text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'insert' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Plus size={12} /> Insert
          </button>
        </div>
        
        <div className="flex-1" />

        {/* Global Actions (Always Visible) */}
        <div className="flex items-center gap-2 py-1">
          <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            <button onClick={onUndo} disabled={!canUndo} className={`flex flex-col items-center px-2 py-0.5 rounded ${canUndo ? 'hover:bg-white text-slate-700' : 'text-slate-300 opacity-50'}`} title="Undo">
              <Undo2 size={12}/>
              <span className="text-[8px] font-black uppercase">Undo</span>
            </button>
            <button onClick={onRedo} disabled={!canRedo} className={`flex flex-col items-center px-2 py-0.5 rounded ${canRedo ? 'hover:bg-white text-slate-700' : 'text-slate-300 opacity-50'}`} title="Redo">
              <Redo2 size={12}/>
              <span className="text-[8px] font-black uppercase">Redo</span>
            </button>
          </div>
          <button onClick={handlePrint} className="flex flex-col items-center px-2 py-1 hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 transition-all" title="Print">
            <Printer size={12} />
            <span className="text-[8px] font-black uppercase">Print</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 py-2 flex items-center gap-4 overflow-x-auto no-scrollbar min-h-[52px]">
        {activeTab === 'text' && (
          <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-200">
            {/* Font Family */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2 shrink-0">
              <Type size={14} className="text-slate-400" />
              <select 
                className="bg-transparent py-1.5 text-xs font-bold w-32 md:w-48 focus:outline-none cursor-pointer"
                value={currentFontFamily}
                onChange={(e) => {
                  setCurrentFontFamily(e.target.value);
                  onDocChange({ fontFamily: e.target.value });
                }}
              >
                <optgroup label="Bengali Fonts (বাংলা)">
                  <option value="'Hind Siliguri', sans-serif">Hind Siliguri</option>
                  <option value="'Noto Sans Bengali', sans-serif">Noto Sans Bengali</option>
                  <option value="'Anek Bangla', sans-serif">Anek Bangla</option>
                  <option value="'Mina', sans-serif">Mina</option>
                  <option value="'Atma', cursive">Atma</option>
                  <option value="'Galada', cursive">Galada</option>
                  <option value="'Tiro Bangla', serif">Tiro Bangla</option>
                  <option value="'Noto Serif Bengali', serif">Noto Serif Bengali</option>
                </optgroup>
                <optgroup label="English Fonts">
                  <option value="'Inter', sans-serif">Inter</option>
                  <option value="'Roboto', sans-serif">Roboto</option>
                  <option value="'Open Sans', sans-serif">Open Sans</option>
                  <option value="'Montserrat', sans-serif">Montserrat</option>
                  <option value="'Poppins', sans-serif">Poppins</option>
                  <option value="'Lato', sans-serif">Lato</option>
                  <option value="'Playfair Display', serif">Playfair Display</option>
                  <option value="'Merriweather', serif">Merriweather</option>
                  <option value="'Lora', serif">Lora</option>
                  <option value="'Ubuntu', sans-serif">Ubuntu</option>
                  <option value="'Oswald', sans-serif">Oswald</option>
                  <option value="'Raleway', sans-serif">Raleway</option>
                  <option value="'Nunito', sans-serif">Nunito</option>
                  <option value="'Source Sans Pro', sans-serif">Source Sans Pro</option>
                  <option value="'PT Sans', sans-serif">PT Sans</option>
                  <option value="'Josefin Sans', sans-serif">Josefin Sans</option>
                  <option value="'Quicksand', sans-serif">Quicksand</option>
                  <option value="'Bebas Neue', sans-serif">Bebas Neue</option>
                  <option value="'Anton', sans-serif">Anton</option>
                  <option value="'Kanit', sans-serif">Kanit</option>
                  <option value="'Cinzel', serif">Cinzel</option>
                  <option value="'Dancing Script', cursive">Dancing Script</option>
                  <option value="'Pacifico', cursive">Pacifico</option>
                  <option value="'Caveat', cursive">Caveat</option>
                  <option value="'Lobster', cursive">Lobster</option>
                </optgroup>
              </select>
            </div>

            {/* Font Size */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 shrink-0">
              <select 
                className="bg-transparent py-1.5 text-xs font-bold w-16 focus:outline-none cursor-pointer text-center"
                value={currentFontSize}
                onChange={(e) => {
                  setCurrentFontSize(e.target.value);
                  onDocChange({ fontSize: e.target.value });
                }}
                title="Global Font Size"
              >
                {FONT_SIZES.map(size => (
                  <option key={size} value={size}>{size.replace('px', '')}</option>
                ))}
              </select>
              <ChevronDown size={12} className="text-slate-400 pointer-events-none -ml-1 mr-1" />
            </div>

            {/* Font Weight */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 shrink-0">
              <span className="text-[10px] font-black text-slate-400 uppercase">W</span>
              <select 
                className="bg-transparent py-1.5 text-xs font-bold w-14 focus:outline-none cursor-pointer text-center"
                value={currentFontWeight}
                onChange={(e) => {
                  setCurrentFontWeight(e.target.value);
                  applyCustomStyle('font-weight', e.target.value);
                }}
                title="Selection Font Weight"
              >
                {FONT_WEIGHTS.map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            {/* Basic Formatting */}
            <div className="flex bg-slate-50 rounded-lg p-1 border border-slate-100 shrink-0 gap-0.5">
              <button onClick={() => execCommand('bold')} className="flex flex-col items-center px-2 py-1 hover:bg-white rounded transition-colors text-slate-700" title="Bold">
                <Bold size={14}/><span className="text-[9px] font-bold mt-0.5">Bold</span>
              </button>
              <button onClick={() => execCommand('italic')} className="flex flex-col items-center px-2 py-1 hover:bg-white rounded transition-colors text-slate-700" title="Italic">
                <Italic size={14}/><span className="text-[9px] font-bold mt-0.5">Italic</span>
              </button>
              <button onClick={() => execCommand('underline')} className="flex flex-col items-center px-2 py-1 hover:bg-white rounded transition-colors text-slate-700" title="Underline">
                <Underline size={14}/><span className="text-[9px] font-bold mt-0.5">Under</span>
              </button>
              <button onClick={() => execCommand('strikeThrough')} className="flex flex-col items-center px-2 py-1 hover:bg-white rounded transition-colors text-slate-700" title="Strikethrough">
                <Strikethrough size={14}/><span className="text-[9px] font-bold mt-0.5">Strike</span>
              </button>
              
              <div className="relative flex flex-col items-center px-2 py-1 hover:bg-white rounded transition-colors border-l border-slate-200 ml-1">
                <Palette size={14} className="text-slate-700" />
                <span className="text-[9px] font-bold mt-0.5">Color</span>
                <input 
                  type="color" 
                  value={currentColor}
                  onChange={(e) => {
                    setCurrentColor(e.target.value);
                    execCommand('foreColor', e.target.value);
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  title="Text Color"
                />
              </div>

              <div className="relative flex flex-col items-center px-2 py-1 hover:bg-white rounded transition-colors">
                <Highlighter size={14} className="text-slate-700" />
                <span className="text-[9px] font-bold mt-0.5">High</span>
                <input 
                  type="color" 
                  defaultValue="#ffff00"
                  onChange={(e) => execCommand('hiliteColor', e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  title="Text Highlight Color"
                />
              </div>

              <div className="relative flex flex-col items-center px-2 py-1 hover:bg-white rounded transition-colors border-l border-slate-200 ml-1">
                <PaintBucket size={14} className="text-slate-700" />
                <span className="text-[9px] font-bold mt-0.5">Page</span>
                <input 
                  type="color" 
                  value={docState.backgroundColor}
                  onChange={(e) => onDocChange({ backgroundColor: e.target.value })}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  title="Page Background Color"
                />
              </div>
            </div>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            {/* Global Text Color & Quick Swatches */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-1 shrink-0">
              <div className="relative flex items-center justify-center w-8 h-8 hover:bg-white rounded-md transition-colors border border-slate-200">
                <div 
                  className="w-4 h-4 rounded-full border border-slate-300 shadow-sm" 
                  style={{ backgroundColor: docState.fontColor }}
                />
                <input 
                  type="color" 
                  value={docState.fontColor}
                  onChange={(e) => onDocChange({ fontColor: e.target.value })}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  title="Global Text Color"
                />
              </div>
              <div className="flex items-center gap-1">
                {QUICK_COLORS.slice(0, 5).map(color => (
                  <button
                    key={color}
                    onClick={() => onDocChange({ fontColor: color })}
                    className="w-4 h-4 rounded-full border border-slate-200 hover:scale-110 transition-transform shadow-sm"
                    style={{ backgroundColor: color }}
                    title={`Set color to ${color}`}
                  />
                ))}
              </div>
            </div>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            {/* Presets Section */}
            <div className="flex items-center gap-2">
              <button 
                onClick={savePreset}
                className="flex items-center gap-1 px-2 py-1.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg text-[10px] font-black uppercase hover:bg-indigo-100 transition-all"
                title="Save Current Style as Preset"
              >
                <Save size={12} /> Save Style
              </button>
              
              <div className="flex items-center gap-1 max-w-[200px] overflow-x-auto no-scrollbar">
                {docState.presets?.map(preset => (
                  <div key={preset.id} className="group relative flex items-center shrink-0">
                    <button 
                      onClick={() => applyPreset(preset)}
                      className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:border-indigo-500 hover:text-indigo-600 transition-all truncate max-w-[80px]"
                      title={`Apply ${preset.name}`}
                    >
                      {preset.name}
                    </button>
                    <button 
                      onClick={() => deletePreset(preset.id)}
                      className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={8} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'paragraph' && (
          <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-2 duration-200">
            {/* Alignment */}
            <div className="flex bg-slate-50 rounded-lg p-1 border border-slate-100 shrink-0 gap-0.5">
              <button onClick={() => execCommand('justifyLeft')} className="flex flex-col items-center px-2 py-1 hover:bg-white rounded transition-colors text-slate-700" title="Left">
                <AlignLeft size={14}/><span className="text-[9px] font-bold mt-0.5">Left</span>
              </button>
              <button onClick={() => execCommand('justifyCenter')} className="flex flex-col items-center px-2 py-1 hover:bg-white rounded transition-colors text-slate-700" title="Center">
                <AlignCenter size={14}/><span className="text-[9px] font-bold mt-0.5">Center</span>
              </button>
              <button onClick={() => execCommand('justifyRight')} className="flex flex-col items-center px-2 py-1 hover:bg-white rounded transition-colors text-slate-700" title="Right">
                <AlignRight size={14}/><span className="text-[9px] font-bold mt-0.5">Right</span>
              </button>
              <button onClick={() => execCommand('justifyFull')} className="flex flex-col items-center px-2 py-1 hover:bg-white rounded transition-colors text-slate-700" title="Justify">
                <AlignJustify size={14}/><span className="text-[9px] font-bold mt-0.5">Full</span>
              </button>
            </div>

            {/* Lists & Indent */}
            <div className="flex bg-slate-50 rounded-lg p-1 border border-slate-100 shrink-0 gap-0.5">
              <button onClick={() => execCommand('insertUnorderedList')} className="flex flex-col items-center px-2 py-1 hover:bg-white rounded transition-colors text-slate-700" title="Bullet List">
                <List size={14}/><span className="text-[9px] font-bold mt-0.5">Bullet</span>
              </button>
              <button onClick={() => execCommand('insertOrderedList')} className="flex flex-col items-center px-2 py-1 hover:bg-white rounded transition-colors text-slate-700" title="Numbered List">
                <ListOrdered size={14}/><span className="text-[9px] font-bold mt-0.5">Num</span>
              </button>
              <button onClick={() => execCommand('indent')} className="flex flex-col items-center px-2 py-1 hover:bg-white rounded transition-colors text-slate-700 border-l border-slate-200 ml-1" title="Indent">
                <Indent size={14}/><span className="text-[9px] font-bold mt-0.5">Indent</span>
              </button>
              <button onClick={() => execCommand('outdent')} className="flex flex-col items-center px-2 py-1 hover:bg-white rounded transition-colors text-slate-700" title="Outdent">
                <Outdent size={14}/><span className="text-[9px] font-bold mt-0.5">Out</span>
              </button>
            </div>

            {/* Spacing */}
            <div className="flex bg-slate-50 rounded-lg p-1 border border-slate-100 shrink-0 gap-1">
              <div className="flex items-center gap-1 px-1 border-r border-slate-200">
                <span className="text-[10px] font-black text-slate-400 uppercase">LH</span>
                <select 
                  className="bg-transparent text-[10px] font-bold focus:outline-none cursor-pointer"
                  value={docState.lineHeight}
                  onChange={(e) => onDocChange({ lineHeight: e.target.value })}
                  title="Line Height"
                >
                  {LINE_HEIGHTS.map(lh => <option key={lh} value={lh}>{lh}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-1 px-1">
                <span className="text-[10px] font-black text-slate-400 uppercase">LS</span>
                <select 
                  className="bg-transparent text-[10px] font-bold focus:outline-none cursor-pointer"
                  value={docState.letterSpacing}
                  onChange={(e) => onDocChange({ letterSpacing: e.target.value })}
                  title="Letter Spacing"
                >
                  {LETTER_SPACINGS.map(ls => <option key={ls} value={ls}>{ls}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'effects' && (
          <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-2 duration-200">
            {/* Text Case */}
            <div className="flex bg-slate-50 rounded-lg p-1 border border-slate-100 shrink-0 gap-1">
              <button onClick={() => applyCustomStyle('text-transform', 'uppercase')} className="flex flex-col items-center px-2 py-1 hover:bg-white rounded transition-colors text-slate-700" title="UPPERCASE">
                <span className="text-[11px] font-black">AA</span>
                <span className="text-[9px] font-bold mt-0.5">Upper</span>
              </button>
              <button onClick={() => applyCustomStyle('text-transform', 'lowercase')} className="flex flex-col items-center px-2 py-1 hover:bg-white rounded transition-colors text-slate-700" title="lowercase">
                <span className="text-[11px] font-black">aa</span>
                <span className="text-[9px] font-bold mt-0.5">Lower</span>
              </button>
              <button onClick={() => applyCustomStyle('text-transform', 'capitalize')} className="flex flex-col items-center px-2 py-1 hover:bg-white rounded transition-colors text-slate-700" title="Capitalize">
                <span className="text-[11px] font-black">Aa</span>
                <span className="text-[9px] font-bold mt-0.5">Cap</span>
              </button>
            </div>

            {/* Text Outline */}
            <div className="flex bg-slate-50 rounded-lg p-1 border border-slate-100 shrink-0 gap-1 items-center">
              <div className="relative flex flex-col items-center px-2 py-1 hover:bg-white rounded transition-colors">
                <Square size={14} className="text-slate-700" />
                <span className="text-[9px] font-bold mt-0.5">Stroke</span>
                <input 
                  type="color" 
                  value={outlineColor}
                  onChange={(e) => {
                    setOutlineColor(e.target.value);
                    applyCustomStyle('-webkit-text-stroke', `${outlineWidth} ${e.target.value}`);
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  title="Outline Color"
                />
              </div>
              <div className="flex flex-col items-center px-1">
                <span className="text-[8px] font-black text-slate-400 uppercase">Width</span>
                <select 
                  className="bg-transparent text-[10px] font-bold focus:outline-none cursor-pointer w-12"
                  value={outlineWidth}
                  onChange={(e) => {
                    setOutlineWidth(e.target.value);
                    applyCustomStyle('-webkit-text-stroke', `${e.target.value} ${outlineColor}`);
                  }}
                  title="Outline Width"
                >
                  {OUTLINE_WIDTHS.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
            </div>

            {/* Scripts & Clean */}
            <div className="flex bg-slate-50 rounded-lg p-1 border border-slate-100 shrink-0 gap-0.5">
              <button onClick={() => execCommand('superscript')} className="flex flex-col items-center px-2 py-1 hover:bg-white rounded transition-colors text-slate-700" title="Superscript">
                <Superscript size={14}/><span className="text-[9px] font-bold mt-0.5">Super</span>
              </button>
              <button onClick={() => execCommand('subscript')} className="flex flex-col items-center px-2 py-1 hover:bg-white rounded transition-colors text-slate-700" title="Subscript">
                <Subscript size={14}/><span className="text-[9px] font-bold mt-0.5">Sub</span>
              </button>
              <button onClick={() => execCommand('removeFormat')} className="flex flex-col items-center px-2 py-1 hover:bg-white rounded transition-colors text-slate-700 border-l border-slate-200 ml-1" title="Clear Formatting">
                <Eraser size={14}/><span className="text-[9px] font-bold mt-0.5">Clear</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'insert' && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
            <button onClick={insertDate} className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600">
              <Calendar size={14} /> Date
            </button>
            <button onClick={insertSignature} className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600">
              <PenTool size={14} /> Signature
            </button>
            <button onClick={() => execCommand('insertHorizontalRule')} className="flex items-center justify-center w-9 h-8 hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-600" title="Horizontal Line">
              <Minus size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};