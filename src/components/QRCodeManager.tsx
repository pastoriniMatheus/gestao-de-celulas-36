
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Eye, 
  EyeOff, 
  Trash2, 
  Copy,
  ExternalLink,
  QrCode
} from 'lucide-react';
import { useQRCodes } from '@/hooks/useQRCodes';
import { CreateQRCodeDialog } from './CreateQRCodeDialog';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export const QRCodeManager = () => {
  const { qrCodes, loading, toggleQRCodeStatus, deleteQRCode } = useQRCodes();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado!",
        description: "URL copiada para a área de transferência"
      });
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const downloadQRCode = async (qrCode: any) => {
    try {
      setDownloadingId(qrCode.id);
      
      // Criar um link para download da imagem
      const link = document.createElement('a');
      link.download = `qr-code-${qrCode.keyword}.png`;
      link.href = qrCode.qr_code_data;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download iniciado",
        description: "QR code baixado com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao baixar QR code:', error);
      toast({
        title: "Erro",
        description: "Erro ao baixar QR code",
        variant: "destructive"
      });
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciamento de QR Codes</h2>
          <p className="text-gray-600">Crie e gerencie QR codes para eventos e campanhas</p>
        </div>
        <CreateQRCodeDialog />
      </div>

      {qrCodes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <QrCode className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum QR Code criado
            </h3>
            <p className="text-gray-500 text-center mb-4">
              Comece criando seu primeiro QR code para eventos ou campanhas
            </p>
            <CreateQRCodeDialog />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {qrCodes.map((qrCode) => (
            <Card key={qrCode.id} className="relative">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{qrCode.title}</CardTitle>
                    <p className="text-sm text-gray-500 break-all">
                      /{qrCode.keyword}
                    </p>
                  </div>
                  <Badge variant={qrCode.active ? "default" : "secondary"}>
                    {qrCode.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* QR Code Image */}
                <div className="flex justify-center">
                  <img 
                    src={qrCode.qr_code_data} 
                    alt={`QR Code para ${qrCode.title}`}
                    className="w-32 h-32 border rounded"
                  />
                </div>

                {/* Stats */}
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {qrCode.scan_count}
                  </div>
                  <div className="text-sm text-gray-500">
                    scan{qrCode.scan_count !== 1 ? 's' : ''}
                  </div>
                </div>

                {/* URL */}
                <div className="p-2 bg-gray-50 rounded text-sm break-all">
                  {qrCode.url}
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(qrCode.url)}
                    className="flex-1"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copiar
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadQRCode(qrCode)}
                    disabled={downloadingId === qrCode.id}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    {downloadingId === qrCode.id ? 'Baixando...' : 'Baixar'}
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleQRCodeStatus(qrCode.id, !qrCode.active)}
                    className="flex-1"
                  >
                    {qrCode.active ? (
                      <><EyeOff className="h-3 w-3 mr-1" /> Desativar</>
                    ) : (
                      <><Eye className="h-3 w-3 mr-1" /> Ativar</>
                    )}
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir o QR code "{qrCode.title}"? 
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => deleteQRCode(qrCode.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
