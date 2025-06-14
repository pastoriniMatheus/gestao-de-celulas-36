
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from './AuthProvider';
import { useToast } from '@/hooks/use-toast';

export const TestLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast({
          title: "Erro no login",
          description: error.message || "Credenciais inválidas",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Sucesso",
          description: "Login realizado com sucesso!"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao fazer login",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loginAsAdmin = () => {
    setEmail('admin@sistema.com');
    setPassword('123456');
  };

  const loginAsLeader = () => {
    setEmail('joao@lider.com');
    setPassword('123456');
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Login de Teste</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <div className="space-y-2">
          <p className="text-sm text-gray-600 text-center">Contas de teste:</p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loginAsAdmin}
              className="flex-1"
            >
              Admin
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loginAsLeader}
              className="flex-1"
            >
              Líder
            </Button>
          </div>
          <p className="text-xs text-gray-500 text-center">
            Todos usam senha: 123456
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
