'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  RepairRecord,
  DocumentItem,
  MaintenanceReminder,
  AppNotification,
  ServiceProviderSubmission,
  OwnershipTransferRequest,
  ResaleDisclosureSettings,
} from './types';
import { INITIAL_PRODUCTS, INITIAL_REMINDERS, INITIAL_NOTIFICATIONS } from './initial-data';
import { calculateHealthScore, calculateEnvironmentalImpact } from './calculations';
import { generateId, generatePublicId } from './utils';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEY = 'relife_state_v1';
const DEMO_MODE_KEY = 'relife_demo_mode_v1';

interface ReLifeUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'consumer' | 'technician' | 'admin';
}

interface ReLifeContextType {
  products: Product[];
  reminders: MaintenanceReminder[];
  notifications: AppNotification[];
  currentUser: ReLifeUser;
  serviceSubmissions: ServiceProviderSubmission[];
  transferRequests: OwnershipTransferRequest[];
  isLoaded: boolean;
  isSupabaseSynced: boolean;
  isDemoMode: boolean;
  unreadCount: number;
  
  // Demo Mode
  setDemoMode: (val: boolean) => void;
  toggleDemoMode: () => void;
  
  // Product actions
  addProduct: (product: Omit<Product, 'id' | 'publicId' | 'healthScore' | 'healthBreakdown' | 'eWasteAvoidedKg' | 'carbonAvoidedKg' | 'estimatedUsefulLifeRemainingYears' | 'originalLifespanYears' | 'documents' | 'repairs' | 'ownershipHistory' | 'status' | 'createdAt' | 'updatedAt'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProductByPublicId: (publicId: string) => Product | undefined;
  getProductById: (id: string) => Product | undefined;
  
  // Repairs & Timeline
  addRepair: (productId: string, repair: Omit<RepairRecord, 'id' | 'createdAt' | 'productId'>) => RepairRecord;
  
  // Documents Vault
  addDocument: (productId: string, doc: Omit<DocumentItem, 'id' | 'uploadDate' | 'productId'>) => DocumentItem;
  deleteDocument: (productId: string, docId: string) => void;
  
  // Privacy & Resale
  updateResaleDisclosure: (productId: string, settings: Partial<ResaleDisclosureSettings>) => void;
  togglePublicShare: (productId: string, isShared: boolean) => void;
  
  // Technician Workflow
  submitTechnicianRepair: (submission: Omit<ServiceProviderSubmission, 'id' | 'submittedAt' | 'status'>) => ServiceProviderSubmission;
  approveTechnicianRepair: (submissionId: string) => void;
  rejectTechnicianRepair: (submissionId: string) => void;
  
  // Ownership Transfer
  initiateTransfer: (productId: string, toEmail: string, transferType: 'private_sale' | 'gift' | 'other', agreedPrice?: number) => OwnershipTransferRequest;
  acceptTransfer: (token: string, newOwnerName: string, newOwnerEmail: string) => boolean;
  getTransferByToken: (token: string) => OwnershipTransferRequest | undefined;
  
  // Reminders & Notifications
  toggleReminder: (id: string) => void;
  addReminder: (reminder: Omit<MaintenanceReminder, 'id' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  
  // Reset
  resetToDemoData: () => void;
}

const ReLifeContext = createContext<ReLifeContextType | undefined>(undefined);

const DEFAULT_USER: ReLifeUser = {
  id: 'usr-elena-rostova',
  name: 'Elena Rostova',
  email: 'elena@relife-demo.org',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  role: 'consumer',
};

export function ReLifeProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [reminders, setReminders] = useState<MaintenanceReminder[]>(INITIAL_REMINDERS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [currentUser] = useState<ReLifeUser>(DEFAULT_USER);
  const [serviceSubmissions, setServiceSubmissions] = useState<ServiceProviderSubmission[]>([]);
  const [transferRequests, setTransferRequests] = useState<OwnershipTransferRequest[]>([]);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isSupabaseSynced, setIsSupabaseSynced] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);

  // Initialize from LocalStorage & Supabase
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.products && Array.isArray(parsed.products) && parsed.products.length > 0) {
          setProducts(parsed.products);
        }
        if (parsed.reminders && Array.isArray(parsed.reminders)) {
          setReminders(parsed.reminders);
        }
        if (parsed.notifications && Array.isArray(parsed.notifications)) {
          setNotifications(parsed.notifications);
        }
        if (parsed.serviceSubmissions && Array.isArray(parsed.serviceSubmissions)) {
          setServiceSubmissions(parsed.serviceSubmissions);
        }
        if (parsed.transferRequests && Array.isArray(parsed.transferRequests)) {
          setTransferRequests(parsed.transferRequests);
        }
      }

      const storedDemo = localStorage.getItem(DEMO_MODE_KEY);
      if (storedDemo !== null) {
        setIsDemoMode(storedDemo === 'true');
      }
    } catch (e) {
      console.warn('Could not read from localStorage, using initial demo seed', e);
    } finally {
      setIsLoaded(true);
    }

    // Attempt Supabase Fetch
    if (supabase) {
      (async () => {
        try {
          const { data, error } = await supabase.from('products').select('*');
          if (!error && data && data.length > 0) {
            setIsSupabaseSynced(true);
            setIsDemoMode(false);
          } else if (error && error.code === 'PGRST205') {
            console.info('Supabase cloud tables not yet created. Operating in robust demo persistence mode.');
            setIsSupabaseSynced(false);
          }
        } catch {
          setIsSupabaseSynced(false);
        }
      })();
    }
  }, []);

  // Save to LocalStorage on state change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const payload = {
        products,
        reminders,
        notifications,
        serviceSubmissions,
        transferRequests,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      localStorage.setItem(DEMO_MODE_KEY, String(isDemoMode));
    } catch (e) {
      console.error('Failed to sync state to localStorage', e);
    }
  }, [products, reminders, notifications, serviceSubmissions, transferRequests, isLoaded, isDemoMode]);

  // Actions
  const addProduct = (
    data: Omit<
      Product,
      | 'id'
      | 'publicId'
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

    const newProduct: Product = {
      ...data,
      id,
      publicId,
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
          ownerName: currentUser.name,
          ownerEmailMasked: currentUser.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
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
        title: 'New Passport Created',
        message: `Registered ${newProduct.name} with unique QR Identity (${newProduct.publicId}).`,
        timestamp: nowIso,
        read: false,
        type: 'milestone',
        actionUrl: `/products/${newProduct.id}`,
      },
      ...prev,
    ]);

    // Write to Supabase if available
    if (supabase) {
      supabase
        .from('products')
        .insert({
          id: newProduct.id,
          public_id: newProduct.publicId,
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

        if (supabase) {
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

    if (supabase) {
      supabase.from('products').delete().eq('id', id).then(() => {});
    }
  };

  const getProductById = (id: string) => products.find((p) => p.id === id);
  const getProductByPublicId = (publicId: string) => products.find((p) => p.publicId === publicId);

  const addRepair = (productId: string, repairData: Omit<RepairRecord, 'id' | 'createdAt' | 'productId'>): RepairRecord => {
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

        // Sync to Supabase
        if (supabase) {
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

    // Add celebration notification
    setNotifications((prev) => [
      {
        id: generateId(),
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

  const addDocument = (productId: string, docData: Omit<DocumentItem, 'id' | 'uploadDate' | 'productId'>): DocumentItem => {
    const id = generateId();
    const nowIso = new Date().toISOString().split('T')[0];
    const newDoc: DocumentItem = {
      ...docData,
      id,
      productId,
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

    if (supabase) {
      supabase
        .from('documents')
        .insert({
          id: newDoc.id,
          product_id: productId,
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

    if (supabase) {
      supabase.from('documents').delete().eq('id', docId).then(() => {});
    }
  };

  const updateResaleDisclosure = (productId: string, settings: Partial<ResaleDisclosureSettings>) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const newSettings = { ...p.resaleDisclosure, ...settings };
        if (supabase) {
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
        if (supabase) {
          supabase.from('products').update({ is_publicly_shared: isShared }).eq('id', productId).then(() => {});
        }
        return { ...p, isPubliclyShared: isShared };
      })
    );
  };

  // Service Provider submissions
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
        title: 'New Service Record Awaiting Approval',
        message: `${submissionData.shopName} logged a repair for ${submissionData.productName}. Please review and seal into passport.`,
        timestamp: nowIso,
        read: false,
        type: 'repair_approval',
        actionUrl: `/products/${submissionData.productId}`,
      },
      ...prev,
    ]);

    if (supabase) {
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

    if (supabase) {
      supabase.from('service_submissions').update({ status: 'approved' }).eq('id', submissionId).then(() => {});
    }
  };

  const rejectTechnicianRepair = (submissionId: string) => {
    setServiceSubmissions((prev) =>
      prev.map((s) => (s.id === submissionId ? { ...s, status: 'rejected' } : s))
    );

    if (supabase) {
      supabase.from('service_submissions').update({ status: 'rejected' }).eq('id', submissionId).then(() => {});
    }
  };

  // Ownership transfer
  const initiateTransfer = (
    productId: string,
    toEmail: string,
    transferType: 'private_sale' | 'gift' | 'other',
    agreedPrice?: number
  ): OwnershipTransferRequest => {
    const product = products.find((p) => p.id === productId);
    if (!product) throw new Error('Product not found');

    const token = 'trans_' + Math.random().toString(36).substring(2, 10);
    const request: OwnershipTransferRequest = {
      id: generateId(),
      token,
      productId,
      productName: product.name,
      productImage: product.imageUrl,
      brand: product.brand,
      model: product.model,
      fromOwnerName: currentUser.name,
      fromOwnerEmail: currentUser.email,
      toRecipientEmail: toEmail,
      transferType,
      agreedPrice,
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      createdAt: new Date().toISOString(),
    };

    setTransferRequests((prev) => [request, ...prev]);

    setNotifications((prev) => [
      {
        id: generateId(),
        title: 'Ownership Transfer Initiated',
        message: `Transfer link generated for ${toEmail}. Private owner invoices will be redacted.`,
        timestamp: new Date().toISOString(),
        read: false,
        type: 'transfer',
        actionUrl: `/transfer/${token}`,
      },
      ...prev,
    ]);

    if (supabase) {
      supabase.from('ownership_transfers').insert(request).then(() => {});
    }

    return request;
  };

  const getTransferByToken = (token: string) => transferRequests.find((t) => t.token === token);

  const acceptTransfer = (token: string, newOwnerName: string, newOwnerEmail: string): boolean => {
    const request = transferRequests.find((t) => t.token === token && t.status === 'pending');
    if (!request) return false;

    const nowIso = new Date().toISOString();

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

        if (supabase) {
          supabase
            .from('products')
            .update({ ownership_history: updatedHistory })
            .eq('id', p.id)
            .then(() => {});
        }

        return {
          ...p,
          documents: filteredDocs,
          ownershipHistory: updatedHistory,
          status: 'active',
          updatedAt: nowIso,
        };
      })
    );

    setTransferRequests((prev) =>
      prev.map((t) => (t.token === token ? { ...t, status: 'accepted' } : t))
    );

    if (supabase) {
      supabase.from('ownership_transfers').update({ status: 'accepted' }).eq('token', token).then(() => {});
    }

    return true;
  };

  const toggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const nextCompleted = !r.completed;
        if (supabase) {
          supabase.from('maintenance_reminders').update({ completed: nextCompleted }).eq('id', id).then(() => {});
        }
        return { ...r, completed: nextCompleted };
      })
    );
  };

  const addReminder = (data: Omit<MaintenanceReminder, 'id' | 'createdAt'>) => {
    const id = generateId();
    const newRem: MaintenanceReminder = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };
    setReminders((prev) => [newRem, ...prev]);

    if (supabase) {
      supabase.from('maintenance_reminders').insert(newRem).then(() => {});
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const resetToDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setProducts(INITIAL_PRODUCTS);
    setReminders(INITIAL_REMINDERS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setServiceSubmissions([]);
    setTransferRequests([]);
    setIsDemoMode(true);
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
        serviceSubmissions,
        transferRequests,
        isLoaded,
        isSupabaseSynced,
        isDemoMode,
        unreadCount,
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
