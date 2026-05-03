import { type FormEvent, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarRange, CheckCircle2, HeartHandshake, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";
import { coachingDisclaimer, coachingTestimonials, couplesBudgetReset, supportEmail } from "@/lib/coachingOfferContent";
import { trpc } from "@/lib/trpc";

const heroHighlights = [
  "Pilot price: £99",
  couplesBudgetReset.sessions,
  "Includes simple preparation and a written summary",
];

type BookingFormState = {
  firstName: string;
  partnerFirstName: string;
  email: string;
  location: string;
  mainFocus: string;
  suggestedTimes: string;
  notes: string;
};

const initialFormState: BookingFormState = {
  firstName: "",
  partnerFirstName: "",
  email: "",
  location: "",
  mainFocus: "",
  suggestedTimes: "",
  notes: "",
};

export default function BookingPage() {
  const [formState, setFormState] = useState<BookingFormState>(initialFormState);
  const [submittedName, setSubmittedName] = useState("");

  const submitEnquiryMutation = trpc.coaching.submitEnquiry.useMutation({
    onSuccess: data => {
      setSubmittedName(data.firstName);
      setFormState(initialFormState);
      toast.success(`Thanks${data.firstName ? `, ${data.firstName}` : ""}. Your enquiry is with me now.`);
    },
    onError: error => {
      toast.error(error.message || `Something went wrong. Please try again or email ${supportEmail}.`);
    },
  });

  const updateField = (field: keyof BookingFormState, value: string) => {
    setFormState(current => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    submitEnquiryMutation.mutate({
      firstName: formState.firstName,
      partnerFirstName: formState.partnerFirstName,
      email: formState.email,
      location: formState.location,
      mainFocus: formState.mainFocus,
      suggestedTimes: formState.suggestedTimes,
      notes: formState.notes,
    });
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F8F7F4_0%,#F8F7F4_55%,#F0E8E0_100%)] text-[#163A43]">
      <header className="border-b border-[#DCCFC4]/70 bg-[#F8F7F4]/90 backdrop-blur">
        <div className="container flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-semibold tracking-tight">SteadyUs</p>
            <p className="text-sm text-[#4C666D]">Couples Budget Reset</p>
          </div>

          <div className="flex flex-wrap gap-3 text-sm">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-[#163A43]/15 bg-white/70 px-4 py-2 text-[#163A43]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
            <a
              href="#booking-form"
              className="inline-flex items-center gap-2 rounded-full bg-[#163A43] px-5 py-2 text-[#F8F7F4]"
            >
              Book the £99 pilot
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="container grid gap-10 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-18">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#6F8F72]/35 bg-[#E6EEE8] px-4 py-2 text-sm text-[#34555C]">
              <HeartHandshake className="h-4 w-4 text-[#6F8F72]" />
              I like to make money conversations feel clearer, calmer, and easier to act on.
            </div>

            <div className="space-y-5">
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
                Book your Couples Budget Reset.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[#436168] md:text-xl">
                {couplesBudgetReset.summary}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {heroHighlights.map(item => (
                <div
                  key={item}
                  className="rounded-3xl border border-white/70 bg-white/75 p-5 shadow-[0_18px_45px_rgba(22,58,67,0.05)]"
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6F8F72]">Included</p>
                  <p className="mt-3 text-base leading-7 text-[#163A43]">{item}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <a
                href="#booking-form"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#163A43] px-6 py-3.5 text-base font-medium text-[#F8F7F4]"
              >
                Start the short booking form
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                href="/checkout"
                className="inline-flex items-center justify-center rounded-full border border-[#163A43]/15 bg-white/70 px-6 py-3.5 text-base font-medium text-[#163A43]"
              >
                See checkout details
              </Link>
            </div>

            <p className="max-w-2xl text-sm leading-7 text-[#5C767C]">
              Pilot pricing is currently <span className="font-semibold text-[#163A43]">£99</span>. The standard package price is planned to move to <span className="font-semibold text-[#163A43]">{couplesBudgetReset.futurePriceRange}</span> once early testimonials are in place.
            </p>
          </div>

          <div className="rounded-[32px] border border-[#DCCFC4] bg-white p-6 shadow-[0_30px_80px_rgba(22,58,67,0.10)] md:p-8">
            <div className="space-y-6">
              <div className="rounded-[28px] bg-[#163A43] p-6 text-[#F8F7F4]">
                <p className="text-sm uppercase tracking-[0.18em] text-[#DCCFC4]">What you are booking</p>
                <p className="mt-4 text-3xl font-semibold">{couplesBudgetReset.name}</p>
                <p className="mt-4 max-w-md text-sm leading-7 text-[#D9E7DB]">{couplesBudgetReset.supportLine}</p>
                <div className="mt-5 flex items-end gap-3">
                  <span className="text-5xl font-semibold">£99</span>
                  <span className="pb-1 text-sm text-[#DCCFC4]">pilot price</span>
                </div>
              </div>

              <div className="space-y-4">
                {couplesBudgetReset.includes.map(item => (
                  <div
                    key={item.title}
                    className="rounded-3xl border border-[#E7DDD4] bg-[#FCFBF8] p-5"
                  >
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
          </div>
        </section>

        <section className="container py-4 lg:py-6">
          <div className="rounded-[34px] border border-[#DCCFC4] bg-[#FCFBF8] p-8 shadow-[0_18px_55px_rgba(22,58,67,0.05)]">
            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6F8F72]">Strong fit</p>
                <h2 className="text-3xl font-semibold tracking-tight">This works best for couples who want clarity, structure, and momentum.</h2>
                <p className="max-w-xl text-base leading-8 text-[#4C666D]">
                  You do not need a perfect spreadsheet, a fully organised budget, or every answer before you book. I built these sessions to help you create progress from wherever you are now.
                </p>
              </div>

              <div className="overflow-hidden rounded-[28px] border border-[#E7DDD4]">
                <div className="grid grid-cols-2 bg-[#F3ECE4] text-sm font-semibold text-[#163A43]">
                  <div className="px-5 py-4">A strong fit if you want to</div>
                  <div className="border-l border-[#E7DDD4] px-5 py-4">Not the purpose of this offer</div>
                </div>
                {couplesBudgetReset.fitTable.map(row => (
                  <div key={row.strongFit} className="grid grid-cols-2 border-t border-[#E7DDD4] bg-white text-sm leading-7 text-[#4C666D]">
                    <div className="px-5 py-4">{row.strongFit}</div>
                    <div className="border-l border-[#E7DDD4] px-5 py-4">{row.notFor}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="container py-8 lg:py-12">
          <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="rounded-[32px] border border-[#DCCFC4] bg-white p-8 shadow-[0_18px_55px_rgba(22,58,67,0.05)]">
              <div className="flex items-center gap-3 text-sm uppercase tracking-[0.18em] text-[#6F8F72]">
                <CalendarRange className="h-4 w-4" />
                What happens next
              </div>
              <div className="mt-5 space-y-5">
                {couplesBudgetReset.nextSteps.map(step => (
                  <div key={step} className="flex gap-3">
                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-[#C96A2B]" />
                    <p className="text-base leading-7 text-[#4C666D]">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-[#DCCFC4] bg-[#163A43] p-8 text-[#F8F7F4] shadow-[0_24px_60px_rgba(22,58,67,0.12)]">
              <div className="flex items-center gap-3 text-sm uppercase tracking-[0.18em] text-[#DCCFC4]">
                <ShieldCheck className="h-4 w-4" />
                Scope and reassurance
              </div>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight">Practical coaching, not regulated advice.</h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-[#D9E7DB]">{coachingDisclaimer}</p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {couplesBudgetReset.followUpOffers.map(item => (
                  <div key={item} className="rounded-3xl border border-white/12 bg-white/6 p-5">
                    <p className="text-sm leading-7 text-[#F8F7F4]">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="container py-6 lg:py-10">
          <div className="rounded-[34px] border border-[#DCCFC4] bg-[#FCFBF8] p-8 shadow-[0_20px_55px_rgba(22,58,67,0.05)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6F8F72]">Trust before the click</p>
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

        <section id="booking-form" className="container scroll-mt-24 py-10 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
            <div className="rounded-[36px] bg-[#163A43] p-8 text-[#F8F7F4] shadow-[0_30px_80px_rgba(22,58,67,0.14)] md:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#DCCFC4]">Short booking form</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">Share the basics and a few times that work.</h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-[#D9E7DB]">
                This short form is the first step. I read every enquiry myself, confirm availability personally, and only send payment instructions once we have agreed a session time.
              </p>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[#F8F7F4]">Your first name</span>
                    <input
                      type="text"
                      required
                      value={formState.firstName}
                      onChange={event => updateField("firstName", event.target.value)}
                      className="h-12 w-full rounded-2xl border border-white/18 bg-white px-4 text-[#163A43] outline-none ring-0 placeholder:text-[#6C7E83]"
                      placeholder="Alex"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[#F8F7F4]">Partner's first name</span>
                    <input
                      type="text"
                      value={formState.partnerFirstName}
                      onChange={event => updateField("partnerFirstName", event.target.value)}
                      className="h-12 w-full rounded-2xl border border-white/18 bg-white px-4 text-[#163A43] outline-none ring-0 placeholder:text-[#6C7E83]"
                      placeholder="Jordan"
                    />
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[#F8F7F4]">Email address</span>
                    <input
                      type="email"
                      required
                      value={formState.email}
                      onChange={event => updateField("email", event.target.value)}
                      className="h-12 w-full rounded-2xl border border-white/18 bg-white px-4 text-[#163A43] outline-none ring-0 placeholder:text-[#6C7E83]"
                      placeholder="alex@example.com"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[#F8F7F4]">Location or timezone</span>
                    <input
                      type="text"
                      required
                      value={formState.location}
                      onChange={event => updateField("location", event.target.value)}
                      className="h-12 w-full rounded-2xl border border-white/18 bg-white px-4 text-[#163A43] outline-none ring-0 placeholder:text-[#6C7E83]"
                      placeholder="Leeds, UK"
                    />
                  </label>
                </div>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-[#F8F7F4]">What would you most like help with right now?</span>
                  <textarea
                    required
                    rows={4}
                    value={formState.mainFocus}
                    onChange={event => updateField("mainFocus", event.target.value)}
                    className="w-full rounded-[24px] border border-white/18 bg-white px-4 py-3 text-[#163A43] outline-none ring-0 placeholder:text-[#6C7E83]"
                    placeholder="For example: we keep avoiding the budget, overspend in different places, and want a calmer shared plan."
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-[#F8F7F4]">Suggested times for session one</span>
                  <textarea
                    required
                    rows={4}
                    value={formState.suggestedTimes}
                    onChange={event => updateField("suggestedTimes", event.target.value)}
                    className="w-full rounded-[24px] border border-white/18 bg-white px-4 py-3 text-[#163A43] outline-none ring-0 placeholder:text-[#6C7E83]"
                    placeholder="Share two or three options, for example: Tuesday 7pm, Thursday 8pm, or Saturday morning."
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-[#F8F7F4]">Anything else helpful for me to know? (optional)</span>
                  <textarea
                    rows={3}
                    value={formState.notes}
                    onChange={event => updateField("notes", event.target.value)}
                    className="w-full rounded-[24px] border border-white/18 bg-white px-4 py-3 text-[#163A43] outline-none ring-0 placeholder:text-[#6C7E83]"
                    placeholder="You can mention schedule constraints, your main goal, or anything you want me to keep in mind."
                  />
                </label>

                {submitEnquiryMutation.error ? (
                  <div className="rounded-[24px] border border-[#E6B7A4] bg-[#F8E3DA] px-4 py-3 text-sm leading-6 text-[#5A2B1B]">
                    {submitEnquiryMutation.error.message || `Something went wrong while sending your enquiry. Please try again or email ${supportEmail}.`}
                  </div>
                ) : null}

                {submitEnquiryMutation.isSuccess ? (
                  <div className="rounded-[24px] border border-[#A7C7AE] bg-[#E7F0E9] px-4 py-3 text-sm leading-6 text-[#163A43]">
                    Thanks{submittedName ? `, ${submittedName}` : ""}. Your enquiry has been sent. I will review your suggested times personally, confirm what is available, and then send payment details if the slot works.
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={submitEnquiryMutation.isPending}
                  className="inline-flex h-12 items-center justify-center rounded-full bg-[#F8F7F4] px-6 text-sm font-medium text-[#163A43] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitEnquiryMutation.isPending ? "Sending your enquiry..." : "Send booking enquiry"}
                </button>
              </form>
            </div>

            <div className="space-y-6">
              <div className="rounded-[28px] border border-[#DCCFC4] bg-white p-6 shadow-[0_18px_55px_rgba(22,58,67,0.06)]">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6F8F72]">What happens after you enquire</p>
                <div className="mt-5 space-y-4 text-sm leading-7 text-[#4C666D]">
                  <p><span className="font-semibold text-[#163A43]">1.</span> I review your form personally, not through an automated checkout.</p>
                  <p><span className="font-semibold text-[#163A43]">2.</span> I reply with availability based on the times you shared.</p>
                  <p><span className="font-semibold text-[#163A43]">3.</span> I send payment details only after we agree the appointment time.</p>
                  <p><span className="font-semibold text-[#163A43]">4.</span> I send final confirmation and simple preparation guidance after payment.</p>
                </div>
              </div>

              <div className="rounded-[28px] border border-[#DCCFC4] bg-[#FCFBF8] p-6 shadow-[0_18px_55px_rgba(22,58,67,0.05)]">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7A4B22]">Prefer to ask a question first?</p>
                <p className="mt-4 text-sm leading-7 text-[#4C666D]">
                  You can email <span className="font-semibold text-[#163A43]">{supportEmail}</span> if you want to check the fit before sending the form.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <a
                    href={`mailto:${supportEmail}?subject=Couples%20Budget%20Reset%20question`}
                    className="inline-flex items-center justify-center rounded-full bg-[#163A43] px-5 py-3 text-sm font-medium text-[#F8F7F4]"
                  >
                    Email a question
                  </a>
                  <Link
                    href="/checkout"
                    className="inline-flex items-center justify-center rounded-full border border-[#163A43]/15 bg-white px-5 py-3 text-sm font-medium text-[#163A43]"
                  >
                    Review the process
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
