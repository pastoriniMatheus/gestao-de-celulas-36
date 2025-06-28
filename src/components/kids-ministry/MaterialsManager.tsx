
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Download, FolderOpen } from 'lucide-react';
import { useMaterials, Material } from '@/hooks/useMaterials';

const CATEGORY_OPTIONS = ['Kids', 'Jovens'];

export const MaterialsManager = () => {
  const { materials, loading, addMaterial, updateMaterial, deleteMaterial } = useMaterials();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState({
    file_name: '',
    category: '',
    file_url: '',
    file_type: ''
  });

  const resetForm = () => {
    setFormData({
      file_name: '',
      category: '',
      file_url: '',
      file_type: ''
    });
    setEditingMaterial(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingMaterial) {
      await updateMaterial(editingMaterial.id, formData);
    } else {
      await addMaterial(formData);
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setFormData({
      file_name: material.file_name,
      category: material.category,
      file_url: material.file_url,
      file_type: material.file_type || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este material?')) {
      await deleteMaterial(id);
    }
  };

  const handleDownload = (material: Material) => {
    window.open(material.file_url, '_blank');
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-2">Carregando...</span>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-6 w-6 text-amber-600" />
          <h2 className="text-2xl font-bold">Materiais</h2>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Anexar Material
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingMaterial ? 'Editar Material' : 'Anexar Material'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="file_name">Nome do Arquivo *</Label>
                <Input
                  id="file_name"
                  value={formData.file_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, file_name: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Categoria *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="file_url">URL do Arquivo *</Label>
                <Input
                  id="file_url"
                  type="url"
                  value={formData.file_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, file_url: e.target.value }))}
                  placeholder="https://..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="file_type">Tipo do Arquivo</Label>
                <Input
                  id="file_type"
                  value={formData.file_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, file_type: e.target.value }))}
                  placeholder="PDF, Imagem, etc."
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingMaterial ? 'Atualizar' : 'Adicionar'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Materiais Disponíveis ({materials.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Arquivo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.map((material) => (
                <TableRow key={material.id}>
                  <TableCell className="font-medium">{material.file_name}</TableCell>
                  <TableCell>{material.category}</TableCell>
                  <TableCell>{material.file_type || 'Não informado'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(material)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(material)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(material.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {materials.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                    Nenhum material cadastrado ainda
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
