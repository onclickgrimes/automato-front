'use client';

import { useState, useEffect, useCallback } from 'react';
import { instagramService } from '../services/instagram';
import {
  InstagramState,
  InstagramLoginRequest,
  InstagramLikeRequest,
  InstagramCommentRequest,
  InstagramMessageRequest,
  InstagramPhotoRequest,
  InstagramFollowRequest,
  InstagramUnfollowRequest,
  InstagramMonitorStartRequest,
  InstagramOperationResult,
  InstagramStatusResponse,
  UseInstagramReturn
} from '../types/instagram';

const initialState: InstagramState = {
  isLoggedIn: false,
  isMonitoring: false,
  isLoading: false,
  error: null
};

export function useInstagram(): UseInstagramReturn {
  const [state, setState] = useState<InstagramState>(initialState);

  // Função para atualizar o estado
  const updateState = useCallback((updates: Partial<InstagramState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Função para lidar com operações assíncronas
  const handleAsyncOperation = useCallback(async (
    operation: () => Promise<InstagramOperationResult>,
    successMessage?: string
  ): Promise<InstagramOperationResult> => {
    updateState({ isLoading: true, error: null });
    
    try {
      const result = await operation();
      
      if (result.success) {
        updateState({ 
          isLoading: false, 
          error: null 
        });
      } else {
        updateState({ 
          isLoading: false, 
          error: result.error || result.message 
        });
      }
      
      return result;
    } catch (error) {
      const errorMessage = (error as Error).message;
      updateState({ 
        isLoading: false, 
        error: errorMessage 
      });
      
      return {
        success: false,
        message: 'Erro inesperado',
        error: errorMessage,
        timestamp: new Date()
      };
    }
  }, [updateState]);

  // Login
  const login = useCallback(async (credentials: InstagramLoginRequest): Promise<InstagramOperationResult> => {
    const result = await handleAsyncOperation(
      () => instagramService.login(credentials),
      'Login realizado com sucesso'
    );
    
    if (result.success) {
      updateState({ isLoggedIn: true });
    }
    
    return result;
  }, [handleAsyncOperation, updateState]);

  // Logout
  const logout = useCallback(async (): Promise<InstagramOperationResult> => {
    const result = await handleAsyncOperation(
      () => instagramService.logout(),
      'Logout realizado com sucesso'
    );
    
    if (result.success) {
      updateState({ 
        isLoggedIn: false, 
        isMonitoring: false 
      });
    }
    
    return result;
  }, [handleAsyncOperation, updateState]);

  // Curtir post
  const likePost = useCallback(async (request: InstagramLikeRequest): Promise<InstagramOperationResult> => {
    return handleAsyncOperation(
      () => instagramService.likePost(request),
      'Post curtido com sucesso'
    );
  }, [handleAsyncOperation]);

  // Comentar post
  const commentPost = useCallback(async (request: InstagramCommentRequest): Promise<InstagramOperationResult> => {
    return handleAsyncOperation(
      () => instagramService.commentPost(request),
      'Comentário adicionado com sucesso'
    );
  }, [handleAsyncOperation]);

  // Enviar mensagem
  const sendMessage = useCallback(async (request: InstagramMessageRequest): Promise<InstagramOperationResult> => {
    return handleAsyncOperation(
      () => instagramService.sendMessage(request),
      'Mensagem enviada com sucesso'
    );
  }, [handleAsyncOperation]);

  // Postar foto
  const postPhoto = useCallback(async (request: InstagramPhotoRequest): Promise<InstagramOperationResult> => {
    return handleAsyncOperation(
      () => instagramService.postPhoto(request),
      'Foto publicada com sucesso'
    );
  }, [handleAsyncOperation]);

  // Seguir usuário
  const followUser = useCallback(async (request: InstagramFollowRequest): Promise<InstagramOperationResult> => {
    return handleAsyncOperation(
      () => instagramService.followUser(request),
      'Usuário seguido com sucesso'
    );
  }, [handleAsyncOperation]);

  // Parar de seguir usuário
  const unfollowUser = useCallback(async (request: InstagramUnfollowRequest): Promise<InstagramOperationResult> => {
    return handleAsyncOperation(
      () => instagramService.unfollowUser(request),
      'Parou de seguir usuário com sucesso'
    );
  }, [handleAsyncOperation]);

  // Iniciar monitoramento
  const startMonitoring = useCallback(async (config?: InstagramMonitorStartRequest): Promise<InstagramOperationResult> => {
    const result = await handleAsyncOperation(
      () => instagramService.startMonitoring(config),
      'Monitoramento iniciado com sucesso'
    );
    
    if (result.success) {
      updateState({ isMonitoring: true });
    }
    
    return result;
  }, [handleAsyncOperation, updateState]);

  // Parar monitoramento
  const stopMonitoring = useCallback(async (): Promise<InstagramOperationResult> => {
    const result = await handleAsyncOperation(
      () => instagramService.stopMonitoring(),
      'Monitoramento parado com sucesso'
    );
    
    if (result.success) {
      updateState({ isMonitoring: false });
    }
    
    return result;
  }, [handleAsyncOperation, updateState]);

  // Obter status
  const getStatus = useCallback(async (): Promise<InstagramStatusResponse> => {
    try {
      updateState({ isLoading: true, error: null });
      const status = await instagramService.getStatus();
      
      updateState({ 
        isLoggedIn: status.loggedIn,
        isMonitoring: status.isMonitoring,
        isLoading: false,
        error: null
      });
      
      return status;
    } catch (error) {
      const errorMessage = (error as Error).message;
      updateState({ 
        isLoading: false, 
        error: errorMessage 
      });
      
      return {
        loggedIn: false,
        isMonitoring: false
      };
    }
  }, [updateState]);

  // Atualizar status
  const refreshStatus = useCallback(async (): Promise<void> => {
    await getStatus();
  }, [getStatus]);

  // Verificar status ao montar o componente
  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  // Verificar status periodicamente se estiver logado
  useEffect(() => {
    if (!state.isLoggedIn) return;

    const interval = setInterval(() => {
      refreshStatus();
    }, 30000); // Verifica a cada 30 segundos

    return () => clearInterval(interval);
  }, [state.isLoggedIn, refreshStatus]);

  return {
    state,
    login,
    logout,
    likePost,
    commentPost,
    sendMessage,
    postPhoto,
    followUser,
    unfollowUser,
    startMonitoring,
    stopMonitoring,
    getStatus,
    refreshStatus
  };
}

// Hook para operações específicas do Instagram
export function useInstagramActions() {
  const instagram = useInstagram();
  
  return {
    ...instagram,
    // Função de conveniência para executar múltiplas ações
    executeActions: async (actions: Array<() => Promise<InstagramOperationResult>>) => {
      const results: InstagramOperationResult[] = [];
      
      for (const action of actions) {
        const result = await action();
        results.push(result);
        
        if (!result.success) {
          break; // Para na primeira falha
        }
      }
      
      return results;
    },
    
    // Função para executar ações em lote com delay
    executeBatchActions: async (
      actions: Array<() => Promise<InstagramOperationResult>>,
      delayMs: number = 1000
    ) => {
      const results: InstagramOperationResult[] = [];
      
      for (let i = 0; i < actions.length; i++) {
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
        
        const result = await actions[i]();
        results.push(result);
        
        if (!result.success) {
          break;
        }
      }
      
      return results;
    }
  };
}

// Hook para estatísticas e logs
export function useInstagramStats() {
  const [stats, setStats] = useState({
    totalActions: 0,
    successfulActions: 0,
    failedActions: 0,
    lastAction: null as InstagramOperationResult | null
  });

  const updateStats = useCallback((result: InstagramOperationResult) => {
    setStats(prev => ({
      totalActions: prev.totalActions + 1,
      successfulActions: prev.successfulActions + (result.success ? 1 : 0),
      failedActions: prev.failedActions + (result.success ? 0 : 1),
      lastAction: result
    }));
  }, []);

  const resetStats = useCallback(() => {
    setStats({
      totalActions: 0,
      successfulActions: 0,
      failedActions: 0,
      lastAction: null
    });
  }, []);

  return {
    stats,
    updateStats,
    resetStats
  };
}