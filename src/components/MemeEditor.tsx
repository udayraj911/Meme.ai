import React, { useRef, useState, useEffect } from 'react';
import { TextOverlay } from '../types';
import { Plus, Trash2, Download, Layers, RotateCcw, ArrowUp, ArrowDown, Move, Type, Check } from 'lucide-react';

interface MemeEditorProps {
  imageUrl: string;
  textOverlays: TextOverlay[];
  onChangeOverlays: (overlays: TextOverlay[]) => void;
  activeTextId: string | null;
  onSetActiveTextId: (id: string | null) => void;
  isScanning: boolean;
}

export default function MemeEditor({
  imageUrl,
  textOverlays,
  onChangeOverlays,
  activeTextId,
  onSetActiveTextId,
  isScanning,
}: MemeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // For tracking drag state
  const [dragState, setDragState] = useState<{
    id: string;
    startX: number;
    startY: number;
    startOverlayX: number;
    startOverlayY: number;
  } | null>(null);

  // Track natural image dimension vs displayed dimension
  const [dimensions, setDimensions] = useState({ width: 0, height: 0, displayWidth: 0, displayHeight: 0 });

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight,
      displayWidth: img.clientWidth,
      displayHeight: img.clientHeight,
    });
  };

  // Update displayed dimensions on resize
  useEffect(() => {
    const handleResize = () => {
      if (imageRef.current) {
        setDimensions(prev => ({
          ...prev,
          displayWidth: imageRef.current?.clientWidth || 0,
          displayHeight: imageRef.current?.clientHeight || 0,
        }));
      }
    };

    window.addEventListener('resize', handleResize);
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, []);

  // Add new text box
  const handleAddText = () => {
    const id = `text-${Date.now()}`;
    const newOverlay: TextOverlay = {
      id,
      text: 'Double click to edit',
      x: 50,
      y: 50,
      fontSize: 32,
      color: '#ffffff',
      borderColor: '#000000',
      borderWidth: 4,
      fontFamily: 'Anton',
      isUppercase: true,
      align: 'center',
      maxWidth: 90,
    };
    onChangeOverlays([...textOverlays, newOverlay]);
    onSetActiveTextId(id);
  };

  // Remove text box
  const handleRemoveText = (id: string) => {
    const updated = textOverlays.filter(o => o.id !== id);
    onChangeOverlays(updated);
    if (activeTextId === id) {
      onSetActiveTextId(updated.length > 0 ? updated[updated.length - 1].id : null);
    }
  };

  // Drag and Drop implementation
  const handleMouseDown = (e: React.MouseEvent, overlay: TextOverlay) => {
    e.preventDefault();
    onSetActiveTextId(overlay.id);

    setDragState({
      id: overlay.id,
      startX: e.clientX,
      startY: e.clientY,
      startOverlayX: overlay.x,
      startOverlayY: overlay.y,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState || !imageRef.current) return;

      const img = imageRef.current;
      const rect = img.getBoundingClientRect();

      // Calculate delta movement in pixels
      const deltaX = e.clientX - dragState.startX;
      const deltaY = e.clientY - dragState.startY;

      // Convert delta to percentage of displayed image size
      const percentDeltaX = (deltaX / rect.width) * 100;
      const percentDeltaY = (deltaY / rect.height) * 100;

      // New percentage coordinates, bounded to [0, 100]
      const newX = Math.max(0, Math.min(100, dragState.startOverlayX + percentDeltaX));
      const newY = Math.max(0, Math.min(100, dragState.startOverlayY + percentDeltaY));

      onChangeOverlays(
        textOverlays.map(o => (o.id === dragState.id ? { ...o, x: newX, y: newY } : o))
      );
    };

    const handleMouseUp = () => {
      if (dragState) {
        setDragState(null);
      }
    };

    if (dragState) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, textOverlays, onChangeOverlays]);

  // Canvas Generation for high-resolution PNG download
  const handleDownload = () => {
    if (!imageRef.current) return;

    const img = new Image();
    // Allow loading cross-origin Unsplash templates safely
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      // Set canvas to the actual original source dimensions
      canvas.width = img.naturalWidth || 800;
      canvas.height = img.naturalHeight || 800;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw background image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Draw each overlay text box
      textOverlays.forEach(overlay => {
        const textToDraw = overlay.isUppercase ? overlay.text.toUpperCase() : overlay.text;

        // Calculate size matching original canvas size
        const displayedWidth = imageRef.current?.clientWidth || 500;
        const fontScaleFactor = canvas.width / displayedWidth;
        const canvasFontSize = overlay.fontSize * fontScaleFactor;

        ctx.font = `bold ${canvasFontSize}px ${overlay.fontFamily}, sans-serif`;
        ctx.textAlign = overlay.align;
        ctx.textBaseline = 'middle';

        // Calculate absolute pixel position based on template percentages
        const xPos = (overlay.x / 100) * canvas.width;
        const yPos = (overlay.y / 100) * canvas.height;

        // Wrap lines
        const maxTextWidth = (overlay.maxWidth / 100) * canvas.width;
        const words = textToDraw.split(' ');
        const lines: string[] = [];
        let currentLine = '';

        for (let n = 0; n < words.length; n++) {
          const testLine = currentLine + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxTextWidth && n > 0) {
            lines.push(currentLine.trim());
            currentLine = words[n] + ' ';
          } else {
            currentLine = testLine;
          }
        }
        lines.push(currentLine.trim());

        // Multi-line draw offsets
        const lineHeight = canvasFontSize * 1.15;
        const totalHeight = lines.length * lineHeight;
        const startY = yPos - totalHeight / 2 + lineHeight / 2;

        lines.forEach((line, index) => {
          const lineY = startY + index * lineHeight;

          // Render stroke border
          if (overlay.borderWidth > 0) {
            ctx.strokeStyle = overlay.borderColor;
            ctx.lineWidth = overlay.borderWidth * fontScaleFactor;
            ctx.lineJoin = 'miter';
            ctx.strokeText(line, xPos, lineY);
          }

          // Render main filled text
          ctx.fillStyle = overlay.color;
          ctx.fillText(line, xPos, lineY);
        });
      });

      // Export and trigger download
      try {
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `MemeCraft_${Date.now()}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error('Canvas export error:', err);
        alert(
          'Could not compile and download image natively due to CORS restriction. Try generating another background template or upload your own photo!'
        );
      }
    };

    img.onerror = () => {
      alert('Failed to load meme canvas for rendering.');
    };
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Interactive Workspace Panel */}
      <div className="bg-white border border-[#e5e1da] rounded-2xl p-4 shadow-sm flex flex-col items-center justify-center flex-1 min-h-[400px] relative">
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <button
            onClick={handleAddText}
            className="flex items-center gap-1 bg-[#1c1a17] hover:bg-[#322f29] text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Text Box</span>
          </button>
        </div>

        {/* Bounding Image Container */}
        <div
          ref={containerRef}
          className="relative max-w-full max-h-[500px] overflow-hidden rounded-xl border border-[#faf9f6] bg-[#f4f2ee] select-none shadow-inner"
        >
          {/* Main Template/Uploaded Image */}
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Meme Canvas Backdrop"
            onLoad={handleImageLoad}
            className="w-full max-h-[500px] object-contain pointer-events-none rounded-xl block"
            referrerPolicy="no-referrer"
          />

          {/* Draggable Overlays Container */}
          {dimensions.displayWidth > 0 && (
            <div className="absolute inset-0 z-20 pointer-events-auto">
              {textOverlays.map(overlay => {
                const isActive = activeTextId === overlay.id;
                const formattedText = overlay.isUppercase ? overlay.text.toUpperCase() : overlay.text;

                return (
                  <div
                    key={overlay.id}
                    onMouseDown={e => handleMouseDown(e, overlay)}
                    className={`absolute p-2 cursor-move select-none transition-shadow ${
                      isActive ? 'ring-2 ring-[#0284c7] ring-offset-1 rounded bg-[#0284c7]/5' : ''
                    }`}
                    style={{
                      left: `${overlay.x}%`,
                      top: `${overlay.y}%`,
                      transform: 'translate(-50%, -50%)',
                      width: `${overlay.maxWidth}%`,
                      textAlign: overlay.align,
                    }}
                  >
                    {/* Visual Handles & Utilities (Only on Focused Item) */}
                    {isActive && (
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#0284c7] text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-md flex items-center gap-2 pointer-events-auto z-30 whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <Move className="w-3 h-3" /> Drag Me
                        </span>
                        <button
                          onMouseDown={e => {
                            e.stopPropagation();
                            handleRemoveText(overlay.id);
                          }}
                          className="bg-red-600 hover:bg-red-700 p-0.5 rounded transition-colors text-white"
                          title="Delete Text Box"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    )}

                    {/* Render text with custom properties & stroke */}
                    <p
                      className="break-words font-extrabold m-0 leading-tight leading-none drop-shadow-sm select-none"
                      style={{
                        fontFamily: overlay.fontFamily,
                        fontSize: `${overlay.fontSize}px`,
                        color: overlay.color,
                        WebkitTextStroke: overlay.borderWidth > 0 ? `${overlay.borderWidth}px ${overlay.borderColor}` : 'none',
                        textShadow: overlay.borderWidth > 0 ? 'none' : '0 1px 3px rgba(0,0,0,0.4)',
                        textTransform: overlay.isUppercase ? 'uppercase' : 'none',
                      }}
                    >
                      {formattedText || <span className="opacity-40 italic font-normal">[Empty box]</span>}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Witty Scanner Overlay when AI is Analysing / Magic-Captioning */}
          {isScanning && (
            <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px] z-30 flex flex-col items-center justify-center text-center p-6 animate-fadeIn">
              <div className="relative w-32 h-32 mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-[#0284c7]/20 border-t-[#0284c7] animate-spin"></div>
                <div className="absolute inset-4 rounded-full border-4 border-dashed border-amber-400 animate-pulse"></div>
                <div className="absolute inset-0 flex items-center justify-center text-white font-extrabold text-2xl animate-bounce">
                  🪄
                </div>
              </div>
              <h3 className="text-sm font-bold text-white tracking-wider uppercase mb-1">
                Gemini is Reading Visual Nuances...
              </h3>
              <p className="text-xs text-slate-300 max-w-sm animate-pulse leading-relaxed">
                Analyzing poses, facial expressions, and composition to suggest high-vibe contextual jokes.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Editor Action Bar (Reset, Download, Layout alignment) */}
      <div className="bg-white border border-[#e5e1da] rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <p className="text-[10px] text-[#7c7468] font-semibold uppercase tracking-wider">
            Canvas layers: {textOverlays.length}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {textOverlays.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Clear all text overlays and start fresh?')) {
                  onChangeOverlays([]);
                  onSetActiveTextId(null);
                }
              }}
              className="flex items-center gap-1 px-3 py-2 border border-[#e5e1da] text-[#7c7468] hover:text-[#ef4444] hover:bg-[#fef2f2] hover:border-red-200 rounded-xl text-xs font-semibold transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Layers</span>
            </button>
          )}

          <button
            onClick={handleDownload}
            disabled={!imageUrl}
            className="flex items-center gap-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>Download High-Res PNG</span>
          </button>
        </div>
      </div>
    </div>
  );
}
