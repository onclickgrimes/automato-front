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
  InstagramConfig
} from '../types/instagram';

class InstagramService {
  private baseUrl: string;
  private timeout: number;
  private retries: number;

  constructor(config?: InstagramConfig) {
    this.baseUrl = config?.baseUrl || '';
    this.timeout = config?.timeout || 30000;
    this.retries = config?.retries || 3;
  }

  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'POST',
    body?: any
  ): Promise<T> {
    const url = `${this.baseUrl}/api/instagram${endpoint}`;
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
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

  // Endpoints de Automação
  
  /**
   * Realiza login na conta do Instagram
   */
  async login(credentials: InstagramLoginRequest): Promise<InstagramOperationResult> {
    try {
      const response = await this.makeRequest<InstagramApiResponse>('/login', 'POST', credentials);
      
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
      const response = await this.makeRequest<InstagramApiResponse>('/like', 'POST', request);
      
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
      const response = await this.makeRequest<InstagramApiResponse>('/comment', 'POST', request);
      
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
      const response = await this.makeRequest<InstagramApiResponse>('/message', 'POST', request);
      
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
      const response = await this.makeRequest<InstagramApiResponse>('/photo', 'POST', request);
      
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
      const response = await this.makeRequest<InstagramApiResponse>('/follow', 'POST', request);
      
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
      const response = await this.makeRequest<InstagramApiResponse>('/unfollow', 'POST', request);
      
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
   * Obtém o status atual da instância
   */
  async getStatus(): Promise<InstagramStatusResponse> {
    try {
      const response = await this.makeRequest<InstagramStatusResponse>('/status', 'GET');
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
      const response = await this.makeRequest<InstagramApiResponse>('/monitor/start', 'POST', config);
      
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
  async stopMonitoring(): Promise<InstagramOperationResult> {
    try {
      const response = await this.makeRequest<InstagramApiResponse>('/monitor/stop', 'POST');
      
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
   * Fecha a instância do navegador
   */
  async close(): Promise<InstagramOperationResult> {
    try {
      const response = await this.makeRequest<InstagramApiResponse>('/close', 'POST');
      
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
   * Realiza logout (alias para close)
   */
  async logout(): Promise<InstagramOperationResult> {
    return this.close();
  }
}

// Instância singleton do serviço
export const instagramService = new InstagramService();

// Exporta a classe para uso customizado
export { InstagramService };