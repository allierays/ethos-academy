"use client";

import SlideEngine from "../../components/pitch/SlideEngine";
import TitleSlide from "../../components/pitch/slides/TitleSlide";
import ProblemSlide from "../../components/pitch/slides/ProblemSlide";
import SolutionSlide from "../../components/pitch/slides/SolutionSlide";
import LiveEvalSlide from "../../components/pitch/slides/LiveEvalSlide";
import ExamSlide from "../../components/pitch/slides/ExamSlide";
import ReportCardSlide from "../../components/pitch/slides/ReportCardSlide";
import GraphSlide from "../../components/pitch/slides/GraphSlide";
import CloseSlide from "../../components/pitch/slides/CloseSlide";

export default function PitchPage() {
  return (
    <SlideEngine>
      <TitleSlide />
      <ProblemSlide />
      <SolutionSlide />
      <LiveEvalSlide />
      <ExamSlide />
      <ReportCardSlide />
      <GraphSlide />
      <CloseSlide />
    </SlideEngine>
  );
}
