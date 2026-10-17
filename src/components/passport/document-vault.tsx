'use client';

import React, { useState } from 'react';
import { DocumentItem } from '@/lib/types';
import { useReLife } from '@/lib/store';
import {
  FileText,
  Upload,
  Trash2,
  Lock,
  FileCheck,
  Download,
  Plus,
  ShieldAlert,
  Eye,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { DocumentPreviewModal } from './document-preview-modal';

interface DocumentVaultProps {
  productId: string;
  documents: DocumentItem[];
  isOwner?: boolean;
}

export function DocumentVault({ productId, documents, isOwner = true }: DocumentVaultProps) {
  const { addDocument, deleteDocument, getProductById } = useReLife();
  const product = getProductById(productId);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [uploadModalOpen, setUploadModalOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [fileType, setFileType] = useState<DocumentItem['fileType']>('invoice');
  const [fileName, setFileName] = useState<string>('');

  const filteredDocs =
    filterType === 'all'
      ? documents
      : documents.filter((d) => d.fileType === filterType);

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    addDocument(productId, {
      title,
      fileName: fileName || `${title.replace(/\s+/g, '_')}.pdf`,
      fileSize: `${(Math.random() * 800 + 200).toFixed(0)} KB`,
      fileType,
      url: '#',
      isVerifiedReceipt: fileType === 'invoice' || fileType === 'repair_receipt',
    });

    setTitle('');
    setFileName('');
    setUploadModalOpen(false);
  };

  const getTypeLabel = (type: DocumentItem['fileType']) => {
    switch (type) {
      case 'invoice':
        return 'Tax Invoice / Bill';
      case 'warranty_cert':
        return 'Warranty Policy';
      case 'manual':
        return 'Service Manual';
      case 'repair_receipt':
        return 'Repair Invoice';
      case 'photo':
        return 'Condition Photo';
      default:
        return 'Document';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-stone-900">Encrypted Document Vault</h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <Lock className="w-3 h-3 text-emerald-600" />
              Owner Private
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Original invoices and receipts are private by default and auto-redacted in public passports.
          </p>
        </div>

        {isOwner && (
          <button
            onClick={() => setUploadModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-800 hover:bg-emerald-900 text-white transition-colors shadow-2xs whitespace-nowrap shrink-0"
          >
            <Upload className="w-3.5 h-3.5 shrink-0" />
            <span>Upload Document</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {['all', 'invoice', 'repair_receipt', 'warranty_cert', 'manual'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1 rounded-lg font-medium transition-colors whitespace-nowrap capitalize ${
              filterType === type
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {type === 'all' ? 'All Documents' : type.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Document Grid */}
      {filteredDocs.length === 0 ? (
        <div className="p-8 bg-white rounded-2xl border border-stone-200 text-center">
          <FileText className="w-8 h-8 text-stone-300 mx-auto mb-2" />
          <p className="text-xs text-stone-500">No documents found for this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              onClick={() => setPreviewDoc(doc)}
                className="bg-white rounded-xl border border-stone-200 p-3.5 flex items-start justify-between gap-3 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 group-hover:bg-emerald-100 transition-colors shrink-0 mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">
                        {getTypeLabel(doc.fileType)}
                      </span>
                      {doc.isVerifiedReceipt && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-blue-700">
                          <FileCheck className="w-3 h-3 text-blue-600" />
                          Verified
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-semibold text-stone-900 truncate group-hover:text-emerald-800 transition-colors" title={doc.title}>
                      {doc.title}
                    </h4>
                    <p className="text-[11px] text-stone-400 truncate">
                      {doc.fileName} • {doc.fileSize} • {formatDate(doc.uploadDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="p-1.5 text-stone-400 hover:text-emerald-800 hover:bg-stone-100 rounded-md transition-colors"
                    title="View Document"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  {isOwner && (
                    <button
                      onClick={() => deleteDocument(productId, doc.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete Document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={!!previewDoc}
        document={previewDoc}
        productName={product?.name}
        productSerial={product?.serialNumber}
        productBrand={product?.brand}
        onClose={() => setPreviewDoc(null)}
      />

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="text-base font-bold text-stone-900 mb-1">Upload to Document Vault</h3>
            <p className="text-xs text-stone-500 mb-4">
              Add invoices, warranty certificates, or technician reports to back up your product pedigree.
            </p>

            <form onSubmit={handleUploadSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Official Purchase Invoice / AppleCare Certificate"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Document Category
                </label>
                <select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-emerald-600"
                >
                  <option value="invoice">Invoice / Proof of Purchase</option>
                  <option value="warranty_cert">Warranty Certificate</option>
                  <option value="repair_receipt">Service / Repair Receipt</option>
                  <option value="manual">User Guide / Manual</option>
                  <option value="photo">Product Condition Photo</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  File Attachment
                </label>
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFileName(e.target.files[0].name);
                      if (!title) setTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ''));
                    }
                  }}
                  className="w-full text-xs text-stone-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-emerald-50 file:text-emerald-800 hover:file:bg-emerald-100"
                />
              </div>

              <div className="p-3 rounded-lg bg-stone-50 text-[11px] text-stone-500 flex items-start gap-2">
                <Lock className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                <span>Private & secure: Financial information is never published to public QR scans.</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-stone-200 text-stone-600 hover:bg-stone-50 whitespace-nowrap shrink-0"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-medium bg-emerald-800 hover:bg-emerald-900 text-white whitespace-nowrap shrink-0"
                >
                  Save to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
