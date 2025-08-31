'use client';

import { useState, useRef } from 'react';
// Instagram hooks removidos - componente em modo mock
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';

interface InstagramPhotoUploadProps {
  className?: string;
}

export function InstagramPhotoUpload({ className }: InstagramPhotoUploadProps) {
  // Hooks removidos - dados mockados
  const state = { accounts: [], activeAccountId: null };
  const postPhoto = async () => {};
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    imagePath: '',
    caption: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setForm(prev => ({ ...prev, imagePath: file.name }));
      
      // Criar preview da imagem
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.imagePath) return;
    
    setIsSubmitting(true);
    try {
      const result = await postPhoto({
        imagePath: form.imagePath,
        caption: form.caption || undefined
      });
      
      setLastResult(result.success ? 'Foto publicada com sucesso!' : result.message);
      
      if (result.success) {
        // Limpar formulário
        setForm({ imagePath: '', caption: '' });
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setForm(prev => ({ ...prev, imagePath: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!state.isLoggedIn) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center py-8">
          <p className="text-gray-500">Faça login no Instagram para publicar fotos</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <h3 className="text-lg font-semibold">Publicar Foto</h3>

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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <div className="space-y-4">
            <Label>Selecionar Imagem</Label>
            
            {/* File Input */}
            <div className="flex items-center space-x-2">
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={isSubmitting || state.isLoading}
                className="flex-1"
              />
              {selectedFile && (
                <Button
                  type="button"
                  onClick={handleClearFile}
                  variant="outline"
                  size="sm"
                  disabled={isSubmitting || state.isLoading}
                >
                  Limpar
                </Button>
              )}
            </div>

            {/* File Info */}
            {selectedFile && (
              <div className="text-sm text-gray-600">
                <p>Arquivo: {selectedFile.name}</p>
                <p>Tamanho: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                <p>Tipo: {selectedFile.type}</p>
              </div>
            )}

            {/* Image Preview */}
            {previewUrl && (
              <div className="space-y-2">
                <Label>Preview da Imagem</Label>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-full max-h-64 mx-auto rounded-lg shadow-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Manual Path Input (Alternative) */}
          <div className="space-y-2">
            <Label htmlFor="imagePath">Ou digite o caminho da imagem</Label>
            <Input
              id="imagePath"
              type="text"
              value={form.imagePath}
              onChange={(e) => setForm(prev => ({ ...prev, imagePath: e.target.value }))}
              placeholder="Ex: /caminho/para/imagem.jpg"
              disabled={isSubmitting || state.isLoading}
            />
            <p className="text-xs text-gray-500">
              Caminho completo para a imagem no servidor
            </p>
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <Label htmlFor="caption">Legenda (opcional)</Label>
            <textarea
              id="caption"
              value={form.caption}
              onChange={(e) => setForm(prev => ({ ...prev, caption: e.target.value }))}
              placeholder="Digite a legenda da sua foto... #hashtags"
              disabled={isSubmitting || state.isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Adicione hashtags para maior alcance</span>
              <span>{form.caption.length}/2200</span>
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting || state.isLoading || !form.imagePath}
          >
            {isSubmitting ? 'Publicando...' : 'Publicar Foto'}
          </Button>
        </form>

        {/* Tips */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <h4 className="font-medium text-yellow-800 mb-2">Dicas para publicação:</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Use imagens de alta qualidade (mínimo 1080x1080px)</li>
            <li>• Formatos suportados: JPG, PNG</li>
            <li>• Adicione hashtags relevantes na legenda</li>
            <li>• Evite publicar muitas fotos em sequência</li>
            <li>• Respeite os termos de uso do Instagram</li>
          </ul>
        </div>

        {/* Loading Indicator */}
        {(isSubmitting || state.isLoading) && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">Publicando foto...</span>
          </div>
        )}
      </div>
    </Card>
  );
}