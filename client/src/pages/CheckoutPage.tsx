import { ArrowLeft, CheckCircle2, CreditCard, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { coachingDisclaimer, couplesBudgetReset, supportEmail } from "@/lib/coachingOfferContent";

const orderSummary = [
  { label: "Package", value: couplesBudgetReset.name },
  { label: "Format", value: couplesBudgetReset.sessions },
  { label: "Price", value: "£99 pilot" },
  {
    label: "Focus",
    value: "Budgeting, cash-flow clarity, financial organisation, and next-step planning",
  },
];

const reassurancePoints = [
  "You do not need to arrive with everything sorted.",
  "The aim is calm clarity and practical action, not perfection.",
  "No payment is requested until your preferred time has been confirmed.",
];

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F8F7F4_0%,#F7F3EE_55%,#EDE3DA_100%)] text-[#163A43]">
      <header className="border-b border-[#DCCFC4]/70 bg-[#F8F7F4]/90 backdrop-blur">
        <div className="container flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-semibold tracking-tight">SteadyUs</p>
            <p className="text-sm text-[#4C666D]">Checkout · Couples Budget Reset</p>
          </div>

          <Link
            href="/couples-budget-reset"
            className="inline-flex items-center gap-2 rounded-full border border-[#163A43]/15 bg-white/75 px-4 py-2 text-sm text-[#163A43]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to booking page
          </Link>
        </div>
      </header>

      <main className="container py-14 lg:py-18">
        <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
          <section className="rounded-[34px] border border-[#DCCFC4] bg-white p-8 shadow-[0_25px_70px_rgba(22,58,67,0.08)] md:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#6F8F72]/35 bg-[#E6EEE8] px-4 py-2 text-sm text-[#34555C]">
              <CreditCard className="h-4 w-4 text-[#6F8F72]" />
              Short form, personal confirmation, then payment
            </div>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight md:text-5xl">How the booking process works.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#436168]">
              I want the booking process to feel clear and low-pressure: first you share your details and a few suggested times, then I confirm availability, then payment is arranged, and then your appointment is finalised.
            </p>

            <div className="mt-8 overflow-hidden rounded-[28px] border border-[#E7DDD4]">
              <div className="grid grid-cols-2 bg-[#F3ECE4] text-sm font-semibold text-[#163A43]">
                <div className="px-5 py-4">Item</div>
                <div className="border-l border-[#E7DDD4] px-5 py-4">Detail</div>
              </div>
              {orderSummary.map(item => (
                <div key={item.label} className="grid grid-cols-2 border-t border-[#E7DDD4] bg-[#FCFBF8] text-sm leading-7 text-[#4C666D]">
                  <div className="px-5 py-4 font-medium text-[#163A43]">{item.label}</div>
                  <div className="border-l border-[#E7DDD4] px-5 py-4">{item.value}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-[28px] bg-[#163A43] p-7 text-[#F8F7F4]">
              <div className="flex items-end justify-between gap-4 border-b border-white/12 pb-5">
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-[#DCCFC4]">Pilot package</p>
                  <p className="mt-2 text-5xl font-semibold">£99</p>
                </div>
                <p className="max-w-[220px] text-right text-sm leading-6 text-[#D9E7DB]">
                  Payment is arranged only after your preferred appointment time is confirmed.
                </p>
              </div>

              <div className="mt-5 space-y-4 text-sm leading-7 text-[#F8F7F4]">
                <p>
                  Start by completing the short booking form and sharing a few suggested times that work for both of you.
                </p>
                <p>
                  If you would rather ask a question first, email <span className="font-semibold">{supportEmail}</span> and I will reply before any payment is requested.
                </p>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Link
                  href="/couples-budget-reset"
                  className="inline-flex items-center justify-center rounded-full bg-[#F8F7F4] px-5 py-3 text-sm font-medium text-[#163A43]"
                >
                  Start the booking form
                </Link>
                <a
                  href={`mailto:${supportEmail}?subject=Couples%20Budget%20Reset%20question`}
                  className="inline-flex items-center justify-center rounded-full border border-white/18 bg-transparent px-5 py-3 text-sm font-medium text-[#F8F7F4]"
                >
                  Email a question first
                </a>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-[32px] border border-[#DCCFC4] bg-[#FCFBF8] p-8 shadow-[0_18px_55px_rgba(22,58,67,0.05)]">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6F8F72]">Before anything is confirmed</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight">A clear, practical, low-pressure way to start.</h2>
              <div className="mt-6 space-y-4">
                {reassurancePoints.map(point => (
                  <div key={point} className="flex gap-3">
                    <CheckCircle2 className="mt-1 h-5 w-5 text-[#6F8F72]" />
                    <p className="text-base leading-7 text-[#4C666D]">{point}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-[#DCCFC4] bg-white p-8 shadow-[0_18px_55px_rgba(22,58,67,0.05)]">
              <div className="flex items-center gap-3 text-sm uppercase tracking-[0.18em] text-[#6F8F72]">
                <ShieldCheck className="h-4 w-4" />
                Scope and boundaries
              </div>
              <p className="mt-5 text-base leading-8 text-[#4C666D]">{coachingDisclaimer}</p>
            </div>

            <div className="rounded-[32px] border border-[#DCCFC4] bg-[#F3ECE4] p-8 shadow-[0_18px_55px_rgba(22,58,67,0.05)]">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7A4B22]">The four-step process</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight">Start simple, then confirm each step.</h2>
              <div className="mt-5 space-y-4 text-base leading-8 text-[#163A43]">
                <p><span className="font-semibold">1.</span> Complete the short intake form and share a few suggested times.</p>
                <p><span className="font-semibold">2.</span> Receive a personal reply from me confirming availability and the best appointment option.</p>
                <p><span className="font-semibold">3.</span> Receive payment instructions once your session time is agreed.</p>
                <p><span className="font-semibold">4.</span> Receive final confirmation and simple preparation guidance before session one.</p>
              </div>
              <p className="mt-4 text-sm leading-7 text-[#36535B]">
                You do not need a finished budget, spreadsheets, or perfect organisation to get value from working with me.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
