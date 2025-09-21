# AI Rules - Sistema de Gestão Ministerial

## Tech Stack

- **Frontend**: React 18 com TypeScript
- **Build Tool**: Vite
- **CSS Framework**: Tailwind CSS com design system customizado
- **Roteamento**: React Router DOM - MANTER rotas em src/App.tsx
- **Formulários**: React Hook Form com Zod para validação
- **Estado Global**: TanStack Query para cache e sincronização de dados
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **UI Components**: shadcn/ui com Radix UI
- **Ícones**: Lucide React
- **Gráficos**: Recharts
- **Notificações**: Sonner (toast system)

## Estrutura do Projeto

```
src/
├── components/           # Componentes React organizados por funcionalidade
│   ├── ui/              # Componentes base do design system (NÃO EDITAR)
│   ├── contact-form/    # Formulários de contato
│   ├── genealogy/       # Visualização de rede de discipulado
│   └── kids/           # Gestão do ministério infantil
├── hooks/              # Custom hooks reutilizáveis
├── pages/              # Páginas principais da aplicação
├── lib/                # Utilitários e configurações
├── integrations/       # Integrações externas (Supabase)
└── types/              # Definições de tipos TypeScript
```

## Diretrizes de Desenvolvimento

### 1. Páginas e Componentes
- **SEMPRE** colocar código fonte na pasta `src/`
- **SEMPRE** colocar páginas em `src/pages/`
- **SEMPRE** colocar componentes em `src/components/`
- A página principal é `src/pages/Index.tsx`
- **SEMPRE** atualizar a página principal para incluir novos componentes
- **NUNCA** editar componentes shadcn/ui diretamente - criar novos componentes se necessário

### 2. Styling e Design System
- **SEMPRE** usar Tailwind CSS para estilização
- **NUNCA** usar cores diretas como `text-white`, `bg-black`, etc.
- **SEMPRE** usar tokens semânticos do design system definidos em `index.css` e `tailwind.config.ts`
- **OBRIGATÓRIO**: Todas as cores devem ser HSL
- Usar variantes dos componentes shadcn/ui para casos especiais
- Manter consistência visual em toda aplicação

### 3. Padrões de Código
- **TypeScript obrigatório** para todas as props e funções
- Usar React Hook Form + Zod para formulários
- Implementar Error Boundaries onde necessário
- Memoizar componentes pesados com React.memo
- Usar custom hooks para lógica reutilizável
- TanStack Query para estado servidor
- useState/useReducer para estado local
- Context API apenas quando estritamente necessário

### 4. Funcionalidades Principais do Sistema

#### 4.1 Gestão de Contatos
- CRUD completo de contatos
- Pipeline de discipulado customizável
- Formulários dinâmicos para captação
- Sistema de notas e acompanhamento
- Filtros avançados e busca

#### 4.2 Gestão de Células
- Criação e gerenciamento de células
- Códigos QR para check-in
- Controle de presença
- Relatórios de frequência
- Hierarquia de liderança

#### 4.3 Sistema de Eventos
- Criação de eventos ministeriais
- Controle de participantes
- Formulários de inscrição
- Relatórios de participação

#### 4.4 Dashboard e Analytics
- Métricas em tempo real
- Gráficos de crescimento
- Análise de conversões
- Relatórios customizáveis

#### 4.5 Ministério Infantil
- Gestão de crianças
- Controle de presenças
- Cronograma de professores
- Material didático

### 5. Supabase - Backend e Banco de Dados

#### 5.1 Autenticação
- Sistema de autenticação JWT via Supabase Auth
- Níveis de permissão: Admin/Líder
- Row Level Security (RLS) implementado
- Profiles table para dados adicionais do usuário

#### 5.2 Banco de Dados
- **SEMPRE** usar migrações para mudanças no banco
- **OBRIGATÓRIO**: Implementar RLS em todas as tabelas
- **NUNCA** fazer referência direta à tabela auth.users
- Usar tabela profiles para dados do usuário
- Validação com triggers em vez de CHECK constraints
- Timestamps automáticos (created_at, updated_at)

#### 5.3 Storage
- Bucket 'photos' para upload de imagens
- Políticas de acesso baseadas em usuário
- Otimização automática de imagens

#### 5.4 Edge Functions
- Função track-qr-scan para rastreamento
- Lógica de negócio no backend
- Integração com APIs externas

### 6. Segurança

#### 6.1 Políticas RLS Obrigatórias
```sql
-- Exemplo de política padrão
CREATE POLICY "Users can view their own data" 
ON table_name 
FOR SELECT 
USING (auth.uid() = user_id);
```

#### 6.2 Validação
- Zod para validação frontend
- Triggers para validação backend
- Sanitização de inputs
- Políticas de acesso granulares

### 7. Performance

#### 7.1 Otimizações
- Code Splitting automático com Vite
- Lazy Loading de componentes
- Cache inteligente com TanStack Query
- Bundle size otimizado
- Memoização de componentes pesados

#### 7.2 Monitoramento
- Error Boundaries implementados
- Logs estruturados
- Métricas de performance
- Análise de bundle

### 8. Funcionalidades Específicas

#### 8.1 Pipeline de Discipulado
- Estágios customizáveis
- Drag and drop entre estágios
- Filtros por líder e região
- Métricas de conversão

#### 8.2 Sistema de QR Codes
- Geração automática para células
- Rastreamento de scans
- Integração com eventos
- Analytics de uso

#### 8.3 Genealogia de Discípulos
- Visualização em rede
- Hierarquia de liderança
- Métricas por nível
- Análise de multiplicação

#### 8.4 Notificações
- Sistema de aniversários
- Webhooks configuráveis
- Notificações em tempo real
- Templates de mensagem

### 9. Padrões de Nomenclatura

#### 9.1 Arquivos
- PascalCase para componentes: `ContactForm.tsx`
- camelCase para hooks: `useContacts.ts`
- kebab-case para páginas: `contact-form.tsx`

#### 9.2 Banco de Dados
- snake_case para tabelas e colunas
- Plural para nomes de tabelas
- Prefixos descritivos para funções

### 10. Deploy e CI/CD

#### 10.1 Build
- Build otimizado com Vite
- Assets estáticos via CDN
- Environment variables seguras
- Validação de tipos

#### 10.2 Monitoramento
- Logs do Supabase
- Error tracking
- Performance monitoring
- Analytics de uso

### 11. Extensibilidade

#### 11.1 Modularidade
- Componentes focados e reutilizáveis
- Hooks personalizados
- Serviços isolados
- Configurações centralizadas

#### 11.2 Integrações
- WhatsApp Business API
- Sistema de webhooks
- APIs externas
- Plugins customizados

## Comandos Importantes

```bash
npm run dev          # Desenvolvimento
npm run build        # Build produção
npm run preview      # Preview do build
npm run lint         # Verificação código
npm run type-check   # Verificação tipos
```

## Diretrizes Críticas

1. **NUNCA** usar variáveis de ambiente VITE_* (não suportado)
2. **SEMPRE** implementar RLS antes de funcionalidades
3. **OBRIGATÓRIO** usar design system para cores
4. **SEMPRE** validar dados com Zod
5. **NUNCA** fazer queries diretas sem cache
6. **SEMPRE** implementar Error Boundaries
7. **OBRIGATÓRIO** usar TypeScript em tudo
8. **SEMPRE** considerar performance e acessibilidade

## Exemplos de Código

### Componente Padrão
```tsx
import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { useContacts } from '@/hooks/useContacts';

interface ContactCardProps {
  contactId: string;
}

export const ContactCard = memo(({ contactId }: ContactCardProps) => {
  const { data: contact, isLoading } = useContacts();
  
  if (isLoading) return <div>Carregando...</div>;
  
  return (
    <div className="bg-card border rounded-lg p-4">
      <h3 className="text-card-foreground font-semibold">{contact?.name}</h3>
      <Button variant="outline">Editar</Button>
    </div>
  );
});
```

### Hook Customizado
```tsx
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useContacts = () => {
  return useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};
```

### Migração Supabase
```sql
-- Criar tabela com RLS
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Criar políticas
CREATE POLICY "Users can view their own contacts" 
ON public.contacts 
FOR SELECT 
USING (auth.uid() = user_id);

-- Trigger para timestamps
CREATE TRIGGER update_contacts_updated_at
BEFORE UPDATE ON public.contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
```

---

**Nota**: Este documento deve ser seguido rigorosamente para manter a consistência, segurança e performance do sistema. Qualquer desvio deve ser justificado e documentado.