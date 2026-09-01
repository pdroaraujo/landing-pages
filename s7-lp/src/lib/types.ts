export type Role = 'admin' | 'seller';

export type Profile = {
  id: string;
  full_name: string;
  role: Role;
};

export type WebsiteStatus = 'none' | 'own' | 'instagram' | 'linktree' | 'unknown';

export type SiteAnalysis = {
  score: number; // 0-10 — quanto MAIOR, mais vale a pena um upgrade
  verdict: string; // parecer curto (Gemini)
  checks: {
    https: boolean;
    mobileViewport: boolean;
    sslValid: boolean;
    hasTitle: boolean;
    hasMetaDescription: boolean;
    staleCopyright: boolean;
    slow: boolean;
  };
};

export type Business = {
  id: string;
  place_id: string | null;
  name: string;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  city: string | null;
  niche: string | null;
  category: string | null;
  rating: number | null;
  reviews: number | null;
  website: string | null;
  website_status: WebsiteStatus;
  has_site: boolean;
  is_lead: boolean; // true = sem site próprio -> lead quente
  analysis: SiteAnalysis | null;
  first_seen_run: string | null;
  created_at: string;
};

export type CallStatus =
  | 'pending'
  | 'called'
  | 'no_answer'
  | 'callback'
  | 'not_interested'
  | 'won'
  | 'lost';

export type ListItem = {
  id: string;
  list_id: string;
  business_id: string;
  assigned_to: string | null;
  call_status: CallStatus;
  notes: string | null;
  contacted_at: string | null;
  business?: Business;
  assignee?: Profile;
};

export type ProspectList = {
  id: string;
  date: string;
  name: string;
  mode: ProspectMode;
  niche: string | null;
  city: string | null;
  created_by: string;
  created_at: string;
  items_count?: number;
};

export type ProspectMode = 'buscar' | 'scanner' | 'roleta';
export type ProspectSource = 'apify' | 'osm';

export type Sale = {
  id: string;
  client_name: string;
  product: string;
  value: number;
  recurring: boolean;
  monthly_value: number;
  contract_signed: boolean;
  seller: string | null;
  sold_at: string;
  source: 'manual' | 'import';
  created_at: string;
};
