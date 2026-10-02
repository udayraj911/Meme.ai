import React, { useState } from 'react';
import { CaptionSuggestion, TextOverlay } from '../types';
import { Sparkles, Sliders, Type, Trash2, Palette, Smile, HelpCircle, ArrowRight, RefreshCw, Layers } from 'lucide-react';

interface AIPanelProps {
  activeText: TextOverlay | null;
  onUpdateActiveText: (updated: Partial<TextOverlay>) => void;
  onDeleteActiveText: () => void;
  onTriggerMagicCaption: () => void;
  isGeneratingCaption: boolean;
  suggestions: CaptionSuggestion[];
  onApplySuggestion: (suggestion: CaptionSuggestion) => void;
  onTriggerRemake: (prompt: string) => Promise<void>;
  isRemakingImage: boolean;
}

export default function AIPanel({
  activeText,
  onUpdateActiveText,
  onDeleteActiveText,
  onTriggerMagicCaption,
  isGeneratingCaption,
  suggestions,
  onApplySuggestion,
  onTriggerRemake,
  isRemakingImage,
}: AIPanelProps) {
  const [remakePrompt, setRemakePrompt] = useState('');
  const [activePanelTab, setActivePanelTab] = useState<'ai' | 'style'>('ai');

  const fontFamilies = [
    { name: 'Impact Style (Anton)', val: 'Anton' },
    { name: 'Bold High-Impact', val: 'Bebas Neue' },
    { name: 'Friendly Round (Fredoka)', val: 'Fredoka' },
    { name: 'Clean Modern (Montserrat)', val: 'Montserrat' },
    { name: 'Classic / Playfair', val: 'Playfair Display' },
    { name: 'System Sans', val: 'sans-serif' }
  ];

  const colors = [
    '#ffffff', '#ffffff00', '#000000', '#f87171', '#fbbf24', '#34d399', '#60a5fa', '#c084fc', '#f472b6'
  ];

  const handleRemakeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remakePrompt.trim()) return;
    await onTriggerRemake(remakePrompt);
    setRemakePrompt('');
  };

  return (
    <div className="bg-white border border-[#e5e1da] rounded-2xl shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
      {/* Sub Tabs */}
      <div className="flex border-b border-[#e5e1da] bg-[#faf9f6]">
        <button
          onClick={() => setActivePanelTab('ai')}
          className={`flex-1 py-3 text-xs font-semibold tracking-wide border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
            activePanelTab === 'ai'
              ? 'border-[#1c1a17] text-[#1c1a17] bg-white'
              : 'border-transparent text-[#7c7468] hover:text-[#1c1a17]'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#0284c7]" />
          <span>AI Magic Suite</span>
        </button>
        <button
          onClick={() => setActivePanelTab('style')}
          className={`flex-1 py-3 text-xs font-semibold tracking-wide border-b-2 transition-colors flex items-center justify-center gap-1.5 relative ${
            activePanelTab === 'style'
              ? 'border-[#1c1a17] text-[#1c1a17] bg-white'
              : 'border-transparent text-[#7c7468] hover:text-[#1c1a17]'
          }`}
        >
          <Sliders className="w-4 h-4 text-[#7c7468]" />
          <span>Styling Controls</span>
          {activeText && (
            <span className="absolute top-2 right-4 w-2 h-2 bg-[#10b981] rounded-full"></span>
          )}
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto max-h-[600px] flex flex-col gap-5">
        {/* TAB 1: AI Magic Suite */}
        {activePanelTab === 'ai' && (
          <div className="space-y-5 flex-1 flex flex-col">
            {/* 1. Magic Caption Generator */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#1c1a17] flex items-center gap-1.5 uppercase tracking-wider">
                  <span>1. AI Magic Caption</span>
                  <span className="text-[10px] bg-[#e0f2fe] text-[#0369a1] px-2 py-0.5 rounded-full border border-[#bae6fd]">Pro</span>
                </h3>
              </div>

              <p className="text-[11px] text-[#7c7468] leading-relaxed">
                Let Gemini read the current image (character context, funny visuals, facial expressions) and draft 5 customized meme suggestions.
              </p>

              <button
                onClick={onTriggerMagicCaption}
                disabled={isGeneratingCaption}
                className="w-full py-3.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingCaption ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Photo Context...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse" />
                    <span>Generate Magic Captions</span>
                  </>
                )}
              </button>
            </div>

            {/* Suggestions Render list */}
            {suggestions.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-bold text-[#7c7468] uppercase tracking-wider flex items-center gap-1">
                  <Smile className="w-3.5 h-3.5 text-amber-500" />
                  <span>AI Generated Suggestions ({suggestions.length})</span>
                </h4>

                <div className="space-y-3">
                  {suggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => onApplySuggestion(sug)}
                      className="w-full text-left bg-[#fcfbfa] hover:bg-white border border-[#e5e1da] hover:border-[#0284c7] p-3 rounded-xl transition-all hover:shadow-md group flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-[#f0f9ff] text-[#0369a1] border border-[#bae6fd] px-2 py-0.5 rounded-md">
                          {sug.vibe}
                        </span>
                        <span className="text-[9px] text-[#a39a8f] font-semibold group-hover:text-[#0284c7] flex items-center gap-1 transition-colors">
                          Apply overlay <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>

                      {/* Display proposed text structure */}
                      <div className="p-2 bg-white rounded-lg border border-[#f4f2ee] text-xs font-bold text-[#1c1a17] leading-tight flex flex-col gap-1">
                        {sug.text ? (
                          <p className="text-slate-800 italic">"{sug.text}"</p>
                        ) : (
                          <>
                            {sug.topText && <p className="text-slate-500 uppercase text-[10px] tracking-wide border-b border-dashed border-[#faf9f6] pb-1">Top: {sug.topText}</p>}
                            {sug.bottomText && <p className="text-slate-800 uppercase tracking-wide">Bottom: {sug.bottomText}</p>}
                          </>
                        )}
                      </div>

                      <p className="text-[10px] text-[#7c7468] leading-normal italic">
                        💡 {sug.explanation}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            <hr className="border-[#e5e1da]" />

            {/* 2. Image-to-Image AI Remake */}
            <div className="space-y-3 pt-1">
              <h3 className="text-xs font-bold text-[#1c1a17] flex items-center gap-1.5 uppercase tracking-wider">
                <span>2. AI Backdrop Remake</span>
                <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">Flash</span>
              </h3>

              <p className="text-[11px] text-[#7c7468] leading-relaxed">
                Describe details or artistic styles you want to modify in the current photo (e.g. "make it an anime drawing", "add party hats on characters", "make background synthwave").
              </p>

              <form onSubmit={handleRemakeSubmit} className="space-y-2.5">
                <input
                  type="text"
                  required
                  value={remakePrompt}
                  onChange={(e) => setRemakePrompt(e.target.value)}
                  placeholder="e.g. Turn the dog into a pixel art character"
                  className="w-full px-3 py-2 text-xs bg-[#faf9f6] border border-[#e5e1da] rounded-xl focus:outline-none focus:border-purple-500 text-[#1c1a17] transition-colors placeholder-[#a39a8f]"
                />
                <button
                  type="submit"
                  disabled={isRemakingImage || !remakePrompt.trim()}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  {isRemakingImage ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Remaking backdrop...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Apply AI Remake</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: Styling Controls */}
        {activePanelTab === 'style' && (
          <div className="space-y-4 flex-1 flex flex-col">
            {activeText ? (
              <div className="space-y-4">
                {/* Active box label */}
                <div className="flex items-center justify-between p-2.5 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl text-[#166534] text-xs font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Type className="w-4 h-4 text-[#15803d]" />
                    <span>Active text element</span>
                  </span>
                  <button
                    onClick={onDeleteActiveText}
                    className="p-1 hover:bg-[#dcfce7] rounded text-red-600 transition-colors"
                    title="Delete element"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Text editor input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1c1a17]">Edit Text Content</label>
                  <textarea
                    rows={2}
                    value={activeText.text}
                    onChange={(e) => onUpdateActiveText({ text: e.target.value })}
                    className="w-full p-2.5 text-xs bg-[#faf9f6] border border-[#e5e1da] rounded-xl focus:outline-none focus:border-[#1c1a17] text-[#1c1a17] font-semibold transition-colors resize-none"
                    placeholder="Enter meme text..."
                  />
                </div>

                {/* Font Family selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1c1a17] block">Font Family</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {fontFamilies.map((font) => (
                      <button
                        key={font.val}
                        onClick={() => onUpdateActiveText({ fontFamily: font.val })}
                        className={`py-2 px-1 text-[10px] font-bold border rounded-lg truncate transition-all text-center ${
                          activeText.fontFamily === font.val
                            ? 'bg-[#1c1a17] border-[#1c1a17] text-white shadow-sm'
                            : 'bg-white border-[#e5e1da] text-[#524d45] hover:border-[#1c1a17]'
                        }`}
                        style={{ fontFamily: font.val }}
                      >
                        {font.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Size slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-[#1c1a17]">
                    <label>Font Size</label>
                    <span className="text-[10px] text-[#7c7468]">{activeText.fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="80"
                    value={activeText.fontSize}
                    onChange={(e) => onUpdateActiveText({ fontSize: parseInt(e.target.value) })}
                    className="w-full h-1 bg-[#e5e1da] rounded-lg appearance-none cursor-pointer accent-[#1c1a17]"
                  />
                </div>

                {/* Uppercase toggle */}
                <div className="flex items-center justify-between p-2 bg-[#faf9f6] border border-[#e5e1da] rounded-xl">
                  <span className="text-xs font-bold text-[#1c1a17]">Force Uppercase</span>
                  <button
                    onClick={() => onUpdateActiveText({ isUppercase: !activeText.isUppercase })}
                    className={`w-10 h-6 flex items-center rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                      activeText.isUppercase ? 'bg-[#1c1a17]' : 'bg-[#e5e1da]'
                    }`}
                  >
                    <div
                      className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${
                        activeText.isUppercase ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Colors section */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#1c1a17]">Text Fill</label>
                    <div className="flex flex-wrap gap-1">
                      {colors.map((col) => (
                        <button
                          key={col}
                          onClick={() => onUpdateActiveText({ color: col })}
                          className={`w-5 h-5 rounded-full border transition-transform ${
                            activeText.color === col ? 'scale-125 border-[#1c1a17]' : 'border-slate-300'
                          }`}
                          style={{ backgroundColor: col }}
                          title={col}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#1c1a17]">Outline Color</label>
                    <div className="flex flex-wrap gap-1">
                      {colors.slice(1).map((col) => (
                        <button
                          key={col}
                          onClick={() => onUpdateActiveText({ borderColor: col })}
                          className={`w-5 h-5 rounded-full border transition-transform ${
                            activeText.borderColor === col ? 'scale-125 border-[#1c1a17]' : 'border-slate-300'
                          }`}
                          style={{ backgroundColor: col }}
                          title={col}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Outline thickness slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-[#1c1a17]">
                    <label>Outline Thickness</label>
                    <span className="text-[10px] text-[#7c7468]">{activeText.borderWidth}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="8"
                    value={activeText.borderWidth}
                    onChange={(e) => onUpdateActiveText({ borderWidth: parseInt(e.target.value) })}
                    className="w-full h-1 bg-[#e5e1da] rounded-lg appearance-none cursor-pointer accent-[#1c1a17]"
                  />
                </div>

                {/* Align options */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1c1a17] block">Text Alignment</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['left', 'center', 'right'] as const).map((alignment) => (
                      <button
                        key={alignment}
                        onClick={() => onUpdateActiveText({ align: alignment })}
                        className={`py-1.5 text-[10px] font-bold capitalize border rounded-lg transition-all ${
                          activeText.align === alignment
                            ? 'bg-[#1c1a17] border-[#1c1a17] text-white shadow-sm'
                            : 'bg-white border-[#e5e1da] text-[#524d45] hover:border-[#1c1a17]'
                        }`}
                      >
                        {alignment}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-24 flex-1 flex flex-col items-center justify-center text-[#7c7468]">
                <div className="bg-[#f4f2ee] p-3 rounded-full mb-3 text-[#a39a8f]">
                  <Type className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-[#1c1a17] mb-1">No text box selected</h4>
                <p className="text-[10px] max-w-[200px] leading-relaxed mx-auto">
                  Click on an existing text box overlay directly on the preview to adjust its styling, colors, and positioning, or click <strong>"Add Text Box"</strong> above the canvas.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
