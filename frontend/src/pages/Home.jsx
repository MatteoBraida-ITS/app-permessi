import { useOutletContext } from "react-router";
import DashboardResponsabile from "@/components/DashboardResponsabile";
import DashboardDipendente from "@/components/DashboardDipendente";

function Home() {
  const utente = useOutletContext();

  if (utente.ruolo === "Responsabile") {
    return <DashboardResponsabile />;
  } else {
    return <DashboardDipendente />;
  }
}
export default Home;
