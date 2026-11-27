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

function DashboardDipendente() {
  const [richieste, setRichieste] = useState([]);
  const [errore, setErrore] = useState("");

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

  if (richieste.length === 0) {
    return <p>Nessuna Richiesta</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Le mie richieste</h2>
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
              <TableCell>{r.stato}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
export default DashboardDipendente;
