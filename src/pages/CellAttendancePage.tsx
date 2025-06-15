
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "lucide-react";

function getTodayStr() {
  const now = new Date();
  return now.toISOString().split("T")[0]; // yyyy-mm-dd
}

function isTodayCellDay(cell: any) {
  if (!cell) return false;
  const today = new Date();
  return cell.meeting_day === today.getDay();
}

export default function CellAttendancePage() {
  const { cellId } = useParams();
  const [cell, setCell] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<"list" | "confirm" | "done">("list");
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [inputCode, setInputCode] = useState("");
  const [isToday, setIsToday] = useState(false);

  useEffect(() => {
    async function fetchCellAndMembers() {
      setLoading(true);
      // Get cell info
      const { data: cell, error: cellErr } = await supabase
        .from("cells")
        .select("*")
        .eq("id", cellId)
        .maybeSingle();
      if (!cell || cellErr) {
        toast({ title: "Erro", description: "Célula não encontrada", variant: "destructive" });
        setLoading(false);
        return;
      }
      setCell(cell);

      // Get contacts linked to cell
      const { data: members, error: memErr } = await supabase
        .from("contacts")
        .select("id, name, attendance_code, age, whatsapp")
        .eq("cell_id", cellId)
        .order("name");
      if (memErr) {
        toast({ ...memErr, title: "Erro", description: "Erro ao buscar membros da célula", variant: "destructive" });
        setLoading(false);
        return;
      }
      setMembers(members);

      // Verifica se hoje é o dia da célula
      const today = new Date();
      setIsToday(cell.meeting_day === today.getDay());

      setLoading(false);
    }
    fetchCellAndMembers();
  }, [cellId]);

  // Permite marcar presença a qualquer hora do dia da célula
  const handleSelectMember = (member: any) => {
    setSelectedMember(member);
    setStep("confirm");
  };

  async function handleConfirmPresence() {
    if (!selectedMember || !cell) return;

    // Validação: pode confirmar presença apenas no dia da célula
    const today = new Date();
    if (cell.meeting_day !== today.getDay()) {
      toast({
        title: "Fora do dia!",
        description: "Só é possível confirmar presença no dia da célula.",
        variant: "destructive",
      });
      return;
    }
    // Valida código de presença
    if (selectedMember.attendance_code !== inputCode.trim()) {
      toast({ title: "Código incorreto", description: "Verifique seu código e tente novamente!", variant: "destructive" });
      return;
    }

    // Marca presença para hoje
    const attendDate = getTodayStr();
    // Verifica se já existe
    const { data: exists } = await supabase
      .from("attendances")
      .select("id")
      .eq("cell_id", cell.id)
      .eq("contact_id", selectedMember.id)
      .eq("attendance_date", attendDate)
      .maybeSingle();

    if (exists) {
      toast({ title: "Presença já registrada", description: "Sua presença já foi marcada para hoje!", variant: "default" });
      setStep("done");
      return;
    }

    // Registro de presença
    const { error } = await supabase.from("attendances").insert({
      cell_id: cell.id,
      contact_id: selectedMember.id,
      attendance_date: attendDate,
      present: true,
      visitor: false
    });
    if (error) {
      toast({ title: "Erro", description: "Erro ao registrar presença!", variant: "destructive" });
      return;
    }
    toast({ title: "Sucesso!", description: "Presença confirmada!", variant: "success" });
    setStep("done");
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-[40vh]">Carregando...</div>;
  }

  if (!isToday) {
    return (
      <Card className="max-w-md mx-auto mt-10 border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-700">Hoje não é o dia da célula!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-orange-900">A confirmação de presença só é liberada no dia da célula.</p>
        </CardContent>
      </Card>
    );
  }

  if (step === "done") {
    return (
      <Card className="max-w-md mx-auto mt-10 border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800">Presença confirmada!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-900">Sua presença foi registrada com sucesso.</p>
          <Button onClick={() => { setStep("list"); setInputCode(""); setSelectedMember(null);}}>Marcar outra presença</Button>
        </CardContent>
      </Card>
    );
  }

  if (step === "confirm" && selectedMember) {
    return (
      <Card className="max-w-md mx-auto mt-10 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-700">Confirme sua presença</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-2">
            <div className="flex items-center gap-2">
              <User className="text-blue-500" />
              <span className="font-medium">{selectedMember.name}</span>
            </div>
            <Input
              placeholder="Digite seu código"
              value={inputCode}
              type="text"
              maxLength={12}
              onChange={(e) => setInputCode(e.target.value)}
              autoFocus
            />
            <Button className="w-full mt-2" onClick={handleConfirmPresence} disabled={!inputCode}>
              Confirmar presença
            </Button>
            <Button variant="secondary" className="w-full mt-2" onClick={() => { setStep("list"); setInputCode("");}}>
              Voltar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // LIST step
  return (
    <Card className="max-w-lg mx-auto mt-10 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-blue-700">Presença da Célula</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <strong>Escolha seu nome abaixo e marque sua presença:</strong>
        </div>
        <div className="flex flex-col gap-3">
          {members.length === 0 && (
            <div className="text-gray-600 text-center">Nenhum membro vinculado a esta célula.</div>
          )}
          {members.map((member) => (
            <Button
              key={member.id}
              variant="outline"
              onClick={() => handleSelectMember(member)}
              className="justify-between"
            >
              <span>{member.name}</span>
              <Badge variant="secondary">Marcar presença</Badge>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
