import PitchHero from "../../components/landing/PitchHero";
import WhatIsEthos from "../../components/landing/WhatIsEthos";
import RubricFoundations from "../../components/landing/RubricFoundations";
import EvaluationPipeline from "../../components/landing/EvaluationPipeline";
import Moltbook from "../../components/landing/Moltbook";
import LiveGraph from "../../components/landing/LiveGraph";
import PoweredByOpus from "../../components/landing/PoweredByOpus";

export default function PitchPage() {
  return (
    <main className="[&>section]:min-h-screen [&>section]:flex [&>section]:flex-col [&>section]:justify-center">
      <PitchHero />
      <WhatIsEthos pitchMode pitchGroup="problem" />
      <RubricFoundations />
      <EvaluationPipeline />
      <Moltbook />
      <WhatIsEthos pitchMode pitchGroup="demo" />
      <LiveGraph />
      <PoweredByOpus />
    </main>
  );
}
