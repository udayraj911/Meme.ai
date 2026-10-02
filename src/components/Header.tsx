import React, { useState } from 'react';
import { Image, Sparkles, HelpCircle, AlertCircle, X } from 'lucide-react';

export default function Header() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#e5e1da] px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#f0f9ff] text-[#0284c7] p-2 rounded-xl border border-[#bae6fd] shadow-sm">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#1c1a17] flex items-center gap-2">
              MemeCraft AI <span className="text-xs bg-[#e0f2fe] text-[#0369a1] font-semibold px-2 py-0.5 rounded-full border border-[#bae6fd]">v2.5</span>
            </h1>
            <p className="text-xs text-[#7c7468]">Next-gen full-stack intelligent meme designer</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-xs text-[#524d45] bg-[#f4f2ee] px-3 py-1.5 rounded-lg border border-[#e5e1da]">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping"></span>
            <span>Gemini 3.1 Suite Active</span>
          </div>

          <button
            onClick={() => setShowHelp(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-[#7c7468] hover:text-[#1c1a17] bg-[#f4f2ee] hover:bg-[#e5e1da] px-3 py-1.5 rounded-lg transition-colors border border-[#e5e1da]"
          >
            <HelpCircle className="w-4 h-4" />
            <span>How it Works</span>
          </button>
        </div>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#faf9f6] border border-[#e5e1da] rounded-2xl w-full max-w-lg p-6 shadow-xl relative">
            <button
              onClick={() => setShowHelp(false)}
              className="absolute top-4 right-4 text-[#7c7468] hover:text-[#1c1a17] p-1 rounded-lg hover:bg-[#f4f2ee]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex gap-3 mb-4">
              <div className="bg-[#fef9c3] text-[#a16207] p-2 rounded-xl border border-[#fef08a]">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#1c1a17]">MemeCraft AI Manual</h3>
            </div>

            <div className="space-y-4 text-sm text-[#524d45]">
              <div className="p-3 bg-white rounded-xl border border-[#e5e1da]">
                <h4 className="font-semibold text-[#1c1a17] mb-1">1. Choose or Generate Backdrop</h4>
                <p>Pick a trending meme template, upload your own local image, or <strong>write a text prompt</strong> to generate a custom template using <strong>Gemini Flash Image</strong>.</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#e5e1da]">
                <h4 className="font-semibold text-[#1c1a17] mb-1">2. Magic Caption Suggestions</h4>
                <p>Click the <strong>"Magic Caption 🪄"</strong> button. The app sends the current backdrop to <strong>Gemini Pro</strong>, which reads the context, character faces, and scenario, generating 5 witty, highly tailored meme suggestions!</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#e5e1da]">
                <h4 className="font-semibold text-[#1c1a17] mb-1">3. Custom Styling & Layout</h4>
                <p>Click any AI suggestion to overlay it instantly. Drag captions anywhere, select fonts (Anton, Bebas Neue, Permanent Marker), adjust sizes, borders, colors, or add multiple custom text layers.</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#e5e1da]">
                <h4 className="font-semibold text-[#1c1a17] mb-1">4. AI Image Modification</h4>
                <p>Use the <strong>"AI Remake"</strong> tool to edit your background image (e.g., "Add funny party hats" or "Make it retro cartoon style") using generative AI!</p>
              </div>
            </div>

            <button
              onClick={() => setShowHelp(false)}
              className="mt-6 w-full py-2.5 bg-[#1c1a17] text-white hover:bg-[#322f29] font-semibold rounded-xl text-xs transition-colors shadow-sm"
            >
              Start Crafting Memes
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
