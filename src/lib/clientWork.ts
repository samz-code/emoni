export interface ProposalLineItem {
  description: string;
  amount_kes: number;
}

export type ProposalStatus = "draft" | "sent" | "accepted" | "declined" | "changes_requested";

export interface ClientProposal {
  id: string;
  public_token: string;
  client_name: string;
  client_email: string;
  company_name: string | null;
  title: string;
  summary: string;
  scope: string;
  line_items: ProposalLineItem[];
  total_kes: number;
  payment_terms: string;
  validity_days: number;
  status: ProposalStatus;
  client_message: string | null;
  accepted_at: string | null;
  created_at: string;
}

export type ReviewStatus = "requested" | "reviewing" | "awaiting_payment" | "paid" | "complete";

export interface WebsiteReview {
  id: string;
  public_token: string;
  client_name: string;
  client_email: string;
  website_url: string;
  goals: string;
  status: ReviewStatus;
  fee_kes: number;
  payment_instructions: string;
  payment_reference: string | null;
  summary: string;
  working_well: string[];
  needs_improvement: string[];
  admin_notes: string;
  created_at: string;
}

export const formatKes = (amount: number) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(amount);

export const toLines = (values: string[]) => values.join("\n");
export const fromLines = (value: string) => value.split("\n").map((line) => line.trim()).filter(Boolean);

export function getErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return "Something went wrong. Please try again.";
}
