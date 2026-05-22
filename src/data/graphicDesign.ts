export type DesignCategory =
  | "Logos"
  | "Posters & Flyers"
  | "Invitations & Cards"
  | "Certificates"
  | "Fiverr Gigs"
  | "CV / Resume & Cover Letter"
  | "Banners & Roll-Ups"
  | "Menus & Price Lists"
  | "Labels & Stickers"
  | "Product Design"
  | "Company Profiles"
  | "YouTube Thumbnails"
  | "Brochures";

export interface DesignItem {
  id: string;
  title: string;
  category: DesignCategory;
  /** Path relative to /public — e.g. /images/logo-neurouni.png */
  image: string;
}

export const designCategories: DesignCategory[] = [
  "Logos",
  "Posters & Flyers",
  "Invitations & Cards",
  "Certificates",
  "Fiverr Gigs",
  "CV / Resume & Cover Letter",
  "Banners & Roll-Ups",
  "Menus & Price Lists",
  "Labels & Stickers",
  "Product Design",
  "Company Profiles",
  "YouTube Thumbnails",
  "Brochures",
];

export const designItems: DesignItem[] = [
  // ─── Logos (PNG) ────────────────────────────────────────────────────────────
  { id: "logo-01",  title: "Angarabat Professionals Association", category: "Logos", image: "/images/Angarabat.png" },
  { id: "logo-02",  title: "Anza Hub",                           category: "Logos", image: "/images/anza.png" },
  { id: "logo-03",  title: "ArmandAir Brand",                    category: "Logos", image: "/images/ArmandAir Brand_main full version.png" },
  { id: "logo-04",  title: "Blessed EC Junior School",           category: "Logos", image: "/images/blessed.png" },
  { id: "logo-05",  title: "BNA",                                category: "Logos", image: "/images/bna.png" },
  { id: "logo-06",  title: "Destiny Engineering Brand",          category: "Logos", image: "/images/DESTINY ENGINEERING BRAND.png" },
  { id: "logo-07",  title: "Fountain Smartec Rebrand",           category: "Logos", image: "/images/Fountain.png" },
  { id: "logo-08",  title: "Kawira Consult",                     category: "Logos", image: "/images/kawira.png" },
  { id: "logo-09",  title: "Kipaa",                              category: "Logos", image: "/images/kipaa.png" },
  { id: "logo-10",  title: "Lilly's Poultry Farm",               category: "Logos", image: "/images/lily.png" },
  { id: "logo-11",  title: "NeuroUni",                           category: "Logos", image: "/images/logo2.png" },
  { id: "logo-12",  title: "Shawamu Foundation",                 category: "Logos", image: "/images/logo3.png" },
  { id: "logo-13",  title: "Luri – A Starry Touch",             category: "Logos", image: "/images/logo4.png" },
  { id: "logo-14",  title: "Together Humanity",                  category: "Logos", image: "/images/logo5.png" },
  { id: "logo-15",  title: "Mama Kitchen",                       category: "Logos", image: "/images/logo6.png" },
  { id: "logo-16",  title: "MobileTek",                          category: "Logos", image: "/images/logo7.png" },
  { id: "logo-17",  title: "Mohsam Premium",                     category: "Logos", image: "/images/logo8.png" },
  { id: "logo-18",  title: "Logo 9",                             category: "Logos", image: "/images/logo9.png" },
  { id: "logo-19",  title: "Eunishar Home & Support",            category: "Logos", image: "/images/logo11.png" },
  { id: "logo-20",  title: "Click2Skill",                        category: "Logos", image: "/images/logo12.png" },
  { id: "logo-21",  title: "Flowmax Plumbing Solutions",         category: "Logos", image: "/images/logo13.png" },
  { id: "logo-22",  title: "Reigns Clinic",                      category: "Logos", image: "/images/Reigns Clinic.png" },
  { id: "logo-23",  title: "Sopa Lodges",                        category: "Logos", image: "/images/Sopa Lodges.jpg" },
  { id: "logo-24",  title: "The Best Sellers Brand",             category: "Logos", image: "/images/The Best Sellers Brand.png" },
  { id: "logo-25",  title: "UB – Kenyan Beer",                   category: "Logos", image: "/images/UB-Kenyan Beer.png" },
  { id: "logo-26",  title: "UBL Horizontal Logo",                category: "Logos", image: "/images/UBL Horizontal Logo_Main Logo Horizontal.png" },
  { id: "logo-27",  title: "Domas Little Voices Speech Therapy", category: "Logos", image: "/images/domas.png" },
  { id: "logo-28",  title: "People",                             category: "Logos", image: "/images/PEOPLE.png" },

  // ─── Posters & Flyers (JPG) ─────────────────────────────────────────────────
  { id: "poster-01", title: "2PM Event",                    category: "Posters & Flyers", image: "/images/2pm.jpg" },
  { id: "poster-02", title: "Ballers Brunch",               category: "Posters & Flyers", image: "/images/ballersbrunch.jpg" },
  { id: "poster-03", title: "Battle (DJ Event)",            category: "Posters & Flyers", image: "/images/battle.webp" },
  { id: "poster-04", title: "Best Menu",                    category: "Posters & Flyers", image: "/images/best_menu.jpg" },
  { id: "poster-05", title: "Bosses",                       category: "Posters & Flyers", image: "/images/bosses.jpg" },
  { id: "poster-06", title: "Caribbean Bottles",            category: "Posters & Flyers", image: "/images/caribbean.webp" },
  { id: "poster-07", title: "Freegoat Party",               category: "Posters & Flyers", image: "/images/freegoat.jpg" },
  { id: "poster-08", title: "Infinity Groove",              category: "Posters & Flyers", image: "/images/groove.jpg" },
  { id: "poster-09", title: "Halloween Edition",            category: "Posters & Flyers", image: "/images/hallowen.webp" },
  { id: "poster-10", title: "Infinity",                     category: "Posters & Flyers", image: "/images/infinity.jpg" },
  { id: "poster-11", title: "Infinity Groove Vol.2",        category: "Posters & Flyers", image: "/images/infinitygroove.jpg" },
  { id: "poster-12", title: "Karaoke Night",                category: "Posters & Flyers", image: "/images/karaoke.jpg" },
  { id: "poster-13", title: "Karaoke Night Special",        category: "Posters & Flyers", image: "/images/karaoke-night.jpg" },
  { id: "poster-14", title: "Kwetunyumbani",                category: "Posters & Flyers", image: "/images/kwetunyumbani.jpg" },
  { id: "poster-15", title: "Ladies Night",                 category: "Posters & Flyers", image: "/images/ladies.jpg" },
  { id: "poster-16", title: "Ladies Night Edition",         category: "Posters & Flyers", image: "/images/ladiesnight.jpg" },
  { id: "poster-17", title: "Mercy Church",                 category: "Posters & Flyers", image: "/images/mercy.jpg" },
  { id: "poster-18", title: "Mugithi Fiesta",               category: "Posters & Flyers", image: "/images/mugithifiesta.jpg" },
  { id: "poster-19", title: "Mwale 2026",                   category: "Posters & Flyers", image: "/images/mwale.jpg" },
  { id: "poster-20", title: "Nyambura",                     category: "Posters & Flyers", image: "/images/nyambura.jpg" },
  { id: "poster-21", title: "Pauline – Merry Christmas",    category: "Posters & Flyers", image: "/images/pauline.jpg" },
  { id: "poster-22", title: "Graduation Reggae",            category: "Posters & Flyers", image: "/images/reggae.jpg" },
  { id: "poster-23", title: "Samidoh",                      category: "Posters & Flyers", image: "/images/samidoh.jpg" },
  { id: "poster-24", title: "Sold Out",                     category: "Posters & Flyers", image: "/images/soldout.jpg" },
  { id: "poster-25", title: "Sold Out Vibes",               category: "Posters & Flyers", image: "/images/soldoutvibes.webp" },
  { id: "poster-26", title: "Sylvia Takeover",              category: "Posters & Flyers", image: "/images/sylvia.jpg" },
  { id: "poster-27", title: "Takeover",                     category: "Posters & Flyers", image: "/images/takeover.jpg" },
  { id: "poster-28", title: "Tour",                         category: "Posters & Flyers", image: "/images/tour.jpg" },
  { id: "poster-29", title: "Urban Vibes",                  category: "Posters & Flyers", image: "/images/urbanvibes.jpg" },
  { id: "poster-30", title: "Mama Miradi",                   category: "Posters & Flyers", image: "/images/tanofresh.jpeg" },
  { id: "poster-31", title: "Matiangi President",           category: "Posters & Flyers", image: "/images/MATIANGI.jpg" },
  { id: "poster-38", title: "Urban Legend 1",               category: "Posters & Flyers", image: "/images/1.jpg" },
  { id: "poster-39", title: "Urban Legend 2",               category: "Posters & Flyers", image: "/images/2.jpg" },
  { id: "poster-40", title: "Urban Legend Vol.1",           category: "Posters & Flyers", image: "/images/URBAN LEGEND 1.jpg" },
  { id: "poster-41", title: "Urban Legend Vol.2",           category: "Posters & Flyers", image: "/images/URBAN LEGEND 2.jpg" },
  { id: "poster-43", title: "Urban Legend Vol.4",           category: "Posters & Flyers", image: "/images/URBAN LEGEND.jpg" },
  { id: "poster-44", title: "Redeemed Church – Vision Bearer", category: "Posters & Flyers", image: "/images/REDEEMED CHURCH -VISION BEARER.jpg" },

  // ─── Other categories — images TBD ──────────────────────────────────────────
  // Invitations & Cards
  { id: "inv-01", title: "Wedding Invitation Card",  category: "Invitations & Cards", image: "/images/inv-wedding.jpg" },
  { id: "inv-02", title: "Birthday Invitation",      category: "Invitations & Cards", image: "/images/inv-birthday.jpg" },
  { id: "inv-03", title: "Corporate Event Invite",   category: "Invitations & Cards", image: "/images/inv-corporate.jpg" },
  { id: "inv-04", title: "Baby Shower Card",         category: "Invitations & Cards", image: "/images/inv-babyshower.jpg" },
  { id: "inv-05", title: "Graduation Card",          category: "Invitations & Cards", image: "/images/inv-graduation.jpg" },

  // Certificates
  { id: "cert-01", title: "Training Certificate",          category: "Certificates", image: "/images/cert-training.jpg" },
  { id: "cert-02", title: "Award of Excellence",           category: "Certificates", image: "/images/cert-award.jpg" },
  { id: "cert-03", title: "School Completion Certificate", category: "Certificates", image: "/images/cert-school.jpg" },
  { id: "cert-04", title: "Participation Certificate",     category: "Certificates", image: "/images/cert-participation.jpg" },

 
 // Fiverr Gigs
{ id: "gig-01", title: "Data Analysis & Automation",  category: "Fiverr Gigs", image: "/images/data.jpg" },
{ id: "gig-02", title: "Fast Responsive Websites",     category: "Fiverr Gigs", image: "/images/websites.jpg" },
{ id: "gig-03", title: "High-Converting Online Stores",category: "Fiverr Gigs", image: "/images/stores.jpg" },
{ id: "gig-04", title: "Professional Mobile Apps",     category: "Fiverr Gigs", image: "/images/mobile.jpg" },
{ id: "gig-05", title: "Secure Full Stack Web Apps",   category: "Fiverr Gigs", image: "/images/fullstack.jpg" },

  // CV / Resume & Cover Letter
  { id: "cv-01", title: "Professional CV",         category: "CV / Resume & Cover Letter", image: "/images/cv-professional.jpg" },
  { id: "cv-02", title: "Creative Resume",         category: "CV / Resume & Cover Letter", image: "/images/cv-creative.jpg" },
  { id: "cv-03", title: "Cover Letter Layout",     category: "CV / Resume & Cover Letter", image: "/images/cover-letter.jpg" },
  { id: "cv-04", title: "Executive CV with Photo", category: "CV / Resume & Cover Letter", image: "/images/cv-executive.jpg" },
  { id: "cv-05", title: "Minimalist Resume",       category: "CV / Resume & Cover Letter", image: "/images/cv-minimalist.jpg" },

  // Banners & Roll-Ups
  { id: "banner-01", title: "Roll-Up Banner 85×200cm",   category: "Banners & Roll-Ups", image: "/images/rollup-01.jpg" },
  { id: "banner-02", title: "Outdoor Backdrop Banner",   category: "Banners & Roll-Ups", image: "/images/backdrop-01.jpg" },
  { id: "banner-03", title: "Social Media Web Banner",   category: "Banners & Roll-Ups", image: "/images/web-banner.jpg" },
  { id: "banner-04", title: "Pull-Up Exhibition Banner", category: "Banners & Roll-Ups", image: "/images/pullup-01.jpg" },
  { id: "banner-05", title: "Step & Repeat Banner",      category: "Banners & Roll-Ups", image: "/images/step-repeat.jpg" },

  // Menus & Price Lists
  { id: "menu-01", title: "Restaurant Menu A4", category: "Menus & Price Lists", image: "/images/menu-restaurant.jpg" },
  { id: "menu-02", title: "Café Drinks Menu",   category: "Menus & Price Lists", image: "/images/menu-cafe.jpg" },
  { id: "menu-03", title: "Service Price List", category: "Menus & Price Lists", image: "/images/pricelist-service.jpg" },
  { id: "menu-04", title: "Salon Price Card",   category: "Menus & Price Lists", image: "/images/pricelist-salon.jpg" },
  { id: "menu-05", title: "Spa Treatment Menu", category: "Menus & Price Lists", image: "/images/menu-spa.jpg" },

  // Labels & Stickers
  { id: "label-01", title: "Honey Jar Label",        category: "Labels & Stickers", image: "/images/label-honey.jpg" },
  { id: "label-02", title: "Cosmetics Bottle Label", category: "Labels & Stickers", image: "/images/label-cosmetics.jpg" },
  { id: "label-03", title: "Brand Sticker Pack",     category: "Labels & Stickers", image: "/images/sticker-brand.jpg" },
  { id: "label-04", title: "Water Bottle Label",     category: "Labels & Stickers", image: "/images/label-water.jpg" },
  { id: "label-05", title: "Product Sticker Set",    category: "Labels & Stickers", image: "/images/sticker-product.jpg" },

  // Product Design
  { id: "prod-01", title: "Packaging Box Mockup", category: "Product Design", image: "/images/packaging-box.jpg" },
  { id: "prod-02", title: "T-Shirt Print Design", category: "Product Design", image: "/images/tshirt-print.jpg" },
  { id: "prod-03", title: "Branded Mug Mockup",   category: "Product Design", image: "/images/mug-branded.jpg" },
  { id: "prod-04", title: "Tote Bag Design",       category: "Product Design", image: "/images/tote-bag.jpg" },
  { id: "prod-05", title: "Branded Cap Design",    category: "Product Design", image: "/images/cap-branded.jpg" },

  // Company Profiles
  { id: "cp-01", title: "Construction Firm Profile", category: "Company Profiles", image: "/images/profile-construction.jpg" },
  { id: "cp-02", title: "NGO Company Profile",       category: "Company Profiles", image: "/images/profile-ngo.jpg" },
  { id: "cp-03", title: "Tech Startup Profile",      category: "Company Profiles", image: "/images/profile-tech.jpg" },
  { id: "cp-04", title: "Logistics Company Profile", category: "Company Profiles", image: "/images/profile-logistics.jpg" },

  // YouTube Thumbnails
  { id: "yt-01", title: "Tech Tutorial Thumbnail", category: "YouTube Thumbnails", image: "/images/thumb-tech.jpg" },
  { id: "yt-02", title: "Vlog Thumbnail",          category: "YouTube Thumbnails", image: "/images/thumb-vlog.jpg" },
  { id: "yt-03", title: "Business Tips Thumbnail", category: "YouTube Thumbnails", image: "/images/thumb-business.jpg" },
  { id: "yt-04", title: "Motivation Thumbnail",    category: "YouTube Thumbnails", image: "/images/thumb-motivation.jpg" },
  { id: "yt-05", title: "Podcast Cover Thumbnail", category: "YouTube Thumbnails", image: "/images/thumb-podcast.jpg" },

  // Brochures
  { id: "broc-01", title: "Tri-fold Service Brochure", category: "Brochures", image: "/images/brochure-service.jpg" },
  { id: "broc-02", title: "School Prospectus",         category: "Brochures", image: "/images/brochure-school.jpg" },
  { id: "broc-03", title: "Real Estate Brochure",      category: "Brochures", image: "/images/brochure-realestate.jpg" },
  { id: "broc-04", title: "Medical Clinic Brochure",   category: "Brochures", image: "/images/brochure-medical.jpg" },
];