import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight, Wifi, Users, BarChart3, Calendar, Star, Shield, Zap, Globe, QrCode, MapPin, Wallet, Apple, Search } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import NFCTapMockup from "@/components/bingoo/NFCTapMockup";
import FeedbackSection from "@/components/bingoo/FeedbackSection";
import LandingDetailModal from "@/components/landing/LandingDetailModal";
import BrandIcon3D from "@/components/landing/BrandIcon3D";
import ProjectFutureSection from "@/components/landing/ProjectFutureSection";
import BingooLogo from "@/components/bingoo/BingooLogo";
import { BingooLogo as BingooWordmark } from "@/components/bingoo/ui/BingooBrand";
import { base44 } from "@/api/base44Client";
import { getLang, setLang, t } from "@/lib/i18n";

// ── Bingoo Brand Colors (official: Navy #0b2149 + Orange #f97316)
const B = {
  navy: "#0b2149",
  navyDark: "#071A3D",
  navyLight: "#13284f",
  orange: "#f97316",
  orangeLight: "#fb923c",
  gold: "#FDBA21",
  goldLight: "#FFD060",
  white: "#FFFFFF",
  slate: "#64748b"
};

const goSignIn = async () => {
  const authed = await base44.auth.isAuthenticated();
  if (authed) window.location.href = '/bingoo';
  else base44.auth.redirectToLogin('/bingoo');
};

const goActivate = async () => {
  const authed = await base44.auth.isAuthenticated();
  if (authed) window.location.href = '/activate-device';
  else base44.auth.redirectToLogin('/activate-device');
};

// Each feature card opens a detail panel (LandingDetailModal) with overview,
// use cases, what's implemented, why it matters, and CTA buttons.
const features = [
  {
    icon: <Wifi className="w-6 h-6" />,
    title: "NFC One-Tap Share",
    desc: "Tap your card or bracelet — instantly share your entire professional profile.",
    accent: B.navy,
    badge: "Core",
    subtitle: "Replace paper business cards with one tap",
    overview: "A visitor taps their phone against your Bingoo NFC card, keychain, bracelet, or sticker and your full digital profile opens instantly — no app to install, no link to type. Update your profile anytime and every tap reflects the change immediately.",
    useCases: [
      "Networking events and conferences — share your profile in seconds",
      "Salons, law offices and clinics — hand a card to every new client",
      "Countertop stands let visitors tap to view your services without typing"
    ],
    implemented: [
      "NFC cards, keychains, bracelets, stickers and desk stands",
      "Device activation flow that links a physical device to your profile",
      "Owner-managed device list with lost-mode and replacement support"
    ],
    whyItMatters: "Paper business cards get lost, outdated, and thrown away. One Bingoo device shares your entire, always-current professional identity — forever.",
    ctas: [{ label: "Get an NFC device", route: "/shop" }, { label: "See plans", route: "/plans" }]
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Real-Time Analytics",
    desc: "Track every profile view, link click, lead, and conversion in real-time.",
    accent: B.orange,
    badge: "Dashboard",
    subtitle: "See what's working and what to improve",
    overview: "Your dashboard shows live profile views, link clicks (WhatsApp, phone, email, social), QR scans, NFC taps, leads and appointments — broken down by source and device so you know which profiles and campaigns perform best.",
    useCases: [
      "Compare which NFC device or QR placement drives the most views",
      "Track which social links get clicked most by visitors",
      "Measure how many profile views turn into leads and bookings"
    ],
    implemented: [
      "Profile view, tap, scan and link-click tracking",
      "Per-profile and per-device breakdowns",
      "Recent activity feed and engagement trend charts"
    ],
    whyItMatters: "You can't grow what you can't measure. Bingoo analytics turn every tap and click into a decision about where to invest next.",
    ctas: [{ label: "See plans", route: "/plans" }, { label: "See plans", route: "/plans" }]
  },
  {
    icon: <Calendar className="w-6 h-6" />,
    title: "Appointment Booking",
    desc: "Let clients book directly from your profile. No back-and-forth emails.",
    accent: B.gold,
    badge: "Plan feature",
    subtitle: "Let clients book from your public profile",
    overview: "Visitors pick a date, time and service straight from your public profile and the request lands in your dashboard. You confirm, reschedule, or decline — and the client is notified. No phone tag, no scheduling software to buy separately.",
    useCases: [
      "Salons and barbers — clients book the stylist and service they want",
      "Law firms — prospects request consultations with intake details",
      "Medical offices and clinics — patients request appointments 24/7"
    ],
    implemented: [
      "Booking widget on the public profile (date, time, service, contact)",
      "Owner dashboard to confirm, reschedule, decline or mark completed",
      "Automatic appointment notifications and reminders"
    ],
    whyItMatters: "Every missed call or email thread is a lost client. Letting visitors book themselves means you capture interest the moment it happens.",
    ctas: [{ label: "Start with this feature", route: "/plans" }, { label: "See plans", route: "/plans" }]
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Lead Generation CRM",
    desc: "Capture visitor info automatically and manage your pipeline from your dashboard.",
    accent: B.navy,
    badge: "Dashboard",
    subtitle: "Turn visitors into a managed pipeline",
    overview: "When a visitor submits their name, phone, email and interest on your profile, the lead is saved to your dashboard with its source (NFC, QR, profile, referral) and a status. You track follow-ups, add notes, and move leads through your pipeline.",
    useCases: [
      "Law firms — capture case type, urgency and consultation preferences",
      "Real estate — qualify buyers and sellers before the first call",
      "Salons and consultants — log every inquiry and never lose a follow-up"
    ],
    implemented: [
      "Lead capture form on the public profile",
      "Pipeline statuses: new, contacted, qualified, won, lost",
      "Internal CRM notes and lead source tracking"
    ],
    whyItMatters: "Most business cards get you a name and number in a pocket. Bingoo captures a structured lead the moment someone is interested, so nothing slips through the cracks.",
    ctas: [{ label: "See plans", route: "/plans" }, { label: "See plans", route: "/plans" }]
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "Multi-Language Profiles",
    desc: "Serve global clients with profiles in English, French, Arabic, and more.",
    accent: B.orange,
    badge: "Available",
    subtitle: "English and French today, more coming",
    overview: "Switch your profile language between English and French so visitors see your content in the language they're most comfortable with. More languages are planned as Bingoo expands across Africa and globally.",
    useCases: [
      "Consultants and agencies serving bilingual clients",
      "Businesses in multilingual regions (West Africa, Canada, Europe)",
      "International teams that want one profile per language"
    ],
    implemented: [
      "Profile language toggle (English / French)",
      "In-app language switcher in the dashboard and landing page"
    ],
    futureVision: "Arabic, Spanish and additional languages are on the roadmap, along with automatic visitor-language detection.",
    futureLabel: "Future vision",
    whyItMatters: "Visitors engage more when content speaks their language. Multi-language profiles help you win clients in every market you serve.",
    ctas: [{ label: "See plans", route: "/plans" }, { label: "Learn more", route: "/plans" }]
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Enterprise Security",
    desc: "Bank-level encryption, GDPR compliant, and built for law firms and medical offices.",
    accent: B.navy,
    badge: "Built-in",
    subtitle: "Owner-based access and private controls",
    overview: "Each profile belongs to its owner. Dashboard records (leads, appointments, analytics, devices) are private and only visible to the profile owner or admins. Public visitors only see what you choose to publish. Row-level security keeps every record scoped to its owner.",
    useCases: [
      "Law firms handling confidential client intake",
      "Medical offices protecting patient appointment data",
      "Corporate teams managing employee profiles centrally"
    ],
    implemented: [
      "Owner-scoped access to leads, appointments and analytics",
      "Admin-only controls for users, devices and billing",
      "Clear separation between public profile and private dashboard"
    ],
    whyItMatters: "Trust is everything for professionals. Bingoo keeps sensitive client data private while letting you share a public, always-on profile.",
    ctas: [{ label: "See plans", route: "/plans" }, { label: "See plans", route: "/plans" }]
  },
  {
    icon: <MapPin className="w-6 h-6" />,
    title: "Lost Item Mode",
    desc: "Attach a Bingoo profile to bags, keys, or pets so finders can report safely.",
    accent: B.orange,
    badge: "Available",
    subtitle: "Recover lost items without exposing private data",
    overview: "Assign a Bingoo NFC device to a suitcase, keychain, pet collar, or product. If someone finds it and taps, they see a lost-item page where they can report they found it — with their contact details and location — without ever seeing your private owner information.",
    useCases: [
      "Luggage and suitcases for travelers",
      "Keys, wallets and backpacks",
      "Pet collars so a found pet can be returned home",
      "Products and high-value assets"
    ],
    implemented: [
      "Lost-mode toggle per device from your dashboard",
      "Public lost-item report page (finder name, contact, message, location)",
      "Owner notifications when a finder reports a found item"
    ],
    whyItMatters: "A lost item is stressful. Bingoo gives finders a safe, private way to reach you — and gives you a real chance of getting it back.",
    ctas: [{ label: "Get an NFC device", route: "/shop" }, { label: "See plans", route: "/plans" }]
  },
  {
    icon: <QrCode className="w-6 h-6" />,
    title: "QR Code Sharing",
    desc: "Scannable profile access for flyers, menus, counters, events, and printed cards.",
    accent: B.gold,
    badge: "Available",
    subtitle: "Share your profile anywhere — no NFC needed",
    overview: "Every Bingoo profile includes a downloadable QR code. Print it on flyers, menus, business cards, storefronts, or event signs so anyone with a phone camera can open your profile instantly — even without an NFC tap.",
    useCases: [
      "Restaurant menus and reservation signs",
      "Salon counters and front-desk displays",
      "Event booths, flyers and printed marketing material"
    ],
    implemented: [
      "Profile QR code with your custom label",
      "Downloadable QR image with optional logo watermark",
      "Custom QR color to match your branding"
    ],
    whyItMatters: "Not everyone has NFC on their phone. A QR code makes your profile reachable from any printed surface, anywhere.",
    ctas: [{ label: "See plans", route: "/plans" }, { label: "See plans", route: "/plans" }]
  },
  {
    icon: <Wallet className="w-6 h-6" />,
    title: "Google Wallet",
    desc: "Save the digital profile pass to Google Wallet for easy sharing.",
    accent: B.navy,
    badge: "Available",
    subtitle: "Your profile pass, saved on Android",
    overview: "Owners can generate a Google Wallet pass from their dashboard. The pass carries their name, title, company, contact actions and QR code — so on Android devices, the profile is always one swipe away in the wallet, ready to share.",
    useCases: [
      "Professionals who want their profile pass alongside payment cards",
      "Teams issuing a consistent digital identity to every member",
      "Sharing your profile quickly from the Android wallet"
    ],
    implemented: [
      "Google Wallet pass generation from the dashboard (owner only)",
      "Pass includes name, title, company, contact and QR",
      "Branded pass design with Bingoo identity"
    ],
    whyItMatters: "A wallet pass means your professional identity lives where people already keep their most important cards — always available, always up to date.",
    ctas: [{ label: "See plans", route: "/plans" }, { label: "See plans", route: "/plans" }]
  },
  {
    icon: <Apple className="w-6 h-6" />,
    title: "Apple Wallet",
    desc: "Coming next — save the Bingoo profile pass to Apple Wallet on iPhone.",
    accent: B.slate,
    badge: "Coming next",
    subtitle: "Apple Wallet pass — in progress",
    overview: "Bingoo is preparing an Apple Wallet pass so iPhone owners can carry their digital profile pass in the Apple Wallet, just like the Google Wallet pass today. This requires an Apple Developer account and pass signing setup.",
    useCases: [
      "iPhone-toting professionals who want the pass in Apple Wallet",
      "Teams standardizing on one digital identity across iOS and Android",
      "Quick profile sharing from the iOS wallet"
    ],
    implemented: [
      "Apple Wallet pass generation backend (in development)",
      "Pass design aligned with the Google Wallet experience"
    ],
    futureVision: "Public Apple Wallet pass availability after Apple Developer signing is configured. Owners will see an 'Add to Apple Wallet' button next to the Google Wallet button.",
    futureLabel: "Coming next",
    whyItMatters: "Most professionals carry an iPhone. An Apple Wallet pass makes Bingoo a natural part of their everyday carry, on every platform.",
    ctas: [{ label: "See plans", route: "/plans" }, { label: "Learn more", route: "/plans" }]
  }
];

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "",
    desc: "Get started today",
    features: ["1 profile", "Public profile link", "Basic contact sharing", "Social links", "QR code", "WhatsApp button"],
    highlight: false,
    cta: "Get Started Free",
    color: B.navy
  },
  {
    name: "Professional",
    price: "$4.99",
    period: "/mo",
    desc: "For individuals and freelancers",
    features: ["Everything in Free", "Appointment booking", "Lead collection CRM", "Gallery and portfolio", "Full analytics dashboard", "Custom branding and colors", "QR code download", "Up to 5 NFC devices", "Instagram integration", "Save contact button"],
    highlight: true,
    cta: "Get Professional",
    color: B.orange
  },
  {
    name: "Salon",
    price: "$19.99",
    period: "/mo",
    desc: "Hair, beauty and wellness",
    features: ["Salon business profile", "Staff profiles", "Service menu", "Appointment booking", "WhatsApp booking button", "Instagram showcase", "Google review link", "Up to 10 NFC devices", "Advanced analytics", "Lead export"],
    highlight: false,
    cta: "Get Salon Plan",
    color: B.navy
  },
  {
    name: "Law Firm",
    price: "$49",
    period: "/mo",
    desc: "Legal services and attorneys",
    features: ["Law firm profile", "Practice areas", "Attorney profiles", "Legal services", "Office locations", "Lead intake forms", "CRM pipeline", "Case dashboard", "Advanced analytics", "Lead export"],
    highlight: false,
    cta: "Get Law Firm Plan",
    color: B.navy
  }
];

// Industries grouped into clear categories. Each card opens a detail panel
// (LandingDetailModal) explaining who it's for, how they use Bingoo, which
// features apply, and any future vision.
const industryGroups = [
  {
    label: "Professional Individual",
    accent: B.orange,
    items: [
      {
        icon: "💡", role: "Entrepreneurs", value: "All links, leads and audience analytics",
        accent: B.orange, badge: "Individual",
        subtitle: "Solo founders and builders",
        overview: "Entrepreneurs use Bingoo to share every link, capture leads and track who's engaging — all from one profile and one NFC device.",
        useCases: ["Pitch meetings and investor intros", "Pop-ups and community events", "Social media bio link replacement"],
        implemented: ["All-in-one link profile", "Lead capture and CRM", "Real-time analytics"],
        ctas: [{ label: "See plans", route: "/plans" }, { label: "See plans", route: "/plans" }]
      },
      {
        icon: "📸", role: "Influencers", value: "One profile, every platform, measurable reach",
        accent: B.orange, badge: "Individual",
        subtitle: "Creators and content makers",
        overview: "Influencers consolidate every social platform, collab link and booking option into one tap-friendly profile, and see exactly which channels drive clicks.",
        useCases: ["Brand collabs and sponsorships", "Event meetups and fan links", "Link-in-bio with analytics"],
        implemented: ["Instagram, TikTok, YouTube, Facebook links", "Custom link store", "Per-link click analytics"],
        ctas: [{ label: "See plans", route: "/plans" }, { label: "See plans", route: "/plans" }]
      },
      {
        icon: "🧑‍💻", role: "Freelancers", value: "Share services, book clients, get paid",
        accent: B.orange, badge: "Individual",
        subtitle: "Independent professionals",
        overview: "Freelancers show their services, portfolio and rates on one profile, let clients book directly, and accept payments through linked payment options.",
        useCases: ["Client onboarding and discovery calls", "Portfolio and service showcase", "Direct booking and payment links"],
        implemented: ["Portfolio items", "Appointment booking", "Payment links (CashApp, Wave, Orange Money, custom)"],
        ctas: [{ label: "See plans", route: "/plans" }, { label: "See plans", route: "/plans" }]
      },
      {
        icon: "🎯", role: "Professionals", value: "Consultants, lawyers, advisors and coaches",
        accent: B.orange, badge: "Individual",
        subtitle: "Consultants and advisors",
        overview: "Independent professionals use Bingoo as a credible, always-current business identity — sharing credentials, services and booking with one tap.",
        useCases: ["Consultations and discovery calls", "Speaking engagements and panels", "Credentials and bio sharing"],
        implemented: ["Bio and credentials", "Appointment booking", "Lead capture CRM"],
        ctas: [{ label: "See plans", route: "/plans" }, { label: "See plans", route: "/plans" }]
      }
    ]
  },
  {
    label: "Business",
    accent: B.navy,
    items: [
      {
        icon: "⚖️", role: "Law Firms", value: "Case intake, consultations and client pipeline",
        accent: B.navy, badge: "Business",
        subtitle: "Attorneys and legal teams",
        overview: "Law firms use Bingoo to capture qualified leads with case-type, urgency and consultation preferences, manage the intake pipeline, and present attorneys, practice areas and office locations publicly.",
        useCases: ["Immigration, civil and criminal intake", "Attorney profiles and bar admissions", "Office locations and consultation booking"],
        implemented: ["Practice areas and legal services", "Team members and attorneys", "Office locations", "Legal lead intake with case details"],
        ctas: [{ label: "See plans", route: "/plans" }, { label: "See plans", route: "/plans" }]
      },
      {
        icon: "🏠", role: "Real Estate", value: "Share listings and book property viewings",
        accent: B.navy, badge: "Business",
        subtitle: "Agents and brokerages",
        overview: "Realtors share their listings, contact and booking links from one profile, and capture interested buyers and sellers as structured leads.",
        useCases: ["Open house signage with QR codes", "Agent profile and specialties", "Property viewing booking"],
        implemented: ["Profile with contact and WhatsApp", "QR codes for signage", "Lead capture and booking"],
        futureVision: "Listing galleries and property-specific QR codes are planned for real estate teams.",
        futureLabel: "Future vision",
        ctas: [{ label: "See plans", route: "/plans" }, { label: "See plans", route: "/plans" }]
      },
      {
        icon: "💇", role: "Salons and Barbers", value: "Booking, portfolio and loyalty",
        accent: B.navy, badge: "Business",
        subtitle: "Hair, beauty and wellness",
        overview: "Salons showcase services, stylists and portfolios, let clients book the service and stylist they want, and display Instagram work and Google reviews — all from one profile.",
        useCases: ["Service menu and pricing", "Stylist profiles and booking", "Instagram showcase and Google reviews"],
        implemented: ["Salon service menu", "Team and stylist profiles", "Appointment booking", "WhatsApp booking button"],
        ctas: [{ label: "See plans", route: "/plans" }, { label: "See plans", route: "/plans" }]
      },
      {
        icon: "🍽️", role: "Restaurants", value: "Digital menu, reservations and QR ordering",
        accent: B.navy, badge: "Business",
        subtitle: "Dining and hospitality",
        overview: "Restaurants share a digital menu via QR, take reservations, and present their location, hours and reviews — turning every table and flyer into a booking opportunity.",
        useCases: ["QR menu on tables and counters", "Reservations and waitlist", "Reviews and social showcase"],
        implemented: ["QR code sharing", "Appointment/booking widget", "Location, hours and social links"],
        futureVision: "Full digital menu builder and table-side ordering are planned for restaurant plans.",
        futureLabel: "Future vision",
        ctas: [{ label: "See plans", route: "/plans" }, { label: "See plans", route: "/plans" }]
      },
      {
        icon: "🏥", role: "Medical Offices", value: "Appointments, intake forms and records",
        accent: B.navy, badge: "Business",
        subtitle: "Clinics and practices",
        overview: "Medical offices use Bingoo to share services and providers, accept appointment requests 24/7, and keep intake data private and owner-scoped.",
        useCases: ["Patient appointment requests", "Provider and service profiles", "Secure, private intake"],
        implemented: ["Appointment booking", "Team members and services", "Owner-scoped, secure dashboard records"],
        ctas: [{ label: "See plans", route: "/plans" }, { label: "See plans", route: "/plans" }]
      },
      {
        icon: "🏢", role: "Business Teams", value: "Corporate teams, agencies and multi-profile orgs",
        accent: B.navy, badge: "Business",
        subtitle: "Teams and enterprises",
        overview: "Corporate teams manage employee profiles, issue NFC cards in bulk, track attendance, and view team-wide analytics from a central dashboard with admin controls.",
        useCases: ["Employee profiles and team NFC cards", "Clock in / clock out attendance", "Team analytics and admin roles"],
        implemented: ["Multi-profile management", "Admin role controls", "Attendance and team analytics"],
        ctas: [{ label: "See plans", route: "/plans" }, { label: "See plans", route: "/plans" }]
      }
    ]
  },
  {
    label: "Asset & Lost Item",
    accent: B.gold,
    items: [
      {
        icon: "🐾", role: "Pet Profiles", value: "Help a lost pet find its way home",
        accent: B.gold, badge: "Lost Item",
        subtitle: "Pet collars and tags",
        overview: "Attach a Bingoo NFC tag or QR code to a pet's collar. If the pet is lost, anyone who finds it can tap to report they found it — with their contact and location — without seeing your private details.",
        useCases: ["Dogs and cats collars", "Travel and outdoor pets", "Found-pet reporting"],
        implemented: ["NFC/QR device assignment", "Lost-mode toggle", "Found-item report page with finder details"],
        ctas: [{ label: "Get an NFC device", route: "/shop" }, { label: "See plans", route: "/plans" }]
      },
      {
        icon: "🧳", role: "Suitcase / Bag", value: "Recover lost luggage without exposing private info",
        accent: B.gold, badge: "Lost Item",
        subtitle: "Luggage and bags",
        overview: "Tag a suitcase, backpack, or laptop bag with a Bingoo device. If it's lost in transit, whoever finds it can tap to report they found it — you get notified with their message and location.",
        useCases: ["Airline luggage and carry-ons", "Backpacks and laptop bags", "Conference swag bags"],
        implemented: ["Device assignment to any item", "Lost-mode with owner notifications", "Finder report page"],
        ctas: [{ label: "Get an NFC device", route: "/shop" }, { label: "See plans", route: "/plans" }]
      },
      {
        icon: "📦", role: "NFC Product / Device", value: "Attach a digital identity to any product",
        accent: B.gold, badge: "Asset",
        subtitle: "Products and devices",
        overview: "Attach a Bingoo NFC device to a product or asset so anyone who taps it sees the profile, instructions, or ownership information you choose to publish — and can report it found if it's lost.",
        useCases: ["High-value equipment and assets", "Product authenticity and info", "Rental and loaned items"],
        implemented: ["Device-to-profile assignment", "Public profile or lost-item page", "Device lifecycle management"],
        ctas: [{ label: "Get an NFC device", route: "/shop" }, { label: "See plans", route: "/plans" }]
      }
    ]
  }
];

// Informational detail cards for the "Explore Bingoo use cases" buttons.
// These open a documentation modal — they never navigate to a personal profile/dashboard.
const docDetails = [
  {
    label: "Individual",
    icon: "👤",
    accent: B.orange,
    badge: "Personal",
    title: "Bingoo for individuals",
    subtitle: "Your professional identity, on one tap",
    overview: "Create a single, always-current digital business card. Share contact, social, payment links and your schedule with one NFC tap or QR scan — no app needed for the person you meet.",
    useCases: [
      "Consultants and freelancers sharing contact fast",
      "Job seekers linking a resume and portfolio",
      "Creators consolidating social and payment links",
      "Coaches and trainers sharing booking links"
    ],
    implemented: [
      "Custom profile layouts and themes",
      "QR sharing with custom colors",
      "Multi-language profiles (EN/FR)",
      "Lead capture from visitors",
      "Appointment booking"
    ],
    whyItMatters: "You never run out of cards, your info is always current, and every new connection is saved automatically.",
    ctas: [
      { label: "See plans", route: "/plans" },
      { label: "Get an NFC device", route: "/shop" }
    ]
  },
  {
    label: "Business",
    icon: "🏢",
    accent: B.navy,
    badge: "Teams & companies",
    title: "Bingoo for business",
    subtitle: "One identity for your whole team",
    overview: "Equip every team member with a branded NFC card pointing to a shared business profile. Manage leads, appointments and analytics from one dashboard.",
    useCases: [
      "Law firms routing case inquiries",
      "Salons managing stylists and bookings",
      "Restaurants sharing menus and reservations",
      "Realtors showcasing listings",
      "Consultancies tracking lead pipelines"
    ],
    implemented: [
      "Shared business profile with team members",
      "Lead CRM with status pipeline",
      "Appointment scheduling per service",
      "Real-time analytics across the team",
      "Corporate attendance tracking"
    ],
    whyItMatters: "Standardize how every employee represents your business — and measure every connection they make.",
    ctas: [
      { label: "See business plans", route: "/plans" },
      { label: "Bulk NFC cards", route: "/shop" }
    ]
  },
  {
    label: "Lost Item",
    icon: "📍",
    accent: "#ef4444",
    badge: "Asset recovery",
    title: "Lost item mode",
    subtitle: "Help the right thing happen when something is lost",
    overview: "Assign an NFC device to anything — keys, luggage, a pet, a product. If found, a tap opens a recovery page with your safe contact info and a finder report form.",
    useCases: [
      "Pet profiles with finder reporting",
      "Suitcases and bags",
      "Keychains and electronics",
      "Branded products with digital identity"
    ],
    implemented: [
      "Lost mode toggle per device",
      "Finder report with location and message",
      "Owner notifications",
      "Safe contact info display"
    ],
    whyItMatters: "Recover what matters without exposing your private phone number or address.",
    ctas: [
      { label: "Get an NFC device", route: "/shop" },
      { label: "See plans", route: "/plans" }
    ]
  },
  {
    label: "Wallet Passes",
    icon: "💳",
    accent: B.gold,
    badge: "Wallet",
    title: "Google Wallet passes",
    subtitle: "Your profile, in their wallet",
    overview: "Generate a branded Google Wallet pass from any profile so contacts can save your business card straight to their phone wallet.",
    useCases: [
      "Trade shows and conferences",
      "Client handouts",
      "Returning customers saving your card",
      "Branded corporate team passes"
    ],
    implemented: [
      "One-tap pass generation",
      "Branded colors and logo",
      "Contact and link details on the pass"
    ],
    futureVision: "Apple Wallet passes are on the near-term roadmap for iPhone owners.",
    whyItMatters: "Staying in someone's wallet is the most durable place your business card can be.",
    ctas: [
      { label: "See plans", route: "/plans" },
      { label: "Get an NFC device", route: "/shop" }
    ]
  },
  {
    label: "Lead CRM",
    icon: "📈",
    accent: "#16a34a",
    badge: "CRM",
    title: "Lead CRM",
    subtitle: "Turn every tap into a tracked lead",
    overview: "Every contact form submission from a profile is captured as a lead with source, status and notes — so you can follow up without losing track.",
    useCases: [
      "Law firms capturing case inquiries",
      "Salons booking first appointments",
      "Realtors logging property interest",
      "Consultants qualifying prospects"
    ],
    implemented: [
      "Lead capture from any public profile",
      "Source tracking (profile, NFC, QR, referral)",
      "Pipeline statuses (new → contacted → won/lost)",
      "Internal CRM notes",
      "Legal intake fields for law firms"
    ],
    whyItMatters: "Most connections are lost because nobody follows up. Bingoo makes the follow-up automatic.",
    ctas: [
      { label: "See plans", route: "/plans" },
      { label: "Get an NFC device", route: "/shop" }
    ]
  },
  {
    label: "Appointment Booking",
    icon: "📅",
    accent: "#2563eb",
    badge: "Booking",
    title: "Appointment booking",
    subtitle: "Let visitors book you in one tap",
    overview: "Add a booking button to any profile. Visitors pick a service, date and time slot — you approve, reschedule or decline from your dashboard.",
    useCases: [
      "Salons and barbers",
      "Law firm consultations",
      "Realtor showings",
      "Coach and consultant sessions"
    ],
    implemented: [
      "Service-based booking",
      "Time-slot selection",
      "Owner approval workflow",
      "Reminder notifications",
      "Calendar view in dashboard"
    ],
    whyItMatters: "Bookings happen at the moment of interest — no phone tag, no back-and-forth.",
    ctas: [
      { label: "See plans", route: "/plans" },
      { label: "Get an NFC device", route: "/shop" }
    ]
  }
];

const fadeUp = { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

function ScrollReveal({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}>
      {children}
    </motion.div>
  );
}

// Animated NFC wave rings
function NFCWaveRings() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-white/10"
          style={{ width: 200 + i * 160, height: 200 + i * 160 }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.15, 0.04, 0.15] }}
          transition={{ duration: 4, repeat: Infinity, delay: i * 0.8, ease: "easeInOut" }} />
      ))}
    </div>
  );
}

// Connection lines SVG background
function ConnectionLines() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.06]" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
      {[[100, 100, 600, 400], [200, 700, 800, 200], [1100, 100, 400, 600], [900, 750, 200, 300], [600, 50, 900, 500]].map(([x1, y1, x2, y2], i) => (
        <motion.line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth="1"
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 4 + i, repeat: Infinity, delay: i * 1.2, ease: "easeInOut" }} />
      ))}
      {[[600, 400], [100, 100], [200, 700], [1100, 100], [900, 750]].map(([cx, cy], i) => (
        <motion.circle key={i} cx={cx} cy={cy} r="4" fill="white"
          animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.7 }} />
      ))}
    </svg>
  );
}

function FloatingOrb({ style, delay = 0 }) {
  return (
    <motion.div
      className="absolute rounded-full blur-3xl pointer-events-none"
      style={style}
      animate={{ y: [0, -24, 0], scale: [1, 1.06, 1], x: [0, 12, 0] }}
      transition={{ duration: 7 + delay, repeat: Infinity, ease: "easeInOut", delay }} />
  );
}

export default function Landing() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => { base44.auth.isAuthenticated().then(setAuthed); }, []);

  // Active detail item for the landing-page modals (features + industries share one modal)
  const [activeDetail, setActiveDetail] = useState(null);

  // Language state — reads from localStorage (auto-detects on first visit via getLang)
  const [lang, setLangState] = useState(() => getLang());
  const toggleLang = () => {
    const next = lang === "en" ? "fr" : "en";
    setLang(next);
    setLangState(next);
  };

  const [statsVisible, setStatsVisible] = useState(false);
  const [counts, setCounts] = useState([0, 0, 0, 0]);

  useEffect(() => {
    if (!statsVisible) return;
    const targets = [10000, 50, 4, 99];
    const duration = 1800;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCounts(targets.map((t) => Math.floor(t * ease)));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [statsVisible]);

  return (
    <div className="min-h-screen font-sans" style={{ background: "#f8fafc", overflowX: 'clip' }}>

      {/* ── NAVBAR */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-50 backdrop-blur-xl border-b"
        style={{ background: "rgba(11,33,73,0.97)", borderColor: "rgba(255,255,255,0.08)" }}>
        
        <div className="max-w-7xl mx-auto px-4 py-3 md:px-6 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5" aria-label="Bingoo Connect home">
            <motion.div whileHover={{ scale: 1.02 }}>
              <BingooLogo className="h-9 w-9" animated={false} />
            </motion.div>
            <BingooWordmark size="text-xl" light stacked={false} />
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-7 text-sm font-semibold text-white/70">
            {[["features", t("lp_features", lang)], ["use-cases", t("lp_industries", lang)], ["pricing", t("lp_pricing", lang)], ["shop", t("lp_shop", lang)]].map(([id, label]) => (
              <motion.a key={id} href={`#${id}`} className="hover:text-white transition-colors" whileHover={{ y: -1 }}>
                {label}
              </motion.a>
            ))}
          </div>

          {/* CTA + Language */}
          <div className="flex gap-2 items-center">
            {/* Language toggle */}
            <button
              onClick={toggleLang}
              className="px-2.5 py-1 rounded-full text-[11px] font-bold border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-all"
              title={t("lp_language", lang)}>
              {lang === "en" ? "🇫🇷 FR" : "🇺🇸 EN"}
            </button>
            {authed ? (
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Button size="sm" onClick={() => window.location.href = '/bingoo'}
                  className="font-bold text-sm"
                  style={{ background: B.orange, color: "#fff", border: "none" }}>
                  {t("lp_dashboard", lang)} →
                </Button>
              </motion.div>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Button variant="ghost" size="sm" onClick={goSignIn}
                    className="text-white/80 hover:text-white hover:bg-white/10 hidden sm:inline-flex font-semibold">
                    {t("lp_sign_in", lang)}
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Button size="sm" onClick={goSignIn}
                    className="font-bold text-sm px-4"
                    style={{ background: B.orange, color: "#fff", border: "none" }}>
                    {t("lp_get_started", lang)}
                  </Button>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* ── HERO */}
      <section className="relative overflow-hidden flex items-center min-h-screen py-20 px-4 md:px-6"
        style={{ background: `linear-gradient(145deg, ${B.navyDark} 0%, ${B.navy} 45%, #0f3d8c 70%, #0a2a5e 100%)` }}>

        <NFCWaveRings />
        <ConnectionLines />

        {/* Floating orbs */}
        <FloatingOrb delay={0} style={{ width: 500, height: 500, top: "-15%", left: "-10%", background: `radial-gradient(circle, rgba(255,122,0,0.18) 0%, transparent 70%)` }} />
        <FloatingOrb delay={2} style={{ width: 400, height: 400, bottom: "-10%", right: "-8%", background: `radial-gradient(circle, rgba(253,186,33,0.14) 0%, transparent 70%)` }} />
        <FloatingOrb delay={4} style={{ width: 250, height: 250, top: "30%", right: "20%", background: `radial-gradient(circle, rgba(255,154,51,0.1) 0%, transparent 70%)` }} />

        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "36px 36px" }} />

        <div className="max-w-7xl mx-auto w-full relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Copy */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-6"
                  style={{ background: "rgba(253,186,33,0.15)", border: "1px solid rgba(253,186,33,0.35)", color: B.gold }}>
                  <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }}>📡</motion.span>
                  NFC-Powered Business Identity Platform
                </div>
              </motion.div>

              <motion.h1
                className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6 text-white"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}>
                One Tap.<br />
                <span style={{ color: B.gold }}>Your Entire</span><br />
                Business World.
              </motion.h1>

              <motion.p
                className="text-lg text-white/70 mb-8 max-w-lg leading-relaxed"
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}>
                The smart NFC card platform that opens your digital profile for law firms, salons, restaurants, realtors, consultants and every professional growing their business.
              </motion.p>

              {/* Tagline pills */}
              <motion.div className="flex flex-wrap gap-2 mb-8"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                {["CONNECT", "SHARE", "GROW", "SUCCEED"].map((word, i) => (
                  <motion.span key={word}
                    className="px-4 py-1.5 rounded-full text-xs font-black tracking-widest"
                    style={{ background: [B.orange, B.gold, "#22c55e", "#ef4444"][i] + "22", color: [B.orange, B.gold, "#22c55e", "#ef4444"][i], border: `1px solid ${[B.orange, B.gold, "#22c55e", "#ef4444"][i]}44` }}
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + i * 0.1 }}>
                    {word}
                  </motion.span>
                ))}
              </motion.div>

              <motion.div className="flex flex-col sm:flex-row gap-3 mb-6"
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.65 }}>
                <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                  <Button size="lg" onClick={goSignIn}
                    className="w-full sm:w-auto font-black text-base px-8 py-6 rounded-2xl shadow-2xl"
                    style={{ background: B.orange, color: "#fff" }}>
                    Create Free Profile <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </motion.div>
              </motion.div>

              {/* Device activation */}
              <motion.div className="flex flex-col sm:flex-row gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
                <motion.div onClick={goActivate} whileHover={{ scale: 1.03, y: -1 }}
                  className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full cursor-pointer transition-colors"
                  style={{ background: "rgba(253,186,33,0.1)", border: "1px solid rgba(253,186,33,0.3)" }}>
                  <span className="text-lg">📦</span>
                  <span className="text-white/70 text-sm font-semibold">Already have a device?</span>
                  <span className="text-sm font-black flex items-center gap-1" style={{ color: B.gold }}>
                    Activate here <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </motion.div>
              </motion.div>
            </div>

            {/* Right: NFC Mockup + Product Images */}
            <motion.div
              className="flex flex-col items-center gap-6"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}>
              <NFCTapMockup />

              {/* 3D brand badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="hidden lg:flex">
                <BrandIcon3D size={120} />
              </motion.div>

              {/* Product showcase strip */}
              <motion.div
                className="flex items-center gap-3 px-5 py-3 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}>
                <span className="text-white/50 text-xs font-bold tracking-widest uppercase">Available as</span>
                {["Card", "Keychain", "Bracelet", "Sticker", "Stand", "Bundle"].map((item, i) => (
                  <motion.span key={item}
                    className="text-xs font-bold px-2.5 py-1 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.3 + i * 0.1 }}>
                    {item}
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR */}
      <motion.section
        className="py-12 px-6"
        style={{ background: B.navyDark }}
        onViewportEnter={() => setStatsVisible(true)}
        viewport={{ once: true }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { val: counts[0].toLocaleString() + "+", label: "Profiles Created" },
            { val: counts[1] + "+", label: "Countries Served" },
            { val: counts[2] + " Plans", label: "For Every Business" },
            { val: "$" + counts[3] + "/mo", label: "Corporate Plan" }
          ].map((s, i) => (
            <ScrollReveal key={s.label} delay={i * 0.1}>
              <p className="text-3xl font-black" style={{ color: B.gold }}>{s.val}</p>
              <p className="text-white/50 text-sm mt-1 font-medium">{s.label}</p>
            </ScrollReveal>
          ))}
        </div>
      </motion.section>

      {/* ── BINGOO LOGO BRAND SECTION */}
      <section className="py-16 px-6" style={{ background: "#f1f5f9" }}>
        <div className="max-w-6xl mx-auto">
          <ScrollReveal className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black mb-3" style={{ color: B.navy }}>
              Trusted by Professionals Worldwide
            </h2>
            <p className="text-slate-500 text-lg">NFC cards, keychains, bracelets and badges — all powered by Bingoo Connect</p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <div className="rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://media.base44.com/images/public/692bd9007b93ba81de543346/5bf500988_BingooconnectNFCBRAND.png"
                alt="Bingoo NFC Products"
                className="w-full object-cover" />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── FEATURES */}
      <section id="features" className="py-16 md:py-24 px-4 md:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-4"
              style={{ background: B.navy + "10", color: B.navy, border: `1px solid ${B.navy}20` }}>
              Platform Features
            </div>
            <h2 className="text-3xl md:text-5xl font-black mb-4" style={{ color: B.navy }}>
              Everything your business needs
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">From one NFC tap to a complete business growth platform.</p>
          </ScrollReveal>
          <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
            variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}>
            {features.map((f, i) => (
              <motion.button
                key={f.title}
                variants={fadeUp}
                whileHover={{ y: -6, boxShadow: "0 24px 48px rgba(11,46,107,0.12)" }}
                whileFocus={{ y: -4 }}
                onClick={() => setActiveDetail(f)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setActiveDetail(f); } }}
                aria-label={`Learn more about ${f.title}`}
                className="text-left rounded-2xl p-7 border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ borderColor: "#e2e8f0", background: "#fff", outlineColor: f.accent }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: (f.accent || B.navy) + "15", color: f.accent || B.navy }}>
                  {f.icon}
                </div>
                <div className="flex items-center gap-2 mb-1.5">
                  {f.badge && (
                    <span className="text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                      style={{ background: (f.accent || B.navy) + "12", color: f.accent || B.navy }}>
                      {f.badge}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-lg mb-2 flex items-center gap-1.5" style={{ color: B.navy }}>
                  {f.title}
                  <ArrowRight className="w-3.5 h-3.5 opacity-40" />
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold" style={{ color: f.accent || B.orange }}>
                  Learn more <ArrowRight className="w-3 h-3" />
                </span>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── USE CASES */}
      <section id="use-cases" className="py-16 md:py-24 px-4 md:px-6" style={{ background: "#f8fafc" }}>
        <div className="max-w-6xl mx-auto">
          <ScrollReveal className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-4"
              style={{ background: B.orange + "15", color: B.orange, border: `1px solid ${B.orange}30` }}>
              Who uses Bingoo?
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: B.navy }}>
              Built for every industry
            </h2>
          </ScrollReveal>
          {industryGroups.map((group, gi) => (
            <div key={group.label} className="mb-10 last:mb-0">
              <ScrollReveal delay={gi * 0.05} className="flex items-center gap-3 mb-5">
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: group.accent }} />
                <h3 className="font-black text-lg" style={{ color: B.navy }}>{group.label}</h3>
                <span className="text-xs font-semibold text-slate-400">
                  {group.items.length} {group.items.length === 1 ? "use case" : "use cases"}
                </span>
              </ScrollReveal>
              <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
                variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}>
                {group.items.map((u) => (
                  <motion.button
                    key={u.role}
                    variants={fadeUp}
                    whileHover={{ y: -4, borderColor: group.accent }}
                    whileFocus={{ y: -2 }}
                    onClick={() => setActiveDetail(u)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setActiveDetail(u); } }}
                    aria-label={`Learn how Bingoo works for ${u.role}`}
                    className="flex items-start gap-4 bg-white rounded-2xl p-5 border-2 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    style={{ borderColor: "#e2e8f0", outlineColor: group.accent }}>
                    <span className="text-4xl shrink-0">{u.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <p className="font-bold text-sm" style={{ color: B.navy }}>{u.role}</p>
                        <ArrowRight className="w-3 h-3 opacity-40" />
                      </div>
                      <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{u.value}</p>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            </div>
          ))}

          {/* Documentation CTA area */}
          <ScrollReveal delay={0.1} className="mt-12 rounded-3xl p-7 md:p-9 text-center"
            style={{ background: `linear-gradient(135deg, ${B.navy} 0%, ${B.navyLight} 100%)` }}>
            <h3 className="font-black text-xl md:text-2xl text-white mb-2">Explore Bingoo use cases</h3>
            <p className="text-white/80 text-sm mb-6 max-w-xl mx-auto">
              Jump straight to the part of Bingoo that fits your goal.
            </p>
            <div className="flex flex-wrap justify-center gap-2.5">
              {docDetails.map((d) => (
                <motion.button
                  key={d.label}
                  onClick={() => setActiveDetail(d)}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold transition-colors"
                  style={{ background: B.orange, color: "#fff", border: "none", boxShadow: "0 6px 18px rgba(255,122,0,0.35)" }}>
                  <span>{d.icon}</span>
                  {d.label}
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.button>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── PROJECT & FUTURE */}
      <ProjectFutureSection />

      {/* ── PRICING */}
      <section id="pricing" className="py-16 md:py-24 px-4 md:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-4"
              style={{ background: B.gold + "20", color: "#b45309", border: `1px solid ${B.gold}40` }}>
              Simple Pricing
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: B.navy }}>
              Plans for every professional
            </h2>
            <p className="text-slate-500 text-lg">NFC devices from $7.99. No hidden fees.</p>
          </ScrollReveal>
          <motion.div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
            variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}>
            {plans.map((p, i) => (
              <motion.div key={p.name} variants={fadeUp}
                whileHover={{ y: p.highlight ? -10 : -6 }}
                className="rounded-2xl p-7 border-2 transition-all relative flex flex-col"
                style={{
                  borderColor: p.highlight ? B.orange : "#e2e8f0",
                  background: p.highlight ? `linear-gradient(145deg, ${B.navy}, ${B.navyLight})` : "#fff",
                  boxShadow: p.highlight ? `0 24px 60px rgba(255,122,0,0.25)` : "none"
                }}>
                {p.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-black"
                    style={{ background: B.orange, color: "#fff" }}>
                    Most Popular
                  </div>
                )}
                <div className="mb-4">
                  <p className="text-sm font-semibold mb-1" style={{ color: p.highlight ? "rgba(255,255,255,0.5)" : B.slate }}>{p.desc}</p>
                  <h3 className="font-black text-xl mb-3" style={{ color: p.highlight ? "#fff" : B.navy }}>{p.name}</h3>
                  <div>
                    <span className="text-4xl font-black" style={{ color: p.highlight ? B.gold : B.navy }}>{p.price}</span>
                    <span className="text-sm ml-1" style={{ color: p.highlight ? "rgba(255,255,255,0.4)" : B.slate }}>{p.period}</span>
                  </div>
                </div>
                <div className="h-px my-4" style={{ background: p.highlight ? "rgba(255,255,255,0.1)" : "#f1f5f9" }} />
                <ul className="space-y-2.5 mb-6 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm"
                      style={{ color: p.highlight ? "rgba(255,255,255,0.75)" : "#64748b" }}>
                      <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: p.highlight ? B.gold : B.orange }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button onClick={() => window.location.href = p.name === "Free" ? '/bingoo' : '/plans'}
                    className="w-full font-bold"
                    style={{ background: p.highlight ? B.orange : B.navy, color: "#fff", border: "none" }}>
                    {p.cta}
                  </Button>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>

          {/* Browse All Plans CTA */}
          <ScrollReveal delay={0.2} className="text-center mt-10">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="inline-block">
              <Button size="lg" onClick={() => window.location.href = '/plans'}
                className="font-black text-base px-10 py-6 rounded-2xl"
                style={{ background: B.navy, color: "#fff", border: "none" }}>
                Browse All Plans <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── SHOP */}
      <section id="shop" className="py-16 md:py-24 px-4 md:px-6" style={{ background: "#f8fafc" }}>
        <div className="max-w-6xl mx-auto">
          <ScrollReveal className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-4"
              style={{ background: B.navy + "10", color: B.navy, border: `1px solid ${B.navy}20` }}>
              Official NFC Products
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: B.navy }}>
              Get your Bingoo NFC device
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">One-time purchase. Tap to share your profile instantly — forever.</p>
          </ScrollReveal>
          <motion.div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6"
            variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}>
            {[
              {
                id: "nfc-card",
                name: "NFC Business Card",
                price: "$19.99",
                desc: "Premium PVC card. Tap to share your full profile instantly.",
                tag: "Best Seller",
                image: "https://media.base44.com/images/public/692bd9007b93ba81de543346/579589e5c_generated_image.png"
              },
              {
                id: "nfc-keychain",
                name: "NFC Keychain",
                price: "$14.99",
                desc: "Compact round tag. Attaches to any key ring.",
                tag: null,
                image: "https://media.base44.com/images/public/692bd9007b93ba81de543346/490b649b9_generated_image.png"
              },
              {
                id: "nfc-sticker",
                name: "NFC Sticker",
                price: "$7.99",
                desc: "Stick anywhere — laptop, window, storefront. Pack of 2.",
                tag: null,
                image: "https://media.base44.com/images/public/692bd9007b93ba81de543346/41b35e638_generated_image.png"
              },
              {
                id: "nfc-stand",
                name: "NFC Desk Stand",
                price: "$34.99",
                desc: "Countertop stand for salons, offices, and front desks.",
                tag: "New",
                image: "https://media.base44.com/images/public/692bd9007b93ba81de543346/ba2752299_generated_image.png"
              },
              {
                id: "nfc-bracelet",
                name: "NFC Bracelet",
                price: "$24.99",
                desc: "Silicone NFC wristband. Wear your profile, share with a tap.",
                tag: "New",
                image: "https://media.base44.com/images/public/692bd9007b93ba81de543346/2dd53607e_generated_image.png"
              },
              {
                id: "nfc-bundle",
                name: "Starter Bundle",
                price: "$29.99",
                desc: "Card + Keychain + Stickers. Everything you need to start.",
                tag: "Save $13",
                image: "https://media.base44.com/images/public/692bd9007b93ba81de543346/3a8a19f21_generated_image.png"
              },
            ].map((item) => (
              <motion.div key={item.id} variants={fadeUp}
                whileHover={{ y: -6, borderColor: B.orange }}
                className="relative bg-white rounded-3xl border-2 overflow-hidden flex flex-col transition-all"
                style={{ borderColor: "#e2e8f0" }}>
                {item.tag && (
                  <span className="absolute top-3 left-3 z-10 text-xs font-black px-3 py-1 rounded-full text-white"
                    style={{ background: item.tag === "Save $13" ? "#16a34a" : item.tag === "New" ? B.navy : B.orange }}>
                    {item.tag}
                  </span>
                )}
                {/* Product image */}
                <div className="bg-slate-50 flex items-center justify-center overflow-hidden" style={{ height: 180 }}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-contain p-3"
                  />
                </div>
                {/* Card body */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-black text-base mb-1" style={{ color: B.navy }}>{item.name}</h3>
                  <p className="text-slate-500 text-sm mb-3 flex-1">{item.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black" style={{ color: B.orange }}>{item.price}</span>
                    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                      <Button className="font-bold rounded-xl text-white text-sm px-4"
                        style={{ background: B.navy }}
                        onClick={() => window.location.href = `/product/${item.id}`}>
                        Details →
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Corporate / Bulk CTA */}
          <ScrollReveal delay={0.2}>
            <div className="mt-8 rounded-3xl p-7 flex flex-col md:flex-row items-center justify-between gap-6"
              style={{ background: `linear-gradient(135deg, ${B.navy} 0%, ${B.navyLight} 100%)` }}>
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-white/10">
                  <img
                    src="https://media.base44.com/images/public/692bd9007b93ba81de543346/bd567db9b_generated_image.png"
                    alt="Corporate 10-Pack"
                    className="w-full h-full object-contain p-1"
                  />
                </div>
                <div>
                  <p className="font-black text-white text-lg">10-Pack Corporate Cards — $99.99</p>
                  <p className="text-white/60 text-sm mt-1">Equip your entire team in one order. Volume discount included.</p>
                </div>
              </div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="flex-shrink-0">
                <Button onClick={() => window.location.href = '/shop'}
                  className="font-bold whitespace-nowrap"
                  style={{ background: B.orange, color: "#fff", border: "none" }}>
                  Browse All Products →
                </Button>
              </motion.div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <FeedbackSection />

      {/* ── BOTTOM CTA */}
      <section className="relative py-20 px-4 md:px-6 text-center overflow-hidden"
        style={{ background: `linear-gradient(145deg, ${B.navyDark} 0%, ${B.navy} 50%, ${B.navyLight} 100%)` }}>
        <ConnectionLines />
        <FloatingOrb delay={0} style={{ width: 400, height: 400, top: "-20%", left: "-10%", background: `radial-gradient(circle, ${B.orange}20 0%, transparent 70%)` }} />
        <FloatingOrb delay={2} style={{ width: 350, height: 350, bottom: "-15%", right: "-5%", background: `radial-gradient(circle, ${B.gold}18 0%, transparent 70%)` }} />
        <div className="max-w-3xl mx-auto relative">
          <ScrollReveal>
            <h2 className="text-3xl md:text-5xl font-black mb-4 text-white">
              Ready to grow your business?
            </h2>
            <p className="text-white/60 text-lg mb-3">Join thousands of professionals worldwide.</p>
            <div className="flex justify-center gap-6 mb-8 text-sm font-black tracking-widest" style={{ color: B.gold }}>
              {["CONNECT", "•", "SHARE", "•", "GROW", "•", "SUCCEED"].map((w, i) => (
                <span key={i} style={{ opacity: w === "•" ? 0.3 : 1 }}>{w}</span>
              ))}
            </div>
            <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.97 }}>
              <Button size="lg" onClick={goSignIn}
                className="font-black text-base md:text-lg px-10 py-6 rounded-2xl shadow-2xl"
                style={{ background: B.orange, color: "#fff" }}>
                Create Your Profile Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── FOOTER */}
      <footer className="py-10 px-6 text-sm" style={{ background: B.navyDark }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <BingooLogo className="h-8 w-8" animated={false} />
            <BingooWordmark size="text-base" light stacked={false} />
          </div>
          <div className="flex flex-wrap justify-center gap-5 text-white/40 text-xs">
            <a href="/shop" className="hover:text-white/70 transition-colors">{t("lp_shop", lang)}</a>
            <a href="/plans" className="hover:text-white/70 transition-colors">{t("lp_pricing", lang)}</a>
            <a href="/privacy" className="hover:text-white/70 transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-white/70 transition-colors">Terms of Service</a>
            <a href="/data-deletion" className="hover:text-white/70 transition-colors">Data Deletion</a>
            <a href="/contact-support" className="hover:text-white/70 transition-colors">Contact</a>
            <button onClick={toggleLang} className="hover:text-white/70 transition-colors font-semibold">
              {lang === "en" ? "🇫🇷 Français" : "🇺🇸 English"}
            </button>
          </div>
          <p className="text-white/30 text-xs">© {new Date().getFullYear()} Bingoo Connect · bingoo.africa</p>
        </div>
      </footer>

      {/* Shared detail modal for feature + industry cards */}
      <LandingDetailModal
        open={!!activeDetail}
        onClose={() => setActiveDetail(null)}
        item={activeDetail}
      />
    </div>
  );
}