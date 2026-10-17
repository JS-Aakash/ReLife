import { DemoPersona, ReLifeUser } from './types';

export const DEMO_PERSONAS = {
  aarav: {
    id: 'usr-aarav-sharma',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@relife.in',
    role: 'consumer' as const,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    badge: 'Hardware Custodian (Owner)',
    description: 'Manages 4 verified personal assets (MacBook Pro M3, Specialized Bike, Sony XM5, Dyson Vacuum) with certified repair records.',
  },
  priya: {
    id: 'usr-priya-patel',
    name: 'Priya Patel',
    email: 'priya.patel@relife.in',
    role: 'consumer' as const,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    badge: 'Sustainable Fleet Lead',
    description: 'Oversees 4 verified mobile & imaging assets (iPhone 15 Pro, iPad Pro M2, Dell XPS 15, Fujifilm X-T5).',
  },
  vikram: {
    id: 'usr-vikram-malhotra',
    name: 'Vikram Malhotra',
    email: 'vikram.malhotra@zenithrepairs.in',
    role: 'technician' as const,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    badge: 'Certified Master Technician',
    description: 'Lead engineer at Zenith Diagnostics with an active diagnostic equipment fleet and authorized customer verification queue.',
  },
  // Backward compatibility aliases
  elena: {
    id: 'usr-aarav-sharma',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@relife.in',
    role: 'consumer' as const,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    badge: 'Hardware Custodian (Owner)',
    description: 'Manages 4 verified personal assets with complete repair records.',
  },
  liam: {
    id: 'usr-priya-patel',
    name: 'Priya Patel',
    email: 'priya.patel@relife.in',
    role: 'consumer' as const,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    badge: 'Sustainable Fleet Lead',
    description: 'Oversees 4 verified mobile & imaging assets.',
  },
  alex: {
    id: 'usr-vikram-malhotra',
    name: 'Vikram Malhotra',
    email: 'vikram.malhotra@zenithrepairs.in',
    role: 'technician' as const,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    badge: 'Certified Master Technician',
    description: 'Lead engineer at Zenith Diagnostics.',
  },
} as const;

export type DemoPersonaKey = 'aarav' | 'priya' | 'vikram' | 'elena' | 'liam' | 'alex';

export const DEFAULT_DEMO_USER: ReLifeUser = {
  id: DEMO_PERSONAS.aarav.id,
  name: DEMO_PERSONAS.aarav.name,
  email: DEMO_PERSONAS.aarav.email,
  avatar: DEMO_PERSONAS.aarav.avatar,
  role: DEMO_PERSONAS.aarav.role,
  isDemoUser: true,
};
