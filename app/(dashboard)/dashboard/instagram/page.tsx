"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { InstagramAccountManager } from '../../../../components/instagram/InstagramAccountManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/hooks/useAuth';

export default function InstagramPage() {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();

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
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Instagram Automation</h1>
            <p className="text-muted-foreground">
              Gerencie suas contas do Instagram e automatize suas ações
            </p>
          </div>
        </div>

        <InstagramAccountManager />
      </div>
  );
}