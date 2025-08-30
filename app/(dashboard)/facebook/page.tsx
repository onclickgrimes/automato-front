"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Facebook, 
  Plus, 
  Settings, 
  Play, 
  Pause, 
  Trash2, 
  Users, 
  Heart, 
  MessageCircle,
  Share,
  Search,
  ExternalLink
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

// Função para formatação consistente de números
const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

const facebookPages = [
  {
    id: 1,
    name: 'Empresa Exemplo Ltda',
    username: '@empresaexemplo',
    profileImage: '',
    followers: 25420,
    likes: 24890,
    posts: 156,
    status: 'active',
    lastActivity: '3 min atrás',
    category: 'Empresa'
  },
  {
    id: 2,
    name: 'Loja Virtual Online',
    username: '@lojavirtual',
    profileImage: '',
    followers: 18930,
    likes: 18200,
    posts: 234,
    status: 'paused',
    lastActivity: '2 horas atrás',
    category: 'Loja'
  },
  {
    id: 3,
    name: 'Tech Influencer',
    username: '@techinfluencer',
    profileImage: '',
    followers: 65600,
    likes: 64100,
    posts: 445,
    status: 'active',
    lastActivity: '1 min atrás',
    category: 'Pessoa Pública'
  }
]

const automationStats = [
  {
    title: 'Seguidores Ganhos',
    value: '+189',
    description: 'Últimas 24h',
    icon: Users,
    trend: '+8% vs ontem'
  },
  {
    title: 'Curtidas Dadas',
    value: '2,456',
    description: 'Hoje',
    icon: Heart,
    trend: 'Meta: 2,500'
  },
  {
    title: 'Comentários',
    value: '145',
    description: 'Hoje',
    icon: MessageCircle,
    trend: '+12% vs ontem'
  },
  {
    title: 'Compartilhamentos',
    value: '89',
    description: 'Hoje',
    icon: Share,
    trend: '+25% vs ontem'
  }
]

const recentPosts = [
  {
    id: 1,
    page: 'Empresa Exemplo Ltda',
    content: 'Novidades chegando em breve! Fiquem ligados...',
    time: '2 horas atrás',
    likes: 45,
    comments: 12,
    shares: 8,
    status: 'published'
  },
  {
    id: 2,
    page: 'Loja Virtual Online',
    content: 'Promoção especial de fim de semana! 50% OFF...',
    time: '4 horas atrás',
    likes: 128,
    comments: 23,
    shares: 15,
    status: 'published'
  },
  {
    id: 3,
    page: 'Tech Influencer',
    content: 'Review do novo smartphone que está bombando...',
    time: '6 horas atrás',
    likes: 234,
    comments: 45,
    shares: 32,
    status: 'published'
  }
]

export default function FacebookPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddPage, setShowAddPage] = useState(false)

  const filteredPages = facebookPages.filter(page =>
    page.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Facebook className="h-8 w-8 mr-3 text-blue-600" />
            Facebook
          </h1>
          <p className="text-gray-600 mt-2">
            Gerencie suas páginas e automações do Facebook
          </p>
        </div>
        <Button onClick={() => setShowAddPage(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Conectar Página
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {automationStats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-xs text-gray-600 mt-1">
                  {stat.description}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {stat.trend}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Facebook Pages */}
        <Card>
          <CardHeader>
            <CardTitle>Páginas do Facebook</CardTitle>
            <CardDescription>
              Gerencie todas as suas páginas conectadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar páginas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-4">
              {filteredPages.map((page) => (
                <div key={page.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={page.profileImage} />
                      <AvatarFallback className="bg-blue-100 text-blue-700">
                        {page.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900">{page.name}</h3>
                      <p className="text-sm text-gray-600">{page.username}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{formatNumber(page.followers)} seguidores</span>
                <span>{formatNumber(page.likes)} curtidas</span>
                        <span>{page.posts} posts</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span className="bg-gray-100 px-2 py-1 rounded">{page.category}</span>
                        <span>•</span>
                        <span>{page.lastActivity}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      page.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {page.status === 'active' ? 'Ativo' : 'Pausado'}
                    </div>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      {page.status === 'active' ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {filteredPages.length === 0 && (
              <div className="text-center py-8">
                <Facebook className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma página encontrada
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? 'Tente ajustar sua busca' : 'Conecte sua primeira página do Facebook'}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setShowAddPage(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Conectar Página
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Posts */}
        <Card>
          <CardHeader>
            <CardTitle>Posts Recentes</CardTitle>
            <CardDescription>
              Últimas publicações das suas páginas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <div key={post.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{post.page}</h4>
                    <span className="text-xs text-gray-500">{post.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{post.content}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Heart className="h-3 w-3" />
                        <span>{post.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="h-3 w-3" />
                        <span>{post.comments}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Share className="h-3 w-3" />
                        <span>{post.shares}</span>
                      </div>
                    </div>
                    <div className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Publicado
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full">
                Ver Todos os Posts
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Page Modal */}
      {showAddPage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Conectar Página do Facebook</CardTitle>
              <CardDescription>
                Conecte uma página para automação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Facebook className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="font-medium text-blue-900">Conectar com Facebook</h3>
                    <p className="text-sm text-blue-700">
                      Você será redirecionado para o Facebook para autorizar o acesso às suas páginas.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Permissões necessárias:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Gerenciar suas páginas</li>
                  <li>• Publicar em nome das páginas</li>
                  <li>• Ler insights das páginas</li>
                  <li>• Responder mensagens</li>
                </ul>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddPage(false)}>
                  Cancelar
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Facebook className="h-4 w-4 mr-2" />
                  Conectar com Facebook
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}