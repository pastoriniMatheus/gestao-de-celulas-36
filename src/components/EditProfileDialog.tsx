
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Camera } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from './AuthProvider';

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditProfileDialog = ({ open, onOpenChange }: EditProfileDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { userProfile, user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    photo_url: userProfile?.photo_url || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Usuário não encontrado.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Salvando perfil para usuário:', user.id);
      console.log('Dados do formulário:', formData);
      
      const profileData = {
        user_id: user.id,
        name: formData.name.trim(),
        email: user.email || '',
        photo_url: formData.photo_url || null,
        role: userProfile?.role || 'user',
        active: true
      };

      console.log('Dados a serem salvos:', profileData);

      // Tentar atualizar primeiro
      const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .update({
          name: profileData.name,
          photo_url: profileData.photo_url
        })
        .eq('user_id', user.id)
        .select();

      if (updateError || !updateData || updateData.length === 0) {
        console.log('Perfil não existe, criando novo...', updateError);
        
        // Se não conseguiu atualizar, criar novo
        const { data: insertData, error: insertError } = await supabase
          .from('profiles')
          .insert([profileData])
          .select();

        if (insertError) {
          console.error('Erro ao criar perfil:', insertError);
          throw insertError;
        }
        
        console.log('Perfil criado com sucesso:', insertData);
      } else {
        console.log('Perfil atualizado com sucesso:', updateData);
      }

      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso! Sistema desenvolvido por Matheus Pastorini.",
      });

      onOpenChange(false);
      
      // Recarregar após um pequeno delay
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
    } catch (error: any) {
      console.error('Erro ao salvar perfil:', error);
      toast({
        title: "Erro",
        description: `Erro ao salvar perfil: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive",
      });
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setFormData(prev => ({ ...prev, photo_url: imageUrl }));
      };
      reader.readAsDataURL(file);

      toast({
        title: "Foto carregada",
        description: "Foto carregada com sucesso. Clique em 'Salvar' para confirmar.",
      });
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer upload da foto.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const getUserInitials = () => {
    if (formData.name) {
      return formData.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return 'MP';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Editar Perfil - Sistema Matheus Pastorini</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Foto do Perfil */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={formData.photo_url} alt={formData.name} />
                <AvatarFallback className="text-lg font-semibold bg-blue-100 text-blue-700">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                size="sm"
                className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
                onClick={() => document.getElementById('photo-input')?.click()}
                disabled={uploading}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <input
              id="photo-input"
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <p className="text-xs text-gray-500 text-center">
              Clique no ícone da câmera para alterar a foto
            </p>
          </div>

          {/* Nome */}
          <div>
            <Label htmlFor="name">Nome Completo *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Seu nome completo"
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || uploading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
