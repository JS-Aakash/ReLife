import { DemoPersona, ReLifeUser } from './types';

export const DEMO_PERSONAS: Record<'elena' | 'liam' | 'alex', DemoPersona> = {
  elena: {
    id: 'usr-elena-rostova',
    name: 'Elena Rostova',
    email: 'elena@relife-demo.org',
    role: 'consumer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    badge: 'Hardware Caretaker (Owner)',
    description: 'Manages 3 verified heirloom products (MacBook Pro, Specialized Sirrus, Dyson V15) with complete repair records.',
  },
  liam: {
    id: 'usr-liam-sterling',
    name: 'Liam Sterling',
    email: 'liam@relife-demo.org',
    role: 'consumer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    badge: 'Prospective Buyer / Recipient',
    description: 'Fresh account ready to receive ownership transfers, claim digital passports, and explore gear.',
  },
  alex: {
    id: 'usr-alex-rivera-tech',
    name: 'Alex Rivera',
    email: 'alex@apexrepairs.com',
    role: 'technician',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    badge: 'Certified Master Technician',
    description: 'Authorized service provider with permissions to submit certified repair records to customer passports.',
  },
};

export const DEFAULT_DEMO_USER: ReLifeUser = {
  id: DEMO_PERSONAS.elena.id,
  name: DEMO_PERSONAS.elena.name,
  email: DEMO_PERSONAS.elena.email,
  avatar: DEMO_PERSONAS.elena.avatar,
  role: DEMO_PERSONAS.elena.role,
  isDemoUser: true,
};
