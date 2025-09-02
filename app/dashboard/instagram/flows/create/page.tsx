'use client';

import { FlowEditorWrapper } from '@/components/workflow/FlowEditor';
import { Workflow } from '@/lib/types/workflow';
import { useRouter } from 'next/navigation';

export default function CreateFlowPage() {
  const router = useRouter();

  const handleSave = (workflow: Workflow) => {
    // Redirecionar para a página de edição após salvar
    router.push(`/dashboard/instagram/flows/edit/${workflow.id}`);
  };

  return (
    <div className="h-screen">
      <FlowEditorWrapper onSave={handleSave} />
    </div>
  );
}