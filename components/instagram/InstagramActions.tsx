'use client';

import { useState } from 'react';
// Instagram hooks removidos - componente em modo mock
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Heart, MessageCircle, UserPlus, Camera, Play, Pause, User } from 'lucide-react';

interface InstagramActionsProps {
  className?: string;
}

export function InstagramActions({ className }: InstagramActionsProps) {
  // Hooks removidos - dados mockados
  const state = { accounts: [], activeAccountId: null };
  const getActiveAccount = () => null;
  const executeActions = async () => {};
  const isExecuting = false;
  const currentAction = null;
  const progress = 0;
  
  const activeAccount = getActiveAccount();
  // Estados dos formulários
  const [likeForm, setLikeForm] = useState({ postId: '' });
  const [commentForm, setCommentForm] = useState({ postId: '', comment: '' });
  const [followForm, setFollowForm] = useState({ username: '' });
  const [bulkActions, setBulkActions] = useState<Array<{
    type: string;
    data: any;
  }>>([]);
  
  const [lastResult, setLastResult] = useState<string | null>(null);

  const handleLikeAction = async () => {
    if (!likeForm.postId || !activeAccount) return;
    
    await executeActions([
      {
        type: 'like',
        data: { postId: likeForm.postId, accountId: activeAccount.id },
        delay: 1000
      }
    ]);
    
    setLikeForm({ postId: '' });
  };

  const handleCommentAction = async () => {
    if (!commentForm.postId || !commentForm.comment || !activeAccount) return;
    
    await executeActions([
      {
        type: 'comment',
        data: {
          postId: commentForm.postId,
          comment: commentForm.comment,
          accountId: activeAccount.id
        },
        delay: 2000
      }
    ]);
    
    setCommentForm({ postId: '', comment: '' });
  };

  const handleFollowAction = async () => {
    if (!followForm.username || !activeAccount) return;
    
    await executeActions([
      {
        type: 'follow',
        data: { username: followForm.username, accountId: activeAccount.id },
        delay: 3000
      }
    ]);
    
    setFollowForm({ username: '' });
  };

  const handleBulkActions = async () => {
    if (bulkActions.length === 0 || !activeAccount) return;
    
    const actions = bulkActions.map((action, index) => ({
      type: action.type as 'like' | 'comment' | 'follow',
      data: { ...action.data, accountId: activeAccount.id },
      delay: (index + 1) * 2000 // Delay progressivo
    }));
    
    await executeActions(actions);
    setBulkActions([]);
  };

  const addToBulk = (type: string, data: any) => {
    setBulkActions(prev => [...prev, { type, data }]);
  };

  const removeFromBulk = (index: number) => {
    setBulkActions(prev => prev.filter((_, i) => i !== index));
  };

  // Verificar se há conta ativa e se está logada
  if (!activeAccount) {
    return (
      <Card className={`p-8 text-center ${className}`}>
        <div className="space-y-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Nenhuma conta selecionada</h3>
            <p className="text-gray-600">
              Selecione uma conta para executar ações
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (!activeAccount.isLoggedIn) {
    return (
      <Card className={`p-8 text-center ${className}`}>
        <div className="space-y-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Conta não conectada</h3>
            <p className="text-gray-600">
              A conta @{activeAccount.username} precisa estar conectada para executar ações
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Ações do Instagram</h3>
          <p className="text-gray-600">
            Execute ações automatizadas na conta @{activeAccount.username}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default" className="bg-green-500">
            @{activeAccount.username}
          </Badge>
          <Badge variant={activeAccount.isLoggedIn ? 'default' : 'secondary'}>
            {activeAccount.isLoggedIn ? 'Conectado' : 'Desconectado'}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="like" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="like" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Curtir
          </TabsTrigger>
          <TabsTrigger value="comment" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Comentar
          </TabsTrigger>
          <TabsTrigger value="follow" className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Seguir
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            Lote
          </TabsTrigger>
        </TabsList>

        {/* Progress Indicator */}
        {isExecuting && (
          <Card className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Executando ações...</span>
                <Badge variant="secondary">
                  {progress.current}/{progress.total}
                </Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
              {currentAction && (
                <p className="text-xs text-gray-600">
                  Ação atual: {currentAction.type}
                </p>
              )}
            </div>
          </Card>
        )}

        <TabsContent value="like" className="space-y-4">
          <Card className="p-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="postId">URL do Post</Label>
                <Input
                  id="postId"
                  type="url"
                  value={likeForm.postId}
                  onChange={(e) => setLikeForm({ postId: e.target.value })}
                  placeholder="https://www.instagram.com/p/..."
                  disabled={isExecuting}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Cole a URL completa do post do Instagram
                </p>
              </div>
              <Button
                onClick={handleLikeAction}
                disabled={isExecuting || !likeForm.postId || !activeAccount?.isLoggedIn}
                className="w-full"
              >
                {isExecuting && currentAction?.type === 'like' ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Curtindo...
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 mr-2" />
                    Curtir Post
                  </>
                )}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="comment" className="space-y-4">
          <Card className="p-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="commentPostUrl">URL do Post</Label>
                <Input
                  id="commentPostUrl"
                  type="url"
                  value={commentForm.postId}
                  onChange={(e) => setCommentForm(prev => ({ ...prev, postId: e.target.value }))}
                  placeholder="https://www.instagram.com/p/..."
                  disabled={isExecuting}
                />
              </div>
              <div>
                <Label htmlFor="comment">Comentário</Label>
                <Textarea
                  id="comment"
                  value={commentForm.comment}
                  onChange={(e) => setCommentForm(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Digite seu comentário..."
                  disabled={isExecuting}
                  rows={3}
                />
              </div>
              <Button
                onClick={handleCommentAction}
                disabled={isExecuting || !commentForm.postId || !commentForm.comment || !activeAccount?.isLoggedIn}
                className="w-full"
              >
                {isExecuting && currentAction?.type === 'comment' ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Comentando...
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Comentar
                  </>
                )}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="follow" className="space-y-4">
          <Card className="p-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Nome de usuário</Label>
                <Input
                  id="username"
                  type="text"
                  value={followForm.username}
                  onChange={(e) => setFollowForm({ username: e.target.value })}
                  placeholder="@usuario (sem o @)"
                  disabled={isExecuting}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Digite apenas o nome de usuário, sem o símbolo @
                </p>
              </div>
              <Button
                onClick={handleFollowAction}
                disabled={isExecuting || !followForm.username || !activeAccount?.isLoggedIn}
                className="w-full"
              >
                {isExecuting && currentAction?.type === 'follow' ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Seguindo...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Seguir Usuário
                  </>
                )}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Ações em Lote</h4>
                <Badge variant="secondary">
                  {bulkActions.length} ações
                </Badge>
              </div>
              
              {bulkActions.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {bulkActions.map((action, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">
                        {action.type}: {JSON.stringify(action.data).substring(0, 50)}...
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFromBulk(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              <Button
                onClick={handleBulkActions}
                disabled={isExecuting || bulkActions.length === 0 || !activeAccount?.isLoggedIn}
                className="w-full"
              >
                {isExecuting ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Executando... ({progress.current}/{progress.total})
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Executar Ações ({bulkActions.length})
                  </>
                )}
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Result Message */}
      {lastResult && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-green-600">{lastResult}</p>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setLastResult(null)}
            >
              ×
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}