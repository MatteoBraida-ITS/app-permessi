import { useEffect } from "react";
import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";

function Layout() {
  const [utente, setUtente] = useState(null);
  const [errore, setErrore] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function caricaUtente() {
      try {
        const response = await fetch("/api/utenti/me", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        const dati = await response.json();

        if (response.ok) {
          setUtente(dati);
        } else {
          if (response.status === 401) {
            localStorage.removeItem("token");
            navigate("/login", { replace: true });
          } else {
            setErrore(dati.errore);
          }
        }
      } catch {
        setErrore("Server non raggiungibile");
      }
    }
    caricaUtente();
  }, [navigate]);

  return (
    <div>
      <header className="flex justify-between items-center border-b px-6 py-3">
        <h1 className="text-lg font-semibold">App permessi</h1>
        <nav className="flex gap-4">
          <Link className="text-sm hover:underline" to="/home">
            Home
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          {utente && (
            <span className="text-sm text-muted-foreground">
              {utente.nome} {utente.cognome}
            </span>
          )}
          <Button
            variant="outline"
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login", { replace: true });
            }}
          >
            Esci
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl p-6">
        {errore && <p className="text-sm text-destructive">{errore}</p>}
        {utente ? <Outlet context={utente} /> : <p>Caricamento...</p>}
      </main>
    </div>
  );
}
export default Layout;
