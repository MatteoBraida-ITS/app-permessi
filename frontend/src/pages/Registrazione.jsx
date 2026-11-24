import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link, useNavigate } from "react-router";

function Registrazione() {
  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confermaPSW, setConfermaPSW] = useState("");
  const [successo, setSuccesso] = useState(false);
  const [errore, setErrore] = useState("");
  const [caricamento, setCaricamento] = useState(false);
  const navigate = useNavigate();

  async function gestioneInvio(e) {
    e.preventDefault();
    setErrore("");

    if (password.length < 8) {
      setErrore("La password deve essere di almeno 8 caratteri");
      return;
    }

    if (password !== confermaPSW) {
      setErrore("Le password non coincidono");
      return;
    }

    setCaricamento(true);

    try {
      const response = await fetch("/api/utenti/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, cognome, email, password }),
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

  if (successo) {
    return (
      <div className="flex justify-center items-center min-h-screen p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Successo</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            Registrazione avvenuta con successo, vai al login per accedere.
            <Button className="w-fit" onClick={() => navigate("/login")}>
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center min-h-screen justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="flex justify-center">
          <CardTitle>Registrazione</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={gestioneInvio} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                id="nome"
                maxLength={50}
                required
              ></Input>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="cognome">Cognome</Label>
              <Input
                value={cognome}
                onChange={(e) => setCognome(e.target.value)}
                id="cognome"
                maxLength={50}
                required
              ></Input>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                id="email"
                type="email"
                maxLength={100}
                required
              ></Input>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                id="password"
                type="password"
                required
              ></Input>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="confermaPSW">Conferma password</Label>
              <Input
                value={confermaPSW}
                onChange={(e) => setConfermaPSW(e.target.value)}
                id="confermaPSW"
                type="password"
                required
              ></Input>
            </div>
            {errore && <p className="text-sm text-destructive">{errore}</p>}
            <Button type="submit" disabled={caricamento}>
              Registrati
            </Button>
            <Link to="/login" className="hover:underline">
              Sei già registrato? Accedi
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
export default Registrazione;
