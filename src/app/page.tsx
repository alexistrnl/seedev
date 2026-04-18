import TopMenu from "@/components/TopMenu"
import HeroSection from "@/components/HeroSection"
import StatsSection from "@/components/StatsSection"
import PortfolioSection from "@/components/PortfolioSection"
import ServicesSection from "@/components/ServicesSection"
import ContactSection from "@/components/ContactSection"
import Footer from "@/components/Footer"

export default function HomePage() {
  return (
    <div style={{ position: "relative", zIndex: 1 }}>
      <TopMenu />
      <HeroSection />
      <StatsSection />
      <PortfolioSection />
      <ServicesSection />
      <ContactSection />
      <Footer />
    </div>
  )
}
