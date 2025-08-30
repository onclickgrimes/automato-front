"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  MessageCircle, 
  Plus, 
  Settings, 
  Play, 
  Pause, 
  Trash2, 
  Send, 
  Users, 
  Clock,
  CheckCircle,
  Search,
  Phone
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const whatsappSessions = [
  {
    id: 1,
    name: 'Atendimento Principal',
    phone: '+55 11 99999-9999',
    status: 'connected',
    lastActivity: '1 min atrás',
    messagesCount: 1247,
    qrCode: null
  },
  {
    id: 2,
    name: 'Vendas Online',
    phone: '+55 11 88888-8888',
    status: 'disconnected',
    lastActivity: '2 horas atrás',
    messagesCount: 892,
    qrCode: 'pending'
  },
  {
    id: 3,
    name: 'Suporte Técnico',
    phone: '+55 11 77777-7777',
    status: 'connected',
    lastActivity: '5 min atrás',
    messagesCount: 456,
    qrCode: null
  }
]

const automationStats = [
  {
    title: 'Mensagens Enviadas',
    value: '2,847',
    description: 'Últimas 24h',
    icon: Send,
    trend: '+15% vs ontem'
  },
  {
    title: 'Contatos Ativos',
    value: '1,234',
    description: 'Total de contatos',
    icon: Users,
    trend: '+23 novos hoje'
  },
  {
    title: 'Taxa de Entrega',
    value: '98.5%',
    description: 'Últimas 24h',
    icon: CheckCircle,
    trend: '+0.3% vs ontem'
  },
  {
    title: 'Tempo Médio',
    value: '2.3s',
    description: 'Resposta automática',
    icon: Clock,
    trend: '-0.5s vs ontem'
  }
]

const recentMessages = [
  {
    id: 1,
    contact: 'João Silva',
    message: 'Olá, gostaria de saber sobre os produtos...',
    time: '2 min atrás',
    status: 'delivered',
    session: 'Atendimento Principal'
  },
  {
    id: 2,
    contact: 'Maria Santos',
    message: 'Qual o prazo de entrega?',
    time: '5 min atrás',
    status: 'read',
    session: 'Vendas Online'
  },
  {
    id: 3,
    contact: 'Pedro Costa',
    message: 'Preciso de ajuda com o produto',
    time: '10 min atrás',
    status: 'delivered',
    session: 'Suporte Técnico'
  }
]

export default function WhatsAppPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddSession, setShowAddSession] = useState(false)

  const filteredSessions = whatsappSessions.filter(session =>
    session.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.phone.includes(searchTerm)
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800'
      case 'disconnected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Conectado'
      case 'disconnected':
        return 'Desconectado'
      default:
        return 'Conectando'
    }
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
            <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3 text-green-500" />
            WhatsApp
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
            Gerencie suas sessões e automações do WhatsApp
          </p>
        </div>
        <Button onClick={() => setShowAddSession(true)} className="text-sm">
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Nova Sessão</span>
          <span className="sm:hidden">Nova</span>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {automationStats.map((stat) => {
          const IconComponent = stat.icon
          return (
            <Card key={stat.title} className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                      {stat.title}
                    </p>
                    <div className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</div>
                    <p className="text-xs text-gray-500 truncate">
                      {stat.description}
                    </p>
                    <p className="text-xs text-green-600 mt-1 truncate">
                      {stat.trend}
                    </p>
                  </div>
                  <IconComponent className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* WhatsApp Sessions */}
        <Card className="h-fit">
          <CardHeader className="pb-4">
            <CardTitle className="text-base sm:text-lg">Sessões WhatsApp</CardTitle>
            <CardDescription className="text-sm">
              Gerencie suas conexões ativas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar sessões..."
                className="pl-10 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              {filteredSessions.map((session) => (
                <div key={session.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors duration-200 space-y-3 sm:space-y-0">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="bg-green-100 text-green-600 text-xs">
                          <Phone className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">{session.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">{session.phone}</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-2 space-y-1 sm:space-y-0">
                      <span className="text-xs text-gray-500">{session.messagesCount} mensagens</span>
                      <span className="text-xs text-gray-500">{session.lastActivity}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-row sm:flex-col items-center sm:items-end space-x-2 sm:space-x-0 sm:space-y-2">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      getStatusColor(session.status)
                    }`}>
                      {getStatusText(session.status)}
                    </div>
                    
                    <div className="flex space-x-1">
                      {session.status === 'connected' ? (
                        <Button size="sm" variant="outline" className="h-8 px-2">
                          <Pause className="h-3 w-3" />
                          <span className="hidden lg:inline ml-1 text-xs">Pausar</span>
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="h-8 px-2">
                          <Play className="h-3 w-3" />
                          <span className="hidden lg:inline ml-1 text-xs">Conectar</span>
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="h-8 px-2">
                        <Settings className="h-3 w-3" />
                        <span className="hidden lg:inline ml-1 text-xs">Config</span>
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 px-2 text-red-600 hover:text-red-700">
                        <Trash2 className="h-3 w-3" />
                        <span className="hidden lg:inline ml-1 text-xs">Excluir</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredSessions.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma sessão encontrada</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'Tente ajustar sua busca' : 'Crie sua primeira sessão do WhatsApp'}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setShowAddSession(true)} className="mt-4 text-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Sessão
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card className="h-fit">
          <CardHeader className="pb-4">
            <CardTitle className="text-base sm:text-lg">Mensagens Recentes</CardTitle>
            <CardDescription className="text-sm">
              Últimas interações automáticas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMessages.map((message) => (
                <div key={message.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                      {message.contact.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {message.contact}
                      </h4>
                      <span className="text-xs text-gray-500 flex-shrink-0">{message.time}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {message.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500 truncate">{message.session}</span>
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        message.status === 'delivered' ? 'bg-green-400' :
                        message.status === 'read' ? 'bg-blue-400' :
                        'bg-gray-400'
                      }`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Session Modal */}
      {showAddSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-lg">Nova Sessão WhatsApp</CardTitle>
              <CardDescription className="text-sm">
                Configure uma nova conexão WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="session-name" className="text-sm">Nome da Sessão</Label>
                <Input id="session-name" placeholder="Ex: Atendimento Principal" className="text-sm" />
              </div>
              <div>
                <Label htmlFor="phone-number" className="text-sm">Número do Telefone</Label>
                <Input id="phone-number" placeholder="+55 11 99999-9999" className="text-sm" />
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowAddSession(false)} className="text-sm">
                  Cancelar
                </Button>
                <Button className="text-sm">
                  Criar Sessão
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}