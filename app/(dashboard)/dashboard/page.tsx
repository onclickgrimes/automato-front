"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Instagram, 
  MessageCircle, 
  Facebook, 
  Clock, 
  Globe, 
  Users, 
  Activity, 
  TrendingUp,
  Plus
} from 'lucide-react'
import Link from 'next/link'

const stats = [
  {
    title: 'Contas Conectadas',
    value: '12',
    description: 'Redes sociais ativas',
    icon: Users,
    trend: '+2 esta semana'
  },
  {
    title: 'Rotinas Ativas',
    value: '8',
    description: 'Automações em execução',
    icon: Activity,
    trend: '+1 hoje'
  },
  {
    title: 'Proxies Configurados',
    value: '5',
    description: 'Proxies disponíveis',
    icon: Globe,
    trend: 'Todos ativos'
  },
  {
    title: 'Taxa de Sucesso',
    value: '94%',
    description: 'Últimas 24 horas',
    icon: TrendingUp,
    trend: '+2% vs ontem'
  }
]

const quickActions = [
  {
    title: 'Instagram',
    description: 'Gerenciar contas do Instagram',
    icon: Instagram,
    href: '/dashboard/instagram',
    color: 'bg-gradient-to-r from-purple-500 to-pink-500'
  },
  {
    title: 'WhatsApp',
    description: 'Automações do WhatsApp',
    icon: MessageCircle,
    href: '/dashboard/whatsapp',
    color: 'bg-gradient-to-r from-green-500 to-green-600'
  },
  {
    title: 'Facebook',
    description: 'Gerenciar páginas do Facebook',
    icon: Facebook,
    href: '/dashboard/facebook',
    color: 'bg-gradient-to-r from-blue-500 to-blue-600'
  },
  {
    title: 'Nova Rotina',
    description: 'Criar nova automação',
    icon: Plus,
    href: '/dashboard/routines/new',
    color: 'bg-gradient-to-r from-gray-500 to-gray-600'
  }
]

const recentActivities = [
  {
    id: 1,
    action: 'Nova conta Instagram conectada',
    time: '2 minutos atrás',
    status: 'success'
  },
  {
    id: 2,
    action: 'Rotina de follow executada',
    time: '15 minutos atrás',
    status: 'success'
  },
  {
    id: 3,
    action: 'Proxy #3 desconectado',
    time: '1 hora atrás',
    status: 'warning'
  },
  {
    id: 4,
    action: 'Backup automático realizado',
    time: '2 horas atrás',
    status: 'success'
  }
]

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Bem-vindo de volta! Aqui está um resumo das suas automações.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => {
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
                <p className="text-xs text-green-600 mt-1 truncate">
                  {stat.trend}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.title} href={action.href}>
                <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                  <CardHeader>
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${action.color} flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-105 transition-transform duration-200`}>
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <CardTitle className="text-base sm:text-lg truncate">{action.title}</CardTitle>
                    <CardDescription className="text-sm line-clamp-2">{action.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Recent Activity and Quick Stats */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center text-base sm:text-lg">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    activity.status === 'success' ? 'bg-green-500' :
                    activity.status === 'warning' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full text-sm">
                Ver Todas as Atividades
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center text-base sm:text-lg">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
              Status do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 truncate">API Backend</span>
                <div className="flex items-center flex-shrink-0 ml-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  <span className="text-sm text-green-600">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 truncate">Banco de Dados</span>
                <div className="flex items-center flex-shrink-0 ml-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  <span className="text-sm text-green-600">Conectado</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 truncate">Proxies</span>
                <div className="flex items-center flex-shrink-0 ml-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2" />
                  <span className="text-sm text-yellow-600">5/6 Ativos</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 truncate">Automações</span>
                <div className="flex items-center flex-shrink-0 ml-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  <span className="text-sm text-green-600">Executando</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}