'use client';

import React, { useState, useCallback, useRef } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  ReactFlowProvider,
  ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { 
  Workflow, 
  WorkflowStep, 
  WorkflowActionType,
  WorkflowAction 
} from '@/lib/types/workflow';
import StepNode, { StepNodeData } from './StepNode';
import WorkflowSidebar from './WorkflowSidebar';
import NodesSidebar from './NodesSidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Download, Save, Play } from 'lucide-react';

const nodeTypes = {
  stepNode: StepNode,
};

interface FlowEditorProps {
  initialWorkflow?: Workflow;
  onSave?: (workflow: Workflow) => void;
}

export default function FlowEditor({ initialWorkflow, onSave }: FlowEditorProps) {
  const { user } = useAuth();
  const supabase = createClient();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  
  // Estado do workflow
  const [workflow, setWorkflow] = useState<Workflow>(initialWorkflow || {
    id: `workflow-${Date.now()}`,
    name: 'Novo Workflow',
    description: '',
    steps: [],
    config: {
      timeout: 300000,
      stopOnError: false
    }
  });

  // Garantir que workflow.steps seja sempre um array usando useMemo para evitar recriação
  const safeWorkflow = React.useMemo(() => ({
    ...workflow,
    steps: workflow.steps || []
  }), [workflow]);
  
  const [selectedStepId, setSelectedStepId] = useState<string | undefined>();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Função para atualizar a ordem dos steps baseada nas conexões
  const updateStepsOrder = useCallback((currentEdges: Edge[]) => {
    if (currentEdges.length === 0) return;

    // Criar um mapa de conexões (source -> target)
    const connections = new Map<string, string[]>();
    const incomingConnections = new Map<string, string[]>();
    
    currentEdges.forEach(edge => {
      if (!connections.has(edge.source)) {
        connections.set(edge.source, []);
      }
      connections.get(edge.source)!.push(edge.target);
      
      if (!incomingConnections.has(edge.target)) {
        incomingConnections.set(edge.target, []);
      }
      incomingConnections.get(edge.target)!.push(edge.source);
    });

    // Encontrar nós sem conexões de entrada (nós iniciais)
    const allNodeIds = new Set([...connections.keys(), ...Array.from(connections.values()).flat()]);
    const startNodes = Array.from(allNodeIds).filter(nodeId => !incomingConnections.has(nodeId));
    
    // Se não há nós iniciais claros, manter ordem atual
    if (startNodes.length === 0) return;

    // Ordenação topológica para determinar a sequência correta
    const orderedStepIds: string[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const topologicalSort = (nodeId: string): boolean => {
      if (visiting.has(nodeId)) {
        // Ciclo detectado, manter ordem atual
        return false;
      }
      if (visited.has(nodeId)) {
        return true;
      }

      visiting.add(nodeId);
      
      const targets = connections.get(nodeId) || [];
      for (const target of targets) {
        if (!topologicalSort(target)) {
          return false;
        }
      }
      
      visiting.delete(nodeId);
      visited.add(nodeId);
      orderedStepIds.unshift(nodeId); // Adicionar no início para ordem correta
      
      return true;
    };

    // Processar todos os nós iniciais
    let hasValidOrder = true;
    for (const startNode of startNodes) {
      if (!topologicalSort(startNode)) {
        hasValidOrder = false;
        break;
      }
    }

    // Se a ordenação foi bem-sucedida, atualizar o workflow
    if (hasValidOrder && orderedStepIds.length > 0) {
      setWorkflow(prev => {
        const stepMap = new Map(prev.steps.map(step => [step.id, step]));
        const orderedSteps = orderedStepIds
          .map(id => stepMap.get(id))
          .filter(step => step !== undefined) as WorkflowStep[];
        
        // Adicionar steps que não estão conectados no final
        const connectedStepIds = new Set(orderedStepIds);
        const unconnectedSteps = prev.steps.filter(step => !connectedStepIds.has(step.id));
        
        return {
          ...prev,
          steps: [...orderedSteps, ...unconnectedSteps]
        };
      });
    }
  }, []);

  // Atualizar ordem quando as edges mudarem
  const handleEdgesChange = useCallback((changes: any[]) => {
    onEdgesChange(changes);
    
    // Se houve remoção de edges, atualizar ordem
    const hasRemovals = changes.some(change => change.type === 'remove');
    if (hasRemovals) {
      // Usar setTimeout para garantir que o estado das edges foi atualizado
      setTimeout(() => {
        setEdges(currentEdges => {
          updateStepsOrder(currentEdges);
          return currentEdges;
        });
      }, 0);
    }
  }, [onEdgesChange, updateStepsOrder]);

  // Sincronizar workflow com nodes
  React.useEffect(() => {
    setNodes((currentNodes) => {
      const existingNodeIds = new Set(currentNodes.map(node => node.id));
      const workflowStepIds = new Set(safeWorkflow.steps.map(step => step.id));
      
      // Remover nós que não existem mais no workflow
      const filteredNodes = currentNodes.filter(node => workflowStepIds.has(node.id));
      
      // Atualizar dados dos nós existentes
      const updatedNodes = filteredNodes.map(node => {
        const step = safeWorkflow.steps.find(s => s.id === node.id);
        if (step) {
          return {
            ...node,
            data: {
              ...node.data,
              step,
              onStepSelect: setSelectedStepId,
              onAddAction: handleAddActionToStep,
              onDeleteStep: handleDeleteStep,
              isSelected: selectedStepId === step.id
            } as StepNodeData,
          };
        }
        return node;
      });
      
      // Criar novos nós para steps que não têm nós correspondentes
      const newNodes = safeWorkflow.steps
        .filter(step => !existingNodeIds.has(step.id))
        .map((step, index) => {
          const existingCount = updatedNodes.length;
          return {
            id: step.id,
            type: 'stepNode',
            position: { 
              x: 100 + ((existingCount + index) % 3) * 350, 
              y: 100 + Math.floor((existingCount + index) / 3) * 200 
            },
            data: {
              step,
              onStepSelect: setSelectedStepId,
              onAddAction: handleAddActionToStep,
              onDeleteStep: handleDeleteStep,
              isSelected: selectedStepId === step.id
            } as StepNodeData,
          };
        });
      
      return [...updatedNodes, ...newNodes];
    });
  }, [safeWorkflow.steps, selectedStepId]);

  const selectedStep = safeWorkflow.steps.find(step => step.id === selectedStepId);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => {
        const newEdges = addEdge(params, eds);
        // Atualizar ordem dos steps baseada nas conexões
        updateStepsOrder(newEdges);
        return newEdges;
      });
    },
    [setEdges, updateStepsOrder]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Função para limpar seleção quando clicar fora dos nós
  const onPaneClick = useCallback(() => {
    setSelectedStepId(undefined);
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const actionType = event.dataTransfer.getData('application/reactflow') as WorkflowActionType;

      if (typeof actionType === 'undefined' || !actionType || !reactFlowInstance || !reactFlowBounds) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // Verificar se foi dropado em um step existente
      const targetNode = nodes.find(node => {
        const nodeElement = document.querySelector(`[data-id="${node.id}"]`);
        if (!nodeElement) return false;
        
        const rect = nodeElement.getBoundingClientRect();
        return (
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom
        );
      });

      if (targetNode) {
        // Adicionar ação ao step existente
        handleAddActionToStep(targetNode.id, actionType);
      } else {
        // Criar novo step com a ação
        const timestamp = Date.now();
        const actionName = getActionName(actionType);
        const newStep: WorkflowStep = {
          id: `step-${timestamp}`,
          name: `${actionName} - ${timestamp}`,
          actions: [{
            type: actionType,
            params: getDefaultParams(actionType),
            description: ''
          }]
        };
        
        setWorkflow(prev => ({
          ...prev,
          steps: [...(prev.steps || []), newStep]
        }));
      }
    },
    [reactFlowInstance, nodes, safeWorkflow.steps]
  );

  const getActionName = (type: WorkflowActionType): string => {
    switch (type) {
      case 'sendDirectMessage':
        return 'Enviar DM';
      case 'likePost':
        return 'Curtir Post';
      case 'followUser':
        return 'Seguir Usuário';
      case 'unfollowUser':
        return 'Deixar de Seguir';
      case 'comment':
        return 'Comentar';
      case 'monitorMessages':
        return 'Monitorar Mensagens';
      case 'monitorPosts':
        return 'Monitorar Posts';
      case 'delay':
        return 'Aguardar';
      case 'startMessageProcessor':
        return 'Iniciar Processador';
      case 'stopMessageProcessor':
        return 'Parar Processador';
      default:
        return 'Ação';
    }
  };

  const getDefaultParams = (type: WorkflowActionType): any => {
    switch (type) {
      case 'sendDirectMessage':
        return { user: '', message: '' };
      case 'likePost':
        return { postId: '' };
      case 'followUser':
      case 'unfollowUser':
        return { username: '' };
      case 'comment':
        return { postId: '', comment: '' };
      case 'monitorMessages':
        return { keywords: [] };
      case 'monitorPosts':
        return { hashtags: [] };
      case 'delay':
        return { duration: 60000 }; // em milissegundos
      case 'startMessageProcessor':
        return { aiConfig: {}, processingConfig: {} };
      case 'stopMessageProcessor':
        return {};
      default:
        return {};
    }
  };

  const handleAddStep = () => {
    const timestamp = Date.now();
    const newStep: WorkflowStep = {
      id: `step-${timestamp}`,
      name: `Novo Step - ${timestamp}`,
      actions: []
    };
    
    setWorkflow(prev => ({
      ...prev,
      steps: [...(prev.steps || []), newStep]
    }));
    
    setSelectedStepId(newStep.id);
  };

  const handleAddActionToStep = useCallback((stepId: string, actionType?: WorkflowActionType) => {
    if (!actionType) {
      setSelectedStepId(stepId);
      return;
    }

    const newAction: WorkflowAction = {
      type: actionType,
      params: getDefaultParams(actionType),
      description: ''
    };

    setWorkflow(prev => ({
      ...prev,
      steps: (prev.steps || []).map(step => 
        step.id === stepId 
          ? { ...step, actions: [...(step.actions || []), newAction] }
          : step
      )
    }));
  }, []);

  const handleDeleteStep = useCallback((stepId: string) => {
    setWorkflow(prev => ({
      ...prev,
      steps: (prev.steps || []).filter(step => step.id !== stepId)
    }));
    
    if (selectedStepId === stepId) {
      setSelectedStepId(undefined);
    }
  }, [selectedStepId]);

  const handleWorkflowChange = useCallback((updatedWorkflow: Workflow) => {
    setWorkflow(updatedWorkflow);
  }, []);

  const handleStepChange = useCallback((updatedStep: WorkflowStep) => {
    setWorkflow(prev => ({
      ...prev,
      steps: (prev.steps || []).map(step => 
        step.id === updatedStep.id ? updatedStep : step
      )
    }));
  }, []);

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(workflow, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${workflow.name.replace(/\s+/g, '_')}_workflow.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleSaveToSupabase = async () => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado para salvar o workflow.',
        variant: 'destructive'
      });
      return;
    }

    if (!workflow.name.trim()) {
      toast({
        title: 'Erro',
        description: 'O workflow precisa ter um nome.',
        variant: 'destructive'
      });
      return;
    }

    if (safeWorkflow.steps.length === 0) {
      toast({
        title: 'Erro',
        description: 'O workflow precisa ter pelo menos um step.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('workflows')
        .upsert({
          id: workflow.id,
          user_id: user.id,
          workflow: workflow
        });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Workflow salvo com sucesso!',
      });
      
      if (onSave) {
        onSave(workflow);
      }
    } catch (error) {
      console.error('Erro ao salvar workflow:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar o workflow. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">
            {workflow.name}
          </h1>
          <p className="text-sm text-gray-600">
            {workflow.description || 'Editor de Workflows'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJSON}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar JSON
          </Button>
          
          <Button
            variant="default"
            size="sm"
            onClick={handleSaveToSupabase}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isLoading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Nodes Sidebar */}
        <NodesSidebar onAddStep={handleAddStep} />
        
        {/* Flow Canvas */}
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-gray-50"
          >
            <Controls />
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
          </ReactFlow>
        </div>
        
        {/* Configuration Sidebar */}
        <WorkflowSidebar
          workflow={workflow}
          selectedStep={selectedStep}
          onWorkflowChange={handleWorkflowChange}
          onStepChange={handleStepChange}
        />
      </div>
    </div>
  );
}

// Wrapper com ReactFlowProvider
export function FlowEditorWrapper(props: FlowEditorProps) {
  return (
    <ReactFlowProvider>
      <FlowEditor {...props} />
    </ReactFlowProvider>
  );
}