"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Instagram, 
  Plus, 
  Settings, 
  Play, 
  Pause, 
  Trash2, 
  Users, 
  Heart, 
  MessageCircle,
  Eye,
  Search
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

// Função para formatação consistente de números
const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

const instagramAccounts = [
  {
    id: 1,
    username: '@empresa_exemplo',
    profileImage: '',
    followers: 15420,
    following: 890,
    posts: 234,
    status: 'active',
    lastActivity: '2 min atrás'
  },
  {
    id: 2,
    username: '@loja_virtual',
    profileImage: '',
    followers: 8930,
    following: 1200,
    posts: 156,
    status: 'paused',
    lastActivity: '1 hora atrás'
  },
  {
    id: 3,
    username: '@influencer_tech',
    profileImage: '',
    followers: 45600,
    following: 2100,
    posts: 789,
    status: 'active',
    lastActivity: '5 min atrás'
  }
]

const automationStats = [
  {
    title: 'Seguidores Ganhos',
    value: '+234',
    description: 'Últimas 24h',
    icon: Users,
    trend: '+12% vs ontem'
  },
  {
    title: 'Curtidas Dadas',
    value: '1,456',
    description: 'Hoje',
    icon: Heart,
    trend: 'Meta: 1,500'
  },
  {
    title: 'Comentários',
    value: '89',
    description: 'Hoje',
    icon: MessageCircle,
    trend: '+5% vs ontem'
  },
  {
    title: 'Visualizações',
    value: '12.3K',
    description: 'Stories hoje',
    icon: Eye,
    trend: '+18% vs ontem'
  }
]

export default function InstagramPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddAccount, setShowAddAccount] = useState(false)

  const filteredAccounts = instagramAccounts.filter(account =>
    account.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Instagram className="h-8 w-8 mr-3 text-pink-500" />
            Instagram
          </h1>
          <p className="text-gray-600 mt-2">
            Gerencie suas contas e automações do Instagram
          </p>
        </div>
        <Button onClick={() => setShowAddAccount(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Conta
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

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Contas do Instagram</CardTitle>
          <CardDescription>
            Gerencie todas as suas contas conectadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar contas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Accounts List */}
          <div className="space-y-4">
            {filteredAccounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={account.profileImage} />
                    <AvatarFallback>
                      {account.username.slice(1, 3).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-gray-900">{account.username}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{formatNumber(account.followers)} seguidores</span>
                      <span>{formatNumber(account.following)} seguindo</span>
                      <span>{account.posts} posts</span>
                    </div>
                    <p className="text-xs text-gray-500">Última atividade: {account.lastActivity}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    account.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {account.status === 'active' ? 'Ativo' : 'Pausado'}
                  </div>
                  <Button variant="outline" size="sm">
                    {account.status === 'active' ? (
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

          {filteredAccounts.length === 0 && (
            <div className="text-center py-8">
              <Instagram className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma conta encontrada
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Tente ajustar sua busca' : 'Adicione sua primeira conta do Instagram'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowAddAccount(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Conta
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Account Modal - Simple version for now */}
      {showAddAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Adicionar Conta do Instagram</CardTitle>
              <CardDescription>
                Conecte uma nova conta para automação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="username">Nome de usuário</Label>
                <Input id="username" placeholder="@seu_usuario" />
              </div>
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" placeholder="Sua senha" />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddAccount(false)}>
                  Cancelar
                </Button>
                <Button>
                  Conectar Conta
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}