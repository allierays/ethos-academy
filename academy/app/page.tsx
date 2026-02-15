import Confrontation from "../components/landing/Confrontation";
import Thesis from "../components/landing/Thesis";
import Evidence from "../components/landing/Evidence";
import LiveGraph from "../components/landing/LiveGraph";
import Invitation from "../components/landing/Invitation";

export default function LandingPage() {
  return (
    <div>
      <Confrontation />
      <Thesis />
      <Evidence />
      <LiveGraph />
      <Invitation />
    </div>
  );
}
