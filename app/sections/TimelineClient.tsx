import ImpactTimeline from "@/components/ImpactTimeline";

const TimlineClient = () => {
  return (
    <section id="journey" className="relative w-full">
      <div className="mx-auto w-[min(1200px,80vw)]">
        <ImpactTimeline />
      </div>
    </section>
  );
};

export default TimlineClient;
