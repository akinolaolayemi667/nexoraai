import { testimonials } from "@/data/marketing";
import { Avatar, Stagger, StaggerItem } from "@/components/ui";
import { Section, SectionHeading } from "./section";

export function Testimonials() {
  return (
    <Section id="testimonials" tone="canvas">
      <SectionHeading eyebrow="Customer stories" title="Teams run faster on NEXORA." />
      <Stagger inView className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
        {testimonials.map((item) => (
          <StaggerItem key={item.name}>
            <figure className="glass-card glass-hover flex h-full flex-col rounded-2xl p-6">
              <div className="border-b border-border-subtle pb-5">
                <p className="text-metric text-3xl font-semibold text-primary">{item.metric}</p>
                <p className="mt-1 text-xs text-muted">{item.metricLabel}</p>
              </div>
              <blockquote className="mt-5 flex-1 text-base text-ink">“{item.quote}”</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <Avatar name={item.name} size="md" />
                <span>
                  <span className="block text-sm font-medium text-ink">{item.name}</span>
                  <span className="block text-xs text-muted">
                    {item.role}, {item.company}
                  </span>
                </span>
              </figcaption>
            </figure>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}
