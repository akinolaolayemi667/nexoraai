import {
  Hero,
  PricingCta,
  ProductCapabilities,
  ProductOverview,
  Solutions,
  Testimonials,
} from "@/components/marketing";

export default function HomePage() {
  return (
    <>
      <title>NEXORA AI — AI-Powered Operations. One Intelligent Workspace.</title>
      <meta
        name="description"
        content="Manage leads, automate workflows, understand your customers and move your business forward from one intelligent platform."
      />
      <Hero />
      <ProductOverview />
      <ProductCapabilities />
      <Solutions />
      <Testimonials />
      <PricingCta />
    </>
  );
}
