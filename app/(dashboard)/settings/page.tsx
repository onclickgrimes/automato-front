"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Database, 
  Palette, 
  Globe,
  Save,
  Eye,
  EyeOff,
  Key,
  Mail,
  Phone,
  Lock
} from 'lucide-react'

const settingsSections = [
  {
    id: 'profile',
    title: 'Perfil',
    description: 'Gerencie suas informações pessoais',
    icon: User
  },
  {
    id: 'notifications',
    title: 'Notificações',
    description: 'Configure suas preferências de notificação',
    icon: Bell
  },
  {
    id: 'security',
    title: 'Segurança',
    description: 'Configurações de segurança e autenticação',
    icon: Shield
  },
  {
    id: 'integrations',
    title: 'Integrações',
    description: 'APIs e conexões externas',
    icon: Database
  },
  {
    id: 'appearance',
    title: 'Aparência',
    description: 'Tema e personalização da interface',
    icon: Palette
  },
  {
    id: 'general',
    title: 'Geral',
    description: 'Configurações gerais do sistema',
    icon: Settings
  }
]

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)

  const renderProfileSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Informações Pessoais</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fullName" className="text-sm">Nome Completo</Label>
            <Input id="fullName" defaultValue="João Silva" className="text-sm" />
          </div>
          <div>
            <Label htmlFor="email" className="text-sm">Email</Label>
            <Input id="email" type="email" defaultValue="joao@exemplo.com" className="text-sm" />
          </div>
          <div>
            <Label htmlFor="phone" className="text-sm">Telefone</Label>
            <Input id="phone" defaultValue="+55 11 99999-9999" className="text-sm" />
          </div>
          <div>
            <Label htmlFor="company" className="text-sm">Empresa</Label>
            <Input id="company" defaultValue="Minha Empresa" className="text-sm" />
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-4">Avatar</h3>
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xl flex-shrink-0">
            JS
          </div>
          <div className="text-center sm:text-left">
            <Button variant="outline" size="sm">Alterar Avatar</Button>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">JPG, PNG ou GIF. Máximo 2MB.</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Salvar Alterações
        </Button>
      </div>
    </div>
  )

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Notificações por Email</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Automações Concluídas</p>
              <p className="text-sm text-gray-600">Receba notificações quando automações forem concluídas</p>
            </div>
            <Button variant="outline" size="sm">Ativado</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Erros de Sistema</p>
              <p className="text-sm text-gray-600">Notificações sobre erros e falhas no sistema</p>
            </div>
            <Button variant="outline" size="sm">Ativado</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Relatórios Semanais</p>
              <p className="text-sm text-gray-600">Resumo semanal das suas automações</p>
            </div>
            <Button variant="outline" size="sm">Desativado</Button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Notificações Push</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notificações no Navegador</p>
              <p className="text-sm text-gray-600">Receba notificações push no navegador</p>
            </div>
            <Button variant="outline" size="sm">Ativado</Button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Salvar Preferências
        </Button>
      </div>
    </div>
  )

  const renderSecuritySection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Alterar Senha</h3>
        <div className="space-y-4 max-w-md">
          <div>
            <Label htmlFor="currentPassword">Senha Atual</Label>
            <div className="relative">
              <Input 
                id="currentPassword" 
                type={showPassword ? 'text' : 'password'}
                placeholder="Digite sua senha atual"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="newPassword">Nova Senha</Label>
            <Input id="newPassword" type="password" placeholder="Digite sua nova senha" />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
            <Input id="confirmPassword" type="password" placeholder="Confirme sua nova senha" />
          </div>
          <Button>
            <Lock className="h-4 w-4 mr-2" />
            Alterar Senha
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Autenticação de Dois Fatores</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">2FA via SMS</p>
              <p className="text-sm text-gray-600">Receba códigos de verificação por SMS</p>
            </div>
            <Button variant="outline">Configurar</Button>
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">App Autenticador</p>
              <p className="text-sm text-gray-600">Use um app como Google Authenticator</p>
            </div>
            <Button variant="outline">Configurar</Button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Sessões Ativas</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Chrome - Windows</p>
              <p className="text-sm text-gray-600">São Paulo, Brasil • Ativo agora</p>
            </div>
            <Button variant="outline" size="sm">Atual</Button>
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Safari - iPhone</p>
              <p className="text-sm text-gray-600">São Paulo, Brasil • 2 horas atrás</p>
            </div>
            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
              Encerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderIntegrationsSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Chaves de API</h3>
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">Chave de API Principal</p>
              <Button variant="outline" size="sm">Regenerar</Button>
            </div>
            <div className="flex items-center space-x-2">
              <Input 
                value={showApiKey ? 'sk-1234567890abcdef1234567890abcdef' : '••••••••••••••••••••••••••••••••'}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-2">Criada em 15 de Janeiro, 2024</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Webhooks</h3>
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">Webhook de Automações</p>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">Editar</Button>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">Remover</Button>
              </div>
            </div>
            <p className="text-sm text-gray-600 font-mono">https://api.exemplo.com/webhook/automations</p>
            <p className="text-sm text-gray-600 mt-1">Eventos: automação concluída, erro de automação</p>
          </div>
          <Button variant="outline">
            <Globe className="h-4 w-4 mr-2" />
            Adicionar Webhook
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Integrações Externas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">Zapier</p>
              <Button variant="outline" size="sm">Conectar</Button>
            </div>
            <p className="text-sm text-gray-600">Integre com milhares de aplicativos</p>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">Slack</p>
              <Button variant="outline" size="sm">Conectar</Button>
            </div>
            <p className="text-sm text-gray-600">Receba notificações no Slack</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAppearanceSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Tema</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
            <div className="w-full h-20 bg-white border rounded mb-3"></div>
            <p className="font-medium text-center">Claro</p>
          </div>
          <div className="p-4 border-2 border-blue-500 rounded-lg cursor-pointer">
            <div className="w-full h-20 bg-gray-900 rounded mb-3"></div>
            <p className="font-medium text-center">Escuro</p>
          </div>
          <div className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
            <div className="w-full h-20 bg-gradient-to-r from-white to-gray-900 rounded mb-3"></div>
            <p className="font-medium text-center">Sistema</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Cor de Destaque</h3>
        <div className="flex space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full cursor-pointer border-2 border-blue-600"></div>
          <div className="w-8 h-8 bg-green-500 rounded-full cursor-pointer"></div>
          <div className="w-8 h-8 bg-purple-500 rounded-full cursor-pointer"></div>
          <div className="w-8 h-8 bg-red-500 rounded-full cursor-pointer"></div>
          <div className="w-8 h-8 bg-yellow-500 rounded-full cursor-pointer"></div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Densidade da Interface</h3>
        <Select defaultValue="comfortable">
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="compact">Compacta</SelectItem>
            <SelectItem value="comfortable">Confortável</SelectItem>
            <SelectItem value="spacious">Espaçosa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end">
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Salvar Preferências
        </Button>
      </div>
    </div>
  )

  const renderGeneralSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Idioma e Região</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
          <div>
            <Label htmlFor="language">Idioma</Label>
            <Select defaultValue="pt-br">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt-br">Português (Brasil)</SelectItem>
                <SelectItem value="en-us">English (US)</SelectItem>
                <SelectItem value="es-es">Español</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="timezone">Fuso Horário</Label>
            <Select defaultValue="america-sao-paulo">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="america-sao-paulo">América/São_Paulo</SelectItem>
                <SelectItem value="america-new-york">América/New_York</SelectItem>
                <SelectItem value="europe-london">Europa/London</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Configurações de Sistema</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Logs Detalhados</p>
              <p className="text-sm text-gray-600">Ativar logs detalhados para debugging</p>
            </div>
            <Button variant="outline" size="sm">Desativado</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto-backup</p>
              <p className="text-sm text-gray-600">Backup automático das configurações</p>
            </div>
            <Button variant="outline" size="sm">Ativado</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Análise de Uso</p>
              <p className="text-sm text-gray-600">Compartilhar dados de uso para melhorias</p>
            </div>
            <Button variant="outline" size="sm">Ativado</Button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Zona de Perigo</h3>
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <p className="font-medium text-red-800 mb-2">Excluir Conta</p>
          <p className="text-sm text-red-600 mb-4">
            Esta ação é irreversível. Todos os seus dados serão permanentemente removidos.
          </p>
          <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
            Excluir Conta
          </Button>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSection()
      case 'notifications':
        return renderNotificationsSection()
      case 'security':
        return renderSecuritySection()
      case 'integrations':
        return renderIntegrationsSection()
      case 'appearance':
        return renderAppearanceSection()
      case 'general':
        return renderGeneralSection()
      default:
        return renderProfileSection()
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Settings className="h-8 w-8 mr-3 text-blue-500" />
          Configurações
        </h1>
        <p className="text-gray-600 mt-2">
          Gerencie suas preferências e configurações do sistema
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-2">
            {settingsSections.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm sm:text-base truncate">{section.title}</p>
                      <p className="text-xs text-gray-500 truncate">{section.description}</p>
                    </div>
                  </div>
                </button>
              )
            })}}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">
                {settingsSections.find(s => s.id === activeSection)?.title}
              </CardTitle>
              <CardDescription className="text-sm">
                {settingsSections.find(s => s.id === activeSection)?.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderContent()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}