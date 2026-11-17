# Part A: Two core features for Coy

Coy's promise is simple. You add the people you like by phone or email. Each one gets a single anonymous heads-up. Nobody learns who added them unless the feeling is mutual. Both features below protect that promise. Neither adds a count, a hint, or an undo that could reveal who liked whom.

---

## 1. Linked identities: match on any verified number or email

**What it is.** A user can attach several verified identifiers to one account: a second SIM, an old number they still answer on, a college email, a personal email. A crush added under *any* of those identifiers matches the account. When someone changes their number, they verify the new one, and every crush pointing at the old one still matches.

**Why it's needed.**

- **A missed match is Coy's worst failure, and it is silent.** Coy matches on the exact identifier someone typed. Suppose Riya adds Arjun's Jio number while Arjun signed up with his Airtel number or his college email. They like each other, neither ever finds out, and nothing in the product tells them anything went wrong. For an app whose whole value is "you'll know if it's mutual", every false negative breaks that value quietly.
- **People in Coy's audience juggle identifiers.** Dual-SIM phones, a "WhatsApp number" that differs from the calling number, and college emails that expire at graduation are all normal. A crush is often added from whatever someone has in their contacts, which may not be the number the other person signed up with.
- **It builds on what Coy already collects.** Coy already verifies a phone (OTP) and an email. Allowing more than one of each, and matching across all of them, extends an existing flow rather than adding a new surface.
- **It is privacy-neutral.** Identifiers stay as keyed hashes, the same as today. Linking only changes which hashes resolve to *you*. It never tells anyone which identifier a crush used, and it never shows a count.

**Guardrails.** Every linked identifier must be verified by OTP or email link, so you can't claim someone else's number to intercept their crushes. Removing an identifier stops new matches through it, but it doesn't undo existing ones.

---

## 2. Crush seasons: slots that expire and come back, without leaking anything

**What it is.** Every crush has a fixed season, say 90 days. If no match happens by the end of it, the crush quietly lapses and the slot returns to the user. The user can choose "renew" at the end if they still feel the same way. The season length is the same for everyone and fixed when the crush is added, so it is not tied to anything the other person does.

**Why it's needed.**

- **"Adding is final" is right, but permanent is too strong.** Coy makes adding final so nobody can add and remove names to test who likes them. That is correct. But with 3 free slots and no way out, a user whose crush from last semester has moved on is stuck for good. Their only options are to pay for more slots or stop using the app. Many will stop.
- **It keeps the anti-probing guarantee.** Probing needs a *fast* add-and-remove loop. A fixed 90-day season gives nothing away. If the other person liked you at any point in those 90 days, you would already have matched. So a lapse reveals nothing that holding the crush for 90 days wouldn't have revealed anyway. No early removal is allowed.
- **It brings people back.** A season ending is a natural, non-creepy reason to return: "Your crush season with one person ended. Renew, or use the slot for someone new?" That is a re-engagement moment that doesn't depend on revealing anything about anyone.
- **It makes paid slots more valuable, not less.** Users who know slots recycle are more willing to use them, and more willing to buy extra ones for a busy season such as fests, freshers, or the end of college. That suits the one-time purchase model better than slots that are permanently locked.

**Guardrails.** The heads-up message limits (once a week, three times in total) apply across renewals, so renewing never re-notifies the other person. Lapses happen silently, and the other person is never told that a crush on them ended.
