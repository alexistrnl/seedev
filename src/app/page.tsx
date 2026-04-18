import Nav from '@/components/landing/Nav';
import Hero from '@/components/landing/Hero';
import Process from '@/components/landing/Process';
import Comparatif from '@/components/landing/Comparatif';
import Portfolio from '@/components/landing/Portfolio';
import Configurator from '@/components/landing/Configurator';
import Pricing from '@/components/landing/Pricing';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Process />
        <Comparatif />
        <Portfolio />
        <Configurator />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
