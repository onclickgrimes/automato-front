"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Clock, 
  Plus, 
  Settings, 
  Play, 
  Pause, 
  Trash2, 
  Calendar, 
  Zap,
  CheckCircle,
  XCircle,
  Search,
  Filter
} from 'lucide-react'

const routines = [
  {
    id: 1,
    name: 'Auto Follow Instagram',
    description: 'Seguir usuários automaticamente baseado em hashtags',
    platform: 'Instagram',
    trigger: 'schedule',
    schedule: 'Diário às 09:00',
    status: 'active',
    lastExecution: '2 min atrás',
    nextExecution: 'Amanhã às 09:00',
    executions: 45,
    successRate: 98
  },
  {
    id: 2,
    name: 'WhatsApp Auto Reply',
    description: 'Resposta automática para mensagens recebidas',
    platform: 'WhatsApp',
    trigger: 'event',
    schedule: 'Quando receber mensagem',
    status: 'active',
    lastExecution: '5 min atrás',
    nextExecution: 'Contínuo',
    executions: 234,
    successRate: 95
  },
  {
    id: 3,
    name: 'Facebook Page Posting',
    description: 'Publicar conteúdo automaticamente nas páginas',
    platform: 'Facebook',
    trigger: 'schedule',
    schedule: 'Segunda, Quarta, Sexta às 14:00',
    status: 'paused',
    lastExecution: '2 dias atrás',
    nextExecution: 'Pausado',
    executions: 12,
    successRate: 100
  },
  {
    id: 4,
    name: 'Instagram Story Viewer',
    description: 'Visualizar stories de contas específicas',
    platform: 'Instagram',
    trigger: 'schedule',
    schedule: 'A cada 2 horas',
    status: 'active',
    lastExecution: '1 hora atrás',
    nextExecution: 'Em 1 hora',
    executions: 156,
    successRate: 92
  }
]

const routineStats = [
  {
    title: 'Rotinas Ativas',
    value: '12',
    description: 'Em execução',
    icon: Zap,
    trend: '+2 esta semana'
  },
  {
    title: 'Execuções Hoje',
    value: '847',
    description: 'Total de execuções',
    icon: CheckCircle,
    trend: '+15% vs ontem'
  },
  {
    title: 'Taxa de Sucesso',
    value: '96.2%',
    description: 'Últimas 24h',
    icon: Calendar,
    trend: '+1.2% vs ontem'
  },
  {
    title: 'Próximas Execuções',
    value: '24',
    description: 'Próximas 6 horas',
    icon: Clock,
    trend: '8 em 1 hora'
  }
]

export default function RoutinesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPlatform, setFilterPlatform] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showCreateRoutine, setShowCreateRoutine] = useState(false)

  const filteredRoutines = routines.filter(routine => {
    const matchesSearch = routine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         routine.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPlatform = filterPlatform === 'all' || routine.platform === filterPlatform
    const matchesStatus = filterStatus === 'all' || routine.status === filterStatus
    
    return matchesSearch && matchesPlatform && matchesStatus
  })

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'Instagram':
        return 'bg-pink-100 text-pink-800'
      case 'WhatsApp':
        return 'bg-green-100 text-green-800'
      case 'Facebook':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo'
      case 'paused':
        return 'Pausado'
      case 'error':
        return 'Erro'
      default:
        return 'Desconhecido'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Clock className="h-8 w-8 mr-3 text-blue-500" />
            Rotinas
          </h1>
          <p className="text-gray-600 mt-2">
            Gerencie suas automações e agendamentos
          </p>
        </div>
        <Button onClick={() => setShowCreateRoutine(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Rotina
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {routineStats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="hover:shadow-md transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-gray-400 flex-shrink-0" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-xs text-gray-600 mt-1 truncate">
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

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Suas Rotinas</CardTitle>
          <CardDescription>
            Gerencie todas as suas automações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar rotinas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterPlatform} onValueChange={setFilterPlatform}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Plataforma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as plataformas</SelectItem>
                <SelectItem value="Instagram">Instagram</SelectItem>
                <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                <SelectItem value="Facebook">Facebook</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="paused">Pausado</SelectItem>
                <SelectItem value="error">Erro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Routines List */}
          <div className="space-y-3 sm:space-y-4">
            {filteredRoutines.map((routine) => (
              <div key={routine.id} className="p-4 sm:p-6 border rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between space-y-4 lg:space-y-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{routine.name}</h3>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                        getPlatformColor(routine.platform)
                      }`}>
                        {routine.platform}
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                        getStatusColor(routine.status)
                      }`}>
                        {getStatusText(routine.status)}
                      </div>
                    </div>
                    <p className="text-gray-600 mb-3 text-sm sm:text-base">{routine.description}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 text-sm">
                      <div className="min-w-0">
                        <span className="text-gray-500">Agendamento:</span>
                        <p className="font-medium truncate">{routine.schedule}</p>
                      </div>
                      <div className="min-w-0">
                        <span className="text-gray-500">Última execução:</span>
                        <p className="font-medium truncate">{routine.lastExecution}</p>
                      </div>
                      <div className="min-w-0">
                        <span className="text-gray-500">Próxima execução:</span>
                        <p className="font-medium truncate">{routine.nextExecution}</p>
                      </div>
                      <div className="min-w-0">
                        <span className="text-gray-500">Taxa de sucesso:</span>
                        <p className="font-medium truncate">{routine.successRate}% ({routine.executions} exec.)</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end space-x-2 lg:ml-4 flex-shrink-0">
                    <Button variant="outline" size="sm">
                      {routine.status === 'active' ? (
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
              </div>
            ))}
          </div>

          {filteredRoutines.length === 0 && (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma rotina encontrada
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterPlatform !== 'all' || filterStatus !== 'all' 
                  ? 'Tente ajustar os filtros de busca' 
                  : 'Crie sua primeira rotina de automação'
                }
              </p>
              {!searchTerm && filterPlatform === 'all' && filterStatus === 'all' && (
                <Button onClick={() => setShowCreateRoutine(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Rotina
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Routine Modal */}
      {showCreateRoutine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Nova Rotina</CardTitle>
              <CardDescription>
                Crie uma nova automação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="routineName">Nome da Rotina</Label>
                <Input id="routineName" placeholder="Ex: Auto Follow Instagram" />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Input id="description" placeholder="Descreva o que esta rotina faz" />
              </div>
              <div>
                <Label htmlFor="platform">Plataforma</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a plataforma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="trigger">Tipo de Gatilho</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Como a rotina será executada" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="schedule">Agendamento</SelectItem>
                    <SelectItem value="event">Evento</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateRoutine(false)}>
                  Cancelar
                </Button>
                <Button>
                  Criar Rotina
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}