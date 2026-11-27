import { fetchConToken } from "@/lib/fetchConToken";
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const coloriStato = {
  "In attesa": "bg-amber-100 text-amber-800",
  Approvato: "bg-green-100 text-green-800",
  Rifiutato: "bg-red-100 text-red-800",
};

function DashboardDipendente() {
  const [richieste, setRichieste] = useState([]);
  const [errore, setErrore] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function caricaRichieste() {
      try {
        const response = await fetchConToken("/api/richieste");

        const dati = await response.json();

        if (response.ok) {
          setRichieste(dati);
        } else {
          setErrore(dati.errore);
        }
      } catch {
        setErrore("Server non raggiungibile");
      }
    }
    caricaRichieste();
  }, []);

  if (errore) {
    return <p className="text-sm text-destructive">{errore}</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Le mie richieste</h2>
        <Button onClick={() => navigate("/richieste/nuova")}>
          Nuova richiesta
        </Button>
      </div>
      {richieste.length === 0 ? (
        <Card>
          <CardContent>
            <p className="text-center text-muted-foreground py-8">
              Nessuna richiesta
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dal</TableHead>
                  <TableHead>Al</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Motivazione</TableHead>
                  <TableHead>Stato</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {richieste.map((r) => (
                  <TableRow key={r.richiesta_id}>
                    <TableCell>{r.data_inizio}</TableCell>
                    <TableCell>{r.data_fine}</TableCell>
                    <TableCell>{r.categoria}</TableCell>
                    <TableCell>{r.motivazione}</TableCell>
                    <TableCell>
                      <Badge className={coloriStato[r.stato]}>{r.stato}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
export default DashboardDipendente;
