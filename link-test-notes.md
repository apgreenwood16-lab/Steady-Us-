# Live link test notes

- Homepage loaded successfully at `/` and no planner CTA or planner wording appeared in the visible public navigation.
- The top homepage booking CTA opened `/couples-budget-reset#booking-form` successfully.
- The booking page now contains a visible short intake form with fields for names, email, location, focus, times, and notes.
- The booking page also exposes working visible links for back to home, checkout details, and support email.

Further live checks confirmed that the booking page checkout link opened `/checkout` successfully, and the checkout page loaded the expected process explanation. The checkout page booking CTA returned successfully to the Couples Budget Reset page, with the short intake form still visible on arrival.

Additional live testing confirmed that the booking page back-home link returns to `/` successfully, and the homepage secondary process CTA also opens `/checkout` correctly. I also inspected the checkout page link targets directly and verified that its email action points to `mailto:hello@steadyus.co.uk?subject=Couples%20Budget%20Reset%20question`.

- 2026-04-10: Re-checked the live homepage after the voice update. The customer-facing copy now includes first-person language such as "I built SteadyUs..." and "I will confirm availability first..." while the booking journey CTAs remain in place.
- 2026-04-10: Submitted a live test enquiry on `/couples-budget-reset` and confirmed the page now shows a visible success confirmation in first-person voice. The booking page also shows the updated question contact as `andy.steadyus@gmail.com`.
