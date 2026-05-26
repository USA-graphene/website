import React from 'react';
import Link from 'next/link';
import { samplePurchaseLinks } from '@/lib/sampleLinks';

export default function B2BSampleCTA() {
  return (
    <div className="mt-16 mb-8 relative rounded-3xl overflow-hidden border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.4)] bg-[#0d1630]">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2d6ef0]/10 via-transparent to-[#00c8ff]/10" />
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-[#2d6ef0]/20 rounded-full blur-[80px]" />
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-[#00c8ff]/20 rounded-full blur-[80px]" />

      <div className="relative p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 z-10">
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight mb-3">
            Evaluate Our Quality
          </h3>
          <p className="text-[#8b9ab5] text-lg max-w-lg mb-0 mx-auto md:mx-0">
            Serious about B2B integration? Test our premium Pulsed Electrical Resistive Carbon Heating turbostratic graphene in your lab. 100g sample packs available now.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <Link 
            href={samplePurchaseLinks.ebay} 
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#2d6ef0] px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#205acc] shadow-[0_0_20px_rgba(45,110,240,0.3)] hover:shadow-[0_0_30px_rgba(45,110,240,0.5)]"
          >
            <span>Order on eBay</span>
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </Link>
          
          <Link 
            href={samplePurchaseLinks.etsy} 
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-white/10 px-6 py-3.5 text-sm font-semibold text-white border border-white/20 transition-all hover:bg-white/20"
          >
            <span>Order on Etsy</span>
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
