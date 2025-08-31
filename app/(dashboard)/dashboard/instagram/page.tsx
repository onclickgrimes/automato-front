"use client"

import { useState, useEffect } from 'react';
import { InstagramAccountManager } from '../../../../components/instagram/InstagramAccountManager';

export default function InstagramPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">Automação do Instagram</h1>
          <p className="text-gray-600 mt-1">
            Gerencie sua conta do Instagram e execute ações de automação
          </p>
        </div>
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="h-48 bg-gray-200 rounded-lg"></div>
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-gray-200 rounded-lg"></div>
              <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Automação do Instagram</h1>
        <p className="text-gray-600 mt-1">
          Gerencie sua conta do Instagram e execute ações de automação
        </p>
      </div>

      {/* Instagram Account Manager */}
      <InstagramAccountManager />




    </div>
  );
}