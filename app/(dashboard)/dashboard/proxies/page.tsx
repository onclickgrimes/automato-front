"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Globe, 
  Plus, 
  Settings, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock,
  Zap,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react'

const proxies = [
  {
    id: 1,
    name: 'Proxy US East 1',
    host: '192.168.1.100',
    port: 8080,
    username: 'user1',
    country: 'Estados Unidos',
    city: 'Nova York',
    type: 'HTTP',
    status: 'active',
    lastCheck: '2 min atrás',
    responseTime: 145,
    uptime: 99.8,
    usedBy: ['Instagram Bot 1', 'Facebook Auto']
  },
  {
    id: 2,
    name: 'Proxy BR São Paulo',
    host: '201.45.123.89',
    port: 3128,
    username: 'user2',
    country: 'Brasil',
    city: 'São Paulo',
    type: 'HTTPS',
    status: 'active',
    lastCheck: '1 min atrás',
    responseTime: 89,
    uptime: 100,
    usedBy: ['WhatsApp Bot', 'Instagram Bot 2']
  },
  {
    id: 3,
    name: 'Proxy EU London',
    host: '185.234.56.78',
    port: 8888,
    username: 'user3',
    country: 'Reino Unido',
    city: 'Londres',
    type: 'SOCKS5',
    status: 'error',
    lastCheck: '5 min atrás',
    responseTime: 0,
    uptime: 87.5,
    usedBy: []
  },
  {
    id: 4,
    name: 'Proxy CA Toronto',
    host: '142.93.45.123',
    port: 1080,
    username: 'user4',
    country: 'Canadá',
    city: 'Toronto',
    type: 'SOCKS5',
    status: 'inactive',
    lastCheck: '1 hora atrás',
    responseTime: 234,
    uptime: 95.2,
    usedBy: []
  }
]

const proxyStats = [
  {
    title: 'Proxies Ativos',
    value: '8',
    description: 'De 12 total',
    icon: CheckCircle,
    trend: '2 offline'
  },
  {
    title: 'Tempo Médio',
    value: '156ms',
    description: 'Resposta média',
    icon: Clock,
    trend: '-12ms vs ontem'
  },
  {
    title: 'Uptime Médio',
    value: '98.2%',
    description: 'Últimos 30 dias',
    icon: Zap,
    trend: '+0.5% vs mês anterior'
  },
  {
    title: 'Tráfego Total',
    value: '2.4GB',
    description: 'Últimas 24h',
    icon: Globe,
    trend: '+15% vs ontem'
  }
]

export default function ProxiesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [showAddProxy, setShowAddProxy] = useState(false)

  const filteredProxies = proxies.filter(proxy => {
    const matchesSearch = proxy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proxy.host.includes(searchTerm) ||
                         proxy.country.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || proxy.status === filterStatus
    const matchesType = filterType === 'all' || proxy.type === filterType
    
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
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
      case 'inactive':
        return 'Inativo'
      case 'error':
        return 'Erro'
      default:
        return 'Desconhecido'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'inactive':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Globe className="h-4 w-4 text-gray-600" />
    }
  }

  const getResponseTimeColor = (time: number) => {
    if (time === 0) return 'text-red-600'
    if (time < 100) return 'text-green-600'
    if (time < 200) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
            <Globe className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3 text-blue-500" />
            Proxies
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
            Gerencie seus proxies para automações
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="text-sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Testar Todos</span>
            <span className="sm:hidden">Testar</span>
          </Button>
          <Button onClick={() => setShowAddProxy(true)} className="text-sm">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Adicionar Proxy</span>
            <span className="sm:hidden">Adicionar</span>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {proxyStats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-gray-400 flex-shrink-0" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{stat.value}</div>
                <p className="text-xs text-gray-600 mt-1 truncate">
                  {stat.description}
                </p>
                <p className="text-xs text-green-600 mt-1 truncate">
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
          <CardTitle className="text-lg sm:text-xl">Seus Proxies</CardTitle>
          <CardDescription className="text-sm">
            Gerencie todos os seus proxies configurados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar proxies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm sm:text-base"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48 text-sm sm:text-base">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
                <SelectItem value="error">Erro</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48 text-sm sm:text-base">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="HTTP">HTTP</SelectItem>
                <SelectItem value="HTTPS">HTTPS</SelectItem>
                <SelectItem value="SOCKS5">SOCKS5</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Proxies List */}
          <div className="space-y-4">
            {filteredProxies.map((proxy) => (
              <div key={proxy.id} className="p-4 sm:p-6 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(proxy.status)}
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{proxy.name}</h3>
                      </div>
                      <div className="flex gap-2">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                          getStatusColor(proxy.status)
                        }`}>
                          {getStatusText(proxy.status)}
                        </div>
                        <div className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full flex-shrink-0">
                          {proxy.type}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm mb-3">
                      <div className="min-w-0">
                        <span className="text-gray-500 block">Endereço:</span>
                        <p className="font-medium font-mono text-xs sm:text-sm truncate">{proxy.host}:{proxy.port}</p>
                      </div>
                      <div className="min-w-0">
                        <span className="text-gray-500 block">Localização:</span>
                        <p className="font-medium truncate">{proxy.city}, {proxy.country}</p>
                      </div>
                      <div className="min-w-0">
                        <span className="text-gray-500 block">Tempo de resposta:</span>
                        <p className={`font-medium ${getResponseTimeColor(proxy.responseTime)}`}>
                          {proxy.responseTime > 0 ? `${proxy.responseTime}ms` : 'N/A'}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <span className="text-gray-500 block">Uptime:</span>
                        <p className="font-medium">{proxy.uptime}%</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                      <span className="truncate">Última verificação: {proxy.lastCheck}</span>
                      {proxy.usedBy.length > 0 && (
                        <span className="truncate">Usado por: {proxy.usedBy.join(', ')}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-row lg:flex-col gap-2 lg:ml-4 flex-shrink-0">
                    <Button variant="outline" size="sm" className="flex-1 lg:flex-none">
                      <RefreshCw className="h-4 w-4" />
                      <span className="ml-2 sm:hidden lg:inline">Testar</span>
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 lg:flex-none">
                      <Settings className="h-4 w-4" />
                      <span className="ml-2 sm:hidden lg:inline">Config</span>
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 flex-1 lg:flex-none">
                      <Trash2 className="h-4 w-4" />
                      <span className="ml-2 sm:hidden lg:inline">Excluir</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProxies.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <Globe className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                Nenhum proxy encontrado
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 px-4">
                {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                  ? 'Tente ajustar os filtros de busca'
                  : 'Adicione seu primeiro proxy'
                }
              </p>
              {!searchTerm && filterStatus === 'all' && filterType === 'all' && (
                <Button onClick={() => setShowAddProxy(true)} className="text-sm sm:text-base">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Proxy
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Proxy Modal */}
      {showAddProxy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Adicionar Proxy</CardTitle>
              <CardDescription>
                Configure um novo proxy para suas automações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="proxyName">Nome do Proxy</Label>
                <Input id="proxyName" placeholder="Ex: Proxy US East 1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="host">Host/IP</Label>
                  <Input id="host" placeholder="192.168.1.100" />
                </div>
                <div>
                  <Label htmlFor="port">Porta</Label>
                  <Input id="port" placeholder="8080" type="number" />
                </div>
              </div>
              <div>
                <Label htmlFor="type">Tipo de Proxy</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="http">HTTP</SelectItem>
                    <SelectItem value="https">HTTPS</SelectItem>
                    <SelectItem value="socks5">SOCKS5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Usuário</Label>
                  <Input id="username" placeholder="username" />
                </div>
                <div>
                  <Label htmlFor="password">Senha</Label>
                  <Input id="password" placeholder="password" type="password" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country">País</Label>
                  <Input id="country" placeholder="Brasil" />
                </div>
                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Input id="city" placeholder="São Paulo" />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddProxy(false)}>
                  Cancelar
                </Button>
                <Button>
                  Adicionar Proxy
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}