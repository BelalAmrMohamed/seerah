import Hero from "@/components/Hero";
import Scene from "@/components/Scene";
import Footer from "@/components/Footer";
import TimelineRail from "@/components/TimelineRail";
import { stations } from "@/lib/stations";

export default function Home() {
  return (
    <main>
      <TimelineRail />
      <Hero />
      {stations.map((s) => <Scene key={s.id} s={s} />)}
      <Footer />
    </main>
  );
}
