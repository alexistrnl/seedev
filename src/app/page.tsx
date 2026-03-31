import TopMenu from "@/components/TopMenu"
import HeroSection from "@/components/HeroSection"
import StatsSection from "@/components/StatsSection"
import PortfolioSection from "@/components/PortfolioSection"
import ServicesSection from "@/components/ServicesSection"
import Footer from "@/components/Footer"

export default function HomePage() {
  return (
    <>
      <div className="home-bg" aria-hidden="true" />
      <div style={{ position: "relative", zIndex: 1 }}>
        <TopMenu />
        <HeroSection />
        <StatsSection />
        <PortfolioSection />
        <ServicesSection />
        <Footer />
      </div>
    </>
  )
}
