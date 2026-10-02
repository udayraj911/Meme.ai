import { MemeTemplate } from '../types';

export const TRENDING_TEMPLATES: MemeTemplate[] = [
  {
    id: 'skeptical-pug',
    name: 'Skeptical Pug',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    tags: ['Animal', 'Skeptical', 'Funny'],
    defaultTextOverlays: [
      {
        text: "ARE YOU SURE?",
        x: 50,
        y: 12,
        fontSize: 36,
        color: "#ffffff",
        borderColor: "#000000",
        borderWidth: 4,
        fontFamily: "Anton",
        isUppercase: true,
        align: "center",
        maxWidth: 90
      },
      {
        text: "THAT HE ONLY DEPLOYED ONCE TODAY?",
        x: 50,
        y: 85,
        fontSize: 28,
        color: "#ffffff",
        borderColor: "#000000",
        borderWidth: 4,
        fontFamily: "Anton",
        isUppercase: true,
        align: "center",
        maxWidth: 90
      }
    ]
  },
  {
    id: 'stressed-dev',
    name: 'Confused Developer',
    url: 'https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?auto=format&fit=crop&w=800&q=80',
    tags: ['Programming', 'Stressed', 'Relatable'],
    defaultTextOverlays: [
      {
        text: "IT WORKED IN DEVELOPMENT",
        x: 50,
        y: 10,
        fontSize: 32,
        color: "#ffffff",
        borderColor: "#000000",
        borderWidth: 4,
        fontFamily: "Anton",
        isUppercase: true,
        align: "center",
        maxWidth: 90
      },
      {
        text: "BUT CRASHES ON STARTUP IN PROD",
        x: 50,
        y: 88,
        fontSize: 28,
        color: "#ffffff",
        borderColor: "#000000",
        borderWidth: 4,
        fontFamily: "Anton",
        isUppercase: true,
        align: "center",
        maxWidth: 90
      }
    ]
  },
  {
    id: 'dramatic-cat',
    name: 'Shocked Orange Cat',
    url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
    tags: ['Animal', 'Drama', 'Reaction'],
    defaultTextOverlays: [
      {
        text: "THE BOWL IS ONLY HALF FULL",
        x: 50,
        y: 15,
        fontSize: 36,
        color: "#ffffff",
        borderColor: "#000000",
        borderWidth: 4,
        fontFamily: "Anton",
        isUppercase: true,
        align: "center",
        maxWidth: 90
      },
      {
        text: "I AM STARVING TO DEATH",
        x: 50,
        y: 85,
        fontSize: 36,
        color: "#ffffff",
        borderColor: "#000000",
        borderWidth: 4,
        fontFamily: "Anton",
        isUppercase: true,
        align: "center",
        maxWidth: 90
      }
    ]
  },
  {
    id: 'overwhelmed-meeting',
    name: 'Overwhelmed Corporate',
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    tags: ['Workplace', 'Corporate', 'Meeting'],
    defaultTextOverlays: [
      {
        text: "THIS COULD HAVE BEEN",
        x: 50,
        y: 10,
        fontSize: 32,
        color: "#ffffff",
        borderColor: "#000000",
        borderWidth: 4,
        fontFamily: "Anton",
        isUppercase: true,
        align: "center",
        maxWidth: 90
      },
      {
        text: "AN EMAIL.",
        x: 50,
        y: 88,
        fontSize: 48,
        color: "#ffffff",
        borderColor: "#000000",
        borderWidth: 5,
        fontFamily: "Anton",
        isUppercase: true,
        align: "center",
        maxWidth: 90
      }
    ]
  },
  {
    id: 'mind-blown',
    name: 'Existential Realization',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    tags: ['Space', 'Existential', 'Deep'],
    defaultTextOverlays: [
      {
        text: "WHEN YOU REALISE",
        x: 50,
        y: 15,
        fontSize: 36,
        color: "#ffffff",
        borderColor: "#000000",
        borderWidth: 4,
        fontFamily: "Anton",
        isUppercase: true,
        align: "center",
        maxWidth: 90
      },
      {
        text: "CSS IS JUST PRETTY RECTANGLES",
        x: 50,
        y: 82,
        fontSize: 32,
        color: "#38bdf8",
        borderColor: "#000000",
        borderWidth: 4,
        fontFamily: "Anton",
        isUppercase: true,
        align: "center",
        maxWidth: 90
      }
    ]
  },
  {
    id: 'shocked-businessman',
    name: 'Shocked Executive',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
    tags: ['Workplace', 'Shocked', 'Reaction'],
    defaultTextOverlays: [
      {
        text: "MY REVENUE JUST GRAPHED UPWARDS",
        x: 50,
        y: 10,
        fontSize: 28,
        color: "#ffffff",
        borderColor: "#000000",
        borderWidth: 4,
        fontFamily: "Anton",
        isUppercase: true,
        align: "center",
        maxWidth: 90
      },
      {
        text: "Wait, that is the cost chart",
        x: 50,
        y: 88,
        fontSize: 24,
        color: "#ef4444",
        borderColor: "#000000",
        borderWidth: 3,
        fontFamily: "Montserrat",
        isUppercase: false,
        align: "center",
        maxWidth: 90
      }
    ]
  },
  {
    id: 'success-posing',
    name: 'Pure Victory',
    url: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=800&q=80',
    tags: ['Victory', 'Success', 'Inspiring'],
    defaultTextOverlays: [
      {
        text: "I FIXED THE BUG",
        x: 50,
        y: 12,
        fontSize: 36,
        color: "#ffffff",
        borderColor: "#000000",
        borderWidth: 4,
        fontFamily: "Anton",
        isUppercase: true,
        align: "center",
        maxWidth: 90
      },
      {
        text: "BY DELETING THE ENTIRE FILE",
        x: 50,
        y: 85,
        fontSize: 28,
        color: "#4ade80",
        borderColor: "#000000",
        borderWidth: 4,
        fontFamily: "Anton",
        isUppercase: true,
        align: "center",
        maxWidth: 90
      }
    ]
  },
  {
    id: 'deep-thinker',
    name: 'Philosophical Question',
    url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    tags: ['Philosophical', 'Thinker', 'Sarcastic'],
    defaultTextOverlays: [
      {
        text: "IF A CLOUD CRASHES",
        x: 50,
        y: 12,
        fontSize: 34,
        color: "#ffffff",
        borderColor: "#000000",
        borderWidth: 4,
        fontFamily: "Anton",
        isUppercase: true,
        align: "center",
        maxWidth: 90
      },
      {
        text: "DOES IT MAKE A SOUND?",
        x: 50,
        y: 85,
        fontSize: 34,
        color: "#ffffff",
        borderColor: "#000000",
        borderWidth: 4,
        fontFamily: "Anton",
        isUppercase: true,
        align: "center",
        maxWidth: 90
      }
    ]
  }
];
