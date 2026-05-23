// DonoAI demo seed.
// Acme Bank + 4 employees + 8 banking-realistic knowledge items.
// Safe to re-run — wipes and repopulates.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const ORG_ID = "org_acmebank";

const USERS = [
  {
    id: "u_sarah",
    email: "sarah@acmebank.test",
    name: "Sarah Chen",
    role: "ADMIN" as const,
    department: "Compliance",
  },
  {
    id: "u_marcus",
    email: "marcus@acmebank.test",
    name: "Marcus Park",
    role: "EMPLOYEE" as const,
    department: "Customer Service",
  },
  {
    id: "u_priya",
    email: "priya@acmebank.test",
    name: "Priya Sharma",
    role: "EMPLOYEE" as const,
    department: "Loan Origination",
  },
  {
    id: "u_diego",
    email: "diego@acmebank.test",
    name: "Diego Rodriguez",
    role: "EMPLOYEE" as const,
    department: "Branch Operations",
  },
];

type Seed = {
  authorId: string;
  title: string;
  type: "WORKFLOW" | "DOCUMENT" | "CASE" | "BEST_PRACTICE" | "TIP";
  tags: string[];
  summary: string;
  content: string;
};

const KNOWLEDGE: Seed[] = [
  {
    authorId: "u_sarah",
    title: "Filing a Suspicious Activity Report (SAR)",
    type: "WORKFLOW",
    tags: ["compliance", "AML", "SAR", "BSA"],
    summary:
      "Step-by-step process for filing a SAR within the 30-day FinCEN deadline. Covers triggers, documentation, escalation, and post-filing review.",
    content: `# Filing a Suspicious Activity Report (SAR)

## When to file
File a SAR within 30 calendar days of detecting the suspicious activity. Common triggers:
- Aggregated transactions of $5,000+ involving funds from illegal activity
- Transactions designed to evade BSA reporting (structuring)
- Insider abuse of any dollar amount
- Computer intrusion or cybercrime
- Identity theft or account takeover

## The process
1. **Document the activity.** In our case management system, create a SAR Case linked to the customer ID. Attach all transaction records, IDs reviewed, and any communications.
2. **Notify your BSA Officer within 24 hours.** Use the encrypted internal channel only. NEVER notify the customer or tip them off — that is a federal crime.
3. **Draft the narrative.** The Five W's: Who, What, When, Where, Why. Be specific; avoid hedging language. Quantify amounts and counts.
4. **Have a second reviewer.** All SARs need a peer sign-off before submission.
5. **File via the BSA E-Filing System.** Save the confirmation number on the case.
6. **Record retention.** Keep all SAR documentation for 5 years from the filing date in the secure compliance archive.

## After filing
- Continue monitoring the account; activity may continue and require continuing-activity SARs every 90 days.
- Do NOT close the account solely because a SAR was filed unless directed by Compliance.

## Common mistakes
- Vague narratives ("customer seemed nervous") without supporting facts.
- Missing the 30-day window — start the clock from *detection*, not from when you started the investigation.
- Tipping off the customer with a casual comment ("we're reviewing your account").`,
  },
  {
    authorId: "u_sarah",
    title: "Customer KYC verification — Enhanced Due Diligence",
    type: "WORKFLOW",
    tags: ["KYC", "compliance", "onboarding", "EDD"],
    summary:
      "When standard KYC isn't enough. Triggers for EDD, additional documentation required, and how to handle PEPs and high-risk geographies.",
    content: `# Enhanced Due Diligence (EDD)

EDD is required when standard KYC flags a higher risk profile.

## Triggers
- Customer is a Politically Exposed Person (PEP) or close associate
- Beneficial owner from a FATF high-risk jurisdiction
- Cash-intensive business (check casher, MSB, marijuana-related)
- Private banking relationship over $500K
- Customer requested unusual products (foreign bearer instruments, complex trust structures)

## Additional documentation required
1. Source of wealth statement (signed)
2. Source of funds for opening deposit (bank statements, sale of asset documentation)
3. Beneficial ownership chart down to all 25%+ owners
4. Reference letters from at least one other regulated financial institution
5. Sanctions screening across all parties — re-run quarterly thereafter

## PEPs
PEPs require ongoing monitoring at least every 90 days. Document all transactions over $10K with a written explanation. Senior management sign-off is required to open the account.

## Approval chain
Branch officer → Compliance Officer → BSA Officer → for PEPs and SDN-adjacent: AML Committee.

Never short-circuit this chain "just to keep a customer."`,
  },
  {
    authorId: "u_marcus",
    title: "Wire transfer dispute — incoming wire sent to wrong account",
    type: "CASE",
    tags: ["wires", "dispute", "operations", "recall"],
    summary:
      "Real case: incoming domestic wire credited to wrong account due to mismatched account number/name. Resolution took 4 business days using a wire recall request.",
    content: `# Case: Misdirected incoming wire — $42,000

**Date:** March 2026
**Customer:** Business depositor, contractor industry
**Issue:** Customer reported their expected $42,000 wire from a project payor never arrived.

## What we found
The originating bank's wire used the correct account number but the wrong beneficiary name (an old DBA). Our system's name/account match defaulted to *credit by account number*, so the funds posted to a stale account belonging to a different customer.

## Resolution sequence
1. Day 1, morning: Customer call → opened operations ticket OPS-2026-3041.
2. Day 1, afternoon: Confirmed via Fedwire trace that the wire posted to account #XXXX-9182.
3. Day 1, end of day: Verified with the receiving account holder, who confirmed they did not expect the funds. They consented to a debit reversal in writing (email + e-signature).
4. Day 2: Operations executed the debit reversal and processed an internal transfer to the correct account.
5. Day 3: Customer called to confirm receipt. Issue closed.
6. Day 4: Filed an internal incident report and reviewed the name/account matching policy with Operations.

## What we'd do differently
- The receiving account holder was cooperative. If they had not consented, we would have had to initiate a formal recall via Fedwire, which takes 5–10 business days and is not guaranteed.
- The policy of crediting on account number alone is the root cause. We've flagged this for review.

## Lessons for staff
Always pause and verify when an unexpected wire posts to a low-activity account. The few minutes you spend can save four days of remediation later.`,
  },
  {
    authorId: "u_priya",
    title: "Mortgage application — required document checklist",
    type: "DOCUMENT",
    tags: ["mortgage", "lending", "underwriting"],
    summary:
      "Complete list of documents required to underwrite a residential mortgage application. Covers W-2 borrowers, self-employed, and gift fund scenarios.",
    content: `# Residential Mortgage — Document Checklist

## Identification (all borrowers)
- Government-issued photo ID (driver's license, passport)
- Social Security card or ITIN documentation

## Income — W-2 employee
- Two most recent pay stubs (covering 30 days)
- W-2s for the most recent two years
- Verbal Verification of Employment (VVOE) within 10 days of closing

## Income — self-employed
- Two years of personal federal tax returns, signed
- Two years of business federal tax returns (1120, 1120S, or 1065), signed
- YTD profit & loss statement, signed
- YTD balance sheet
- CPA letter confirming business operations (within 30 days)

## Assets
- Two months of bank statements for all accounts used for down payment and reserves
- 60-day average balance for investment accounts
- Source-of-funds explanation for any deposit exceeding 50% of monthly gross income

## Gift funds
- Gift letter signed by donor, with relationship and statement of no repayment
- Donor's bank statement showing source of gift
- Copy of the gift check or wire transfer
- Bank statement showing receipt of gift by borrower

## Property
- Purchase contract, fully executed
- Earnest money deposit receipt
- Homeowner's insurance binder (binder; full policy required before closing)
- HOA documents if applicable

## Tips
- Pull credit only once authorized. Re-pulls within 30 days don't damage score further.
- Self-employed borrowers: anticipate 2x the documentation cycle. Set expectations Day 1.`,
  },
  {
    authorId: "u_marcus",
    title: "Handling debit card fraud claims under Regulation E",
    type: "WORKFLOW",
    tags: ["fraud", "Reg-E", "disputes", "cards"],
    summary:
      "Reg E timeline: 10 business days to provisionally credit, 45 days to resolve (90 days for POS or foreign). Step-by-step claim intake and documentation.",
    content: `# Regulation E Debit Card Dispute Handling

## Timeline (memorize)
- Day 0: Customer reports
- Day 10: We MUST provisionally credit (extends to 20 if account is new — < 30 days old)
- Day 45: Resolution required (90 for POS or foreign-originated)

## Intake (within first business day)
1. Pull up customer in core system, verify identity per call-back procedure
2. Open dispute case in DisputeIQ, capture:
   - Card number (mask last 4)
   - Transaction date, merchant, amount
   - Was card in customer's possession? (yes/no — this determines fraud vs. dispute type)
   - Was PIN used?
   - Reason customer disputes the transaction
3. Send the customer the dispute form via secure email. They have 60 days from statement date to dispute — but they may dispute up to 120 days for unauthorized transfers.

## Card actions
- If FRAUD (card lost/stolen/compromised, or PIN compromised): immediately HOT-list the card, issue a new card same day.
- If DISPUTE (legitimate transaction but customer disputes the charge): do NOT close the card unless they request it.

## Provisional credit
By day 10, even if investigation incomplete:
- Credit the disputed amount plus any related fees (NSF, OD) that the disputed transaction caused
- Note the credit as PROVISIONAL in the customer's statement narrative

## Investigation
- Pull merchant chargeback through MasterCard/Visa networks
- Request signed receipts for swipe transactions
- For card-not-present: compare shipping address to customer addresses on file
- Document EVERY conversation and finding

## Resolution
- If FOUND IN FAVOR of customer: convert provisional to permanent credit, send written notice
- If FOUND IN FAVOR of merchant: reverse provisional credit, send written explanation, give the customer 5 business days notice before reversal

## Mistakes to avoid
- Forgetting to credit related fees (compliance audit finding last year)
- Closing the case before the 45/90-day clock runs out
- Sending denial letters without the specific reason code`,
  },
  {
    authorId: "u_diego",
    title: "End-of-day cash recon — TIP from 6 years on the teller line",
    type: "TIP",
    tags: ["operations", "cash", "teller", "reconciliation"],
    summary:
      "Quick mental checklist for diagnosing common cash recon variances. If you can rule these out in 5 minutes, escalate to your supervisor — don't burn an hour.",
    content: `# End-of-day cash recon — quick triage

If your drawer is off, walk through these in order BEFORE doing a full bill-by-bill recount:

1. **Check the strap denominations.** Most $100 variances are a $100 strap that's actually $1,000 (or vice versa) because someone grabbed the wrong band.
2. **Look for unposted transactions.** Check your terminal queue. A buy/sell with the vault that didn't post is the #1 cause of "exactly $X,000" variances.
3. **Check coin.** A box of pennies is $25; a box of dimes is $250. People mix these up under pressure.
4. **Re-count just the highest denominations.** A miscount of $100 bills accounts for ~70% of variances; rarely is it the small bills.
5. **Check your foreign currency drawer separately.** Easy to lump it in by accident.

If those five checks don't find it in 5 minutes, stop and ask your supervisor. We had a teller spend 90 minutes hunting a $20 variance last year only to discover the system was double-counting a vault buy — not human error.

## Final tip
Date your strap bands. When you find a strap that's wrong tomorrow, you'll know it came from yesterday.`,
  },
  {
    authorId: "u_priya",
    title: "Best practice: explaining adverse action to a declined applicant",
    type: "BEST_PRACTICE",
    tags: ["lending", "ECOA", "communication", "compliance"],
    summary:
      "Required under Reg B / ECOA: notify the applicant within 30 days with specific reasons. How to phrase the call empathetically while staying compliant.",
    content: `# Adverse Action Notices — saying "no" right

## What the regulation requires
Under Regulation B (ECOA), you must send written notice within 30 days of an adverse action with:
- The specific reasons for the action (not just a checkbox)
- The credit bureau used and its contact info
- Notice of right to a free credit report
- The ECOA Equal Credit Opportunity statement

## How to handle the call
You usually don't have to make the call — the letter satisfies the legal requirement. But for relationship customers, a call before the letter arrives is the right thing.

### Script
*"I wanted to call you before our formal letter arrives. Unfortunately we weren't able to approve your loan request, and I want you to hear the reasons directly from me. The biggest factor was [specific reason: debt-to-income ratio at 51%, recent late payments, insufficient credit history]. I know that's not the answer you were hoping for."*

Pause. Let them respond.

*"Here's what I'd suggest if you want to revisit this in 6–12 months: [specific actions tied to the reason]. We'd be happy to talk again then."*

## What NOT to say
- "Your credit score was too low." (vague; not the actual reason)
- "Our policy doesn't allow…" (impersonal; doesn't explain the WHY)
- Any reference to a prohibited basis (race, gender, age, marital status, national origin, religion, receipt of public assistance)

## What TO say
- Be specific (DTI, length of employment, collateral value, etc.)
- Tie reasons to credit factors the applicant can act on
- Offer a path forward if there is one
- Document the conversation in the loan file`,
  },
  {
    authorId: "u_marcus",
    title: "Customer call — large unexpected withdrawal request",
    type: "CASE",
    tags: ["fraud", "elder", "customer-service", "scams"],
    summary:
      "Case: 78-year-old customer requested $15,000 cash withdrawal, said it was for 'home repairs' — turned out to be a grandparent scam in progress. We saved her funds by slowing down and asking the right questions.",
    content: `# Case: $15,000 cash withdrawal — grandparent scam intercepted

## What happened
A long-time customer (78, lives alone) came to the branch on a Tuesday morning visibly agitated. Requested $15,000 in cash for "home repairs."

## Red flags I noticed
- Highly unusual amount for her — her largest cash withdrawal in 5 years had been $2,000
- Repeated checking her phone during the conversation
- Vague about which contractor and which repairs
- Said she "needed it within the hour"
- When I asked normal followup questions she became defensive

## What I did
I followed our elder financial exploitation protocol:
1. **Slowed down.** Told her there'd be a 20-minute hold while we prepared cash that large (true — we don't keep $15K in the drawer).
2. **Pulled her into a private office** under the cover story of paperwork.
3. **Asked the open-ended question:** "Tell me about who's getting paid — I want to make sure your money goes where it should."
4. She mentioned a phone call earlier that morning from someone claiming to be her grandson — said he was in jail in Mexico and needed bail money wired through a "lawyer."

## Resolution
- I confirmed the actual grandson was at work in Cleveland (with her permission, called his mother).
- Documented the attempted scam.
- Filed a SAR per our elder exploitation policy.
- Reported to Adult Protective Services with her consent.
- Walked her through how to recognize the same scam variations (gift cards, wire transfer, crypto).

## Lessons
- A large unusual cash request from an elderly customer is a red flag. ALWAYS pull them into private space.
- "I need it within the hour" is a scammer's signature pressure tactic.
- The hold-cash-for-prep cover story is a clean way to slow down without sounding accusatory.
- Have an actual reason ready ("I need to verify your address for the cash withdrawal log") — not just "wait here."`,
  },
];

async function wipe() {
  await db.message.deleteMany();
  await db.conversation.deleteMany();
  await db.weeklyReport.deleteMany();
  await db.knowledgeItem.deleteMany();
  await db.user.deleteMany();
  await db.organization.deleteMany();
}

async function main() {
  console.log("→ wiping");
  await wipe();

  console.log("→ creating org");
  await db.organization.create({
    data: { id: ORG_ID, name: "Acme Bank", slug: "acme" },
  });

  console.log("→ creating users");
  const passwordHash = await bcrypt.hash("demo", 10);
  for (const u of USERS) {
    await db.user.create({
      data: {
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        department: u.department,
        passwordHash,
        orgId: ORG_ID,
      },
    });
  }

  console.log(`→ creating ${KNOWLEDGE.length} knowledge items`);
  const now = Date.now();
  for (let i = 0; i < KNOWLEDGE.length; i++) {
    const k = KNOWLEDGE[i];
    await db.knowledgeItem.create({
      data: {
        orgId: ORG_ID,
        authorId: k.authorId,
        title: k.title,
        content: k.content,
        summary: k.summary,
        type: k.type,
        tags: JSON.stringify(k.tags),
        // Spread creation across last 30 days for realistic ordering
        createdAt: new Date(now - (KNOWLEDGE.length - i) * 86400_000 * 3),
      },
    });
  }

  console.log("→ seeding one previous conversation for Marcus");
  const conv = await db.conversation.create({
    data: {
      userId: "u_marcus",
      title: "How to file a SAR",
    },
  });
  await db.message.createMany({
    data: [
      {
        conversationId: conv.id,
        role: "USER",
        content: "What's the timeline for filing a SAR?",
      },
      {
        conversationId: conv.id,
        role: "ASSISTANT",
        content:
          "You have 30 calendar days from the date you detect the suspicious activity to file the SAR with FinCEN. See [K1] for the full workflow including documentation, peer review, and post-filing monitoring.",
        citations: JSON.stringify(["__knowledge_id_to_be_replaced__"]),
      },
    ],
  });

  console.log("\n✓ seed complete");
  console.log("  Admin:    sarah@acmebank.test / demo");
  console.log("  Employee: marcus@acmebank.test / demo");
  console.log("  Employee: priya@acmebank.test / demo");
  console.log("  Employee: diego@acmebank.test / demo\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
