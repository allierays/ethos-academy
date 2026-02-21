import AutoPlayEngine from "../../components/demo/AutoPlayEngine";
import QuestionScene from "../../components/demo/QuestionScene";
import RoomScene from "../../components/demo/RoomScene";
import ConstitutionScene from "../../components/demo/ConstitutionScene";
import MeasureScene from "../../components/demo/MeasureScene";
import PhronesisScene from "../../components/demo/PhronesisScene";
import GraphScene from "../../components/demo/GraphScene";
import EnrollScene from "../../components/demo/EnrollScene";
import AlumniScene from "../../components/demo/AlumniScene";

export const metadata = {
  title: "Demo",
  description: "Does your AI agent have wisdom? Enroll your agent in Ethos Academy to measure integrity, logic, and empathy growth over time.",
};

export default function DemoPage() {
  return (
    <AutoPlayEngine durations={[12, 28, 28, 28, 28, 28, 28, 0]}>
      <QuestionScene />
      <RoomScene />
      <ConstitutionScene />
      <MeasureScene />
      <PhronesisScene />
      <GraphScene />
      <EnrollScene />
      <AlumniScene />
    </AutoPlayEngine>
  );
}
