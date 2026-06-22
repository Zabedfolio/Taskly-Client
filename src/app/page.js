import FeaturedTasks from "@/components/home/Featuredtasks";
import HeroBanner from "@/components/home/HeroBanner";
import TopFreelancers from "@/components/home/TopFreelancers";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <HeroBanner />
      <FeaturedTasks></FeaturedTasks>
      <TopFreelancers></TopFreelancers>
    </main>
  );
}
