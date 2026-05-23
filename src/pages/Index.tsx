import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Goals from '@/components/Goals';
import WhyChooseUs from '@/components/WhyChooseUs';
import Courses from '@/components/Courses';
import Journey from '@/components/Journey';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background-dark lg:overflow-visible">
      <Navbar />
      <Hero />
      <Goals />
      <Courses />
      <WhyChooseUs />
      <Journey />
      <Footer />
    </div>
  );
};

export default Index;
