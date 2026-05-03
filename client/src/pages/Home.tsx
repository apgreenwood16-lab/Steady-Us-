import { ArrowRight, CheckCircle2, HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { coachingDisclaimer, coachingTestimonials, couplesBudgetReset, faqContent, supportEmail } from "@/lib/coachingOfferContent";

export default function Home() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F8F7F4_0%,#F8F7F4_52%,#F2EAE2_100%)] text-[#163A43]">
      <header className="border-b border-[#DCCFC4]/70 bg-[#F8F7F4]/90 backdrop-blur">
        <div className="container flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-semibold tracking-tight">SteadyUs</p>
            <p className="text-sm text-[#4C666D]">Practical money clarity for couples</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="/couples-budget-reset#booking-form"
              className="inline-flex items-center gap-2 rounded-full bg-[#163A43] px-5 py-2.5 text-sm font-medium text-[#F8F7F4]"
            >
              Book the £99 pilot
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              href="/checkout"
              className="inline-flex items-center justify-center rounded-full border border-[#163A43]/15 bg-white/75 px-5 py-2.5 text-sm font-medium text-[#163A43]"
            >
              How booking works
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="container grid gap-12 py-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-20">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#6F8F72]/30 bg-[#E6EEE8] px-4 py-2 text-sm text-[#34555C]">
              <Sparkles className="h-4 w-4 text-[#6F8F72]" />
              I built this for couples who are doing okay on paper, but still want money to feel clearer and less stressful
            </div>

            <div className="space-y-5">
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
                I help couples make money feel calmer, clearer, and easier to talk about.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[#436168] md:text-xl">
                {couplesBudgetReset.summary}
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <a
                href="/couples-budget-reset#booking-form"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#163A43] px-6 py-3.5 text-base font-medium text-[#F8F7F4]"
              >
                Start the booking form
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                href="/checkout"
                className="inline-flex items-center justify-center rounded-full border border-[#163A43]/15 bg-white/70 px-6 py-3.5 text-base font-medium text-[#163A43]"
              >
                Review checkout details
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  title: "Pilot price",
                  text: "£99 for the full two-session package while I gather the first testimonials and refine the offer.",
                },
                {
                  title: "Designed for couples",
                  text: "I designed it for busy professionals trying to balance everyday life with savings, debt, or home goals.",
                },
                {
                  title: "Clear boundaries",
                  text: "I provide budgeting support and financial organisation only, with clear regulated-advice boundaries.",
                },
              ].map(item => (
                <div key={item.title} className="rounded-3xl border border-white/70 bg-white/70 p-5 shadow-[0_20px_60px_rgba(22,58,67,0.06)]">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6F8F72]">{item.title}</p>
                  <p className="mt-3 text-sm leading-6 text-[#4C666D]">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-[#DCCFC4] bg-white p-6 shadow-[0_30px_80px_rgba(22,58,67,0.10)] md:p-8">
            <div className="rounded-[28px] bg-[#163A43] p-6 text-[#F8F7F4]">
              <p className="text-sm uppercase tracking-[0.18em] text-[#DCCFC4]">The offer</p>
              <p className="mt-4 text-3xl font-semibold">{couplesBudgetReset.name}</p>
              <p className="mt-4 max-w-md text-sm leading-7 text-[#D9E7DB]">{couplesBudgetReset.supportLine}</p>
              <div className="mt-5 flex items-end gap-3">
                <span className="text-5xl font-semibold">£99</span>
                <span className="pb-1 text-sm text-[#DCCFC4]">pilot price</span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {couplesBudgetReset.includes.map(item => (
                <div key={item.title} className="rounded-3xl border border-[#E7DDD4] bg-[#FCFBF8] p-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-1 h-5 w-5 text-[#6F8F72]" />
                    <div>
                      <p className="font-semibold text-[#163A43]">{item.title}</p>
                      <p className="mt-2 text-sm leading-7 text-[#4C666D]">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container py-4 lg:py-6">
          <div className="rounded-[34px] border border-[#DCCFC4] bg-[#FCFBF8] p-8 shadow-[0_18px_55px_rgba(22,58,67,0.05)]">
            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6F8F72]">Who this is for</p>
                <h2 className="text-3xl font-semibold tracking-tight">Clarity for couples who are not reckless, just overdue a proper reset.</h2>
                <p className="max-w-xl text-base leading-8 text-[#4C666D]">
                  I built these sessions for people who are broadly sensible with money, but still feel that their finances are more messy, reactive, or avoidant than they want them to be.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {couplesBudgetReset.whoItsFor.map(item => (
                  <div key={item} className="rounded-[28px] border border-[#E7DDD4] bg-white p-5">
                    <p className="text-sm leading-7 text-[#36535B]">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="container py-8 lg:py-12">
          <div className="rounded-[32px] border border-[#DCCFC4] bg-white p-8 shadow-[0_18px_55px_rgba(22,58,67,0.05)]">
            <div className="flex items-center gap-3 text-sm uppercase tracking-[0.18em] text-[#6F8F72]">
              <ShieldCheck className="h-4 w-4" />
              Scope and reassurance
            </div>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight">Practical financial coaching with clear boundaries.</h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[#4C666D]">{coachingDisclaimer}</p>
          </div>
        </section>

        <section className="container py-6 lg:py-10">
          <div className="rounded-[34px] border border-[#DCCFC4] bg-[#FCFBF8] p-8 shadow-[0_20px_55px_rgba(22,58,67,0.05)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6F8F72]">{coachingTestimonials.eyebrow}</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">{coachingTestimonials.heading}</h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[#4C666D]">{coachingTestimonials.support}</p>
            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              {coachingTestimonials.quotes.map(item => (
                <div key={item.attribution} className="rounded-[28px] border border-[#E7DDD4] bg-white p-6">
                  <p className="text-base leading-8 text-[#36535B]">“{item.quote}”</p>
                  <p className="mt-5 text-sm font-semibold uppercase tracking-[0.12em] text-[#C46A4A]">{item.attribution}</p>
                </div>
              ))}
            </div>
          </div>
        </section>


        <section className="container py-6 lg:py-10">
          <div className="rounded-[34px] border border-[#DCCFC4] bg-white p-8 shadow-[0_20px_55px_rgba(22,58,67,0.05)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6F8F72]">Frequently asked questions</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">A simple process before anything is confirmed.</h2>
            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              {faqContent.map(item => (
                <div key={item.question} className="rounded-[28px] border border-[#E7DDD4] bg-[#FCFBF8] p-6">
                  <p className="text-lg font-semibold text-[#163A43]">{item.question}</p>
                  <p className="mt-3 text-base leading-8 text-[#4C666D]">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container py-6 lg:py-10">
          <div className="rounded-[32px] border border-[#DCCFC4] bg-[#163A43] p-8 text-[#F8F7F4] shadow-[0_24px_60px_rgba(22,58,67,0.12)]">
            <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#DCCFC4]">Contact and booking</p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight">Start with the form, then confirm the right time together.</h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-[#D9E7DB]">
                  If the Couples Budget Reset feels like the right fit, start with the short form and share a few times that work for both of you. I will confirm availability first, then send payment details, and then confirm the appointment. If you would rather ask a quick question before booking, email me directly at {supportEmail}.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <a
                  href="/couples-budget-reset#booking-form"
                  className="inline-flex items-center justify-center rounded-full bg-[#F8F7F4] px-5 py-3 text-sm font-medium text-[#163A43]"
                >
                  Open booking form
                </a>
                <Link
                  href="/checkout"
                  className="inline-flex items-center justify-center rounded-full border border-white/18 bg-transparent px-5 py-3 text-sm font-medium text-[#F8F7F4]"
                >
                  Review the process
                </Link>
                <a
                  href={`mailto:${supportEmail}?subject=Couples%20Budget%20Reset%20question`}
                  className="inline-flex items-center justify-center rounded-full border border-white/18 bg-transparent px-5 py-3 text-sm font-medium text-[#F8F7F4]"
                >
                  Email me first
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
