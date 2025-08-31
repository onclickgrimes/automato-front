"use client"

import { useState, useEffect } from 'react';
import { InstagramAccountManager } from '../../../../components/instagram/InstagramAccountManager';
import { InstagramControl } from '../../../../components/instagram/InstagramControl';
import { InstagramActions } from '../../../../components/instagram/InstagramActions';
import { InstagramPhotoUpload } from '../../../../components/instagram/InstagramPhotoUpload';

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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Instagram Control */}
          <InstagramControl />
          
          {/* Instagram Actions */}
          <InstagramActions />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Photo Upload */}
          <InstagramPhotoUpload />
          
          {/* Tips and Guidelines */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Diretrizes de Uso</h3>
            <div className="space-y-3 text-sm text-blue-800">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Use a automação de forma responsável e respeitando os termos de uso do Instagram</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Evite ações excessivas em curtos períodos de tempo para não ser detectado como spam</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Mantenha suas credenciais seguras e não as compartilhe</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Monitore regularmente as atividades para garantir que tudo está funcionando corretamente</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Use o monitoramento de mensagens para responder rapidamente aos seus seguidores</p>
              </div>
            </div>
          </div>

          {/* Safety Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h4 className="font-medium text-yellow-800">Aviso Importante</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Esta ferramenta é para uso educacional e pessoal. O uso inadequado pode resultar em 
                  restrições ou banimento da sua conta do Instagram. Use com responsabilidade.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Status da API</h4>
            <p className="text-sm text-gray-600">Todos os endpoints estão funcionais</p>
          </div>
          <div className="text-right">
             <p className="text-sm text-gray-600">Última atualização</p>
             <p className="text-sm font-medium text-gray-900">Agora</p>
           </div>
        </div>
      </div>
    </div>
  );
}