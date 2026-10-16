'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { QrCode, Download, ExternalLink, Copy, Check, ShieldCheck, Printer } from 'lucide-react';
import Link from 'next/link';

interface QRCardProps {
  publicId: string;
  productName: string;
  serialNumber?: string;
  size?: number;
}

export function QRCard({ publicId, productName, serialNumber, size = 180 }: QRCardProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [origin, setOrigin] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const passportUrl = `${origin}/passport/${publicId}`;

  useEffect(() => {
    QRCode.toDataURL(passportUrl, {
      width: size * 2,
      margin: 1.5,
      color: {
        dark: '#0a261c', // Forest 900
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR generation error', err));
  }, [passportUrl, size]);

  const handleCopy = () => {
    navigator.clipboard.writeText(passportUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `relife-passport-${publicId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col items-center text-center">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center">
          <QrCode className="w-3.5 h-3.5" />
        </div>
        <h3 className="text-sm font-semibold text-stone-900">Living Digital Passport QR</h3>
      </div>

      {/* QR Code Container styled like a physical tamper-evident product tag */}
      <div className="relative p-3 bg-stone-50 rounded-xl border border-stone-200/90 shadow-inner group">
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qrDataUrl}
            alt={`Passport QR for ${productName}`}
            className="w-40 h-40 object-contain rounded-lg"
          />
        ) : (
          <div className="w-40 h-40 flex items-center justify-center text-stone-400">
            <span className="text-xs">Generating QR...</span>
          </div>
        )}

        <div className="mt-2 text-[10px] font-mono font-medium text-stone-500 uppercase tracking-wider flex items-center justify-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          <span>{publicId}</span>
        </div>
      </div>

      <p className="text-xs text-stone-500 mt-3 max-w-[240px]">
        Scan to view tamper-proof public repair milestones & provenance.
      </p>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mt-4 w-full">
        <button
          onClick={handleCopy}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 transition-colors shadow-2xs"
          title="Copy public link"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-stone-500" />
              <span>Copy Link</span>
            </>
          )}
        </button>

        <button
          onClick={handleDownload}
          className="inline-flex items-center justify-center p-2 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 transition-colors shadow-2xs"
          title="Download printable PNG badge"
        >
          <Download className="w-3.5 h-3.5 text-stone-600" />
        </button>

        <Link
          href={`/passport/${publicId}`}
          target="_blank"
          className="inline-flex items-center justify-center p-2 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors shadow-2xs"
          title="Open Public Passport View"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="mt-3 w-full pt-3 border-t border-stone-100">
        <Link
          href={`/resale/${publicId}`}
          className="text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:underline flex items-center justify-center gap-1"
        >
          <span>View Smart Resale Report</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
