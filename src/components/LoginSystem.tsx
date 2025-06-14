
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Edit, Trash2, User, Shield, Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'leader' | 'user';
  photo?: string;
  active: boolean;
  createdAt: string;
}

export const LoginSystem = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Admin Principal',
      email: 'admin@igreja.com',
      role: 'admin',
      active: true,
      createdAt: '2024-01-01'
    },
    {
      id: '2',
      name: 'João Silva',
      email: 'joao@igreja.com',
      role: 'leader',
      photo: '/placeholder.svg',
      active: true,
      createdAt: '2024-02-01'
    },
    {
      id: '3',
      name: 'Maria Santos',
      email: 'maria@igreja.com',
      role: 'leader',
      active: true,
      createdAt: '2024-02-15'
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' as 'admin' | 'leader' | 'user'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      setUsers(users.map(user => 
        user.id === editingUser.id 
          ? { ...user, name: formData.name, email: formData.email, role: formData.role }
          : user
      ));
    } else {
      const newUser: User = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        role: formData.role,
        active: true,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setUsers([...users, newUser]);
    }
    
    setFormData({ name: '', email: '', password: '', role: 'user' });
    setEditingUser(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({ 
      name: user.name, 
      email: user.email, 
      password: '',
      role: user.role 
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setUsers(users.filter(user => user.id !== id));
  };

  const toggleActive = (id: string) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, active: !user.active } : user
    ));
  };

  const getRoleLabel = (role: string) => {
    const roles = {
      admin: 'Administrador',
      leader: 'Líder',
      user: 'Usuário'
    };
    return roles[role as keyof typeof roles];
  };

  const getRoleColor = (role: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      leader: 'bg-blue-100 text-blue-800',
      user: 'bg-gray-100 text-gray-800'
    };
    return colors[role as keyof typeof colors];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
          <p className="text-gray-600">Administre usuários, líderes e permissões</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Digite o nome completo"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Digite o email"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingUser ? "Nova senha (deixe em branco para manter)" : "Digite a senha"}
                    required={!editingUser}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <Label htmlFor="role">Função</Label>
                <Select value={formData.role} onValueChange={(value: 'admin' | 'leader' | 'user') => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="leader">Líder</SelectItem>
                    <SelectItem value="user">Usuário</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                {editingUser ? 'Atualizar' : 'Criar'} Usuário
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <Card key={user.id} className="relative">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={user.photo} />
                  <AvatarFallback>
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={getRoleColor(user.role)}>
                  {user.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                  {user.role === 'leader' && <User className="w-3 h-3 mr-1" />}
                  {getRoleLabel(user.role)}
                </Badge>
                <Badge variant={user.active ? "default" : "secondary"}>
                  {user.active ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              
              <div className="text-sm text-gray-600">
                <p>Criado em: {new Date(user.createdAt).toLocaleDateString('pt-BR')}</p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleActive(user.id)}
                  className="flex-1"
                >
                  {user.active ? 'Desativar' : 'Ativar'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(user)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(user.id)}
                  className="text-red-600 hover:text-red-700"
                  disabled={user.role === 'admin'}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
