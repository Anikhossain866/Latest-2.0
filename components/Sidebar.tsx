
import React from 'react';
import { DocumentState, FloatingElement } from '../types';
import { 
  Settings, 
  Layout, 
  X, 
  Ruler, 
  Type, 
  Plus, 
  Box, 
  Image as ImageBtn, 
  Sliders, 
  Layers, 
  Sun, 
  Contrast, 
  Sparkles, 
  Eye, 
  TextCursorInput,
  Mail,
  MapPin,
  User,
  RectangleHorizontal,
  RectangleVertical,
  Stamp,
  RotateCw,
  Type as TypeIcon,
  Scissors,
  Maximize,
  Move as MoveIcon,
  Table as TableIcon,
  Grid,
  PlusSquare,
  MinusSquare,
  Columns,
  Rows
} from 'lucide-react';

interface SidebarProps {
  docState: DocumentState;
  onDocChange: (updates: Partial<DocumentState>) => void;
  onClose?: () => void;
  selectedElementId: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ docState, onDocChange, onClose, selectedElementId }) => {
  const selectedElement = docState.elements.find(el => el.id === selectedElementId);

  const updateSelectedElement = (updates: Partial<FloatingElement>) => {
    if (!selectedElementId) return;
    const newElements = docState.elements.map(el => 
      el.id === selectedElementId ? { ...el, ...updates } : el
    );
    onDocChange({ elements: newElements });
  };

  const addTextBox = () => {
    const newBox: FloatingElement = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'text',
      content: 'New Dynamic Text Box',
      x: 100,
      y: 100,
      width: 250,
      height: 80,
      rotation: 0,
      opacity: 100,
      zIndex: docState.elements.length + 1,
    };
    onDocChange({ elements: [...docState.elements, newBox] });
  };

  const addImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (re) => {
          const newImg: FloatingElement = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'image',
            content: re.target?.result as string,
            x: 150,
            y: 200,
            width: 300,
            height: 200,
            rotation: 0,
            opacity: 100,
            zIndex: docState.elements.length + 1,
            filters: {
              brightness: 100,
              contrast: 100,
              grayscale: 0,
              sepia: 0,
              blur: 0,
              saturate: 100,
              hueRotate: 0,
              invert: 0
            }
          };
          onDocChange({ elements: [...docState.elements, newImg] });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const addTable = () => {
    const newTable: FloatingElement = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'table',
      content: '',
      x: 100,
      y: 100,
      width: 400,
      height: 120,
      rotation: 0,
      opacity: 100,
      zIndex: docState.elements.length + 1,
      tableData: {
        rows: [
          { id: 'r1', cells: [{ id: 'c1-1', content: 'Header 1' }, { id: 'c1-2', content: 'Header 2' }] },
          { id: 'r2', cells: [{ id: 'c2-1', content: 'Data 1' }, { id: 'c2-2', content: 'Data 2' }] }
        ],
        columnWidths: [200, 200],
        rowHeights: [60, 60]
      }
    };
    onDocChange({ elements: [...docState.elements, newTable] });
  };

  const handleTableAction = (action: 'addRowStart' | 'addRowEnd' | 'addColStart' | 'addColEnd' | 'removeRow' | 'removeCol') => {
    if (!selectedElement || selectedElement.type !== 'table' || !selectedElement.tableData) return;
    const { rows, columnWidths, rowHeights } = selectedElement.tableData;
    
    let newRows = [...rows];
    let newColWidths = [...columnWidths];
    let newRowHeights = [...rowHeights];

    if (action === 'addRowEnd' || action === 'addRowStart') {
      const newRowId = Math.random().toString(36).substr(2, 9);
      const newCells = newColWidths.map((_, i) => ({ id: `${newRowId}-${i}`, content: '' }));
      const newRow = { id: newRowId, cells: newCells };
      if (action === 'addRowStart') {
        newRows.unshift(newRow);
        newRowHeights.unshift(60);
      } else {
        newRows.push(newRow);
        newRowHeights.push(60);
      }
    } else if (action === 'addColEnd' || action === 'addColStart') {
      if (action === 'addColStart') {
        newColWidths.unshift(150);
        newRows = newRows.map(row => ({
          ...row,
          cells: [{ id: Math.random().toString(36).substr(2, 9), content: '' }, ...row.cells]
        }));
      } else {
        newColWidths.push(150);
        newRows = newRows.map(row => ({
          ...row,
          cells: [...row.cells, { id: Math.random().toString(36).substr(2, 9), content: '' }]
        }));
      }
    } else if (action === 'removeRow' && newRows.length > 1) {
      newRows.pop();
      newRowHeights.pop();
    } else if (action === 'removeCol' && newColWidths.length > 1) {
      newColWidths.pop();
      newRows = newRows.map(row => ({
        ...row,
        cells: row.cells.slice(0, -1)
      }));
    }

    const newWidth = newColWidths.reduce((a, b) => a + b, 0);
    const newHeight = newRowHeights.reduce((a, b) => a + b, 0);

    updateSelectedElement({
      tableData: { rows: newRows, columnWidths: newColWidths, rowHeights: newRowHeights },
      width: newWidth,
      height: newHeight
    });
  };

  const handleCellChange = (rowIndex: number, colIndex: number, content: string) => {
    if (!selectedElement || selectedElement.type !== 'table' || !selectedElement.tableData) return;
    const newRows = [...selectedElement.tableData.rows];
    newRows[rowIndex].cells[colIndex].content = content;
    updateSelectedElement({
      tableData: { ...selectedElement.tableData, rows: newRows }
    });
  };

  const handleTableSizeChange = (type: 'col' | 'row', index: number, value: number) => {
    if (!selectedElement || selectedElement.type !== 'table' || !selectedElement.tableData) return;
    const { columnWidths, rowHeights } = selectedElement.tableData;
    
    if (type === 'col') {
      const newWidths = [...columnWidths];
      newWidths[index] = Math.max(20, value);
      const totalWidth = newWidths.reduce((a, b) => a + b, 0);
      updateSelectedElement({
        tableData: { ...selectedElement.tableData, columnWidths: newWidths },
        width: totalWidth
      });
    } else {
      const newHeights = [...rowHeights];
      newHeights[index] = Math.max(20, value);
      const totalHeight = newHeights.reduce((a, b) => a + b, 0);
      updateSelectedElement({
        tableData: { ...selectedElement.tableData, rowHeights: newHeights },
        height: totalHeight
      });
    }
  };

  const handleFilterChange = (filterName: string, value: number) => {
    if (!selectedElement || selectedElement.type !== 'image') return;
    updateSelectedElement({
      filters: {
        ...selectedElement.filters!,
        [filterName]: value
      }
    });
  };

  const updateWatermark = (updates: Partial<typeof docState.watermark>) => {
    onDocChange({
      watermark: {
        ...docState.watermark!,
        ...updates
      }
    });
  };

  return (
    <aside className="h-full flex flex-col bg-white overflow-hidden shadow-2xl select-none">
      <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-100">
            <Settings size={18} />
          </div>
          <h3 className="font-black text-sm text-slate-800 uppercase tracking-tight">Design Studio</h3>
        </div>
        <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-indigo-600 border border-slate-200 rounded-xl bg-white transition-all active:scale-95"><X size={20}/></button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        
        {/* CONTEXTUAL EDITOR SECTION */}
        {selectedElement ? (
          <section className="p-6 border-b border-indigo-50 bg-indigo-50/30 space-y-6 animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 bg-indigo-600 rounded-full" />
              <label className="text-[11px] font-black text-indigo-900 uppercase tracking-widest flex items-center gap-2">
                <Sliders size={14} className="text-indigo-600" /> Active Element
              </label>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                    <span className="flex items-center gap-1"><Eye size={10}/> Opacity</span>
                    <span>{selectedElement.opacity}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={selectedElement.opacity} onChange={(e) => updateSelectedElement({ opacity: parseInt(e.target.value) })} className="w-full accent-indigo-600 h-1.5" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                    <span className="flex items-center gap-1"><Layers size={10}/> Depth</span>
                    <span>Z:{selectedElement.zIndex}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => updateSelectedElement({ zIndex: Math.max(0, selectedElement.zIndex - 1) })} className="flex-1 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black shadow-sm flex flex-col items-center">
                      <span>-</span>
                      <span className="text-[8px] uppercase text-slate-400">Back</span>
                    </button>
                    <button onClick={() => updateSelectedElement({ zIndex: selectedElement.zIndex + 1 })} className="flex-1 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black shadow-sm flex flex-col items-center">
                      <span>+</span>
                      <span className="text-[8px] uppercase text-slate-400">Front</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Position & Size Controls */}
              <div className="space-y-4 pt-4 border-t border-indigo-100">
                <div className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1">
                  <MoveIcon size={10} /> Transform
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase">X Position</span>
                    <input 
                      type="number" 
                      value={Math.round(selectedElement.x)} 
                      onChange={(e) => updateSelectedElement({ x: parseInt(e.target.value) || 0 })}
                      className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-[10px] font-bold focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase">Y Position</span>
                    <input 
                      type="number" 
                      value={Math.round(selectedElement.y)} 
                      onChange={(e) => updateSelectedElement({ y: parseInt(e.target.value) || 0 })}
                      className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-[10px] font-bold focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase">Width (px)</span>
                    <input 
                      type="number" 
                      value={Math.round(selectedElement.width)} 
                      onChange={(e) => updateSelectedElement({ width: parseInt(e.target.value) || 20 })}
                      className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-[10px] font-bold focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase">Height (px)</span>
                    <input 
                      type="number" 
                      value={Math.round(selectedElement.height)} 
                      onChange={(e) => updateSelectedElement({ height: parseInt(e.target.value) || 20 })}
                      className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-[10px] font-bold focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {selectedElement.type === 'image' && (
                <div className="space-y-4 pt-4 border-t border-indigo-100">
                  <div className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1">
                    <Scissors size={10} /> Crop & Fit
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(['cover', 'contain', 'fill'] as const).map(fit => (
                      <button
                        key={fit}
                        onClick={() => updateSelectedElement({ objectFit: fit })}
                        className={`py-2 px-1 border rounded-xl text-[9px] font-black uppercase transition-all ${selectedElement.objectFit === fit ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                      >
                        {fit}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedElement.type === 'table' && selectedElement.tableData && (
                <div className="space-y-4 pt-4 border-t border-indigo-100">
                  <div className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1">
                    <Grid size={10} /> Table Management
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handleTableAction('addRowStart')} className="flex items-center justify-center gap-2 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black hover:bg-indigo-50 hover:border-indigo-200 transition-all">
                      <Rows size={12} /> Row Above
                    </button>
                    <button onClick={() => handleTableAction('addRowEnd')} className="flex items-center justify-center gap-2 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black hover:bg-indigo-50 hover:border-indigo-200 transition-all">
                      <Rows size={12} /> Row Below
                    </button>
                    <button onClick={() => handleTableAction('addColStart')} className="flex items-center justify-center gap-2 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black hover:bg-indigo-50 hover:border-indigo-200 transition-all">
                      <Columns size={12} /> Col Left
                    </button>
                    <button onClick={() => handleTableAction('addColEnd')} className="flex items-center justify-center gap-2 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black hover:bg-indigo-50 hover:border-indigo-200 transition-all">
                      <Columns size={12} /> Col Right
                    </button>
                    <button onClick={() => handleTableAction('removeRow')} className="flex items-center justify-center gap-2 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black hover:bg-rose-50 hover:border-rose-200 text-rose-600 transition-all">
                      <MinusSquare size={12} /> Del Row
                    </button>
                    <button onClick={() => handleTableAction('removeCol')} className="flex items-center justify-center gap-2 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black hover:bg-rose-50 hover:border-rose-200 text-rose-600 transition-all">
                      <MinusSquare size={12} /> Del Col
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="text-[9px] font-black text-slate-400 uppercase">Column Widths</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedElement.tableData.columnWidths.map((w, i) => (
                        <div key={i} className="flex flex-col gap-1">
                          <span className="text-[8px] font-bold text-slate-400">Col {i+1}</span>
                          <input 
                            type="number" 
                            value={w} 
                            onChange={(e) => handleTableSizeChange('col', i, parseInt(e.target.value) || 0)}
                            className="w-16 bg-white border border-slate-200 rounded-lg p-1 text-[10px] font-bold outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-[9px] font-black text-slate-400 uppercase">Row Heights</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedElement.tableData.rowHeights.map((h, i) => (
                        <div key={i} className="flex flex-col gap-1">
                          <span className="text-[8px] font-bold text-slate-400">Row {i+1}</span>
                          <input 
                            type="number" 
                            value={h} 
                            onChange={(e) => handleTableSizeChange('row', i, parseInt(e.target.value) || 0)}
                            className="w-16 bg-white border border-slate-200 rounded-lg p-1 text-[10px] font-bold outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div className="text-[9px] font-black text-slate-400 uppercase">Table Styling</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase">Font Size</span>
                        <input 
                          type="text" 
                          value={selectedElement.fontSize || '12px'} 
                          onChange={(e) => updateSelectedElement({ fontSize: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-[10px] font-bold outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase">Font Family</span>
                        <select 
                          className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-[10px] font-bold outline-none"
                          value={selectedElement.fontFamily || docState.fontFamily}
                          onChange={(e) => updateSelectedElement({ fontFamily: e.target.value })}
                        >
                          <option value="'Inter', sans-serif">Inter</option>
                          <option value="'Noto Sans Bengali', sans-serif">Bengali</option>
                          <option value="'JetBrains Mono', monospace">Mono</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div className="text-[9px] font-black text-slate-400 uppercase">Cell Content Editor</div>
                    <div className="max-h-40 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                      {selectedElement.tableData.rows.map((row, ri) => (
                        <div key={row.id} className="grid grid-cols-2 gap-2">
                          {row.cells.map((cell, ci) => (
                            <input 
                              key={cell.id}
                              value={cell.content}
                              placeholder={`R${ri+1} C${ci+1}`}
                              onChange={(e) => handleCellChange(ri, ci, e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-[10px] font-medium outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {selectedElement.type === 'text' && (
                <div className="space-y-4 pt-4 border-t border-indigo-100">
                  <div className="space-y-2">
                    <div className="text-[10px] font-black text-slate-500 uppercase">Text Styling</div>
                    <select 
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={selectedElement.fontFamily}
                      onChange={(e) => updateSelectedElement({ fontFamily: e.target.value })}
                    >
                      <option value="'Inter', sans-serif">Inter</option>
                      <option value="'Noto Sans Bengali', sans-serif">Noto Sans Bengali</option>
                      <option value="'Hind Siliguri', sans-serif">Hind Siliguri</option>
                      <option value="'Lobster', cursive">Lobster</option>
                    </select>
                  </div>
                </div>
              )}

              {selectedElement.type === 'image' && (
                <div className="space-y-4 pt-4 border-t border-indigo-100">
                  <div className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1">
                    <Sparkles size={10} /> Image Filters
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase">Bright</span>
                      <input type="range" min="0" max="200" value={selectedElement.filters?.brightness} onChange={(e) => handleFilterChange('brightness', parseInt(e.target.value))} className="w-full h-1" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase">Contrast</span>
                      <input type="range" min="0" max="200" value={selectedElement.filters?.contrast} onChange={(e) => handleFilterChange('contrast', parseInt(e.target.value))} className="w-full h-1" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase">Grayscale</span>
                      <input type="range" min="0" max="100" value={selectedElement.filters?.grayscale} onChange={(e) => handleFilterChange('grayscale', parseInt(e.target.value))} className="w-full h-1" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase">Sepia</span>
                      <input type="range" min="0" max="100" value={selectedElement.filters?.sepia} onChange={(e) => handleFilterChange('sepia', parseInt(e.target.value))} className="w-full h-1" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase">Saturate</span>
                      <input type="range" min="0" max="200" value={selectedElement.filters?.saturate} onChange={(e) => handleFilterChange('saturate', parseInt(e.target.value))} className="w-full h-1" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase">Hue Rotate</span>
                      <input type="range" min="0" max="360" value={selectedElement.filters?.hueRotate} onChange={(e) => handleFilterChange('hueRotate', parseInt(e.target.value))} className="w-full h-1" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase">Invert</span>
                      <input type="range" min="0" max="100" value={selectedElement.filters?.invert} onChange={(e) => handleFilterChange('invert', parseInt(e.target.value))} className="w-full h-1" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase">Blur</span>
                      <input type="range" min="0" max="20" value={selectedElement.filters?.blur} onChange={(e) => handleFilterChange('blur', parseInt(e.target.value))} className="w-full h-1" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        ) : (
          <section className="p-6 border-b border-slate-50 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-4 bg-purple-500 rounded-full" />
              <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Plus size={14} className="text-purple-500" /> Insert Objects
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={addTextBox}
                className="flex flex-col items-center gap-2 p-5 border border-slate-200 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 transition-all group bg-white shadow-sm active:scale-95"
              >
                <Box size={28} className="text-slate-400 group-hover:text-indigo-600" />
                <span className="text-xs font-black text-slate-600 group-hover:text-indigo-900 uppercase">Text Box</span>
              </button>
              <button 
                onClick={addImage}
                className="flex flex-col items-center gap-2 p-5 border border-slate-200 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 transition-all group bg-white shadow-sm active:scale-95"
              >
                <ImageBtn size={28} className="text-slate-400 group-hover:text-indigo-600" />
                <span className="text-xs font-black text-slate-600 group-hover:text-indigo-900 uppercase">Image</span>
              </button>
              <button 
                onClick={addTable}
                className="flex flex-col items-center gap-2 p-5 border border-slate-200 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 transition-all group bg-white shadow-sm active:scale-95"
              >
                <TableIcon size={28} className="text-slate-400 group-hover:text-indigo-600" />
                <span className="text-xs font-black text-slate-600 group-hover:text-indigo-900 uppercase">Table</span>
              </button>
            </div>
          </section>
        )}

        {/* SECTION: PAGE SETTINGS */}
        <section className="p-6 border-b border-slate-50 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 bg-indigo-500 rounded-full" />
            <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <Layout size={14} className="text-indigo-500" /> Page Setup
            </label>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Paper Size</div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => onDocChange({ pageSize: 'a4' })} className={`p-3 border rounded-xl flex flex-col items-center gap-1 transition-all ${docState.pageSize === 'a4' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm' : 'hover:bg-slate-50 border-slate-200 bg-white'}`}>
                  <span className="text-xs font-black">A4 Sheet</span>
                </button>
                <button onClick={() => onDocChange({ pageSize: 'legal' })} className={`p-3 border rounded-xl flex flex-col items-center gap-1 transition-all ${docState.pageSize === 'legal' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm' : 'hover:bg-slate-50 border-slate-200 bg-white'}`}>
                  <span className="text-xs font-black">Legal Paper</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Orientation</div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => onDocChange({ orientation: 'portrait' })} className={`p-3 border rounded-xl flex flex-col items-center gap-1 transition-all ${docState.orientation === 'portrait' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm' : 'hover:bg-slate-50 border-slate-200 bg-white'}`}>
                  <RectangleVertical size={16} className="mb-1" />
                  <span className="text-xs font-black">Portrait</span>
                </button>
                <button onClick={() => onDocChange({ orientation: 'landscape' })} className={`p-3 border rounded-xl flex flex-col items-center gap-1 transition-all ${docState.orientation === 'landscape' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm' : 'hover:bg-slate-50 border-slate-200 bg-white'}`}>
                  <RectangleHorizontal size={16} className="mb-1" />
                  <span className="text-xs font-black">Landscape</span>
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-black text-slate-700">
                <span className="flex items-center gap-2"><Ruler size={14} className="text-slate-400" /> Margin</span>
                <span className="px-2 py-1 bg-indigo-50 border border-indigo-100 rounded-lg font-mono text-indigo-600 text-xs">{docState.margin}mm</span>
              </div>
              <input type="range" min="0" max="80" step="1" value={docState.margin} onChange={(e) => onDocChange({ margin: parseInt(e.target.value) })} className="w-full accent-indigo-500" />
            </div>
          </div>
        </section>

        {/* SECTION: WATERMARK */}
        <section className="p-6 border-b border-slate-50 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-amber-500 rounded-full" />
              <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Stamp size={14} className="text-amber-500" /> Watermark
              </label>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={docState.watermark?.enabled}
                onChange={(e) => updateWatermark({ enabled: e.target.checked })}
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {docState.watermark?.enabled && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="space-y-2">
                <div className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                  <TypeIcon size={10} /> Watermark Text
                </div>
                <input 
                  type="text" 
                  value={docState.watermark.text}
                  onChange={(e) => updateWatermark({ text: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none shadow-sm"
                  placeholder="Enter watermark text..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                    <span className="flex items-center gap-1"><Eye size={10}/> Visibility</span>
                    <span>{docState.watermark.opacity}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="50" 
                    value={docState.watermark.opacity} 
                    onChange={(e) => updateWatermark({ opacity: parseInt(e.target.value) })} 
                    className="w-full accent-amber-500 h-1.5" 
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                    <span className="flex items-center gap-1"><RotateCw size={10}/> Rotation</span>
                    <span>{docState.watermark.rotation}°</span>
                  </div>
                  <input 
                    type="range" 
                    min="-180" 
                    max="180" 
                    value={docState.watermark.rotation} 
                    onChange={(e) => updateWatermark({ rotation: parseInt(e.target.value) })} 
                    className="w-full accent-amber-500 h-1.5" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                  <span className="flex items-center gap-1"><Plus size={10}/> Text Size</span>
                  <span>{docState.watermark.fontSize}px</span>
                </div>
                <input 
                  type="range" 
                  min="20" 
                  max="300" 
                  value={docState.watermark.fontSize} 
                  onChange={(e) => updateWatermark({ fontSize: parseInt(e.target.value) })} 
                  className="w-full accent-amber-500 h-1.5" 
                />
              </div>
            </div>
          )}
        </section>

        {/* DEVELOPER PROFILE SECTION */}
        <section className="p-6 space-y-4 bg-slate-50/50">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 bg-slate-900 rounded-full" />
            <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <User size={14} /> About Developer
            </label>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
              <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                <User size={16} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Developer</p>
                <p className="text-xs font-black text-slate-900">Md Anik Hossain</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
              <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                <MapPin size={16} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Location</p>
                <p className="text-xs font-black text-slate-900">Bangladesh</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
              <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                <Mail size={16} />
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Contact</p>
                <p className="text-[11px] font-black text-slate-900 truncate">anikhossain333877@gmail.com</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="p-6 border-t border-slate-100 bg-slate-50 text-center">
        <div className="text-indigo-700 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
          Anik Tools Studio v1.0
        </div>
        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Professional Graphics Engine</p>
      </div>
    </aside>
  );
};
