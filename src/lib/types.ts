export type ProductCategory = 
  | 'smartphone'
  | 'laptop'
  | 'tablet'
  | 'audio'
  | 'appliance'
  | 'bicycle'
  | 'camera'
  | 'gaming'
  | 'other';

export type ProductCondition = 
  | 'mint' 
  | 'excellent' 
  | 'good' 
  | 'fair' 
  | 'refurbished';

export type WarrantyStatus = 
  | 'active' 
  | 'expiring_soon' // < 30 days
  | 'expired' 
  | 'lifetime'
  | 'unknown';

export type VerificationBadge = 
  | 'technician-verified' 
  | 'document-backed' 
  | 'owner-reported';

export interface DocumentItem {
  id: string;
  productId: string;
  userId?: string;
  title: string;
  fileName: string;
  fileSize: string;
  fileType: 'invoice' | 'warranty_cert' | 'manual' | 'repair_receipt' | 'photo';
  uploadDate: string;
  url: string;
  isVerifiedReceipt?: boolean;
}

export interface RepairPart {
  name: string;
  partNumber?: string;
  cost: number;
}

export interface RepairRecord {
  id: string;
  productId: string;
  date: string;
  issueSummary: string;
  symptoms: string;
  diagnosis: string;
  technicianOrShopName: string;
  serviceProviderId?: string;
  cost: number;
  partsReplaced: RepairPart[];
  warrantyClaim: boolean;
  verificationBadge: VerificationBadge;
  verificationDetails?: {
    verifiedBy?: string;
    technicianLicense?: string;
    shopName?: string;
    shopAddress?: string;
    verifiedAt?: string;
    verificationNotes?: string;
  };
  usefulLifeExtensionMonths: number;
  receiptDocumentId?: string;
  photos?: string[];
  ownerApproved: boolean; // For technician submitted records
  notes?: string;
  createdAt: string;
}

export interface HealthScoreBreakdown {
  overallScore: number; // 0 - 100
  tier: 'Exceptional' | 'Good' | 'Moderate' | 'Degraded';
  factors: {
    name: string;
    score: number; // 0 - 25
    maxScore: number;
    weight: string;
    explanation: string;
    status: 'positive' | 'neutral' | 'warning';
  }[];
  maintenanceAdvice: string[];
}

export interface ResaleDisclosureSettings {
  showSerialNumber: boolean;
  showPurchasePrice: boolean;
  showFullTimeline: boolean;
  showDocumentProofs: boolean;
  showHealthScoreBreakdown: boolean;
  showTechnicianNotes: boolean;
  customPublicNote?: string;
}

export interface OwnershipMilestone {
  id: string;
  productId: string;
  ownerName: string;
  ownerEmailMasked: string;
  startDate: string;
  endDate?: string;
  transferType: 'original_purchase' | 'private_sale' | 'gift' | 'warranty_replacement' | 'other';
  transferNote?: string;
}

export interface Product {
  id: string;
  publicId: string; // e.g. "relife-mac-893a"
  userId?: string; // Authenticated owner user_id
  name: string;
  brand: string;
  model: string;
  serialNumber: string;
  category: ProductCategory;
  purchasePrice: number;
  purchaseCurrency: string;
  purchaseDate: string;
  seller: string;
  warrantyMonths: number;
  warrantyExpiryDate: string;
  condition: ProductCondition;
  imageUrl: string;
  description?: string;
  
  // Health & Sustainability
  healthScore: number; // 0-100
  healthBreakdown: HealthScoreBreakdown;
  eWasteAvoidedKg: number;
  carbonAvoidedKg: number;
  estimatedUsefulLifeRemainingYears: number;
  originalLifespanYears: number;

  // Relations
  documents: DocumentItem[];
  repairs: RepairRecord[];
  ownershipHistory: OwnershipMilestone[];
  
  // Privacy & Sharing
  resaleDisclosure: ResaleDisclosureSettings;
  status: 'active' | 'in_repair' | 'transferred' | 'archived';
  isPubliclyShared: boolean;
  
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceReminder {
  id: string;
  userId?: string;
  productId: string;
  productName: string;
  productImage: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  type: 'warranty_expiry' | 'maintenance' | 'inspection' | 'firmware';
  completed: boolean;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId?: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'warranty' | 'repair_approval' | 'transfer' | 'milestone' | 'info';
  actionUrl?: string;
  data?: any;
}

export interface ServiceProviderSubmission {
  id: string;
  productId: string;
  publicId: string;
  productName: string;
  shopName: string;
  technicianName: string;
  technicianContact: string;
  issueSummary: string;
  diagnosis: string;
  partsReplaced: RepairPart[];
  laborCost: number;
  partsCost: number;
  totalCost: number;
  repairDate: string;
  warrantyClaim: boolean;
  notes: string;
  status: 'pending_owner_approval' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface OwnershipTransferRequest {
  id: string;
  token: string;
  productId: string;
  productName: string;
  productImage: string;
  brand: string;
  model: string;
  fromOwnerId?: string;
  fromOwnerName: string;
  fromOwnerEmail: string;
  toRecipientId?: string;
  toRecipientEmail: string;
  transferType: 'private_sale' | 'gift' | 'other';
  agreedPrice?: number;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  expiresAt: string;
  createdAt: string;
}

export interface ReLifeUser {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role: 'consumer' | 'technician' | 'admin';
  isDemoUser?: boolean;
}

export interface DemoPersona {
  id: string;
  name: string;
  email: string;
  role: 'consumer' | 'technician' | 'admin';
  avatar: string;
  badge: string;
  description: string;
}
