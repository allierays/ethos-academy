import Hero from "../components/landing/Hero";
import WhatIsPhronesis from "../components/landing/WhatIsPhronesis";
import Pillars from "../components/landing/Pillars";
import ScaleStatement from "../components/landing/ScaleStatement";
import GraphTeaser from "../components/landing/GraphTeaser";
export default function LandingPage() {
  return (
    <div>
      <Hero />
      <WhatIsPhronesis />
      <Pillars />
      <ScaleStatement />
      <GraphTeaser />
    </div>
  );
}
