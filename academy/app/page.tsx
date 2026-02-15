import Hero from "../components/landing/Hero";
import WhatIsPhronesis from "../components/landing/WhatIsPhronesis";
import HomeworkDemo from "../components/landing/HomeworkDemo";
import TheLoop from "../components/landing/TheLoop";
import OpenSource from "../components/landing/OpenSource";
import LiveGraph from "../components/landing/LiveGraph";
import ScaleStatement from "../components/landing/ScaleStatement";
import MarketingCTA from "../components/landing/MarketingCTA";

export default function LandingPage() {
  return (
    <div>
      <Hero />
      <WhatIsPhronesis />
      <HomeworkDemo />
      <TheLoop />
      <OpenSource />
      <LiveGraph />
      <ScaleStatement />
      <MarketingCTA />
    </div>
  );
}
