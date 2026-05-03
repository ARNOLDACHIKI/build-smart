import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import PricingSection from '@/components/landing/PricingSection';
import MobileAppDashboardSection from '@/components/landing/MobileAppDashboardSection';
import Footer from '@/components/landing/Footer';

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== '/' || !location.hash) return;

    const sectionId = location.hash.slice(1);
    const element = document.getElementById(sectionId);
    if (!element) return;

    const offset = 96;
    const top = Math.max(window.scrollY + element.getBoundingClientRect().top - offset, 0);
    window.scrollTo({ top, behavior: 'smooth' });
  }, [location.hash, location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <MobileAppDashboardSection />
      <TestimonialsSection />
      <PricingSection />
      <Footer />
    </div>
  );
};

export default Index;
