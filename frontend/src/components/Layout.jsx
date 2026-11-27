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
      <header className="flex justify-between">
        <h1>App permessi</h1>
        <Link to="/home">Home</Link>
        <div className="flex justify-between">
          {utente && (
            <span>
              {utente.nome} {utente.cognome}
            </span>
          )}
          <Button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login", { replace: true });
            }}
          >
            Esci
          </Button>
        </div>
      </header>
      {errore && <p className="text-sm text-destructive">{errore}</p>}
      <main>
        {utente ? <Outlet context={utente} /> : <p>Caricamento...</p>}
      </main>
    </div>
  );
}
export default Layout;
