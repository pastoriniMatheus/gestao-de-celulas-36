# Sistema de Gestão Ministerial

Sistema completo de gestão para igrejas e ministérios, desenvolvido com tecnologias modernas para gerenciamento de contatos, células, eventos e pipeline de discipulado.

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 18** - Biblioteca principal para interfaces
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e servidor de desenvolvimento
- **Tailwind CSS** - Framework CSS utilitário
- **React Router DOM** - Roteamento SPA
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de esquemas
- **TanStack Query** - Cache e sincronização de dados
- **Lucide React** - Biblioteca de ícones
- **Recharts** - Gráficos e visualizações
- **Radix UI** - Componentes acessíveis
- **Sonner** - Sistema de notificações toast

### Backend/Database
- **Supabase** - Backend completo (autenticação, database, storage)
- **PostgreSQL** - Banco de dados relacional
- **Row Level Security (RLS)** - Segurança a nível de linha

### Bibliotecas Complementares
- **QRCode.js** - Geração de códigos QR
- **Date-fns** - Manipulação de datas
- **React Beautiful DnD** - Drag and drop
- **XYFlow/React** - Diagramas e fluxos
- **React Resizable Panels** - Painéis redimensionáveis

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React organizados por funcionalidade
│   ├── ui/             # Componentes base do design system
│   ├── contact-form/   # Formulários de contato
│   ├── genealogy/      # Visualização de rede de discipulado
│   └── kids/          # Gestão do ministério infantil
├── hooks/              # Custom hooks reutilizáveis
├── pages/              # Páginas principais da aplicação
├── lib/                # Utilitários e configurações
├── integrations/       # Integrações externas (Supabase)
└── types/              # Definições de tipos TypeScript
```

## 🔧 Configuração do Ambiente

### Pré-requisitos
- Node.js 18+ 
- NPM ou Yarn
- Conta Supabase configurada

### Instalação
```bash
# Clone o repositório
git clone [URL_DO_REPOSITORIO]

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
```

### Variáveis de Ambiente
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

### Executar em Desenvolvimento
```bash
npm run dev
```

## 🏗️ Funcionalidades Principais

### 1. Gestão de Contatos
- CRUD completo de contatos
- Pipeline de discipulado com etapas customizáveis
- Formulários dinâmicos para captação
- Sistema de notas e acompanhamento
- Filtros avançados e busca

### 2. Gestão de Células
- Criação e gerenciamento de células
- Códigos QR para check-in
- Controle de presença
- Relatórios de frequência
- Hierarquia de liderança

### 3. Sistema de Eventos
- Criação de eventos ministeriais
- Controle de participantes
- Formulários de inscrição
- Relatórios de participação

### 4. Dashboard e Analytics
- Métricas em tempo real
- Gráficos de crescimento
- Análise de conversões
- Relatórios customizáveis

### 5. Gestão de Usuários
- Sistema de autenticação
- Níveis de permissão (Admin/Líder)
- Perfis personalizáveis
- Configurações por usuário

### 6. Ministério Infantil
- Gestão de crianças
- Controle de presenças
- Cronograma de professores
- Material didático

## 🔒 Segurança

O sistema implementa múltiplas camadas de segurança:

- **Autenticação JWT** via Supabase Auth
- **Row Level Security (RLS)** no PostgreSQL
- **Políticas de acesso** por nível de usuário
- **Validação de dados** com Zod
- **Sanitização** de inputs do usuário

## 📊 Performance

- **Code Splitting** automático com Vite
- **Lazy Loading** de componentes
- **Cache inteligente** com TanStack Query
- **Otimização de imagens** automática
- **Bundle size** otimizado

## 🎨 Design System

O projeto utiliza um design system consistente baseado em:

- **Tokens de design** definidos em `index.css`
- **Componentes reutilizáveis** na pasta `ui/`
- **Variantes configuráveis** para cada componente
- **Tema dark/light** automático
- **Responsividade** mobile-first

## 🛠️ Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build
npm run lint         # Verificação de código
npm run type-check   # Verificação de tipos
```

## 📝 Padrões de Código

### Componentes
- Usar TypeScript para todas as props
- Implementar Error Boundaries onde necessário
- Memoizar componentes pesados com React.memo
- Usar custom hooks para lógica reutilizável

### Estado
- TanStack Query para estado servidor
- useState/useReducer para estado local
- Context API apenas quando necessário
- Evitar prop drilling

### Estilização
- Usar apenas tokens do design system
- Evitar CSS inline ou classes customizadas
- Priorizar componentes do design system
- Manter consistência visual

## 🔄 Fluxo de Desenvolvimento

1. **Feature Branches** - Criar branch para cada nova funcionalidade
2. **Commits Semânticos** - Usar convenção de commits
3. **Code Review** - Revisão obrigatória antes do merge
4. **Testes** - Implementar testes para funções críticas
5. **Deploy** - CI/CD automatizado

## 🚀 Deploy

O sistema está configurado para deploy automático:

1. Build otimizado com Vite
2. Assets estáticos servidos via CDN
3. Database gerenciado pelo Supabase
4. Monitoramento em tempo real

## 📞 Suporte

Para questões técnicas ou dúvidas sobre implementação:

1. Verificar documentação dos componentes
2. Consultar logs do Supabase
3. Revisar Error Boundaries implementados
4. Analisar performance via DevTools

## 🔮 Roadmap

- [ ] Implementação de PWA
- [ ] Notificações push
- [ ] Relatórios avançados em PDF
- [ ] Integração com WhatsApp Business
- [ ] API externa para integrações
- [ ] Dashboard móvel nativo

## 📚 Documentação Adicional

- [Supabase Docs](https://supabase.com/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [TanStack Query](https://tanstack.com/query)

---

**Nota**: Este sistema foi desenvolvido com foco na escalabilidade, performance e manutenibilidade. Todas as decisões arquiteturais foram tomadas pensando no crescimento futuro da aplicação.