import { HeroSection } from "@/components/home/HeroSection";
import { LeaderboardSection } from "@/components/home/LeaderboardSection";
import { EventsSection } from "@/components/home/EventsSection";
import { AnnouncementsSection } from "@/components/home/AnnouncementsSection";
import { EvaluationSection } from "@/components/home/EvaluationSection";

const Index = () => {
  return (
    <div>
      <HeroSection />
      <LeaderboardSection />
      <EventsSection />
      <AnnouncementsSection />
      <EvaluationSection />
    </div>
  );
};

export default Index;
