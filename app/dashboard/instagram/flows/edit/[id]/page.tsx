'use client';

import { FlowEditorWrapper } from '@/components/workflow/FlowEditor';
import { Workflow } from '@/lib/types/workflow';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState, use } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface EditFlowPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditFlowPage({ params }: EditFlowPageProps) {
  const { id } = use(params);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      return; // Aguarda o carregamento da autenticação
    }

    if (!user) {
      router.push('/login');
      return;
    }

    loadWorkflow();
  }, [user, authLoading, id]);

  const loadWorkflow = async () => {
    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Workflow não encontrado.');
        } else {
          throw error;
        }
        return;
      }

      setWorkflow(data.workflow);
    } catch (error) {
      console.error('Erro ao carregar workflow:', error);
      setError('Erro ao carregar o workflow.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (updatedWorkflow: Workflow) => {
    setWorkflow(updatedWorkflow);
  };

  if (authLoading || loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando workflow...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Erro</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => router.push('/dashboard/instagram/flows')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Voltar
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!workflow) {
    return null;
  }

  return (
    <div className="h-screen">
      <FlowEditorWrapper 
        initialWorkflow={workflow} 
        onSave={handleSave} 
      />
    </div>
  );
}