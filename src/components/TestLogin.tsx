
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from './AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { Shield, User } from 'lucide-react';

export const TestLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast({
          title: "Erro no login",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login realizado com sucesso!",
        });
      }
    } catch (error) {
      console.error('Erro no login:', error);
      toast({
        title: "Erro inesperado",
        description: "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loginAsTestUser = (testEmail: string, testPassword: string = '123456') => {
    setEmail(testEmail);
    setPassword(testPassword);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Login do Sistema</CardTitle>
          <CardDescription>
            Entre com suas credenciais para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="space-y-2">
            <p className="text-sm text-gray-600 text-center">Usuários de teste:</p>
            <div className="grid gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loginAsTestUser('admin@sistema.com')}
                className="flex items-center gap-2"
              >
                <Shield className="h-4 w-4 text-red-600" />
                Admin Sistema
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loginAsTestUser('lider@sistema.com')}
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4 text-blue-600" />
                João Silva - Líder
              </Button>
            </div>
            <p className="text-xs text-gray-500 text-center">
              Senha padrão: 123456
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
