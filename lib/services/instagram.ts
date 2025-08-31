import {
  InstagramLoginRequest,
  InstagramLikeRequest,
  InstagramCommentRequest,
  InstagramMessageRequest,
  InstagramPhotoRequest,
  InstagramFollowRequest,
  InstagramUnfollowRequest,
  InstagramMonitorStartRequest,
  InstagramApiResponse,
  InstagramStatusResponse,
  InstagramOperationResult,
  InstagramConfig,
  InstagramAccount,
  InstagramAccountState,
  InstagramAuthData
} from '../types/instagram';

class InstagramMultiAccountService {
  private baseUrl: string;
  private timeout: number;
  private retries: number;
  private accounts: Map<string, InstagramAccount> = new Map();

  constructor(config?: InstagramConfig) {
    this.baseUrl = config?.baseUrl || '';
    this.timeout = config?.timeout || 30000;
    this.retries = config?.retries || 3;
  }

  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'POST',
    body?: any,
    accountId?: string
  ): Promise<T> {
    const url = `${this.baseUrl}/api/instagram${endpoint}`;
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(accountId && { 'X-Account-ID': accountId })
      },
    };

    if (body && method === 'POST') {
      options.body = JSON.stringify(body);
    }

    let lastError: Error;
    
    for (let attempt = 0; attempt < this.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        options.signal = controller.signal;
        
        const response = await fetch(url, options);
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === this.retries - 1) {
          throw lastError;
        }
        
        // Aguarda antes de tentar novamente
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
    
    throw lastError!;
  }

  private createOperationResult(
    success: boolean,
    message: string,
    data?: any,
    error?: string
  ): InstagramOperationResult {
    return {
      success,
      message,
      data,
      error,
      timestamp: new Date()
    };
  }

  private generateAccountId(): string {
    return `account_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Gerenciamento de Contas

  /**
   * Adiciona uma nova conta
   */
  async addAccount(credentials: InstagramLoginRequest): Promise<InstagramOperationResult> {
    try {
      const accountId = credentials.accountId || this.generateAccountId();
      
      // Tenta fazer login com as credenciais fornecidas
      const loginResult = await this.login({ ...credentials, accountId });
      
      if (loginResult.success) {
        const account: InstagramAccount = {
          id: accountId,
          username: credentials.auth.type === 'credentials' ? credentials.auth.username : 'cookie_user',
          displayName: credentials.auth.type === 'credentials' ? credentials.auth.username : undefined,
          authType: credentials.auth.type,
          isActive: true,
          lastLogin: new Date(),
          isMonitoring: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        this.accounts.set(accountId, account);
        
        return this.createOperationResult(
          true,
          'Conta adicionada com sucesso',
          { accountId, account }
        );
      }
      
      return loginResult;
    } catch (error) {
      return this.createOperationResult(
        false,
        'Erro ao adicionar conta',
        null,
        (error as Error).message
      );
    }
  }

  /**
   * Remove uma conta
   */
  async removeAccount(accountId: string): Promise<InstagramOperationResult> {
    try {
      if (!this.accounts.has(accountId)) {
        return this.createOperationResult(
          false,
          'Conta não encontrada',
          null,
          `Account ID ${accountId} not found`
        );
      }

      // Faz logout da conta antes de remover
      await this.logout(accountId);
      
      this.accounts.delete(accountId);
      
      return this.createOperationResult(
        true,
        'Conta removida com sucesso',
        { accountId }
      );
    } catch (error) {
      return this.createOperationResult(
        false,
        'Erro ao remover conta',
        null,
        (error as Error).message
      );
    }
  }

  /**
   * Lista todas as contas
   */
  getAccounts(): InstagramAccount[] {
    return Array.from(this.accounts.values());
  }

  /**
   * Obtém uma conta específica
   */
  getAccount(accountId: string): InstagramAccount | null {
    return this.accounts.get(accountId) || null;
  }

  // Endpoints de Automação
  
  /**
   * Realiza login na conta do Instagram
   */
  async login(credentials: InstagramLoginRequest): Promise<InstagramOperationResult> {
    try {
      const response = await this.makeRequest<InstagramApiResponse>(
        '/login', 
        'POST', 
        credentials,
        credentials.accountId
      );
      
      // Atualiza informações da conta se o login foi bem-sucedido
      if (response.success && credentials.accountId) {
        const account = this.accounts.get(credentials.accountId);
        if (account) {
          account.lastLogin = new Date();
          account.updatedAt = new Date();
          this.accounts.set(credentials.accountId, account);
        }
      }
      
      return this.createOperationResult(
        response.success,
        response.message,
        response.data
      );
    } catch (error) {
      return this.createOperationResult(
        false,
        'Erro ao fazer login no Instagram',
        null,
        (error as Error).message
      );
    }
  }

  /**
   * Curte um post específico
   */
  async likePost(request: InstagramLikeRequest): Promise<InstagramOperationResult> {
    try {
      const response = await this.makeRequest<InstagramApiResponse>(
        '/like', 
        'POST', 
        request,
        request.accountId
      );
      
      return this.createOperationResult(
        response.success,
        response.message,
        response.data
      );
    } catch (error) {
      return this.createOperationResult(
        false,
        'Erro ao curtir post',
        null,
        (error as Error).message
      );
    }
  }

  /**
   * Adiciona um comentário a um post
   */
  async commentPost(request: InstagramCommentRequest): Promise<InstagramOperationResult> {
    try {
      const response = await this.makeRequest<InstagramApiResponse>(
        '/comment', 
        'POST', 
        request,
        request.accountId
      );
      
      return this.createOperationResult(
        response.success,
        response.message,
        response.data
      );
    } catch (error) {
      return this.createOperationResult(
        false,
        'Erro ao comentar post',
        null,
        (error as Error).message
      );
    }
  }

  /**
   * Envia uma mensagem direta
   */
  async sendMessage(request: InstagramMessageRequest): Promise<InstagramOperationResult> {
    try {
      const response = await this.makeRequest<InstagramApiResponse>(
        '/message', 
        'POST', 
        request,
        request.accountId
      );
      
      return this.createOperationResult(
        response.success,
        response.message,
        response.data
      );
    } catch (error) {
      return this.createOperationResult(
        false,
        'Erro ao enviar mensagem',
        null,
        (error as Error).message
      );
    }
  }

  /**
   * Publica uma foto no feed
   */
  async postPhoto(request: InstagramPhotoRequest): Promise<InstagramOperationResult> {
    try {
      const response = await this.makeRequest<InstagramApiResponse>(
        '/photo', 
        'POST', 
        request,
        request.accountId
      );
      
      return this.createOperationResult(
        response.success,
        response.message,
        response.data
      );
    } catch (error) {
      return this.createOperationResult(
        false,
        'Erro ao publicar foto',
        null,
        (error as Error).message
      );
    }
  }

  /**
   * Segue um usuário
   */
  async followUser(request: InstagramFollowRequest): Promise<InstagramOperationResult> {
    try {
      const response = await this.makeRequest<InstagramApiResponse>(
        '/follow', 
        'POST', 
        request,
        request.accountId
      );
      
      return this.createOperationResult(
        response.success,
        response.message,
        response.data
      );
    } catch (error) {
      return this.createOperationResult(
        false,
        'Erro ao seguir usuário',
        null,
        (error as Error).message
      );
    }
  }

  /**
   * Para de seguir um usuário
   */
  async unfollowUser(request: InstagramUnfollowRequest): Promise<InstagramOperationResult> {
    try {
      const response = await this.makeRequest<InstagramApiResponse>(
        '/unfollow', 
        'POST', 
        request,
        request.accountId
      );
      
      return this.createOperationResult(
        response.success,
        response.message,
        response.data
      );
    } catch (error) {
      return this.createOperationResult(
        false,
        'Erro ao parar de seguir usuário',
        null,
        (error as Error).message
      );
    }
  }

  // Endpoints de Monitoramento e Estado

  /**
   * Obtém o status atual de uma conta específica ou todas
   */
  async getStatus(accountId?: string): Promise<InstagramStatusResponse> {
    try {
      const endpoint = accountId ? `/status/${accountId}` : '/status';
      const response = await this.makeRequest<InstagramStatusResponse>(
        endpoint, 
        'GET',
        null,
        accountId
      );
      return response;
    } catch (error) {
      return {
        loggedIn: false,
        isMonitoring: false
      };
    }
  }

  /**
   * Inicia o monitoramento de mensagens
   */
  async startMonitoring(config?: InstagramMonitorStartRequest): Promise<InstagramOperationResult> {
    try {
      const response = await this.makeRequest<InstagramApiResponse>(
        '/monitor/start', 
        'POST', 
        config,
        config?.accountId
      );
      
      // Atualiza status de monitoramento da conta
      if (response.success && config?.accountId) {
        const account = this.accounts.get(config.accountId);
        if (account) {
          account.isMonitoring = true;
          account.updatedAt = new Date();
          this.accounts.set(config.accountId, account);
        }
      }
      
      return this.createOperationResult(
        response.success,
        response.message,
        response.data
      );
    } catch (error) {
      return this.createOperationResult(
        false,
        'Erro ao iniciar monitoramento',
        null,
        (error as Error).message
      );
    }
  }

  /**
   * Para o monitoramento de mensagens
   */
  async stopMonitoring(accountId?: string): Promise<InstagramOperationResult> {
    try {
      const endpoint = accountId ? `/monitor/stop/${accountId}` : '/monitor/stop';
      const response = await this.makeRequest<InstagramApiResponse>(
        endpoint, 
        'POST',
        null,
        accountId
      );
      
      // Atualiza status de monitoramento da conta
      if (response.success && accountId) {
        const account = this.accounts.get(accountId);
        if (account) {
          account.isMonitoring = false;
          account.updatedAt = new Date();
          this.accounts.set(accountId, account);
        }
      }
      
      return this.createOperationResult(
        response.success,
        response.message,
        response.data
      );
    } catch (error) {
      return this.createOperationResult(
        false,
        'Erro ao parar monitoramento',
        null,
        (error as Error).message
      );
    }
  }

  /**
   * Fecha a sessão de uma conta específica
   */
  async close(accountId?: string): Promise<InstagramOperationResult> {
    try {
      const endpoint = accountId ? `/close/${accountId}` : '/close';
      const response = await this.makeRequest<InstagramApiResponse>(
        endpoint, 
        'POST',
        null,
        accountId
      );
      
      return this.createOperationResult(
        response.success,
        response.message,
        response.data
      );
    } catch (error) {
      return this.createOperationResult(
        false,
        'Erro ao fechar sessão',
        null,
        (error as Error).message
      );
    }
  }

  /**
   * Realiza logout de uma conta específica
   */
  async logout(accountId?: string): Promise<InstagramOperationResult> {
    return this.close(accountId);
  }
}

// Instância singleton do serviço
export const instagramService = new InstagramMultiAccountService();

// Exporta a classe para uso customizado
export { InstagramMultiAccountService };

// Mantém compatibilidade com a classe anterior
export const InstagramService = InstagramMultiAccountService;