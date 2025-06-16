
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MapPin, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { AddCityDialog } from './AddCityDialog';
import { AddNeighborhoodDialog } from './AddNeighborhoodDialog';

interface City {
  id: string;
  name: string;
  state: string;
  active: boolean;
}

interface Neighborhood {
  id: string;
  name: string;
  city_id: string;
  active: boolean;
}

export const LocationManager = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCity, setEditingCity] = useState<string | null>(null);
  const [editingNeighborhood, setEditingNeighborhood] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<any>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [citiesResult, neighborhoodsResult] = await Promise.all([
        supabase.from('cities').select('*').order('name'),
        supabase.from('neighborhoods').select('*').order('name')
      ]);

      if (citiesResult.error) throw citiesResult.error;
      if (neighborhoodsResult.error) throw neighborhoodsResult.error;

      setCities(citiesResult.data || []);
      setNeighborhoods(neighborhoodsResult.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar cidades e bairros",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCity = async (id: string, updates: Partial<City>) => {
    try {
      const { error } = await supabase
        .from('cities')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Cidade atualizada com sucesso!",
      });

      setEditingCity(null);
      setEditValues({});
      loadData();
    } catch (error) {
      console.error('Erro ao atualizar cidade:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar cidade",
        variant: "destructive",
      });
    }
  };

  const updateNeighborhood = async (id: string, updates: Partial<Neighborhood>) => {
    try {
      const { error } = await supabase
        .from('neighborhoods')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Bairro atualizado com sucesso!",
      });

      setEditingNeighborhood(null);
      setEditValues({});
      loadData();
    } catch (error) {
      console.error('Erro ao atualizar bairro:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar bairro",
        variant: "destructive",
      });
    }
  };

  const deleteCity = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta cidade? Isso também excluirá todos os bairros relacionados.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('cities')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Cidade excluída com sucesso!",
      });

      loadData();
    } catch (error) {
      console.error('Erro ao excluir cidade:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir cidade",
        variant: "destructive",
      });
    }
  };

  const deleteNeighborhood = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este bairro?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('neighborhoods')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Bairro excluído com sucesso!",
      });

      loadData();
    } catch (error) {
      console.error('Erro ao excluir bairro:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir bairro",
        variant: "destructive",
      });
    }
  };

  const getCityName = (cityId: string) => {
    const city = cities.find(c => c.id === cityId);
    return city ? `${city.name} - ${city.state}` : 'Cidade não encontrada';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Carregando dados...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cidades */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                Cidades
              </CardTitle>
              <CardDescription>
                Gerencie as cidades do sistema
              </CardDescription>
            </div>
            <AddCityDialog onCityAdded={loadData} />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cities.map((city) => (
                <TableRow key={city.id}>
                  <TableCell>
                    {editingCity === city.id ? (
                      <Input
                        value={editValues.name || city.name}
                        onChange={(e) => setEditValues(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full"
                      />
                    ) : (
                      city.name
                    )}
                  </TableCell>
                  <TableCell>
                    {editingCity === city.id ? (
                      <Input
                        value={editValues.state || city.state}
                        onChange={(e) => setEditValues(prev => ({ ...prev, state: e.target.value.toUpperCase() }))}
                        className="w-20"
                        maxLength={2}
                      />
                    ) : (
                      city.state
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${city.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {city.active ? 'Ativa' : 'Inativa'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {editingCity === city.id ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateCity(city.id, editValues)}
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingCity(null);
                              setEditValues({});
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingCity(city.id);
                              setEditValues({ name: city.name, state: city.state });
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteCity(city.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Bairros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-600" />
                Bairros
              </CardTitle>
              <CardDescription>
                Gerencie os bairros do sistema
              </CardDescription>
            </div>
            <AddNeighborhoodDialog cities={cities} onNeighborhoodAdded={loadData} />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {neighborhoods.map((neighborhood) => (
                <TableRow key={neighborhood.id}>
                  <TableCell>
                    {editingNeighborhood === neighborhood.id ? (
                      <Input
                        value={editValues.name || neighborhood.name}
                        onChange={(e) => setEditValues(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full"
                      />
                    ) : (
                      neighborhood.name
                    )}
                  </TableCell>
                  <TableCell>{getCityName(neighborhood.city_id)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${neighborhood.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {neighborhood.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {editingNeighborhood === neighborhood.id ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateNeighborhood(neighborhood.id, editValues)}
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingNeighborhood(null);
                              setEditValues({});
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingNeighborhood(neighborhood.id);
                              setEditValues({ name: neighborhood.name });
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteNeighborhood(neighborhood.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
