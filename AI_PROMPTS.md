# AI_PROMPTS.md

This document records how AI (Claude) was used throughout the development of
this project, organized by development stage. It includes the main prompts
used, what AI suggested, what I accepted as-is, what I changed or rejected,
and which decisions were made independently.

**AI tool used:** Claude (Anthropic)

---

## 1. Planning & project structure

**Prompt:**
> "I need to complete a test assignment: a full-stack order creation app.
> Some work is already in progress. I'll share code with you, and you tell
> me what to fix or improve."

**How it was used:** I worked out the project structure together with AI —
Express + React + TypeScript, with a JSON file acting as the "database"
(`products.json` for the catalog, later `orders.json` for order history).
We discussed the tradeoffs of this approach (no real DB, but sufficient for
the assignment's scope) before I committed to it.

**My contribution:** I made the final call on the folder layout
(`backend/src/{routes,services,data}` and `frontend/src/{components,api,hooks}`),
and on keeping validation logic centralized in a single `orderService.ts`
rather than spread across routes, so the business rules would be easy to
test and reason about in one place.

---

## 2. Implementation — review and bug fixing

**Prompt:**
> "Here's my frontend code [App.tsx, ProductList.tsx, Cart.tsx,
> OrderOutcome.tsx, api/client.ts]. Tell me what to fix or improve."

**What AI found:** A bug where the stock-availability check in `handleAdd`
didn't account for quantities already sitting in the cart — meaning a user
could add more than the actual remaining stock across multiple "Add" clicks
for the same product.

**What I did with it:** I reviewed the suggested fix (subtracting
`alreadyInCart` from `product.stock` before comparing), verified it against
a specific low-stock test case myself, and applied it. I then caught, on my
own, that the same bug existed in a second place — the stepper's `max`
value in `ProductList.tsx` wasn't using the cart-aware remaining stock —
and asked for that file to be checked again specifically.

**Prompt (backend):**
> "Here's my backend code [routes/orders.ts, routes/products.ts,
> services/orderService.ts, types.ts, index.ts]. Same as before — what needs
> fixing?"

**What AI found:**
1. No error handling for malformed JSON in request bodies (Express would
   return an HTML error page instead of a JSON error).
2. `request.items` wasn't checked with `Array.isArray()`, so a non-array
   value (e.g. a string) would silently pass the initial truthy check and
   break later in the loop.
3. A noted (not fixed) concurrency caveat: no locking between the stock
   check and the stock mutation, so a theoretical race condition exists
   under concurrent requests for the last unit of a product.

**What I changed/accepted:** Accepted fixes #1 and #2 as written — verified
by testing malformed JSON via the browser dev tools before/after. I decided
**not** to implement a locking mechanism for #3, since it's out of scope for
a JSON-file "database" in a take-home assignment, but noted it as a known,
deliberate limitation.

---

## 3. Debugging via screenshots

Several rounds of debugging were done by screenshotting the running app and
asking AI to confirm a fix or explain observed behavior, rather than
requesting changes blindly.

**Prompt:**
> "[Screenshot] Why doesn't the error message disappear when I clear the
> quantity field?"

**What AI found:** The submit-time error (`fieldError`/`fieldErrorProductId`
in `App.tsx`) was only cleared inside `handleAdd`, not when the input value
itself changed — so a stale error message would persist even after the user
fixed their input.

**What I did:** Verified the fix (clearing the error inside
`handleQuantityChange` when the edited product matches the errored one) by
re-testing the exact scenario from the screenshot before accepting it.

**Prompt:**
> "[Screenshot of a validation message showing '-1' in the quantity field]
> Is this the error you meant?"

**Outcome:** Confirmed the debounced live-validation was working as
intended, catching a negative-quantity edge case entered manually via the
keyboard (not through the +/- stepper, which is disabled at 0).

---

## 4. Feature additions

After the core requirements were working, I asked AI for suggestions on
what would make the app look more complete/professional, then picked which
ones to actually build:

**Prompt:**
> "What else can I add to the code to make it look more professional, or
> what feature can I add?"

**AI suggested (among others):** search/filter, sort, debounced live
validation, order history with persisted logging, loading skeletons, toasts,
idempotency keys for order submission, frontend unit tests.

**My decision:** I selected three: **search & sort**, **debounced live
quantity validation**, and **order history logging to `orders.json`** — a
deliberately small, coherent set rather than every suggestion, to keep the
scope focused and each feature fully working rather than half-implemented.

**Prompt (implementation):**
> "Let's implement search and filtering, form-level validation with
> debounce, and logging orders to a separate `orders.json` — let's do this."

**What I reviewed carefully before accepting:**
- The debounce hook (`useDebounce.ts`) — simple and correct, accepted as-is.
- The refactor of `ProductList` into a per-card component was necessary
  (hooks can't be called inside `.map()`), which I confirmed by checking why
  the original flat-map version wouldn't work with per-card debounce state.
- The `orders.json` logging approach — I reviewed that it appends after
  stock mutation succeeds (not before), consistent with the existing
  validate-then-mutate pattern already in `orderService.ts`.

**Prompt (order history feature):**
> "Let's implement Order History and sorting."

**What I caught myself:** After integrating the updated `App.tsx`, I
noticed the "New Order" view and "Order History" view were rendering
simultaneously instead of being mutually exclusive tabs. I flagged this
specifically and had it corrected, then tested the tab-switching manually
to confirm the two views were properly isolated.

---

## 5. Testing

Backend tests (`orderService.test.ts`) were reviewed with AI to confirm
coverage of all business rules from the spec:
- Order creation reduces stock.
- 10% discount applied above £100.
- Rejects a non-existent product.
- Rejects zero/negative/non-integer quantities.
- Rejects an order exceeding available stock.
- Rejects ordering a zero-stock product.

Manual UI testing was done end-to-end by hand for every rule (search,
sort, live validation, stock+cart interaction, discount boundary at exactly
£100, order history) — I wrote and followed my own test checklist rather
than relying solely on AI-suggested test cases, so I could personally
explain and reproduce every scenario.

---

## Summary of what AI contributed vs. what I decided

| Area | AI contribution | My contribution |
|---|---|---|
| Architecture & structure | Discussed tradeoffs of JSON-file storage vs. a real DB | Made the final call on folder layout and on centralizing all validation in one service file |
| Business logic bugs | Identified cart+stock double-counting bug, missing `Array.isArray` check, JSON parse error handling | Verified each fix against manual test cases before accepting; caught a second instance of the stock bug in `ProductList.tsx` myself |
| Feature scope | Suggested a list of possible features | Chose which 3 to implement, to keep scope focused |
| Feature implementation | Wrote first-pass code for debounce hook, search/sort logic, order history component/route | Reviewed line-by-line, caught a tab-rendering logic error introduced during integration, tested each feature manually |
| Testing | Confirmed test coverage against spec | Wrote the manual end-to-end test checklist and executed it personally |