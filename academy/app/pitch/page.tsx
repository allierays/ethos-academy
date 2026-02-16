import Hero from "../../components/landing/Hero";
import WhatIsEthos from "../../components/landing/WhatIsEthos";
import Moltbook from "../../components/landing/Moltbook";
import LiveGraph from "../../components/landing/LiveGraph";
import PoweredByOpus from "../../components/landing/PoweredByOpus";

export default function PitchPage() {
  return (
    <main className="[&>section]:min-h-screen [&>section]:flex [&>section]:flex-col [&>section]:justify-center">
      <Hero />
      <WhatIsEthos />
      <Moltbook />
      <LiveGraph />
      <PoweredByOpus />
    </main>
  );
}
