
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from '@/hooks/use-toast';

export interface QRCode {
  id: string;
  keyword: string;
  title: string;
  url: string;
  qr_code_data: string;
  scan_count: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const useQRCodes = () => {
  const [qrCodes, setQRCodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchQRCodes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('qr_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar QR codes:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar QR codes",
          variant: "destructive"
        });
        return;
      }

      setQRCodes(data || []);
    } catch (error) {
      console.error('Erro crítico ao buscar QR codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const createQRCode = async (keyword: string, title: string) => {
    try {
      // Gerar URL baseada no domínio atual
      const baseUrl = window.location.origin;
      const redirectUrl = `${baseUrl}/qr/${keyword}`;
      
      // Gerar QR code data (será o SVG em base64)
      const QRCode = require('qrcode');
      const qrCodeDataUrl = await QRCode.toDataURL(redirectUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      const { data, error } = await supabase
        .from('qr_codes')
        .insert([{
          keyword,
          title,
          url: redirectUrl,
          qr_code_data: qrCodeDataUrl,
          created_by: user?.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar QR code:', error);
        if (error.code === '23505') {
          toast({
            title: "Erro",
            description: "Esta palavra-chave já existe. Escolha outra.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Erro",
            description: "Erro ao criar QR code",
            variant: "destructive"
          });
        }
        return null;
      }

      toast({
        title: "Sucesso",
        description: "QR code criado com sucesso!"
      });

      await fetchQRCodes();
      return data;
    } catch (error) {
      console.error('Erro crítico ao criar QR code:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao criar QR code",
        variant: "destructive"
      });
      return null;
    }
  };

  const toggleQRCodeStatus = async (id: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from('qr_codes')
        .update({ active })
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar status:', error);
        toast({
          title: "Erro",
          description: "Erro ao atualizar status do QR code",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: `QR code ${active ? 'ativado' : 'desativado'} com sucesso!`
      });

      await fetchQRCodes();
    } catch (error) {
      console.error('Erro crítico ao atualizar status:', error);
    }
  };

  const deleteQRCode = async (id: string) => {
    try {
      const { error } = await supabase
        .from('qr_codes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar QR code:', error);
        toast({
          title: "Erro",
          description: "Erro ao deletar QR code",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "QR code deletado com sucesso!"
      });

      await fetchQRCodes();
    } catch (error) {
      console.error('Erro crítico ao deletar QR code:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchQRCodes();
    }
  }, [user]);

  return {
    qrCodes,
    loading,
    createQRCode,
    toggleQRCodeStatus,
    deleteQRCode,
    refreshQRCodes: fetchQRCodes
  };
};
