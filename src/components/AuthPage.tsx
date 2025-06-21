
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { useSystemConfig } from '@/hooks/useSystemConfig';

export const AuthPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signUpData, setSignUpData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const { config, loading: configLoading } = useSystemConfig();

  const displayTitle = config.church_name?.text || config.form_title?.text || 'Sistema de Células';
  const logoUrl = config.site_logo?.url;
  const logoAlt = config.site_logo?.alt || 'Logo';

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await signIn(loginData.email, loginData.password);
      if (error) {
        toast({
          title: "Erro ao entrar",
          description: error.message === 'Invalid login credentials' ? "Email ou senha incorretos" : error.message,
          variant: "destructive"
        });
      }
    } catch {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (signUpData.password !== signUpData.confirmPassword) {
      toast({ title: "Erro", description: "As senhas não coincidem", variant: "destructive" });
      return;
    }
    if (signUpData.password.length < 6) {
      toast({ title: "Erro", description: "A senha deve ter pelo menos 6 caracteres", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await signUp(signUpData.email, signUpData.password, signUpData.name);
      if (error) {
        toast({
          title: "Erro ao criar conta",
          description: error.message === 'User already registered' ? "Este email já está cadastrado" : error.message,
          variant: "destructive"
        });
      } else {
        toast({ title: "Conta criada com sucesso!", description: "Você já pode acessar o sistema." });
      }
    } catch {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (configLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gray-800 rounded-xl animate-pulse"></div>
              <div>
                <div className="w-48 h-10 bg-gray-800 rounded animate-pulse mb-3"></div>
                <div className="w-40 h-6 bg-gray-800 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 via-black to-gray-900/50"></div>
      <div style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.03) 0%, transparent 50%)' }} className="absolute inset-0 bg-gray-900"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo + Título */}
        <div className="text-center mb-10 flex flex-col items-center justify-center gap-4" style={{ animation: 'fadeIn 1s ease-out forwards' }}>
          {logoUrl ? (
            <img src={logoUrl} alt={logoAlt} className="w-28 h-28 object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.25)] transition-transform duration-300 hover:scale-105" style={{ filter: 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.3))' }} />
          ) : (
            <img src="/assets/default-logo.png" alt="Logo padrão" className="w-28 h-28 object-contain opacity-80" />
          )}
          <h1 className="text-4xl font-light text-white" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.8)' }}>{displayTitle}</h1>
          <p className="text-gray-300 text-base max-w-sm">Entre com sua conta ou crie uma nova para começar</p>
          <style>{`
            @keyframes fadeIn {
              0% { opacity: 0; transform: translateY(-10px); }
              100% { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>

        {/* Card */}
        <Card className="shadow-2xl border-0 bg-white/5 backdrop-blur-md border border-white/10">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl text-white font-light">Acesso ao Sistema</CardTitle>
            <CardDescription className="text-gray-300 text-base">Entre com sua conta ou crie uma nova para começar</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/5 border border-white/10">
                <TabsTrigger value="login" className="data-[state=active]:bg-white data-[state=active]:text-black text-white border-0">Entrar</TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-white data-[state=active]:text-black text-white border-0">Criar Conta</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <Label htmlFor="login-email" className="text-white text-base">Email</Label>
                    <Input id="login-email" type="email" value={loginData.email} onChange={e => setLoginData(prev => ({ ...prev, email: e.target.value }))} placeholder="seu@email.com" className="h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-white/40 focus:bg-white/10 transition-all" required />
                  </div>
                  <div>
                    <Label htmlFor="login-password" className="text-white text-base">Senha</Label>
                    <div className="relative">
                      <Input id="login-password" type={showPassword ? "text" : "password"} value={loginData.password} onChange={e => setLoginData(prev => ({ ...prev, password: e.target.value }))} placeholder="Sua senha" className="h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-white/40 focus:bg-white/10 transition-all pr-12" required />
                      <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-4 py-2 hover:bg-transparent text-gray-400 hover:text-white" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12 bg-white text-black hover:bg-gray-100 font-semibold text-base transition-all duration-200" disabled={loading}>
                    {loading ? 'Entrando...' : 'Entrar'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-6">
                  <div>
                    <Label htmlFor="signup-name" className="text-white text-base">Nome Completo</Label>
                    <Input id="signup-name" value={signUpData.name} onChange={e => setSignUpData(prev => ({ ...prev, name: e.target.value }))} placeholder="Seu nome completo" className="h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-white/40 focus:bg-white/10 transition-all" required />
                  </div>
                  <div>
                    <Label htmlFor="signup-email" className="text-white text-base">Email</Label>
                    <Input id="signup-email" type="email" value={signUpData.email} onChange={e => setSignUpData(prev => ({ ...prev, email: e.target.value }))} placeholder="seu@email.com" className="h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-white/40 focus:bg-white/10 transition-all" required />
                  </div>
                  <div>
                    <Label htmlFor="signup-password" className="text-white text-base">Senha</Label>
                    <div className="relative">
                      <Input id="signup-password" type={showPassword ? "text" : "password"} value={signUpData.password} onChange={e => setSignUpData(prev => ({ ...prev, password: e.target.value }))} placeholder="Mínimo 6 caracteres" className="h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-white/40 focus:bg-white/10 transition-all pr-12" required />
                      <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-4 py-2 hover:bg-transparent text-gray-400 hover:text-white" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="signup-confirm-password" className="text-white text-base">Confirmar Senha</Label>
                    <Input id="signup-confirm-password" type="password" value={signUpData.confirmPassword} onChange={e => setSignUpData(prev => ({ ...prev, confirmPassword: e.target.value }))} placeholder="Confirme sua senha" className="h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-white/40 focus:bg-white/10 transition-all" required />
                  </div>
                  <Button type="submit" className="w-full h-12 bg-white text-black hover:bg-gray-100 font-semibold text-base transition-all duration-200" disabled={loading}>
                    {loading ? 'Criando conta...' : 'Criar Conta'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} {config.church_name?.text || displayTitle}. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
};
"""

file_path = "/mnt/data/AuthPage.tsx"
with open(file_path, "w", encoding="utf-8") as f:
    f.write(code)

file_path
