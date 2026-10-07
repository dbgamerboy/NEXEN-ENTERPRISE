/* NEXEN Demo Build: all sample data lives here. Every number is SAMPLE data for the demo, not a result or an earnings claim. */
window.NEXEN_DATA = {
  videos: [
    { t: "Day 1: What NEXEN does", len: "4:10", xp: 50, say: "NEXEN bundles the latest AI money workflows so you start with results, not research." },
    { t: "Pick your industry", len: "3:25", xp: 50, say: "Choose an industry and NEXEN hands you the exact n8n workflows for it." },
    { t: "Run your first workflow", len: "5:40", xp: 80, say: "Press run once by hand. After proof it becomes a one tap automation." },
    { t: "Meet MARVIN", len: "2:55", xp: 40, say: "MARVIN speaks your next step out loud and explains why it matters." },
    { t: "Level up and unlock bosses", len: "6:05", xp: 100, say: "Finish dungeons to unlock new workflows and bigger automations." }
  ],
  industries: [
    { id: "re", name: "Real Estate Flip", icon: "🏠", wf: [
      ["Undervalued Property Scout", 7, "Compares asking price with sold comps and flags deals."],
      ["Buyer List Builder", 6, "Finds investors who bought similar homes nearby."],
      ["Offer Letter Drafter", 4, "Drafts offers for your approval. Nothing sends alone."]] },
    { id: "clip", name: "Podcast & Stream Clipping", icon: "🎬", wf: [
      ["Link to Clips Pipeline", 9, "Downloads at 1080p, cuts scored 9:16 clips with captions."],
      ["Clip Bounty Discovery", 8, "Ranks open clipping campaigns by payout and fit."],
      ["Review Queue Publisher", 5, "Queues clips for your yes before anything posts."]] },
    { id: "arb", name: "Service Arbitrage", icon: "🧰", wf: [
      ["Local Offer Finder", 6, "Finds services nearby businesses already pay for."],
      ["Intake and Delivery Bot", 8, "Handles forms, delivery and invoice reminders."],
      ["Review Request Loop", 4, "Asks happy clients for reviews automatically."]] },
    { id: "lead", name: "Lead Generation", icon: "📞", wf: [
      ["Ideal Buyer Lead Scout", 7, "Scores public leads by fit with a one line reason."],
      ["Outreach Drafts for Approval", 5, "Writes the email, you tap approve."],
      ["Follow-up Scheduler", 4, "Reminds you who to call or email next."]] },
    { id: "start", name: "Startup Scouting", icon: "🚀", wf: [
      ["Launch Board Watcher", 6, "Tracks new launches that match your thesis."],
      ["Founder Shortlist Weekly", 5, "A weekly list of founders worth a call."],
      ["Deal Memo Drafter", 6, "One page memo on each shortlisted company."]] },
    { id: "ecom", name: "Dropshipping / UGC Ads", icon: "📦", wf: [
      ["Product Research Engine", 9, "Scores products by demand and margin."],
      ["15s UGC Ad Draft (review only)", 3, "Drafts a short ad script and shot list."],
      ["Order Status Replier", 4, "Answers where-is-my-order messages."]] },
    { id: "music", name: "Music & Content", icon: "🎵", wf: [
      ["Virality and Music Research", 9, "Finds sounds and formats gaining traction."],
      ["Content Calendar Builder", 5, "Plans a month of posts per channel."],
      ["Skills to Offer Interview", 5, "Turns what you know into an offer and content."]] },
    { id: "side", name: "Simple Side Hustles", icon: "💡", wf: [
      ["Hustle Idea Ranker", 4, "Ranks small hustles by effort and payoff."],
      ["Faceless Short-Form Pipeline", 8, "Script, voice, captions, export."],
      ["Daily Next Step Notifier", 3, "One task per day, spoken by MARVIN."]] }
  ],
  courses: [
    { id: "c1", tier: "Tier 1", name: "Small Side Hustles", lessons: 12, blurb: "Ideas you can start from your room this week." },
    { id: "c2", tier: "Tier 2", name: "Service Arbitrage", lessons: 18, blurb: "Resell automated services to local businesses." },
    { id: "c3", tier: "Tier 3", name: "Real Estate Buy & Flip", lessons: 24, blurb: "Find, offer, flip, with scouts and buyer lists." }
  ],
  votes: [
    { id: "v1", name: "Faceless YouTube Channels", n: 128 },
    { id: "v2", name: "AI Receptionist for Local Shops", n: 164 },
    { id: "v3", name: "Newsletter Sponsorship Flipping", n: 97 }
  ],
  plans: {
    Starter: ["3 industries", "Onboarding videos", "Community channel"],
    Pro: ["All industries", "Pick 2 courses", "Monthly hustle vote", "New workflows every update"],
    Denizen: ["Everything in Pro", "Denizen agent swarm", "Priority workflow requests", "VR room early access"]
  },
  approvals: [
    { id: "a1", t: "Post 3 clips to your channel", why: "Review file ready, captions checked" },
    { id: "a2", t: "Send 12 outreach emails", why: "Drafts scored 80+ fit, you read them first" },
    { id: "a3", t: "Spend $0, start free trial of a tool", why: "No card needed, cancel anytime" }
  ],
  nextActions: [
    { t: "Watch video 2: Pick your industry", why: "It unlocks the exact workflows for your hustle.", xp: 40 },
    { t: "Install the Link to Clips Pipeline", why: "One install gives you your first automated output.", xp: 60 },
    { t: "Approve the 3 queued clips", why: "Nothing posts without your yes, so this is the gate.", xp: 30 },
    { t: "Beat the dungeon boss", why: "A boss kill unlocks a new workflow.", xp: 120 }
  ],
  feed: [
    ["ClipperAgent", "cut 6 clips from the sample podcast, best score 87"],
    ["LeadScout", "found 14 leads matching your ideal buyer, top fit 92"],
    ["PropertyScout", "flagged 3 homes priced 11 to 18 percent under nearby comps"],
    ["StartupScout", "shortlisted 2 founders from this week's launches"],
    ["Translator", "localized the pitch into 7 languages"],
    ["RetentionLab", "variant B holds viewers 14 percent longer than variant A"],
    ["CircuitBreaker", "upload stalled, rerouted to the outbox, retry queued"],
    ["Approvals", "3 items waiting for your yes"]
  ],
  swarm: {
    Startups: { cols: ["Company", "Stage", "Fit"], rows: [["Northwind Robotics", "Seed", 91], ["Lumen Health", "Pre-seed", 86], ["Brightloop AI", "Seed", 82], ["Tidewater Pay", "Series A", 77]] },
    Leads: { cols: ["Lead", "Role", "Fit"], rows: [["Maya R.", "Owner, dental clinic", 93], ["Dev P.", "Founder, e-bike shop", 88], ["Lena K.", "GM, auto detailing", 84], ["Omar T.", "Owner, roofing", 80]] },
    Properties: { cols: ["Address", "Ask vs comps", "Buyers"], rows: [["112 Alder St", "-17%", 6], ["48 Birch Ln", "-13%", 4], ["905 Cedar Ct", "-11%", 7], ["27 Dune Rd", "-9%", 3]] },
    "Podcast Clips": { cols: ["Moment", "Length", "Score"], rows: [["The hook at 12:04", "0:31", 87], ["Story about the first sale", "0:42", 84], ["Hot take on pricing", "0:27", 81], ["Closing advice", "0:35", 76]] },
    Niches: { cols: ["Niche", "Best tag", "Competition"], rows: [["AI for dentists", "#aiautomation", "Low"], ["Home flipping diary", "#flipping", "Medium"], ["Local SEO tips", "#localseo", "Low"], ["Faceless finance", "#moneytok", "High"]] }
  },
  languages: {
    es: ["Español", "Elige tu industria, recibe los flujos exactos y deja que la IA haga el trabajo repetitivo."],
    fr: ["Français", "Choisissez votre secteur, recevez les workflows exacts et laissez l'IA gérer le travail répétitif."],
    pt: ["Português", "Escolha seu setor, receba os fluxos exatos e deixe a IA cuidar do trabalho repetitivo."],
    de: ["Deutsch", "Wähle deine Branche, erhalte die genauen Workflows und lass die KI die Routinearbeit erledigen."],
    ja: ["日本語", "業界を選ぶだけで、最適なワークフローが届き、AIが繰り返し作業を代行します。"],
    ar: ["العربية", "اختر مجالك، واحصل على سير العمل المناسب، ودع الذكاء الاصطناعي ينجز المهام المتكررة.", "rtl"],
    hi: ["हिन्दी", "अपना उद्योग चुनें, सटीक वर्कफ़्लो पाएँ, और दोहराए जाने वाले काम AI पर छोड़ दें।"]
  },
  pitch: "Pick your industry, get the exact workflows, and let AI handle the repetitive work.",
  roadmap: [
    { v: "V3", t: "Command HUD", d: "The red triple-screen command center with MARVIN.", s: "shipped" },
    { v: "V4", t: "Industry Workflow Packs", d: "One tap installs for every industry you pick.", s: "shipped" },
    { v: "V5", t: "Denizen Swarm", d: "Agents that scout startups, leads, homes and clips.", s: "demo" },
    { v: "V6", t: "NEXEN RPG", d: "Dungeons, bosses and quests that wrap your real tasks.", s: "demo" },
    { v: "V7", t: "Global Marketplace", d: "Translate, market and sell workflows between countries.", s: "planned" },
    { v: "V8", t: "VR Home", d: "Your goals float in the room, your house becomes your game interior.", s: "planned 2027" }
  ],
  dungeon: { name: "The Backlog Crypt", tasks: ["Reply to 5 leads", "Approve 3 clips", "Install a workflow", "Run the ROI check"], boss: "Boss: Procrastination Wyrm", bossHp: 100 },
  marvinLines: {
    crit: "Critical strike. Boss down. New workflow unlocked.",
    levelup: "Level up. Keep going."
  },
  chat: [
    [/money|fast|today/i, "Fastest move today: install the Link to Clips Pipeline, approve the 3 queued clips, then run the ROI check on it. That is about 20 minutes. (sample data)"],
    [/block|stuck|stall/i, "One blocker: 3 approvals are waiting on you. Open the Approvals card and tap Approve or Deny. Everything else is moving."],
    [/startup|invest/i, "StartupScout shortlisted 4 companies. Open the Swarm card, tab Startups, and press Run swarm to refresh the list."],
    [/lead|customer|buyer/i, "LeadScout has 4 leads scored 80+. Drafts are ready for your approval, nothing sends on its own."],
    [/house|propert|flip|real estate/i, "PropertyScout flagged 3 homes under nearby comps and matched buyers. Check Swarm, tab Properties."],
    [/youtube|clip|podcast/i, "Pick Podcast & Stream Clipping under Choose your industry, install the pipeline, then approve the clips it makes."],
    [/translate|language|global/i, "Open Go Global, pick a language and press Translate pitch. 7 languages are loaded in this demo."],
    [/game|dungeon|boss|rpg/i, "Open NEXEN RPG and press Attack task. The last task is the boss. A critical strike unlocks a workflow."],
    [/hello|hi|hey/i, "MARVIN online. Ask what to do today, what is blocking you, or tell me your industry."]
  ],
  chatDefault: "I can answer from sample data in this demo. Try: money move today, what is blocking me, find me a startup, translate my pitch.",
  retention: {
    ours: [100, 92, 85, 79, 74, 70, 66, 63, 60, 58],
    theirs: [100, 86, 74, 65, 58, 52, 47, 43, 40, 37]
  }
};

/* Guided tour. One entry per highlighted button; the same list builds docs/TUTORIAL.md. */
window.NEXEN_TOUR = [
  { sel: "#tour-btn", screen: null, name: "Tutorial", does: "Starts this guided tour. Each button is spotlighted with a note on what it does." },
  { sel: "#hl-btn", screen: null, name: "Highlight all", does: "Outlines and numbers every clickable button on all three screens at once. Press again to hide." },
  { sel: "#arr-r", screen: null, name: "Side arrows", does: "On phones and small windows the three screens sit side by side. The side arrows slide to the next or previous screen." },
  { sel: "#onb-play-0", screen: 0, name: "Play onboarding video", does: "Opens the first onboarding video. Watch it and press Mark watched to earn XP." },
  { sel: "#ind-chips .chip:nth-child(2)", screen: 0, name: "Choose your industry", does: "Pick an industry chip. The list below changes to the exact n8n workflows for that industry." },
  { sel: "#wf-list .wf:first-child .btn", screen: 0, name: "Install workflow", does: "Adds the workflow to your Installed list and the Workflows live counter." },
  { sel: "#course-0", screen: 0, name: "Pick a course", does: "Courses come prebundled. Pick any 2 of the 3 tiers. The third locks until you swap." },
  { sel: "#vote-0", screen: 0, name: "Monthly vote", does: "Vote for the next hustle added to the subscription for free. One vote per month, bars update live." },
  { sel: "#plan-tabs .tab:nth-child(3)", screen: 0, name: "Plan perks", does: "Switch between Starter, Pro and Denizen to see the perks. Subscribe is a demo and charges nothing." },
  { sel: "#roi-run", screen: 0, name: "Score workflow", does: "Runs the Golden Math: profit, ROI and repeatability decide Scale, Hold or Kill. Uses the live backend when it is running." },
  { sel: "#voice", screen: 1, name: "MARVIN voice", does: "Toggles spoken replies. MARVIN reads each answer out loud and announces boss kills." },
  { sel: "#chat-send", screen: 1, name: "Send to MARVIN", does: "Sends your question. MARVIN answers from the sample data in this demo." },
  { sel: "#quick .quick:first-child", screen: 1, name: "Quick question", does: "One tap questions: money move today, what is blocking me, find a startup." },
  { sel: "#next-do", screen: 1, name: "Do it", does: "Completes the one next action MARVIN gave you, awards XP and shows the next step." },
  { sel: "#appr-0 .ok", alt: "#appr-0", screen: 1, name: "Approve", does: "Anything that posts, sends or spends waits here. Approve or Deny with one tap." },
  { sel: "#rec-toggle", screen: 1, name: "Agent recording", does: "Starts or pauses the live feed that shows what the agents are doing right now." },
  { sel: "#wf-run", screen: 1, name: "Run workflow", does: "Runs an installed workflow and streams its steps into the log, ending with a result." },
  { sel: "#brain-go", screen: 1, name: "Brain search", does: "Searches the vector database. Live backend uses your vector DB, otherwise the bundled sample." },
  { sel: "#atk", screen: 2, name: "Attack task", does: "Each hit finishes one task in the dungeon. The last hit on the boss is a critical strike that unlocks a workflow." },
  { sel: "#qr-gen", screen: 2, name: "Login QR", does: "Shows the demo QR pattern used to log into the game. Real login is not part of the demo." },
  { sel: "#swarm-tabs .tab:nth-child(2)", screen: 2, name: "Swarm tabs", does: "Switch scouts: startups, leads, properties, podcast clips, niches." },
  { sel: "#swarm-run", screen: 2, name: "Run swarm", does: "Sends the scouts out and refreshes the table with new sample finds." },
  { sel: "#tr-go", screen: 2, name: "Translate pitch", does: "Translates the pitch into the language you pick. 7 languages in the demo." },
  { sel: "#ab-run", screen: 2, name: "Run A/B test", does: "Draws retention curves for your video against a competitor and shows the lift." },
  { sel: "#vr-open", screen: 2, name: "Preview VR room", does: "Opens a preview of the 2027 VR home with your goals floating in the room." },
  { sel: "#den", screen: 2, name: "Denizen mode", does: "Turns on Denizen. Agent counts and feed speed double, so you see the swarm at full power." }
];
