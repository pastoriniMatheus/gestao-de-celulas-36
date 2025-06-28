
-- Tabela para cadastro de crianças
CREATE TABLE public.children (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  class TEXT NOT NULL CHECK (class IN ('Berçário', 'Jardim', 'Pré-Adolescentes', 'Adolescentes')),
  type TEXT NOT NULL CHECK (type IN ('Membro', 'Visitante')),
  parent_contact_id UUID REFERENCES public.contacts(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para lições
CREATE TABLE public.lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Kids', 'Jovens')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para escala de professoras
CREATE TABLE public.teacher_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  worship_date DATE NOT NULL,
  class TEXT NOT NULL CHECK (class IN ('Berçário', 'Jardim', 'Pré-Adolescentes', 'Adolescentes')),
  teacher_1 TEXT,
  teacher_2 TEXT,
  lesson_id UUID REFERENCES public.lessons(id),
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para registro de aulas
CREATE TABLE public.class_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  worship_date DATE NOT NULL,
  class TEXT NOT NULL CHECK (class IN ('Berçário', 'Jardim', 'Pré-Adolescentes', 'Adolescentes')),
  teacher_1 TEXT,
  teacher_2 TEXT,
  lesson_id UUID REFERENCES public.lessons(id),
  total_members INTEGER DEFAULT 0,
  total_visitors INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para presença de crianças
CREATE TABLE public.child_attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_record_id UUID REFERENCES public.class_records(id) ON DELETE CASCADE,
  child_id UUID REFERENCES public.children(id),
  present BOOLEAN NOT NULL DEFAULT false,
  type TEXT NOT NULL CHECK (type IN ('Membro', 'Visitante')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para notificações das crianças
CREATE TABLE public.child_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES public.children(id),
  message TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para materiais
CREATE TABLE public.materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Kids', 'Jovens')),
  file_url TEXT NOT NULL,
  file_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para melhor performance
CREATE INDEX idx_children_class ON public.children(class);
CREATE INDEX idx_children_parent ON public.children(parent_contact_id);
CREATE INDEX idx_teacher_schedules_date ON public.teacher_schedules(worship_date);
CREATE INDEX idx_class_records_date ON public.class_records(worship_date);
CREATE INDEX idx_child_attendance_record ON public.child_attendance(class_record_id);
CREATE INDEX idx_child_notifications_child ON public.child_notifications(child_id);

-- Triggers para atualizar updated_at
CREATE TRIGGER update_children_updated_at BEFORE UPDATE ON public.children FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_teacher_schedules_updated_at BEFORE UPDATE ON public.teacher_schedules FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_class_records_updated_at BEFORE UPDATE ON public.class_records FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON public.materials FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
