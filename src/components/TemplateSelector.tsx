import React, { useState, useRef } from 'react';
import { TRENDING_TEMPLATES } from '../data/templates';
import { MemeTemplate } from '../types';
import { Search, Upload, Sparkles, Sliders, RefreshCw, CheckCircle, Image as ImageIcon } from 'lucide-react';

interface TemplateSelectorProps {
  onSelectTemplate: (template: MemeTemplate) => void;
  onUploadCustom: (base64: string, mimeType: string) => void;
  activeTemplateId: string | null;
  onAiGenerate: (prompt: string, aspectRatio: string) => Promise<string | null>;
  isGeneratingAi: boolean;
}

export default function TemplateSelector({
  onSelectTemplate,
  onUploadCustom,
  activeTemplateId,
  onAiGenerate,
  isGeneratingAi,
}: TemplateSelectorProps) {
  const [activeTab, setActiveTab] = useState<'preset' | 'ai' | 'upload'>('preset');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiAspectRatio, setAiAspectRatio] = useState('1:1');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract all unique tags
  const allTags = ['All', ...Array.from(new Set(TRENDING_TEMPLATES.flatMap(t => t.tags)))];

  // Filter templates
  const filteredTemplates = TRENDING_TEMPLATES.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTag = selectedTag === 'All' || template.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  // Handle local file uploads
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG/JPG).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUploadCustom(reader.result, file.type);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    const url = await onAiGenerate(aiPrompt, aiAspectRatio);
    if (url) {
      // Clear prompt on successful generation
      setAiPrompt('');
    }
  };

  return (
    <div className="bg-white border border-[#e5e1da] rounded-2xl shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
      {/* Tab Switcher */}
      <div className="flex border-b border-[#e5e1da] bg-[#faf9f6]">
        <button
          onClick={() => setActiveTab('preset')}
          className={`flex-1 py-3 text-xs font-semibold tracking-wide border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'preset'
              ? 'border-[#1c1a17] text-[#1c1a17] bg-white'
              : 'border-transparent text-[#7c7468] hover:text-[#1c1a17]'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Preset templates</span>
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex-1 py-3 text-xs font-semibold tracking-wide border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'ai'
              ? 'border-[#1c1a17] text-[#1c1a17] bg-white'
              : 'border-transparent text-[#7c7468] hover:text-[#1c1a17]'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>AI Generator</span>
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-3 text-xs font-semibold tracking-wide border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'upload'
              ? 'border-[#1c1a17] text-[#1c1a17] bg-white'
              : 'border-transparent text-[#7c7468] hover:text-[#1c1a17]'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Upload Image</span>
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto max-h-[600px] flex flex-col">
        {/* Preset Templates Tab */}
        {activeTab === 'preset' && (
          <div className="flex flex-col flex-1 gap-4">
            {/* Search and Filters */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#a39a8f]" />
                <input
                  type="text"
                  placeholder="Search templates or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-[#faf9f6] border border-[#e5e1da] rounded-xl focus:outline-none focus:border-[#1c1a17] text-[#1c1a17] transition-colors"
                />
              </div>

              {/* Tag Badges */}
              <div className="flex flex-wrap gap-1.5 pb-1">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`text-[10px] font-medium px-2.5 py-1 rounded-full border transition-all ${
                      selectedTag === tag
                        ? 'bg-[#1c1a17] border-[#1c1a17] text-white'
                        : 'bg-white border-[#e5e1da] text-[#524d45] hover:border-[#1c1a17]'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Template Grid */}
            {filteredTemplates.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {filteredTemplates.map((template) => {
                  const isActive = activeTemplateId === template.id;
                  return (
                    <button
                      key={template.id}
                      onClick={() => onSelectTemplate(template)}
                      className={`group relative rounded-xl border-2 overflow-hidden bg-[#faf9f6] flex flex-col text-left transition-all hover:shadow-md hover:border-[#1c1a17] ${
                        isActive ? 'border-[#1c1a17] ring-2 ring-[#1c1a17]/10' : 'border-[#e5e1da]'
                      }`}
                    >
                      <div className="aspect-square w-full relative bg-[#e5e1da] overflow-hidden">
                        <img
                          src={template.url}
                          alt={template.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        {isActive && (
                          <div className="absolute top-2 right-2 bg-[#1c1a17] text-white p-1 rounded-full shadow-sm">
                            <CheckCircle className="w-3.5 h-3.5 fill-[#1c1a17]" />
                          </div>
                        )}
                      </div>
                      <div className="p-2 border-t border-[#e5e1da]">
                        <h4 className="text-[11px] font-bold text-[#1c1a17] truncate">{template.name}</h4>
                        <div className="flex gap-1 mt-1 flex-wrap overflow-hidden h-[16px]">
                          {template.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[8px] bg-[#f4f2ee] text-[#7c7468] px-1 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 flex-1 flex flex-col items-center justify-center text-[#7c7468]">
                <p className="text-xs font-semibold mb-1">No templates found</p>
                <p className="text-[10px]">Try resetting search filters or keywords.</p>
              </div>
            )}
          </div>
        )}

        {/* AI Backdrop Generator Tab */}
        {activeTab === 'ai' && (
          <div className="flex-1 flex flex-col gap-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex gap-2 items-start text-xs text-amber-800">
              <Sparkles className="w-4.5 h-4.5 shrink-0 text-amber-500 mt-0.5" />
              <div>
                <span className="font-bold">Gemini 3.1 Flash Image</span>
                <p className="text-[10px] text-amber-700 mt-0.5 leading-relaxed">
                  Generate entirely unique meme base-plates with AI. Describe the template scene below. Avoid requesting pre-baked text on the template!
                </p>
              </div>
            </div>

            <form onSubmit={handleAiSubmit} className="space-y-4 flex-1 flex flex-col">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1c1a17]">Scene description</label>
                <textarea
                  required
                  rows={4}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. A grumpy kitten wearing huge coder headphones looking at a green computer screen with binary code reflection"
                  className="w-full p-3 text-xs bg-[#faf9f6] border border-[#e5e1da] rounded-xl focus:outline-none focus:border-[#1c1a17] text-[#1c1a17] transition-colors resize-none placeholder-[#a39a8f]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1c1a17] block">Aspect Ratio</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Square (1:1)', val: '1:1' },
                    { label: 'Classic (4:3)', val: '4:3' },
                    { label: 'Widescreen (16:9)', val: '16:9' },
                    { label: 'Social (9:16)', val: '9:16' }
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setAiAspectRatio(item.val)}
                      className={`py-2 text-[10px] font-semibold border rounded-lg transition-all ${
                        aiAspectRatio === item.val
                          ? 'bg-[#1c1a17] border-[#1c1a17] text-white shadow-sm'
                          : 'bg-white border-[#e5e1da] text-[#524d45] hover:border-[#1c1a17]'
                      }`}
                    >
                      {item.val}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex-1 flex flex-col justify-end">
                <button
                  type="submit"
                  disabled={isGeneratingAi || !aiPrompt.trim()}
                  className="w-full py-3 bg-[#1c1a17] hover:bg-[#322f29] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingAi ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generating with Gemini Flash...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Template</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Upload Custom Image Tab */}
        {activeTab === 'upload' && (
          <div className="flex-1 flex flex-col gap-4">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex-1 border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[300px] ${
                dragOver
                  ? 'border-[#1c1a17] bg-[#f4f2ee]'
                  : 'border-[#e5e1da] bg-[#faf9f6] hover:bg-[#f4f2ee] hover:border-[#7c7468]'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/jpg"
                className="hidden"
              />

              <div className="bg-white p-4 rounded-full shadow-sm border border-[#e5e1da] mb-4 text-[#7c7468]">
                <Upload className="w-8 h-8" />
              </div>

              <h4 className="text-sm font-bold text-[#1c1a17] mb-1">Drag and drop your image</h4>
              <p className="text-xs text-[#7c7468] mb-4">Supports JPEG, PNG up to 10MB</p>

              <button
                type="button"
                className="px-4 py-2 bg-white border border-[#e5e1da] text-[#1c1a17] hover:border-[#1c1a17] rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                Browse Files
              </button>
            </div>

            <p className="text-[10px] text-[#7c7468] text-center leading-relaxed">
              Once uploaded, you can use the AI Magic Caption button on the right to immediately get funny contextual captions designed just for your photo!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
