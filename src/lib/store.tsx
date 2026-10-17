'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Product,
  RepairRecord,
  DocumentItem,
  MaintenanceReminder,
  AppNotification,
  ServiceProviderSubmission,
  OwnershipTransferRequest,
  ResaleDisclosureSettings,
  ReLifeUser,
} from './types';
import {
  INITIAL_PRODUCTS,
  ALL_DEMO_PRODUCTS,
  INITIAL_REMINDERS,
  INITIAL_NOTIFICATIONS,
  AARAV_INITIAL_PRODUCTS,
  AARAV_INITIAL_REMINDERS,
  AARAV_INITIAL_NOTIFICATIONS,
  PRIYA_INITIAL_PRODUCTS,
  PRIYA_INITIAL_REMINDERS,
  PRIYA_INITIAL_NOTIFICATIONS,
  VIKRAM_INITIAL_PRODUCTS,
  VIKRAM_INITIAL_REMINDERS,
  VIKRAM_INITIAL_NOTIFICATIONS,
  INITIAL_SERVICE_SUBMISSIONS,
} from './initial-data';
import { DEMO_PERSONAS, DEFAULT_DEMO_USER, DemoPersonaKey } from './auth-personas';
import { calculateHealthScore, calculateEnvironmentalImpact } from './calculations';
import { generateId, generatePublicId } from './utils';
import {
  supabase,
  isSupabaseConfigured,
  supabaseSignUp,
  supabaseSignIn,
  supabaseSignOut,
} from './supabase';

const ACTIVE_USER_KEY = 'relife_active_user_v2';
const DEMO_MODE_KEY = 'relife_demo_mode_v2';
const ACTIVE_PERSONA_KEY = 'relife_active_persona_v2';

interface ReLifeContextType {
  products: Product[];
  reminders: MaintenanceReminder[];
  notifications: AppNotification[];
  currentUser: ReLifeUser | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  activePersonaKey: DemoPersonaKey | 'custom' | null;
  serviceSubmissions: ServiceProviderSubmission[];
  transferRequests: OwnershipTransferRequest[];
  isLoaded: boolean;
  isSupabaseSynced: boolean;
  isDemoMode: boolean;
  unreadCount: number;

  // Auth actions
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (
    email: string,
    password?: string,
    fullName?: string,
    role?: 'consumer' | 'technician'
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loginAsDemo: (personaKey: DemoPersonaKey) => void;

  // Demo Mode controls
  setDemoMode: (val: boolean) => void;
  toggleDemoMode: () => void;

  // Product actions
  addProduct: (
    product: Omit<
      Product,
      | 'id'
      | 'publicId'
      | 'userId'
      | 'healthScore'
      | 'healthBreakdown'
      | 'eWasteAvoidedKg'
      | 'carbonAvoidedKg'
      | 'estimatedUsefulLifeRemainingYears'
      | 'originalLifespanYears'
      | 'documents'
      | 'repairs'
      | 'ownershipHistory'
      | 'status'
      | 'createdAt'
      | 'updatedAt'
    >
  ) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProductByPublicId: (publicId: string) => Product | undefined;
  getProductById: (id: string) => Product | undefined;

  // Repairs & Timeline
  addRepair: (
    productId: string,
    repair: Omit<RepairRecord, 'id' | 'createdAt' | 'productId'>
  ) => RepairRecord;

  // Documents Vault
  addDocument: (
    productId: string,
    doc: Omit<DocumentItem, 'id' | 'uploadDate' | 'productId' | 'userId'>
  ) => DocumentItem;
  deleteDocument: (productId: string, docId: string) => void;

  // Privacy & Resale
  updateResaleDisclosure: (productId: string, settings: Partial<ResaleDisclosureSettings>) => void;
  togglePublicShare: (productId: string, isShared: boolean) => void;

  // Technician Workflow
  submitTechnicianRepair: (
    submission: Omit<ServiceProviderSubmission, 'id' | 'submittedAt' | 'status'>
  ) => ServiceProviderSubmission;
  approveTechnicianRepair: (submissionId: string) => void;
  rejectTechnicianRepair: (submissionId: string) => void;

  // Ownership Transfer (Chain of Custody)
  initiateTransfer: (
    productId: string,
    toEmail: string,
    transferType: 'private_sale' | 'gift' | 'other',
    agreedPrice?: number
  ) => OwnershipTransferRequest;
  acceptTransfer: (token: string, newOwnerName: string, newOwnerEmail: string) => boolean;
  getTransferByToken: (token: string) => OwnershipTransferRequest | undefined;

  // Reminders & Notifications
  toggleReminder: (id: string) => void;
  addReminder: (reminder: Omit<MaintenanceReminder, 'id' | 'createdAt' | 'userId'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Reset
  resetToDemoData: () => void;
}

const ReLifeContext = createContext<ReLifeContextType | undefined>(undefined);

export function ReLifeProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<ReLifeUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [activePersonaKey, setActivePersonaKey] = useState<DemoPersonaKey | 'custom' | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [reminders, setReminders] = useState<MaintenanceReminder[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [serviceSubmissions, setServiceSubmissions] = useState<ServiceProviderSubmission[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('relife_service_submissions_v2');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.warn('Failed to parse saved submissions', e);
        }
      }
    }
    return INITIAL_SERVICE_SUBMISSIONS;
  });
  const [transferRequests, setTransferRequests] = useState<OwnershipTransferRequest[]>([]);

  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isSupabaseSynced, setIsSupabaseSynced] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);

  // Helper to load user-partitioned data from LocalStorage & Supabase
  const loadUserData = useCallback(async (user: ReLifeUser | null) => {
    if (!user) {
      setProducts([]);
      setReminders([]);
      setNotifications([]);
      return;
    }

    const userId = user.id;

    // 1. Load from user-specific local storage partition
    try {
      const userProductsKey = `relife_products_${userId}`;
      const userRemindersKey = `relife_reminders_${userId}`;
      const userNotifsKey = `relife_notifs_${userId}`;

      const savedProducts = localStorage.getItem(userProductsKey);
      const savedReminders = localStorage.getItem(userRemindersKey);
      const savedNotifs = localStorage.getItem(userNotifsKey);

      if (savedProducts) {
        const parsed = JSON.parse(savedProducts);
        const healed = Array.isArray(parsed)
          ? parsed.map((p: any) => {
              if (p.imageUrl?.includes('photo-1581092335397-9583fe92d232')) {
                return { ...p, imageUrl: 'https://images.unsplash.com/photo-1597733336794-12d05021d510?auto=format&fit=crop&w=1000&q=80' };
              }
              return p;
            })
          : parsed;
        setProducts(healed);
      } else if (userId === DEMO_PERSONAS.aarav.id || userId === 'usr-aarav-sharma' || userId === 'usr-elena-rostova') {
        setProducts(AARAV_INITIAL_PRODUCTS);
      } else if (userId === DEMO_PERSONAS.priya.id || userId === 'usr-priya-patel' || userId === 'usr-liam-sterling') {
        setProducts(PRIYA_INITIAL_PRODUCTS);
      } else if (userId === DEMO_PERSONAS.vikram.id || userId === 'usr-vikram-malhotra' || userId === 'usr-alex-rivera-tech') {
        setProducts(VIKRAM_INITIAL_PRODUCTS);
      } else {
        setProducts([]);
      }

      if (savedReminders) {
        setReminders(JSON.parse(savedReminders));
      } else if (userId === DEMO_PERSONAS.aarav.id || userId === 'usr-aarav-sharma' || userId === 'usr-elena-rostova') {
        setReminders(AARAV_INITIAL_REMINDERS);
      } else if (userId === DEMO_PERSONAS.priya.id || userId === 'usr-priya-patel' || userId === 'usr-liam-sterling') {
        setReminders(PRIYA_INITIAL_REMINDERS);
      } else if (userId === DEMO_PERSONAS.vikram.id || userId === 'usr-vikram-malhotra' || userId === 'usr-alex-rivera-tech') {
        setReminders(VIKRAM_INITIAL_REMINDERS);
      } else {
        setReminders([]);
      }

      if (savedNotifs) {
        setNotifications(JSON.parse(savedNotifs));
      } else if (userId === DEMO_PERSONAS.aarav.id || userId === 'usr-aarav-sharma' || userId === 'usr-elena-rostova') {
        setNotifications(AARAV_INITIAL_NOTIFICATIONS);
      } else if (userId === DEMO_PERSONAS.priya.id || userId === 'usr-priya-patel' || userId === 'usr-liam-sterling') {
        setNotifications(PRIYA_INITIAL_NOTIFICATIONS);
      } else if (userId === DEMO_PERSONAS.vikram.id || userId === 'usr-vikram-malhotra' || userId === 'usr-alex-rivera-tech') {
        setNotifications(VIKRAM_INITIAL_NOTIFICATIONS);
      } else {
        setNotifications([
          {
            id: generateId(),
            title: 'Welcome to ReLife',
            message: `Hello ${user.name}! Your secure digital product passport custodian vault is ready.`,
            timestamp: new Date().toISOString(),
            read: false,
            type: 'info',
          },
        ]);
      }
    } catch (e) {
      console.warn('Error reading user storage partition:', e);
    }

    // 2. If Supabase is connected and user is not in demo fallback mode, query Supabase
    if (supabase && isSupabaseConfigured && !user.isDemoUser) {
      try {
        const { data: supaProducts, error } = await supabase
          .from('products')
          .select('*, documents(*), repairs(*)')
          .eq('user_id', userId);

        if (!error && supaProducts && supaProducts.length > 0) {
          // Transform database fields to client model
          const mapped: Product[] = supaProducts.map((p: any) => ({
            id: p.id,
            publicId: p.public_id,
            userId: p.user_id,
            name: p.name,
            brand: p.brand,
            model: p.model,
            serialNumber: p.serial_number || '',
            category: p.category,
            purchasePrice: Number(p.purchase_price) || 0,
            purchaseCurrency: p.purchase_currency || 'USD',
            purchaseDate: p.purchase_date,
            seller: p.seller || '',
            warrantyMonths: p.warranty_months || 12,
            warrantyExpiryDate: p.warranty_expiry_date,
            condition: p.condition || 'good',
            imageUrl: p.image_url || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80',
            description: p.description,
            healthScore: p.health_score || 100,
            healthBreakdown: p.health_breakdown || calculateHealthScore(p.purchase_date, p.category, p.purchase_price, []),
            eWasteAvoidedKg: Number(p.e_waste_avoided_kg) || 0,
            carbonAvoidedKg: Number(p.carbon_avoided_kg) || 0,
            originalLifespanYears: Number(p.original_lifespan_years) || 5,
            estimatedUsefulLifeRemainingYears: Number(p.estimated_useful_life_remaining_years) || 5,
            resaleDisclosure: p.resale_disclosure || {
              showSerialNumber: true,
              showPurchasePrice: false,
              showFullTimeline: true,
              showDocumentProofs: true,
              showHealthScoreBreakdown: true,
              showTechnicianNotes: true,
            },
            ownershipHistory: p.ownership_history || [],
            status: p.status || 'active',
            isPubliclyShared: p.is_publicly_shared ?? true,
            createdAt: p.created_at,
            updatedAt: p.updated_at,
            documents: (p.documents || []).map((d: any) => ({
              id: d.id,
              productId: d.product_id,
              userId: d.user_id,
              title: d.title,
              fileName: d.file_name,
              fileSize: d.file_size || '250 KB',
              fileType: d.file_type,
              uploadDate: d.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
              url: d.url,
              isVerifiedReceipt: d.is_verified_receipt,
            })),
            repairs: (p.repairs || []).map((r: any) => ({
              id: r.id,
              productId: r.product_id,
              date: r.date,
              issueSummary: r.issue_summary,
              symptoms: r.symptoms || '',
              diagnosis: r.diagnosis || '',
              technicianOrShopName: r.technician_or_shop_name,
              serviceProviderId: r.service_provider_id,
              cost: Number(r.cost) || 0,
              partsReplaced: r.parts_replaced || [],
              warrantyClaim: r.warranty_claim || false,
              verificationBadge: r.verification_badge || 'owner-reported',
              verificationDetails: r.verification_details,
              usefulLifeExtensionMonths: r.useful_life_extension_months || 12,
              ownerApproved: r.owner_approved ?? true,
              notes: r.notes || '',
              createdAt: r.created_at,
            })),
          }));

          setProducts(mapped);
          setIsSupabaseSynced(true);
        }
      } catch (err) {
        console.info('Supabase query returned, keeping local state:', err);
      }
    }
  }, []);

  // Initialize Auth Session on mount
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        // 1. Check if Supabase session exists
        if (supabase && isSupabaseConfigured) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && isMounted) {
            const userObj: ReLifeUser = {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Hardware Caretaker',
              avatar: session.user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
              role: session.user.user_metadata?.role || 'consumer',
              isDemoUser: false,
            };
            setCurrentUser(userObj);
            setIsAuthenticated(true);
            setIsDemoMode(false);
            setActivePersonaKey('custom');
            localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(userObj));
            await loadUserData(userObj);
            setAuthLoading(false);
            setIsLoaded(true);
            return;
          }
        }

        // 2. Check saved session in localStorage
        const savedUserStr = localStorage.getItem(ACTIVE_USER_KEY);
        const savedPersona = localStorage.getItem(ACTIVE_PERSONA_KEY) as any;
        const savedDemo = localStorage.getItem(DEMO_MODE_KEY);

        if (savedUserStr && isMounted) {
          const parsedUser = JSON.parse(savedUserStr);
          setCurrentUser(parsedUser);
          setIsAuthenticated(true);
          setIsDemoMode(savedDemo !== null ? savedDemo === 'true' : Boolean(parsedUser.isDemoUser));
          setActivePersonaKey((savedPersona as DemoPersonaKey) || (parsedUser.isDemoUser ? 'aarav' : 'custom'));
          await loadUserData(parsedUser);
        } else if (isMounted) {
          // Default to logged-out state on fresh visits as requested
          setCurrentUser(null);
          setIsAuthenticated(false);
          setIsDemoMode(false);
          setActivePersonaKey(null);
          setProducts([]);
          setReminders([]);
          setNotifications([]);
        }
      } catch (err) {
        console.warn('Auth initialization error:', err);
        if (isMounted) {
          setCurrentUser(null);
          setIsAuthenticated(false);
          setIsDemoMode(false);
          setActivePersonaKey(null);
          setProducts([]);
          setReminders([]);
          setNotifications([]);
        }
      } finally {
        if (isMounted) {
          setAuthLoading(false);
          setIsLoaded(true);
        }
      }
    }

    initAuth();

    // 3. Listen to Supabase Auth State changes
    if (supabase && isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!isMounted) return;
        if (session?.user) {
          const userObj: ReLifeUser = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Hardware Caretaker',
            avatar: session.user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            role: session.user.user_metadata?.role || 'consumer',
            isDemoUser: false,
          };
          setCurrentUser(userObj);
          setIsAuthenticated(true);
          setIsDemoMode(false);
          setActivePersonaKey('custom');
          localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(userObj));
          localStorage.setItem(DEMO_MODE_KEY, 'false');
          localStorage.setItem(ACTIVE_PERSONA_KEY, 'custom');
          await loadUserData(userObj);
        } else if (_event === 'SIGNED_OUT') {
          // Handled in logout
        }
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, [loadUserData]);

  // Sync active user's partition to LocalStorage
  useEffect(() => {
    if (!isLoaded || !currentUser) return;
    try {
      const userProductsKey = `relife_products_${currentUser.id}`;
      const userRemindersKey = `relife_reminders_${currentUser.id}`;
      const userNotifsKey = `relife_notifs_${currentUser.id}`;

      localStorage.setItem(userProductsKey, JSON.stringify(products));
      localStorage.setItem(userRemindersKey, JSON.stringify(reminders));
      localStorage.setItem(userNotifsKey, JSON.stringify(notifications));
      localStorage.setItem(DEMO_MODE_KEY, String(isDemoMode));
    } catch (e) {
      console.warn('Failed to save to localStorage partition:', e);
    }
  }, [products, reminders, notifications, currentUser, isLoaded, isDemoMode]);

  // Auth Action: Sign In
  const login = async (email: string, password = ''): Promise<{ success: boolean; error?: string }> => {
    setAuthLoading(true);

    const trimmedEmail = email.trim().toLowerCase();

    // 1. Check Demo Personas first so judges entering demo credentials always instantly succeed
    const match = Object.entries(DEMO_PERSONAS).find(
      ([, p]) => p.email.toLowerCase() === trimmedEmail
    );

    if (match) {
      const [key] = match;
      loginAsDemo(key as DemoPersonaKey);
      setAuthLoading(false);
      return { success: true };
    }

    // 2. If Supabase is configured and not a demo email domain, authenticate with Supabase Auth
    if (
      supabase &&
      isSupabaseConfigured &&
      !trimmedEmail.endsWith('@relife.in') &&
      !trimmedEmail.endsWith('@zenithrepairs.in') &&
      !trimmedEmail.endsWith('@relife-demo.org')
    ) {
      const res = await supabaseSignIn(email, password);
      if (res.error) {
        setAuthLoading(false);
        return { success: false, error: res.error.message };
      }
      if (res.data?.user) {
        const user = res.data.user;
        const userObj: ReLifeUser = {
          id: user.id,
          email: user.email || email,
          name: user.user_metadata?.full_name || email.split('@')[0],
          avatar: user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          role: user.user_metadata?.role || 'consumer',
          isDemoUser: false,
        };
        setCurrentUser(userObj);
        setIsAuthenticated(true);
        setIsDemoMode(false);
        setActivePersonaKey('custom');
        localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(userObj));
        localStorage.setItem(DEMO_MODE_KEY, 'false');
        localStorage.setItem(ACTIVE_PERSONA_KEY, 'custom');
        await loadUserData(userObj);
        setAuthLoading(false);
        return { success: true };
      }
    }

    // 3. Custom Local User
    const customUser: ReLifeUser = {
      id: 'usr_' + Math.random().toString(36).substring(2, 10),
      name: email.split('@')[0],
      email,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      role: 'consumer',
      isDemoUser: true,
    };
    setCurrentUser(customUser);
    setIsAuthenticated(true);
    setIsDemoMode(true);
    setActivePersonaKey('custom');
    localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(customUser));
    localStorage.setItem(DEMO_MODE_KEY, 'true');
    localStorage.setItem(ACTIVE_PERSONA_KEY, 'custom');
    await loadUserData(customUser);
    setAuthLoading(false);
    return { success: true };
  };

  // Auth Action: Sign Up
  const signup = async (
    email: string,
    password = '',
    fullName = '',
    role: 'consumer' | 'technician' = 'consumer'
  ): Promise<{ success: boolean; error?: string }> => {
    setAuthLoading(true);

    if (supabase && isSupabaseConfigured && !email.endsWith('@relife-demo.org')) {
      const res = await supabaseSignUp(email, password, fullName, role);
      if (res.error) {
        setAuthLoading(false);
        return { success: false, error: res.error.message };
      }
      if (res.data?.user) {
        const user = res.data.user;
        const userObj: ReLifeUser = {
          id: user.id,
          email: user.email || email,
          name: fullName || email.split('@')[0],
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          role,
          isDemoUser: false,
        };
        setCurrentUser(userObj);
        setIsAuthenticated(true);
        setIsDemoMode(false);
        setActivePersonaKey('custom');
        localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(userObj));
        localStorage.setItem(DEMO_MODE_KEY, 'false');
        localStorage.setItem(ACTIVE_PERSONA_KEY, 'custom');
        await loadUserData(userObj);
        setAuthLoading(false);
        return { success: true };
      }
    }

    // Local / Demo Sign Up
    const newUser: ReLifeUser = {
      id: 'usr_' + Math.random().toString(36).substring(2, 10),
      name: fullName || email.split('@')[0],
      email,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      role,
      isDemoUser: true,
    };
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    setIsDemoMode(true);
    setActivePersonaKey('custom');
    localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(newUser));
    localStorage.setItem(DEMO_MODE_KEY, 'true');
    localStorage.setItem(ACTIVE_PERSONA_KEY, 'custom');
    await loadUserData(newUser);
    setAuthLoading(false);
    return { success: true };
  };

  // Auth Action: Sign Out
  const logout = async () => {
    setAuthLoading(true);
    if (supabase) {
      try {
        await supabaseSignOut();
      } catch (err) {
        console.warn('Signout error:', err);
      }
    }
    setCurrentUser(null);
    setIsAuthenticated(false);
    setActivePersonaKey(null);
    localStorage.removeItem(ACTIVE_USER_KEY);
    localStorage.removeItem(ACTIVE_PERSONA_KEY);
    setProducts([]);
    setReminders([]);
    setNotifications([]);
    setAuthLoading(false);
  };

  // Auth Action: Instant Demo Persona Login
  const loginAsDemo = (personaKey: DemoPersonaKey) => {
    const effectiveKey = (personaKey === 'elena' ? 'aarav' : personaKey === 'liam' ? 'priya' : personaKey === 'alex' ? 'vikram' : personaKey) as 'aarav' | 'priya' | 'vikram';
    const persona = DEMO_PERSONAS[effectiveKey];
    if (!persona) return;
    const userObj: ReLifeUser = {
      id: persona.id,
      name: persona.name,
      email: persona.email,
      avatar: persona.avatar,
      role: persona.role,
      isDemoUser: true,
    };
    setCurrentUser(userObj);
    setIsAuthenticated(true);
    setIsDemoMode(true);
    setActivePersonaKey(effectiveKey);
    localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(userObj));
    localStorage.setItem(DEMO_MODE_KEY, 'true');
    localStorage.setItem(ACTIVE_PERSONA_KEY, effectiveKey);
    loadUserData(userObj);
  };

  // Product Actions
  const addProduct = (
    data: Omit<
      Product,
      | 'id'
      | 'publicId'
      | 'userId'
      | 'healthScore'
      | 'healthBreakdown'
      | 'eWasteAvoidedKg'
      | 'carbonAvoidedKg'
      | 'estimatedUsefulLifeRemainingYears'
      | 'originalLifespanYears'
      | 'documents'
      | 'repairs'
      | 'ownershipHistory'
      | 'status'
      | 'createdAt'
      | 'updatedAt'
    >
  ): Product => {
    const id = generateId();
    const publicId = generatePublicId(data.brand, data.model);
    const nowIso = new Date().toISOString();

    const healthBreakdown = calculateHealthScore(data.purchaseDate, data.category, data.purchasePrice, []);
    const impact = calculateEnvironmentalImpact(data.category, []);

    const ownerName = currentUser ? currentUser.name : 'Hardware Caretaker';
    const ownerEmail = currentUser ? currentUser.email : 'owner@relife-passport.org';
    const ownerId = currentUser ? currentUser.id : 'usr-anonymous';

    const newProduct: Product = {
      ...data,
      id,
      publicId,
      userId: ownerId,
      originalLifespanYears: 5,
      estimatedUsefulLifeRemainingYears: 5,
      healthScore: healthBreakdown.overallScore,
      healthBreakdown,
      eWasteAvoidedKg: impact.eWasteAvoidedKg,
      carbonAvoidedKg: impact.carbonAvoidedKg,
      documents: [],
      repairs: [],
      ownershipHistory: [
        {
          id: generateId(),
          productId: id,
          ownerName,
          ownerEmailMasked: ownerEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
          startDate: data.purchaseDate || nowIso.split('T')[0],
          transferType: 'original_purchase',
        },
      ],
      resaleDisclosure: data.resaleDisclosure || {
        showSerialNumber: true,
        showPurchasePrice: false,
        showFullTimeline: true,
        showDocumentProofs: true,
        showHealthScoreBreakdown: true,
        showTechnicianNotes: true,
      },
      status: 'active',
      isPubliclyShared: data.isPubliclyShared ?? true,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    setProducts((prev) => [newProduct, ...prev]);

    // Push notification
    setNotifications((prev) => [
      {
        id: generateId(),
        userId: ownerId,
        title: 'New Passport Created',
        message: `Registered ${newProduct.name} with unique QR Identity (${newProduct.publicId}).`,
        timestamp: nowIso,
        read: false,
        type: 'milestone',
        actionUrl: `/products/${newProduct.id}`,
      },
      ...prev,
    ]);

    // Write to Supabase with user_id
    if (supabase && isSupabaseConfigured) {
      supabase
        .from('products')
        .insert({
          id: newProduct.id,
          public_id: newProduct.publicId,
          user_id: ownerId,
          name: newProduct.name,
          brand: newProduct.brand,
          model: newProduct.model,
          serial_number: newProduct.serialNumber,
          category: newProduct.category,
          purchase_price: newProduct.purchasePrice,
          purchase_currency: newProduct.purchaseCurrency,
          purchase_date: newProduct.purchaseDate,
          seller: newProduct.seller,
          warranty_months: newProduct.warrantyMonths,
          warranty_expiry_date: newProduct.warrantyExpiryDate,
          condition: newProduct.condition,
          image_url: newProduct.imageUrl,
          description: newProduct.description,
          health_score: newProduct.healthScore,
          health_breakdown: newProduct.healthBreakdown,
          e_waste_avoided_kg: newProduct.eWasteAvoidedKg,
          carbon_avoided_kg: newProduct.carbonAvoidedKg,
          original_lifespan_years: newProduct.originalLifespanYears,
          estimated_useful_life_remaining_years: newProduct.estimatedUsefulLifeRemainingYears,
          resale_disclosure: newProduct.resaleDisclosure,
          ownership_history: newProduct.ownershipHistory,
          status: newProduct.status,
          is_publicly_shared: newProduct.isPubliclyShared,
        })
        .then(({ error }) => {
          if (!error) setIsSupabaseSynced(true);
        });
    }

    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const updated = { ...p, ...updates, updatedAt: new Date().toISOString() };

        if (updates.repairs || updates.purchaseDate || updates.purchasePrice) {
          const breakdown = calculateHealthScore(
            updated.purchaseDate,
            updated.category,
            updated.purchasePrice,
            updated.repairs
          );
          const impact = calculateEnvironmentalImpact(updated.category, updated.repairs);
          updated.healthScore = breakdown.overallScore;
          updated.healthBreakdown = breakdown;
          updated.eWasteAvoidedKg = impact.eWasteAvoidedKg;
          updated.carbonAvoidedKg = impact.carbonAvoidedKg;
        }

        if (supabase && isSupabaseConfigured) {
          supabase
            .from('products')
            .update({
              name: updated.name,
              brand: updated.brand,
              model: updated.model,
              condition: updated.condition,
              health_score: updated.healthScore,
              health_breakdown: updated.healthBreakdown,
              e_waste_avoided_kg: updated.eWasteAvoidedKg,
              carbon_avoided_kg: updated.carbonAvoidedKg,
              resale_disclosure: updated.resaleDisclosure,
              is_publicly_shared: updated.isPubliclyShared,
            })
            .eq('id', id)
            .then(() => {});
        }

        return updated;
      })
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setReminders((prev) => prev.filter((r) => r.productId !== id));

    if (supabase && isSupabaseConfigured) {
      supabase.from('products').delete().eq('id', id).then(() => {});
    }
  };

  const getProductById = (id: string) => products.find((p) => p.id === id) || ALL_DEMO_PRODUCTS.find((p) => p.id === id);
  const getProductByPublicId = (publicId: string) => products.find((p) => p.publicId === publicId) || ALL_DEMO_PRODUCTS.find((p) => p.publicId === publicId);

  // Repairs & Timeline
  const addRepair = (
    productId: string,
    repairData: Omit<RepairRecord, 'id' | 'createdAt' | 'productId'>
  ): RepairRecord => {
    const id = generateId();
    const nowIso = new Date().toISOString();
    const newRecord: RepairRecord = {
      ...repairData,
      id,
      productId,
      createdAt: nowIso,
    };

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const newRepairs = [newRecord, ...p.repairs];
        const breakdown = calculateHealthScore(p.purchaseDate, p.category, p.purchasePrice, newRepairs);
        const impact = calculateEnvironmentalImpact(p.category, newRepairs);

        const updatedProd = {
          ...p,
          repairs: newRepairs,
          healthScore: breakdown.overallScore,
          healthBreakdown: breakdown,
          eWasteAvoidedKg: impact.eWasteAvoidedKg,
          carbonAvoidedKg: impact.carbonAvoidedKg,
          estimatedUsefulLifeRemainingYears: Number(
            (p.estimatedUsefulLifeRemainingYears + (repairData.usefulLifeExtensionMonths || 12) / 12).toFixed(1)
          ),
          updatedAt: nowIso,
        };

        if (supabase && isSupabaseConfigured) {
          supabase
            .from('repairs')
            .insert({
              id: newRecord.id,
              product_id: productId,
              date: newRecord.date,
              issue_summary: newRecord.issueSummary,
              symptoms: newRecord.symptoms,
              diagnosis: newRecord.diagnosis,
              technician_or_shop_name: newRecord.technicianOrShopName,
              cost: newRecord.cost,
              parts_replaced: newRecord.partsReplaced,
              warranty_claim: newRecord.warrantyClaim,
              verification_badge: newRecord.verificationBadge,
              verification_details: newRecord.verificationDetails,
              useful_life_extension_months: newRecord.usefulLifeExtensionMonths,
              owner_approved: newRecord.ownerApproved,
              notes: newRecord.notes,
            })
            .then(() => {});

          supabase
            .from('products')
            .update({
              health_score: updatedProd.healthScore,
              health_breakdown: updatedProd.healthBreakdown,
              e_waste_avoided_kg: updatedProd.eWasteAvoidedKg,
              carbon_avoided_kg: updatedProd.carbonAvoidedKg,
              estimated_useful_life_remaining_years: updatedProd.estimatedUsefulLifeRemainingYears,
            })
            .eq('id', productId)
            .then(() => {});
        }

        return updatedProd;
      })
    );

    setNotifications((prev) => [
      {
        id: generateId(),
        userId: currentUser?.id,
        title: 'Repair Recorded to Passport',
        message: `${repairData.issueSummary} recorded with badge: ${repairData.verificationBadge}.`,
        timestamp: nowIso,
        read: false,
        type: 'milestone',
        actionUrl: `/products/${productId}`,
      },
      ...prev,
    ]);

    return newRecord;
  };

  // Document Vault Actions (User-Isolated)
  const addDocument = (
    productId: string,
    docData: Omit<DocumentItem, 'id' | 'uploadDate' | 'productId' | 'userId'>
  ): DocumentItem => {
    const id = generateId();
    const nowIso = new Date().toISOString().split('T')[0];
    const newDoc: DocumentItem = {
      ...docData,
      id,
      productId,
      userId: currentUser?.id,
      uploadDate: nowIso,
    };

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        return {
          ...p,
          documents: [newDoc, ...p.documents],
          updatedAt: new Date().toISOString(),
        };
      })
    );

    if (supabase && isSupabaseConfigured) {
      supabase
        .from('documents')
        .insert({
          id: newDoc.id,
          product_id: productId,
          user_id: currentUser?.id,
          title: newDoc.title,
          file_name: newDoc.fileName,
          file_size: newDoc.fileSize,
          file_type: newDoc.fileType,
          url: newDoc.url,
          is_verified_receipt: newDoc.isVerifiedReceipt,
        })
        .then(() => {});
    }

    return newDoc;
  };

  const deleteDocument = (productId: string, docId: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        return {
          ...p,
          documents: p.documents.filter((d) => d.id !== docId),
          updatedAt: new Date().toISOString(),
        };
      })
    );

    if (supabase && isSupabaseConfigured) {
      supabase.from('documents').delete().eq('id', docId).then(() => {});
    }
  };

  const updateResaleDisclosure = (productId: string, settings: Partial<ResaleDisclosureSettings>) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const newSettings = { ...p.resaleDisclosure, ...settings };
        if (supabase && isSupabaseConfigured) {
          supabase.from('products').update({ resale_disclosure: newSettings }).eq('id', productId).then(() => {});
        }
        return { ...p, resaleDisclosure: newSettings };
      })
    );
  };

  const togglePublicShare = (productId: string, isShared: boolean) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        if (supabase && isSupabaseConfigured) {
          supabase.from('products').update({ is_publicly_shared: isShared }).eq('id', productId).then(() => {});
        }
        return { ...p, isPubliclyShared: isShared };
      })
    );
  };

  // Technician Workflow
  const submitTechnicianRepair = (submissionData: Omit<ServiceProviderSubmission, 'id' | 'submittedAt' | 'status'>) => {
    const id = generateId();
    const nowIso = new Date().toISOString();
    const newSubmission: ServiceProviderSubmission = {
      ...submissionData,
      id,
      status: 'pending_owner_approval',
      submittedAt: nowIso,
    };

    setServiceSubmissions((prev) => [newSubmission, ...prev]);

    setNotifications((prev) => [
      {
        id: generateId(),
        userId: currentUser?.id,
        title: 'New Service Record Awaiting Approval',
        message: `${submissionData.shopName} logged a repair for ${submissionData.productName}. Please review and seal into passport.`,
        timestamp: nowIso,
        read: false,
        type: 'repair_approval',
        actionUrl: `/products/${submissionData.productId}`,
      },
      ...prev,
    ]);

    if (supabase && isSupabaseConfigured) {
      supabase.from('service_submissions').insert(newSubmission).then(() => {});
    }

    return newSubmission;
  };

  const approveTechnicianRepair = (submissionId: string) => {
    const sub = serviceSubmissions.find((s) => s.id === submissionId);
    if (!sub) return;

    addRepair(sub.productId, {
      date: sub.repairDate,
      issueSummary: sub.issueSummary,
      symptoms: 'Verified by authorized service center.',
      diagnosis: sub.diagnosis,
      technicianOrShopName: `${sub.shopName} (${sub.technicianName})`,
      serviceProviderId: sub.id,
      cost: sub.totalCost,
      partsReplaced: sub.partsReplaced,
      warrantyClaim: sub.warrantyClaim,
      verificationBadge: 'technician-verified',
      verificationDetails: {
        verifiedBy: sub.technicianName,
        shopName: sub.shopName,
        verifiedAt: new Date().toISOString(),
        verificationNotes: sub.notes,
      },
      usefulLifeExtensionMonths: 24,
      ownerApproved: true,
    });

    setServiceSubmissions((prev) =>
      prev.map((s) => (s.id === submissionId ? { ...s, status: 'approved' } : s))
    );

    if (supabase && isSupabaseConfigured) {
      supabase.from('service_submissions').update({ status: 'approved' }).eq('id', submissionId).then(() => {});
    }
  };

  const rejectTechnicianRepair = (submissionId: string) => {
    setServiceSubmissions((prev) =>
      prev.map((s) => (s.id === submissionId ? { ...s, status: 'rejected' } : s))
    );

    if (supabase && isSupabaseConfigured) {
      supabase.from('service_submissions').update({ status: 'rejected' }).eq('id', submissionId).then(() => {});
    }
  };

  // Ownership Transfer (Chain of Custody Handshake)
  const initiateTransfer = (
    productId: string,
    toEmail: string,
    transferType: 'private_sale' | 'gift' | 'other',
    agreedPrice?: number
  ): OwnershipTransferRequest => {
    const product = products.find((p) => p.id === productId);
    if (!product) throw new Error('Product not found');

    const token = 'trans_' + Math.random().toString(36).substring(2, 10);
    const fromOwnerName = currentUser ? currentUser.name : 'Aarav Sharma';
    const fromOwnerEmail = currentUser ? currentUser.email : 'aarav.sharma@relife.in';
    const fromOwnerId = currentUser ? currentUser.id : undefined;

    const request: OwnershipTransferRequest = {
      id: generateId(),
      token,
      productId,
      productName: product.name,
      productImage: product.imageUrl,
      brand: product.brand,
      model: product.model,
      fromOwnerId,
      fromOwnerName,
      fromOwnerEmail,
      toRecipientEmail: toEmail,
      transferType,
      agreedPrice,
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      createdAt: new Date().toISOString(),
    };

    setTransferRequests((prev) => [request, ...prev]);

    // Update product status to indicate pending custody transfer
    updateProduct(productId, { status: 'in_repair' });

    setNotifications((prev) => [
      {
        id: generateId(),
        userId: fromOwnerId,
        title: 'Ownership Transfer Initiated',
        message: `Transfer link generated for ${toEmail}. Private owner invoices will be redacted.`,
        timestamp: new Date().toISOString(),
        read: false,
        type: 'transfer',
        actionUrl: `/transfer/${token}`,
      },
      ...prev,
    ]);

    if (supabase && isSupabaseConfigured) {
      supabase
        .from('ownership_transfers')
        .insert({
          id: request.id,
          token: request.token,
          product_id: request.productId,
          product_name: request.productName,
          product_image: request.productImage,
          brand: request.brand,
          model: request.model,
          from_owner_id: fromOwnerId,
          from_owner_name: request.fromOwnerName,
          from_owner_email: request.fromOwnerEmail,
          to_recipient_email: request.toRecipientEmail,
          transfer_type: request.transferType,
          agreed_price: request.agreedPrice,
          status: request.status,
          expires_at: request.expiresAt,
        })
        .then(() => {});
    }

    return request;
  };

  const getTransferByToken = (token: string) => transferRequests.find((t) => t.token === token);

  const acceptTransfer = (token: string, newOwnerName: string, newOwnerEmail: string): boolean => {
    const request = transferRequests.find((t) => t.token === token && t.status === 'pending');
    if (!request) return false;

    const nowIso = new Date().toISOString();
    const recipientUserId = currentUser ? currentUser.id : 'usr_recipient_' + Math.random().toString(36).substring(2, 8);

    // Filter documents: strip financial invoices to protect previous owner's private billing/cards
    let transferredProduct: Product | null = null;

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== request.productId) return p;

        const filteredDocs = p.documents.filter((d) => d.fileType !== 'invoice');

        const newMilestone = {
          id: generateId(),
          productId: p.id,
          ownerName: newOwnerName,
          ownerEmailMasked: newOwnerEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
          startDate: nowIso.split('T')[0],
          transferType: request.transferType,
          transferNote: `Transferred from ${request.fromOwnerName} (${request.transferType})`,
        };

        const updatedHistory = [newMilestone, ...p.ownershipHistory];

        const updated: Product = {
          ...p,
          userId: recipientUserId,
          documents: filteredDocs,
          ownershipHistory: updatedHistory,
          status: 'active',
          updatedAt: nowIso,
        };

        transferredProduct = updated;

        if (supabase && isSupabaseConfigured) {
          supabase
            .from('products')
            .update({
              user_id: recipientUserId,
              ownership_history: updatedHistory,
              status: 'active',
              updated_at: nowIso,
            })
            .eq('id', p.id)
            .then(() => {});
        }

        return updated;
      })
    );

    // Update transfer request status
    setTransferRequests((prev) =>
      prev.map((t) => (t.token === token ? { ...t, status: 'accepted', toRecipientId: recipientUserId } : t))
    );

    if (supabase && isSupabaseConfigured) {
      supabase
        .from('ownership_transfers')
        .update({ status: 'accepted', to_recipient_id: recipientUserId })
        .eq('token', token)
        .then(() => {});
    }

    // If recipient is currently logged in, persist to recipient's local partition as well
    if (transferredProduct && currentUser && currentUser.id === recipientUserId) {
      const recipientProductsKey = `relife_products_${recipientUserId}`;
      const existing = localStorage.getItem(recipientProductsKey);
      const list: Product[] = existing ? JSON.parse(existing) : [];
      localStorage.setItem(recipientProductsKey, JSON.stringify([transferredProduct, ...list.filter((x) => x.id !== (transferredProduct as Product).id)]));
    }

    return true;
  };

  const toggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const nextCompleted = !r.completed;
        if (supabase && isSupabaseConfigured) {
          supabase.from('maintenance_reminders').update({ completed: nextCompleted }).eq('id', id).then(() => {});
        }
        return { ...r, completed: nextCompleted };
      })
    );
  };

  const addReminder = (data: Omit<MaintenanceReminder, 'id' | 'createdAt' | 'userId'>) => {
    const id = generateId();
    const newRem: MaintenanceReminder = {
      ...data,
      id,
      userId: currentUser?.id,
      createdAt: new Date().toISOString(),
    };
    setReminders((prev) => [newRem, ...prev]);

    if (supabase && isSupabaseConfigured) {
      supabase
        .from('maintenance_reminders')
        .insert({
          id: newRem.id,
          user_id: currentUser?.id,
          product_id: newRem.productId,
          product_name: newRem.productName,
          product_image: newRem.productImage,
          title: newRem.title,
          description: newRem.description,
          due_date: newRem.dueDate,
          priority: newRem.priority,
          type: newRem.type,
          completed: newRem.completed,
        })
        .then(() => {});
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    if (supabase && isSupabaseConfigured) {
      supabase.from('notifications').update({ read: true }).eq('id', id).then(() => {});
    }
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (supabase && isSupabaseConfigured && currentUser) {
      supabase.from('notifications').update({ read: true }).eq('user_id', currentUser.id).then(() => {});
    }
  };

  const resetToDemoData = () => {
    loginAsDemo('aarav');
    Object.values(DEMO_PERSONAS).forEach((p) => {
      localStorage.removeItem(`relife_products_${p.id}`);
      localStorage.removeItem(`relife_reminders_${p.id}`);
      localStorage.removeItem(`relife_notifs_${p.id}`);
    });
    localStorage.removeItem('relife_service_submissions_v2');
    setProducts(AARAV_INITIAL_PRODUCTS);
    setReminders(AARAV_INITIAL_REMINDERS);
    setNotifications(AARAV_INITIAL_NOTIFICATIONS);
    setServiceSubmissions(INITIAL_SERVICE_SUBMISSIONS);
    setTransferRequests([]);
  };

  const toggleDemoMode = () => {
    setIsDemoMode((prev) => !prev);
  };

  const setDemoMode = (val: boolean) => {
    setIsDemoMode(val);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <ReLifeContext.Provider
      value={{
        products,
        reminders,
        notifications,
        currentUser,
        isAuthenticated,
        authLoading,
        activePersonaKey,
        serviceSubmissions,
        transferRequests,
        isLoaded,
        isSupabaseSynced,
        isDemoMode,
        unreadCount,
        login,
        signup,
        logout,
        loginAsDemo,
        setDemoMode,
        toggleDemoMode,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductById,
        getProductByPublicId,
        addRepair,
        addDocument,
        deleteDocument,
        updateResaleDisclosure,
        togglePublicShare,
        submitTechnicianRepair,
        approveTechnicianRepair,
        rejectTechnicianRepair,
        initiateTransfer,
        acceptTransfer,
        getTransferByToken,
        toggleReminder,
        addReminder,
        markNotificationRead,
        markAllNotificationsRead,
        resetToDemoData,
      }}
    >
      {children}
    </ReLifeContext.Provider>
  );
}

export function useReLife() {
  const context = useContext(ReLifeContext);
  if (!context) {
    throw new Error('useReLife must be used within a ReLifeProvider');
  }
  return context;
}
