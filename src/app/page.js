import FeaturedTasks from "@/components/home/Featuredtasks";
import HeroBanner from "@/components/home/HeroBanner";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <HeroBanner />
      <FeaturedTasks></FeaturedTasks>
    </main>
  );
}
