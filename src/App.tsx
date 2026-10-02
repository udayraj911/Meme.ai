import React, { useState } from 'react';
import Header from './components/Header';
import TemplateSelector from './components/TemplateSelector';
import MemeEditor from './components/MemeEditor';
import AIPanel from './components/AIPanel';
import { TRENDING_TEMPLATES } from './data/templates';
import { MemeTemplate, TextOverlay, CaptionSuggestion } from './types';
import { Sparkles, Image as ImageIcon, Sliders, Play, AlertCircle } from 'lucide-react';

export default function App() {
  // Initialize with the first high-quality template in our collection
  const defaultTemplate = TRENDING_TEMPLATES[0];

  const [currentTemplate, setCurrentTemplate] = useState<MemeTemplate | null>(defaultTemplate);
  const [imageUrl, setImageUrl] = useState<string>(defaultTemplate.url);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');

  // Load template's default overlays, assigning them safe unique IDs
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>(
    (defaultTemplate.defaultTextOverlays || []).map((o, idx) => ({
      ...o,
      id: `text-init-${idx}-${Date.now()}`,
    }))
  );

  const [activeTextId, setActiveTextId] = useState<string | null>(
    textOverlays.length > 0 ? textOverlays[0].id : null
  );

  // AI Loading & Result States
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [isGeneratingTemplate, setIsGeneratingTemplate] = useState(false);
  const [isRemakingImage, setIsRemakingImage] = useState(false);
  const [suggestions, setSuggestions] = useState<CaptionSuggestion[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  // Retrieve the currently highlighted text overlay for the controls
  const activeText = textOverlays.find(o => o.id === activeTextId) || null;

  // 1. Template selection handler
  const handleSelectTemplate = (template: MemeTemplate) => {
    setCurrentTemplate(template);
    setImageUrl(template.url);
    setMimeType('image/jpeg');
    setApiError(null);
    setSuggestions([]);

    // Map template's defaults to state with unique IDs
    const mapped = (template.defaultTextOverlays || []).map((o, idx) => ({
      ...o,
      id: `text-${template.id}-${idx}-${Date.now()}`,
    }));
    setTextOverlays(mapped);
    setActiveTextId(mapped.length > 0 ? mapped[mapped.length - 1].id : null);
  };

  // 2. Custom photo upload handler
  const handleUploadCustom = (base64: string, fileMimeType: string) => {
    setCurrentTemplate(null);
    setImageUrl(base64);
    setMimeType(fileMimeType);
    setApiError(null);
    setSuggestions([]);

    // Provide one default editable text box centered to guide the user
    const defaultBox: TextOverlay = {
      id: `text-uploaded-${Date.now()}`,
      text: 'Double click to edit',
      x: 50,
      y: 15,
      fontSize: 32,
      color: '#ffffff',
      borderColor: '#000000',
      borderWidth: 4,
      fontFamily: 'Anton',
      isUppercase: true,
      align: 'center',
      maxWidth: 90,
    };

    setTextOverlays([defaultBox]);
    setActiveTextId(defaultBox.id);
  };

  // 3. AI Template generation using text prompts
  const handleAiGenerateTemplate = async (prompt: string, aspectRatio: string): Promise<string | null> => {
    setIsGeneratingTemplate(true);
    setApiError(null);
    try {
      const response = await fetch('/api/generate-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, aspectRatio }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to generate backdrop template');
      }

      const generatedUrl = data.imageUrl;
      setCurrentTemplate(null);
      setImageUrl(generatedUrl);
      setMimeType('image/png');
      setSuggestions([]);

      // Setup a starter overlay text box
      const initialBox: TextOverlay = {
        id: `text-ai-gen-${Date.now()}`,
        text: 'TAP TO CHANGE TEXT',
        x: 50,
        y: 85,
        fontSize: 32,
        color: '#ffffff',
        borderColor: '#000000',
        borderWidth: 4,
        fontFamily: 'Anton',
        isUppercase: true,
        align: 'center',
        maxWidth: 90,
      };

      setTextOverlays([initialBox]);
      setActiveTextId(initialBox.id);
      return generatedUrl;
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || 'Error communicating with Gemini model.');
      return null;
    } finally {
      setIsGeneratingTemplate(false);
    }
  };

  // 4. Trigger Magic Caption Context Analysis
  const handleTriggerMagicCaption = async () => {
    if (!imageUrl) return;
    setIsGeneratingCaption(true);
    setApiError(null);
    setSuggestions([]);

    try {
      const response = await fetch('/api/magic-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageUrl,
          mimeType: mimeType,
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to analyze photo and get suggestions');
      }

      if (data.captions && data.captions.length > 0) {
        setSuggestions(data.captions);
      } else {
        throw new Error('AI returned an empty suggestion list.');
      }
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || 'An error occurred during visual context analysis.');
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  // 5. Apply AI Caption suggestion to active layers
  const handleApplySuggestion = (suggestion: CaptionSuggestion) => {
    const timeId = Date.now();
    const newOverlays: TextOverlay[] = [];

    // If it has traditional top and bottom texts
    if (suggestion.topText || suggestion.bottomText) {
      if (suggestion.topText) {
        newOverlays.push({
          id: `text-ai-top-${timeId}`,
          text: suggestion.topText,
          x: 50,
          y: 12,
          fontSize: 34,
          color: '#ffffff',
          borderColor: '#000000',
          borderWidth: 4,
          fontFamily: 'Anton',
          isUppercase: true,
          align: 'center',
          maxWidth: 90,
        });
      }

      if (suggestion.bottomText) {
        newOverlays.push({
          id: `text-ai-bot-${timeId}`,
          text: suggestion.bottomText,
          x: 50,
          y: 85,
          fontSize: 34,
          color: '#ffffff',
          borderColor: '#000000',
          borderWidth: 4,
          fontFamily: 'Anton',
          isUppercase: true,
          align: 'center',
          maxWidth: 90,
        });
      }
    } else if (suggestion.text) {
      // If single line modern tweet-style caption
      newOverlays.push({
        id: `text-ai-single-${timeId}`,
        text: suggestion.text,
        x: 50,
        y: 15,
        fontSize: 24,
        color: '#ffffff',
        borderColor: '#000000',
        borderWidth: 3,
        fontFamily: 'Montserrat',
        isUppercase: false,
        align: 'center',
        maxWidth: 85,
      });
    }

    if (newOverlays.length > 0) {
      setTextOverlays(newOverlays);
      setActiveTextId(newOverlays[newOverlays.length - 1].id);
    }
  };

  // 6. Trigger Image Backdrop Remaking/Modification
  const handleTriggerRemake = async (prompt: string) => {
    if (!imageUrl) return;
    setIsRemakingImage(true);
    setApiError(null);

    try {
      const response = await fetch('/api/edit-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageUrl,
          mimeType: mimeType,
          prompt: prompt,
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to modify image template');
      }

      setImageUrl(data.imageUrl);
      setMimeType('image/png');
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || 'An error occurred during AI image remodeling.');
    } finally {
      setIsRemakingImage(false);
    }
  };

  // Text state update delegates
  const handleUpdateActiveText = (updatedFields: Partial<TextOverlay>) => {
    if (!activeTextId) return;
    setTextOverlays(
      textOverlays.map(o => (o.id === activeTextId ? { ...o, ...updatedFields } : o))
    );
  };

  const handleDeleteActiveText = () => {
    if (!activeTextId) return;
    const updated = textOverlays.filter(o => o.id !== activeTextId);
    setTextOverlays(updated);
    setActiveTextId(updated.length > 0 ? updated[updated.length - 1].id : null);
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1c1a17] flex flex-col">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-6 w-full flex-1 flex flex-col gap-6">
        {/* API Error Notification */}
        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl flex items-start gap-3 text-xs animate-fadeIn shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">An Error Occurred</span>
              <p className="text-red-700 leading-normal">{apiError}</p>
              <p className="text-[10px] text-red-500">
                Please make sure your API key is correctly configured in <strong>Settings &gt; Secrets</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Core Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1">
          {/* Left Panel: Template Selector */}
          <section className="lg:col-span-3 flex flex-col">
            <TemplateSelector
              onSelectTemplate={handleSelectTemplate}
              onUploadCustom={handleUploadCustom}
              activeTemplateId={currentTemplate?.id || null}
              onAiGenerate={handleAiGenerateTemplate}
              isGeneratingAi={isGeneratingTemplate}
            />
          </section>

          {/* Middle Column: Interactive Meme Canvas */}
          <section className="lg:col-span-5 flex flex-col h-full">
            <MemeEditor
              imageUrl={imageUrl}
              textOverlays={textOverlays}
              onChangeOverlays={setTextOverlays}
              activeTextId={activeTextId}
              onSetActiveTextId={setActiveTextId}
              isScanning={isGeneratingCaption}
            />
          </section>

          {/* Right Panel: AI Capabilities & Custom Styling Controls */}
          <section className="lg:col-span-4 flex flex-col">
            <AIPanel
              activeText={activeText}
              onUpdateActiveText={handleUpdateActiveText}
              onDeleteActiveText={handleDeleteActiveText}
              onTriggerMagicCaption={handleTriggerMagicCaption}
              isGeneratingCaption={isGeneratingCaption}
              suggestions={suggestions}
              onApplySuggestion={handleApplySuggestion}
              onTriggerRemake={handleTriggerRemake}
              isRemakingImage={isRemakingImage}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
