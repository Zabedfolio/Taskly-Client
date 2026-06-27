import FeaturedTasks from "@/components/home/Featuredtasks";
import HeroBanner from "@/components/home/HeroBanner";
import TestimonialsShowcase from "@/components/home/TestimonialsShowcase";
import TopFreelancers from "@/components/home/TopFreelancers";
import PlatformStats from "@/components/home/PlatformStats";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <HeroBanner />
      <FeaturedTasks></FeaturedTasks>
      <TopFreelancers></TopFreelancers>
      <PlatformStats></PlatformStats>
      <TestimonialsShowcase></TestimonialsShowcase>
    </main>
  );
}
