import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errore, setErrore] = useState("");
  const [caricamento, setCaricamento] = useState(false);

  async function gestioneInvio(e) {
    e.preventDefault();
    setErrore("");
    setCaricamento(true);

    try {
      const response = await fetch("/api/utenti/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const dati = await response.json();

      if (!response.ok) {
        setErrore(dati.errore);
      } else {
        localStorage.setItem("token", dati.token);
        console.log(dati.utente);
      }
    } catch {
      setErrore("Server non raggiungibile");
    } finally {
      setCaricamento(false);
    }
  }

  return (
    <div className="flex items-center min-h-screen justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="flex justify-center">
          <CardTitle>Accedi</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={gestioneInvio} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                id="email"
                type="email"
              ></Input>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                id="password"
                type="password"
              ></Input>
            </div>
            {errore && <p className="text-sm text-destructive">{errore}</p>}
            <Button type="submit" disabled={caricamento}>
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
export default Login;
