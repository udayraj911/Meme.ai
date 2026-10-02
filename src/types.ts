export interface MemeTemplate {
  id: string;
  name: string;
  url: string;
  tags: string[];
  defaultTextOverlays?: Omit<TextOverlay, 'id'>[];
}

export interface TextOverlay {
  id: string;
  text: string;
  x: number; // percentage X (0 to 100)
  y: number; // percentage Y (0 to 100)
  fontSize: number; // size in pixels
  color: string;
  borderColor: string;
  borderWidth: number;
  fontFamily: string;
  isUppercase: boolean;
  align: 'left' | 'center' | 'right';
  maxWidth: number; // percentage max width (e.g., 90)
}

export interface CaptionSuggestion {
  vibe: string; // e.g., "Sarcastic", "Relatable", "Millennial", "Nerd/Geek", "Literal"
  text?: string; // Standard single-line or multi-line caption
  topText?: string; // Traditional top meme text
  bottomText?: string; // Traditional bottom meme text
  explanation: string; // Brief funny explanation of why this caption fits
}

export interface GenerationResponse {
  captions?: CaptionSuggestion[];
  error?: string;
}

export interface ImageGenerationResponse {
  imageUrl?: string;
  error?: string;
}
