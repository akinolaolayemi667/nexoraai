import { Seo } from "@/components/seo";
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
      <Seo page="home" />
      <Hero />
      <ProductOverview />
      <ProductCapabilities />
      <Solutions />
      <Testimonials />
      <PricingCta />
    </>
  );
}
