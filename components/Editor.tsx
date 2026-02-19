import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { DocumentState, FloatingElement } from '../types';
import { Move, RotateCw, Maximize2, Trash2 } from 'lucide-react';

interface EditorProps {
  docState: DocumentState;
  onContentChange: (content: string) => void;
  onElementsChange: (elements: FloatingElement[]) => void;
  onElementsCommit: (elements: FloatingElement[]) => void;
  scale?: number;
  selectedElementId: string | null;
  setSelectedElementId: (id: string | null) => void;
}

export const Editor = forwardRef<HTMLDivElement, EditorProps>(({ 
  docState, 
  onContentChange, 
  onElementsChange,
  onElementsCommit,
  scale = 1,
  selectedElementId,
  setSelectedElementId
}, ref) => {
  const editableRef = useRef<HTMLDivElement>(null);
  const lastContentRef = useRef(docState.content);
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<'move' | 'resize' | 'rotate' | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, elX: 0, elY: 0, elW: 0, elH: 0, elR: 0 });
  const currentElementsRef = useRef(docState.elements);

  // Keep ref in sync for the mouseUp commit
  useEffect(() => {
    currentElementsRef.current = docState.elements;
  }, [docState.elements]);

  // Synchronize external content changes (Undo, Redo, Toolbar)
  useEffect(() => {
    if (editableRef.current && docState.content !== lastContentRef.current) {
      editableRef.current.innerHTML = docState.content;
      lastContentRef.current = docState.content;
    }
  }, [docState.content]);

  // Initial content injection
  useEffect(() => {
    if (editableRef.current) {
      editableRef.current.innerHTML = docState.content;
    }
  }, []);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const html = e.currentTarget.innerHTML;
    lastContentRef.current = html;
    onContentChange(html);
  };

  const getDimensions = () => {
    const isLandscape = docState.orientation === 'landscape';
    const dimensions = docState.pageSize === 'a4' ? { w: '210mm', h: '297mm' } : { w: '216mm', h: '356mm' };
    return isLandscape ? { w: dimensions.h, h: dimensions.w } : dimensions;
  };

  const dims = getDimensions();

  // Handle clicking on the page to focus the editor
  const handlePageClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (editableRef.current && e.target === editableRef.current)) {
      setSelectedElementId(null);
      if (editableRef.current) {
        editableRef.current.focus();
      }
    }
  };

  const startDrag = (e: React.MouseEvent, element: FloatingElement, type: 'move' | 'resize' | 'rotate') => {
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);
    setDragType(type);
    setSelectedElementId(element.id);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      elX: element.x,
      elY: element.y,
      elW: element.width,
      elH: element.height,
      elR: element.rotation
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !selectedElementId || !dragType) return;

      const dx = (e.clientX - dragStart.x) / scale;
      const dy = (e.clientY - dragStart.y) / scale;

      const newElements = docState.elements.map(el => {
        if (el.id !== selectedElementId) return el;

        if (dragType === 'move') {
          return { ...el, x: dragStart.elX + dx, y: dragStart.elY + dy };
        } else if (dragType === 'resize') {
          return { ...el, width: Math.max(20, dragStart.elW + dx), height: Math.max(20, dragStart.elH + dy) };
        } else if (dragType === 'rotate') {
          const centerX = dragStart.elX + dragStart.elW / 2;
          const centerY = dragStart.elY + dragStart.elH / 2;
          const angle = Math.atan2(e.clientY - (centerY * scale), e.clientX - (centerX * scale)) * (180 / Math.PI);
          return { ...el, rotation: angle };
        }
        return el;
      });

      onElementsChange(newElements);
    };

    const handleMouseUp = () => {
      if (isDragging) {
        onElementsCommit(currentElementsRef.current);
      }
      setIsDragging(false);
      setDragType(null);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, selectedElementId, dragType, dragStart, docState.elements, onElementsChange, onElementsCommit, scale]);

  const deleteElement = (id: string) => {
    onElementsCommit(docState.elements.filter(el => el.id !== id));
    setSelectedElementId(null);
  };

  const getFilterString = (filters: any) => {
    if (!filters) return 'none';
    return `
      brightness(${filters.brightness}%) 
      contrast(${filters.contrast}%) 
      grayscale(${filters.grayscale}%) 
      sepia(${filters.sepia}%) 
      blur(${filters.blur}px)
      saturate(${filters.saturate}%)
      hue-rotate(${filters.hueRotate}deg)
      invert(${filters.invert}%)
    `.replace(/\s+/g, ' ').trim();
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        ref={ref}
        id="printable-a4-canvas"
        className="a4-page relative origin-top bg-white cursor-text"
        onClick={handlePageClick}
        style={{
          width: dims.w,
          height: dims.h,
          padding: `${docState.margin}mm`,
          fontFamily: docState.fontFamily,
          fontSize: docState.fontSize,
          color: docState.fontColor,
          backgroundColor: docState.backgroundColor,
          lineHeight: docState.lineHeight,
          letterSpacing: `${docState.letterSpacing}px`,
          transform: `scale(${scale})`,
          transition: 'transform 0.1s ease-out, background-color 0.2s ease-in-out',
          boxShadow: '0 0 30px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Margin Guide */}
        <div 
          className="printable-guide no-print" 
          data-html2canvas-ignore="true"
          style={{
            position: 'absolute',
            top: `${docState.margin}mm`,
            left: `${docState.margin}mm`,
            right: `${docState.margin}mm`,
            bottom: `${docState.margin}mm`,
            border: '1px dashed rgba(79, 70, 229, 0.25)',
            pointerEvents: 'none',
            zIndex: 10
          }}
        />

        {/* Watermark */}
        {docState.watermark?.enabled && (
          <div 
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) rotate(${docState.watermark.rotation}deg)`,
              fontSize: `${docState.watermark.fontSize}px`,
              fontWeight: 900,
              color: 'currentColor',
              opacity: docState.watermark.opacity / 100,
              pointerEvents: 'none',
              zIndex: 0,
              whiteSpace: 'nowrap',
              userSelect: 'none',
              textAlign: 'center',
              width: '100%'
            }}
          >
            {docState.watermark.text}
          </div>
        )}

        {/* Actual Editable Content Area */}
        <div
          ref={editableRef}
          contentEditable="true"
          suppressContentEditableWarning
          onInput={handleInput}
          spellCheck="false"
          className="w-full h-full outline-none rich-editor-content select-text whitespace-pre-wrap break-words flex-1 relative z-10"
          style={{ 
            minHeight: '100%',
            fontFamily: docState.fontFamily,
            fontSize: docState.fontSize,
            color: docState.fontColor,
            lineHeight: docState.lineHeight,
            letterSpacing: `${docState.letterSpacing}px`,
            textAlign: 'left' // Default alignment, can be overridden by inline styles from toolbar
          }}
          data-placeholder="Click here to start typing your document..."
        />

        {/* Floating Elements - Rendered AFTER text to be on top */}
        {docState.elements.map(el => (
          <div
            key={el.id}
            onClick={(e) => { e.stopPropagation(); setSelectedElementId(el.id); }}
            style={{
              position: 'absolute',
              left: el.x,
              top: el.y,
              width: el.width,
              height: el.height,
              transform: `rotate(${el.rotation}deg)`,
              zIndex: el.zIndex + 20, // Ensure it's above the text editor (z-10)
              opacity: el.opacity / 100,
              cursor: 'move',
              border: selectedElementId === el.id ? '2px solid #4f46e1' : '1px transparent'
            }}
            onMouseDown={(e) => startDrag(e, el, 'move')}
          >
            {el.type === 'table' && el.tableData ? (
              <div className="w-full h-full overflow-hidden bg-white border border-slate-200 shadow-sm">
                <table style={{ width: '100%', height: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                  <tbody>
                    {el.tableData.rows.map((row, ri) => (
                      <tr key={row.id} style={{ height: el.tableData!.rowHeights[ri] }}>
                        {row.cells.map((cell, ci) => (
                          <td 
                            key={cell.id} 
                            style={{ 
                              width: el.tableData!.columnWidths[ci], 
                              border: '1px solid #cbd5e1',
                              padding: '8px',
                              fontSize: el.fontSize || '12px',
                              fontFamily: el.fontFamily || docState.fontFamily,
                              verticalAlign: 'middle',
                              textAlign: 'center',
                              backgroundColor: ri === 0 ? '#f1f5f9' : 'white',
                              fontWeight: ri === 0 ? '900' : '500',
                              color: ri === 0 ? '#1e293b' : '#475569',
                              wordBreak: 'break-word'
                            }}
                          >
                            {cell.content}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : el.type === 'image' ? (
              <img 
                src={el.content} 
                alt="" 
                draggable="false"
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: el.objectFit || 'cover',
                  filter: getFilterString(el.filters)
                }} 
              />
            ) : (
              <div 
                className="w-full h-full p-2 overflow-hidden break-words"
                dangerouslySetInnerHTML={{ __html: el.content }}
                style={{ 
                  fontSize: el.fontSize || docState.fontSize,
                  fontFamily: el.fontFamily || docState.fontFamily
                }}
              />
            )}

            {selectedElementId === el.id && (
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white shadow-xl border border-slate-200 p-1 rounded-lg no-print" data-html2canvas-ignore="true">
                <div className="p-1.5 hover:bg-slate-100 rounded cursor-move" onMouseDown={(e) => startDrag(e, el, 'move')} title="Move"><Move size={14} /></div>
                <div className="p-1.5 hover:bg-slate-100 rounded cursor-pointer" onMouseDown={(e) => startDrag(e, el, 'rotate')} title="Rotate"><RotateCw size={14} /></div>
                <div className="p-1.5 hover:bg-slate-100 rounded cursor-pointer" onMouseDown={(e) => startDrag(e, el, 'resize')} title="Resize"><Maximize2 size={14} /></div>
                <div className="p-1.5 hover:bg-rose-100 text-rose-600 rounded cursor-pointer" onClick={() => deleteElement(el.id)} title="Delete"><Trash2 size={14} /></div>
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Spacer to maintain layout height when scaled */}
      <div style={{ height: `calc(${dims.h} * ${scale} - ${dims.h})` }} className="pointer-events-none" />
    </div>
  );
});

Editor.displayName = 'Editor';