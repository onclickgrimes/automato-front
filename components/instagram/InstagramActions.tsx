'use client';

import { useState } from 'react';
import { useInstagram } from '../../lib/hooks/useInstagram';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';

interface InstagramActionsProps {
  className?: string;
}

export function InstagramActions({ className }: InstagramActionsProps) {
  const { state, likePost, commentPost, sendMessage, followUser, unfollowUser } = useInstagram();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'like' | 'comment' | 'message' | 'follow'>('like');
  
  // Estados dos formulários
  const [likeForm, setLikeForm] = useState({ postId: '' });
  const [commentForm, setCommentForm] = useState({ postId: '', comment: '' });
  const [messageForm, setMessageForm] = useState({ userId: '', message: '' });
  const [followForm, setFollowForm] = useState({ userId: '' });
  
  const [lastResult, setLastResult] = useState<string | null>(null);

  const handleLike = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!likeForm.postId) return;
    
    setIsSubmitting(true);
    try {
      const result = await likePost({ postId: likeForm.postId });
      setLastResult(result.success ? 'Post curtido com sucesso!' : result.message);
      if (result.success) {
        setLikeForm({ postId: '' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentForm.postId || !commentForm.comment) return;
    
    setIsSubmitting(true);
    try {
      const result = await commentPost({
        postId: commentForm.postId,
        comment: commentForm.comment
      });
      setLastResult(result.success ? 'Comentário adicionado com sucesso!' : result.message);
      if (result.success) {
        setCommentForm({ postId: '', comment: '' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageForm.userId || !messageForm.message) return;
    
    setIsSubmitting(true);
    try {
      const result = await sendMessage({
        userId: messageForm.userId,
        message: messageForm.message
      });
      setLastResult(result.success ? 'Mensagem enviada com sucesso!' : result.message);
      if (result.success) {
        setMessageForm({ userId: '', message: '' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFollow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followForm.userId) return;
    
    setIsSubmitting(true);
    try {
      const result = await followUser({ userId: followForm.userId });
      setLastResult(result.success ? 'Usuário seguido com sucesso!' : result.message);
      if (result.success) {
        setFollowForm({ userId: '' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnfollow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followForm.userId) return;
    
    setIsSubmitting(true);
    try {
      const result = await unfollowUser({ userId: followForm.userId });
      setLastResult(result.success ? 'Parou de seguir usuário com sucesso!' : result.message);
      if (result.success) {
        setFollowForm({ userId: '' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!state.isLoggedIn) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center py-8">
          <p className="text-gray-500">Faça login no Instagram para usar as ações de automação</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <h3 className="text-lg font-semibold">Ações de Automação</h3>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'like', label: 'Curtir' },
            { id: 'comment', label: 'Comentar' },
            { id: 'message', label: 'Mensagem' },
            { id: 'follow', label: 'Seguir' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Result Message */}
        {lastResult && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-600">{lastResult}</p>
            <button
              onClick={() => setLastResult(null)}
              className="text-xs text-blue-500 hover:text-blue-700 mt-1"
            >
              Fechar
            </button>
          </div>
        )}

        {/* Tab Content */}
        <div className="space-y-4">
          {/* Like Tab */}
          {activeTab === 'like' && (
            <form onSubmit={handleLike} className="space-y-4">
              <div>
                <Label htmlFor="postId">ID do Post</Label>
                <Input
                  id="postId"
                  type="text"
                  value={likeForm.postId}
                  onChange={(e) => setLikeForm({ postId: e.target.value })}
                  placeholder="Ex: C5d3Tz7uF9C"
                  disabled={isSubmitting || state.isLoading}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  O ID do post pode ser encontrado na URL do Instagram
                </p>
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting || state.isLoading || !likeForm.postId}
              >
                {isSubmitting ? 'Curtindo...' : 'Curtir Post'}
              </Button>
            </form>
          )}

          {/* Comment Tab */}
          {activeTab === 'comment' && (
            <form onSubmit={handleComment} className="space-y-4">
              <div>
                <Label htmlFor="commentPostId">ID do Post</Label>
                <Input
                  id="commentPostId"
                  type="text"
                  value={commentForm.postId}
                  onChange={(e) => setCommentForm(prev => ({ ...prev, postId: e.target.value }))}
                  placeholder="Ex: C5d3Tz7uF9C"
                  disabled={isSubmitting || state.isLoading}
                  required
                />
              </div>
              <div>
                <Label htmlFor="comment">Comentário</Label>
                <Input
                  id="comment"
                  type="text"
                  value={commentForm.comment}
                  onChange={(e) => setCommentForm(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Digite seu comentário"
                  disabled={isSubmitting || state.isLoading}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting || state.isLoading || !commentForm.postId || !commentForm.comment}
              >
                {isSubmitting ? 'Comentando...' : 'Adicionar Comentário'}
              </Button>
            </form>
          )}

          {/* Message Tab */}
          {activeTab === 'message' && (
            <form onSubmit={handleMessage} className="space-y-4">
              <div>
                <Label htmlFor="userId">Usuário</Label>
                <Input
                  id="userId"
                  type="text"
                  value={messageForm.userId}
                  onChange={(e) => setMessageForm(prev => ({ ...prev, userId: e.target.value }))}
                  placeholder="@usuario ou ID do usuário"
                  disabled={isSubmitting || state.isLoading}
                  required
                />
              </div>
              <div>
                <Label htmlFor="message">Mensagem</Label>
                <Input
                  id="message"
                  type="text"
                  value={messageForm.message}
                  onChange={(e) => setMessageForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Digite sua mensagem"
                  disabled={isSubmitting || state.isLoading}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting || state.isLoading || !messageForm.userId || !messageForm.message}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}
              </Button>
            </form>
          )}

          {/* Follow Tab */}
          {activeTab === 'follow' && (
            <form className="space-y-4">
              <div>
                <Label htmlFor="followUserId">Usuário</Label>
                <Input
                  id="followUserId"
                  type="text"
                  value={followForm.userId}
                  onChange={(e) => setFollowForm({ userId: e.target.value })}
                  placeholder="@usuario ou ID do usuário"
                  disabled={isSubmitting || state.isLoading}
                  required
                />
              </div>
              <div className="flex space-x-2">
                <Button 
                  type="button"
                  onClick={handleFollow}
                  className="flex-1"
                  disabled={isSubmitting || state.isLoading || !followForm.userId}
                >
                  {isSubmitting ? 'Seguindo...' : 'Seguir'}
                </Button>
                <Button 
                  type="button"
                  onClick={handleUnfollow}
                  variant="destructive"
                  className="flex-1"
                  disabled={isSubmitting || state.isLoading || !followForm.userId}
                >
                  {isSubmitting ? 'Parando...' : 'Parar de Seguir'}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Loading Indicator */}
        {(isSubmitting || state.isLoading) && (
          <div className="flex items-center justify-center py-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">Processando...</span>
          </div>
        )}
      </div>
    </Card>
  );
}