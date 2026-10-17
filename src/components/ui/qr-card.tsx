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
  const [tagModalOpen, setTagModalOpen] = useState<boolean>(false);

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
      <div
        onClick={() => setTagModalOpen(true)}
        className="relative p-3 bg-stone-50 rounded-xl border border-stone-200/90 shadow-inner group cursor-pointer hover:border-emerald-400 hover:shadow-xs transition-all"
        title="Click to expand printable physical asset sticker"
      >
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qrDataUrl}
            alt={`Passport QR for ${productName}`}
            className="w-40 h-40 object-contain rounded-lg group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-40 h-40 flex items-center justify-center text-stone-400">
            <span className="text-xs">Generating QR...</span>
          </div>
        )}

        <div className="mt-2 text-[10px] font-mono font-medium text-stone-500 uppercase tracking-wider flex items-center justify-center gap-1 group-hover:text-emerald-800 transition-colors">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          <span>{publicId}</span>
        </div>

        <span className="text-[9px] text-emerald-700 font-semibold block mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          Click to expand tag sticker ↗
        </span>
      </div>

      <p className="text-xs text-stone-500 mt-3 max-w-[240px]">
        Scan to view tamper-proof public repair milestones & provenance.
      </p>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mt-4 w-full">
        <button
          onClick={handleCopy}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 transition-colors shadow-2xs whitespace-nowrap shrink-0"
          title="Copy public link"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-stone-500 shrink-0" />
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

      {/* Printable Asset Tag Modal */}
      {tagModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 text-center space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Physical Asset Tag</span>
              </span>
              <button
                onClick={() => setTagModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Simulated Peel-and-Stick Tag Sticker */}
            <div className="p-4 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-300 space-y-3">
              <div className="flex items-center justify-between text-[10px] font-black tracking-widest text-emerald-800 uppercase">
                <span>RELIFE PASSPORT</span>
                <span>AUTHENTIC</span>
              </div>

              {qrDataUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrDataUrl}
                  alt={`Tag for ${productName}`}
                  className="w-44 h-44 mx-auto rounded-xl border border-stone-200 bg-white p-2 shadow-2xs"
                />
              )}

              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-stone-900 truncate">{productName}</h4>
                {serialNumber && (
                  <p className="font-mono text-[10px] text-stone-500">{serialNumber}</p>
                )}
                <span className="font-mono text-[9px] text-emerald-800 font-bold block pt-1">
                  ID: {publicId}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Sticker</span>
              </button>
              <button
                onClick={handleDownload}
                className="py-2 px-3 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save PNG</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
