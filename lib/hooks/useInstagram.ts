'use client';

import { useState, useEffect, useCallback } from 'react';
import { instagramService } from '../services/instagram';
import {
  InstagramState,
  InstagramAccountState,
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
  UseInstagramReturn,
  InstagramAccount,
  InstagramStats
} from '../types/instagram';

const initialState: InstagramState = {
  accounts: [],
  activeAccountId: null,
  isLoading: false,
  error: null
};

export function useInstagram(): UseInstagramReturn {
  const [state, setState] = useState<InstagramState>(initialState);

  // Função para atualizar o estado
  const updateState = useCallback((updates: Partial<InstagramState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Função para atualizar uma conta específica
  const updateAccount = useCallback((accountId: string, updates: Partial<InstagramAccountState>) => {
    setState(prev => ({
      ...prev,
      accounts: prev.accounts.map(account => 
        account.id === accountId ? { ...account, ...updates } : account
      )
    }));
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

  // Gerenciamento de Contas
  
  const addAccount = useCallback(async (credentials: InstagramLoginRequest): Promise<InstagramOperationResult> => {
    const result = await handleAsyncOperation(
      () => instagramService.addAccount(credentials),
      'Conta adicionada com sucesso'
    );
    
    if (result.success && result.data) {
      const { accountId, account } = result.data;
      const accountState: InstagramAccountState = {
        id: accountId,
        username: account.username,
        isLoggedIn: true,
        isMonitoring: false,
        authType: account.authType,
        lastActivity: new Date(),
        stats: {
          totalLikes: 0,
          totalComments: 0,
          totalMessages: 0,
          totalPosts: 0,
          totalFollows: 0,
          totalUnfollows: 0,
          lastActivity: new Date()
        }
      };
      
      setState(prev => ({
        ...prev,
        accounts: [...prev.accounts, accountState],
        activeAccountId: prev.activeAccountId || accountId
      }));
    }
    
    return result;
  }, [handleAsyncOperation]);

  const removeAccount = useCallback(async (accountId: string): Promise<InstagramOperationResult> => {
    const result = await handleAsyncOperation(
      () => instagramService.removeAccount(accountId),
      'Conta removida com sucesso'
    );
    
    if (result.success) {
      setState(prev => {
        const newAccounts = prev.accounts.filter(account => account.id !== accountId);
        const newActiveAccountId = prev.activeAccountId === accountId 
          ? (newAccounts.length > 0 ? newAccounts[0].id : null)
          : prev.activeAccountId;
        
        return {
          ...prev,
          accounts: newAccounts,
          activeAccountId: newActiveAccountId
        };
      });
    }
    
    return result;
  }, [handleAsyncOperation]);

  const switchAccount = useCallback((accountId: string) => {
    const account = state.accounts.find(acc => acc.id === accountId);
    if (account) {
      updateState({ activeAccountId: accountId });
    }
  }, [state.accounts, updateState]);

  const getActiveAccount = useCallback((): InstagramAccountState | null => {
    if (!state.activeAccountId) return null;
    return state.accounts.find(account => account.id === state.activeAccountId) || null;
  }, [state.activeAccountId, state.accounts]);

  // Autenticação
  
  const login = useCallback(async (credentials: InstagramLoginRequest): Promise<InstagramOperationResult> => {
    const accountId = credentials.accountId || state.activeAccountId;
    if (!accountId) {
      return {
        success: false,
        message: 'Nenhuma conta selecionada',
        error: 'No account selected',
        timestamp: new Date()
      };
    }

    const result = await handleAsyncOperation(
      () => instagramService.login({ ...credentials, accountId }),
      'Login realizado com sucesso'
    );
    
    if (result.success) {
      updateAccount(accountId, { 
        isLoggedIn: true,
        lastActivity: new Date()
      });
    }
    
    return result;
  }, [handleAsyncOperation, updateAccount, state.activeAccountId]);

  const logout = useCallback(async (accountId?: string): Promise<InstagramOperationResult> => {
    const targetAccountId = accountId || state.activeAccountId;
    if (!targetAccountId) {
      return {
        success: false,
        message: 'Nenhuma conta selecionada',
        error: 'No account selected',
        timestamp: new Date()
      };
    }

    const result = await handleAsyncOperation(
      () => instagramService.logout(targetAccountId),
      'Logout realizado com sucesso'
    );
    
    if (result.success) {
      updateAccount(targetAccountId, { 
        isLoggedIn: false, 
        isMonitoring: false 
      });
    }
    
    return result;
  }, [handleAsyncOperation, updateAccount, state.activeAccountId]);

  // Ações do Instagram
  
  const likePost = useCallback(async (request: InstagramLikeRequest): Promise<InstagramOperationResult> => {
    const accountId = request.accountId || state.activeAccountId;
    const result = await handleAsyncOperation(
      () => instagramService.likePost({ ...request, accountId }),
      'Post curtido com sucesso'
    );
    
    if (result.success && accountId) {
      updateAccount(accountId, {
        lastActivity: new Date(),
        stats: {
          ...state.accounts.find(acc => acc.id === accountId)?.stats || {} as InstagramStats,
          totalLikes: (state.accounts.find(acc => acc.id === accountId)?.stats.totalLikes || 0) + 1,
          lastActivity: new Date()
        }
      });
    }
    
    return result;
  }, [handleAsyncOperation, updateAccount, state.activeAccountId, state.accounts]);

  const commentPost = useCallback(async (request: InstagramCommentRequest): Promise<InstagramOperationResult> => {
    const accountId = request.accountId || state.activeAccountId;
    const result = await handleAsyncOperation(
      () => instagramService.commentPost({ ...request, accountId }),
      'Comentário adicionado com sucesso'
    );
    
    if (result.success && accountId) {
      updateAccount(accountId, {
        lastActivity: new Date(),
        stats: {
          ...state.accounts.find(acc => acc.id === accountId)?.stats || {} as InstagramStats,
          totalComments: (state.accounts.find(acc => acc.id === accountId)?.stats.totalComments || 0) + 1,
          lastActivity: new Date()
        }
      });
    }
    
    return result;
  }, [handleAsyncOperation, updateAccount, state.activeAccountId, state.accounts]);

  const sendMessage = useCallback(async (request: InstagramMessageRequest): Promise<InstagramOperationResult> => {
    const accountId = request.accountId || state.activeAccountId;
    const result = await handleAsyncOperation(
      () => instagramService.sendMessage({ ...request, accountId }),
      'Mensagem enviada com sucesso'
    );
    
    if (result.success && accountId) {
      updateAccount(accountId, {
        lastActivity: new Date(),
        stats: {
          ...state.accounts.find(acc => acc.id === accountId)?.stats || {} as InstagramStats,
          totalMessages: (state.accounts.find(acc => acc.id === accountId)?.stats.totalMessages || 0) + 1,
          lastActivity: new Date()
        }
      });
    }
    
    return result;
  }, [handleAsyncOperation, updateAccount, state.activeAccountId, state.accounts]);

  const postPhoto = useCallback(async (request: InstagramPhotoRequest): Promise<InstagramOperationResult> => {
    const accountId = request.accountId || state.activeAccountId;
    const result = await handleAsyncOperation(
      () => instagramService.postPhoto({ ...request, accountId }),
      'Foto publicada com sucesso'
    );
    
    if (result.success && accountId) {
      updateAccount(accountId, {
        lastActivity: new Date(),
        stats: {
          ...state.accounts.find(acc => acc.id === accountId)?.stats || {} as InstagramStats,
          totalPosts: (state.accounts.find(acc => acc.id === accountId)?.stats.totalPosts || 0) + 1,
          lastActivity: new Date()
        }
      });
    }
    
    return result;
  }, [handleAsyncOperation, updateAccount, state.activeAccountId, state.accounts]);

  const followUser = useCallback(async (request: InstagramFollowRequest): Promise<InstagramOperationResult> => {
    const accountId = request.accountId || state.activeAccountId;
    const result = await handleAsyncOperation(
      () => instagramService.followUser({ ...request, accountId }),
      'Usuário seguido com sucesso'
    );
    
    if (result.success && accountId) {
      updateAccount(accountId, {
        lastActivity: new Date(),
        stats: {
          ...state.accounts.find(acc => acc.id === accountId)?.stats || {} as InstagramStats,
          totalFollows: (state.accounts.find(acc => acc.id === accountId)?.stats.totalFollows || 0) + 1,
          lastActivity: new Date()
        }
      });
    }
    
    return result;
  }, [handleAsyncOperation, updateAccount, state.activeAccountId, state.accounts]);

  const unfollowUser = useCallback(async (request: InstagramUnfollowRequest): Promise<InstagramOperationResult> => {
    const accountId = request.accountId || state.activeAccountId;
    const result = await handleAsyncOperation(
      () => instagramService.unfollowUser({ ...request, accountId }),
      'Parou de seguir usuário com sucesso'
    );
    
    if (result.success && accountId) {
      updateAccount(accountId, {
        lastActivity: new Date(),
        stats: {
          ...state.accounts.find(acc => acc.id === accountId)?.stats || {} as InstagramStats,
          totalUnfollows: (state.accounts.find(acc => acc.id === accountId)?.stats.totalUnfollows || 0) + 1,
          lastActivity: new Date()
        }
      });
    }
    
    return result;
  }, [handleAsyncOperation, updateAccount, state.activeAccountId, state.accounts]);

  // Monitoramento
  
  const startMonitoring = useCallback(async (config?: InstagramMonitorStartRequest): Promise<InstagramOperationResult> => {
    const accountId = config?.accountId || state.activeAccountId;
    const result = await handleAsyncOperation(
      () => instagramService.startMonitoring({ ...config, accountId }),
      'Monitoramento iniciado com sucesso'
    );
    
    if (result.success && accountId) {
      updateAccount(accountId, { isMonitoring: true });
    }
    
    return result;
  }, [handleAsyncOperation, updateAccount, state.activeAccountId]);

  const stopMonitoring = useCallback(async (accountId?: string): Promise<InstagramOperationResult> => {
    const targetAccountId = accountId || state.activeAccountId;
    const result = await handleAsyncOperation(
      () => instagramService.stopMonitoring(targetAccountId),
      'Monitoramento parado com sucesso'
    );
    
    if (result.success && targetAccountId) {
      updateAccount(targetAccountId, { isMonitoring: false });
    }
    
    return result;
  }, [handleAsyncOperation, updateAccount, state.activeAccountId]);

  // Status
  
  const getStatus = useCallback(async (accountId?: string): Promise<InstagramStatusResponse> => {
    try {
      updateState({ isLoading: true, error: null });
      const status = await instagramService.getStatus(accountId);
      
      if (accountId) {
        updateAccount(accountId, {
          isLoggedIn: status.loggedIn,
          isMonitoring: status.isMonitoring
        });
      }
      
      updateState({ 
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
  }, [updateState, updateAccount]);

  const refreshStatus = useCallback(async (accountId?: string): Promise<void> => {
    await getStatus(accountId);
  }, [getStatus]);



  // Salva contas no localStorage quando mudarem
  useEffect(() => {
    // Verificar se estamos no cliente antes de acessar localStorage
    if (typeof window === 'undefined') return;
    
    if (state.accounts.length > 0) {
      localStorage.setItem('instagram-accounts', JSON.stringify(state.accounts));
    } else {
      localStorage.removeItem('instagram-accounts');
    }
  }, [state.accounts]);

  // Verificar status periodicamente para contas logadas
  useEffect(() => {
    const loggedInAccounts = state.accounts.filter(account => account.isLoggedIn);
    if (loggedInAccounts.length === 0) return;

    const interval = setInterval(() => {
      loggedInAccounts.forEach(account => {
        refreshStatus(account.id);
      });
    }, 30000); // Verifica a cada 30 segundos

    return () => clearInterval(interval);
  }, [state.accounts, refreshStatus]);

  return {
    state,
    // Gerenciamento de contas
    addAccount,
    removeAccount,
    switchAccount,
    getActiveAccount,
    // Autenticação
    login,
    logout,
    // Ações do Instagram
    likePost,
    commentPost,
    sendMessage,
    postPhoto,
    followUser,
    unfollowUser,
    // Monitoramento
    startMonitoring,
    stopMonitoring,
    // Status
    getStatus,
    refreshStatus
  };
}

// Hook para operações específicas do Instagram com múltiplas contas
export function useInstagramActions() {
  const instagram = useInstagram();
  
  return {
    ...instagram,
    // Função de conveniência para executar múltiplas ações em uma conta
    executeActions: async (
      actions: Array<() => Promise<InstagramOperationResult>>,
      accountId?: string
    ) => {
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
      delayMs: number = 1000,
      accountId?: string
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
    },
    
    // Executa uma ação em todas as contas ativas
    executeOnAllAccounts: async (
      actionFactory: (accountId: string) => () => Promise<InstagramOperationResult>
    ) => {
      const activeAccounts = instagram.state.accounts.filter(account => account.isLoggedIn);
      const results: { [accountId: string]: InstagramOperationResult } = {};
      
      for (const account of activeAccounts) {
        const action = actionFactory(account.id);
        results[account.id] = await action();
      }
      
      return results;
    }
  };
}

// Hook para estatísticas e logs com suporte a múltiplas contas
export function useInstagramStats() {
  const { state } = useInstagram();
  
  const getAccountStats = useCallback((accountId: string) => {
    const account = state.accounts.find(acc => acc.id === accountId);
    return account?.stats || {
      totalLikes: 0,
      totalComments: 0,
      totalMessages: 0,
      totalPosts: 0,
      totalFollows: 0,
      totalUnfollows: 0,
      lastActivity: undefined
    };
  }, [state.accounts]);
  
  const getTotalStats = useCallback(() => {
    return state.accounts.reduce((total, account) => ({
      totalLikes: total.totalLikes + account.stats.totalLikes,
      totalComments: total.totalComments + account.stats.totalComments,
      totalMessages: total.totalMessages + account.stats.totalMessages,
      totalPosts: total.totalPosts + account.stats.totalPosts,
      totalFollows: total.totalFollows + account.stats.totalFollows,
      totalUnfollows: total.totalUnfollows + account.stats.totalUnfollows,
      lastActivity: account.stats.lastActivity && (!total.lastActivity || account.stats.lastActivity > total.lastActivity) 
        ? account.stats.lastActivity 
        : total.lastActivity
    }), {
      totalLikes: 0,
      totalComments: 0,
      totalMessages: 0,
      totalPosts: 0,
      totalFollows: 0,
      totalUnfollows: 0,
      lastActivity: undefined as Date | undefined
    });
  }, [state.accounts]);
  
  const getActiveAccountStats = useCallback(() => {
    if (!state.activeAccountId) return null;
    return getAccountStats(state.activeAccountId);
  }, [state.activeAccountId, getAccountStats]);

  return {
    getAccountStats,
    getTotalStats,
    getActiveAccountStats,
    accounts: state.accounts
  };
}