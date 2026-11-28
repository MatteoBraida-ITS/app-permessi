import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchConToken } from "@/lib/fetchConToken";
import { CircleCheckBig } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

function NuovaRichiesta() {
  const [dataInizio, setDataInizio] = useState("");
  const [dataFine, setDataFine] = useState("");
  const [motivazione, setMotivazione] = useState("");
  const [categoria, setCategoria] = useState(null);
  const [categorie, setCategorie] = useState([]);
  const [errore, setErrore] = useState("");
  const [caricamento, setCaricamento] = useState(false);
  const [successo, setSuccesso] = useState(false);
  const navigate = useNavigate();

  async function gestioneInvio(e) {
    e.preventDefault();
    setErrore("");
    setCaricamento(true);

    try {
      const response = await fetchConToken("/api/richieste", {
        method: "POST",
        body: JSON.stringify({
          data_inizio: dataInizio,
          data_fine: dataFine,
          categoria_id: Number(categoria),
          motivazione,
        }),
      });

      const dati = await response.json();

      if (!response.ok) {
        setErrore(dati.errore);
      } else {
        setSuccesso(true);
      }
    } catch {
      setErrore("Server non raggiungibile");
    } finally {
      setCaricamento(false);
    }
  }

  useEffect(() => {
    async function caricaCategorie() {
      try {
        const response = await fetchConToken("/api/categorie");

        const dati = await response.json();

        if (response.ok) {
          setCategorie(dati);
        } else {
          setErrore(dati.errore);
        }
      } catch {
        setErrore("Server non raggiungibile");
      }
    }
    caricaCategorie();
  }, []);

  const categorieFormattate = categorie.map((cat) => ({
    value: cat.categoria_id,
    label: cat.descrizione,
  }));

  if (successo) {
    function ricomincia() {
      setDataInizio("");
      setDataFine("");
      setMotivazione("");
      setCategoria(null);
      setErrore("");
      setSuccesso(false);
    }

    return (
      <div className="flex justify-center items-center  p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="flex items-center gap-2">
            <CardTitle>Successo</CardTitle>
            <CircleCheckBig className="dark:text-green-400 text-green-600" />
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            Creazione nuova richiesta avvenuta con successo!
            <div className="flex items-center gap-4">
              <Button className="w-fit" onClick={() => navigate("/home")}>
                Torna alla home
              </Button>
              <Button className="w-fit" onClick={ricomincia} variant="outline">
                Nuova richiesta
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Crea una nuova richiesta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={gestioneInvio} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="dataInizio">Data inizio</Label>
              <Input
                value={dataInizio}
                type="date"
                id="dataInizio"
                onChange={(e) => setDataInizio(e.target.value)}
                required
              ></Input>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="dataFine">Data fine</Label>
              <Input
                value={dataFine}
                type="date"
                id="dataFine"
                onChange={(e) => setDataFine(e.target.value)}
                required
                min={dataInizio}
              ></Input>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Select
                items={categorieFormattate}
                value={categoria}
                onValueChange={setCategoria}
                required
              >
                <SelectTrigger className="w-full" id="categoria">
                  <SelectValue placeholder="Scegli una categoria"></SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {categorie.map((cat) => {
                    return (
                      <SelectItem
                        key={cat.categoria_id}
                        value={cat.categoria_id}
                      >
                        {cat.descrizione}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="motivazione">Motivazione</Label>
              <Input
                value={motivazione}
                onChange={(e) => setMotivazione(e.target.value)}
                id="motivazione"
                required
              ></Input>
            </div>
            {errore && <p className="text-sm text-destructive">{errore}</p>}
            <Button type="submit" disabled={caricamento}>
              Crea richiesta
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
export default NuovaRichiesta;
