import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Check, Eye, EyeOff, Plus, Save, Search, Trash2 } from "lucide-react";
import { ImageUploader } from "@/components/ImageUploader";
import { supabase } from "@/lib/supabase";
import { slugifyIndustryName, type Industry } from "@/lib/industries";

type IndustryDraft = Omit<Industry, "id" | "created_at" | "updated_at"> & { id?: string };

const emptyIndustry = (sort_order: number): IndustryDraft => ({
  name: "",
  slug: "",
  tagline: "",
  hero_headline: "",
  description: "",
  overview: "",
  hero_image_url: "",
  challenges: [],
  solutions: [],
  outcomes: [],
  use_cases: [],
  faqs: [],
  service_slugs: [],
  seo_title: "",
  seo_description: "",
  cta_label: "Talk to us about your project",
  cta_link: "/contact",
  sort_order,
  published: false,
});

const inputClass = "w-full rounded-lg border border-[#DCD5C9] bg-white px-3 py-2.5 text-sm text-[#1A1A16] focus:border-[#007979] focus:outline-none focus:ring-2 focus:ring-[#007979]/15";

function linesToList(value: string) {
  return value.split("\n").map((line) => line.trim()).filter(Boolean);
}

function listToLines(value: string[] | null | undefined) {
  return (value ?? []).join("\n");
}

function formatContentPairs(values: { title: string; description: string }[] | undefined) {
  return (values ?? []).map(({ title, description }) => `${title} | ${description}`).join("\n");
}

function parseContentPairs(value: string) {
  return value.split("\n").map((line) => {
    const [title = "", ...rest] = line.split("|");
    return { title: title.trim(), description: rest.join("|").trim() };
  }).filter((item) => item.title || item.description);
}

function formatFaqs(values: { question: string; answer: string }[] | undefined) {
  return (values ?? []).map(({ question, answer }) => `${question} | ${answer}`).join("\n");
}

function parseFaqs(value: string) {
  return value.split("\n").map((line) => {
    const [question = "", ...rest] = line.split("|");
    return { question: question.trim(), answer: rest.join("|").trim() };
  }).filter((item) => item.question || item.answer);
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#524646]/75">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs leading-5 text-[#524646]/60">{hint}</span>}
    </label>
  );
}

export default function ManageIndustries() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<IndustryDraft | null>(null);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const industriesQuery = useQuery({
    queryKey: ["admin-industries"],
    queryFn: async () => {
      const { data, error } = await supabase.from("industries").select("*").order("sort_order").order("name");
      if (error) throw error;
      return (data ?? []) as Industry[];
    },
  });
  const industries = useMemo(() => industriesQuery.data ?? [], [industriesQuery.data]);
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term ? industries.filter((item) => `${item.name} ${item.tagline}`.toLowerCase().includes(term)) : industries;
  }, [industries, search]);

  const saveMutation = useMutation({
    mutationFn: async (draft: IndustryDraft) => {
      const payload = {
        name: draft.name.trim(),
        slug: slugifyIndustryName(draft.slug),
        tagline: draft.tagline.trim(),
        hero_headline: draft.hero_headline.trim(),
        description: draft.description.trim(),
        overview: draft.overview.trim(),
        hero_image_url: draft.hero_image_url.trim(),
        challenges: draft.challenges.map((item) => item.trim()).filter(Boolean),
        solutions: draft.solutions.map((item) => item.trim()).filter(Boolean),
        outcomes: draft.outcomes.map((item) => item.trim()).filter(Boolean),
        use_cases: draft.use_cases.filter((item) => item.title.trim() && item.description.trim()),
        faqs: draft.faqs.filter((item) => item.question.trim() && item.answer.trim()),
        service_slugs: draft.service_slugs.map((item) => item.trim()).filter(Boolean),
        seo_title: draft.seo_title.trim(),
        seo_description: draft.seo_description.trim(),
        cta_label: draft.cta_label.trim(),
        cta_link: draft.cta_link.trim(),
        sort_order: Math.max(0, Math.round(Number(draft.sort_order) || 0)),
        published: draft.published,
        updated_at: new Date().toISOString(),
        ...(draft.id ? { id: draft.id } : {}),
      };
      const { error } = await supabase.from("industries").upsert(payload);
      if (error) throw error;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-industries"] }),
        queryClient.invalidateQueries({ queryKey: ["industries"] }),
        queryClient.invalidateQueries({ queryKey: ["industry"] }),
      ]);
      setSelected(null);
      setErrorMessage(null);
      setNotice("Industry saved.");
    },
    onError: (error: Error) => setErrorMessage(error.message || "Could not save this industry."),
  });

  const deleteMutation = useMutation({
    mutationFn: async (industry: IndustryDraft) => {
      if (!industry.id) return;
      const { error } = await supabase.from("industries").delete().eq("id", industry.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-industries"] }),
        queryClient.invalidateQueries({ queryKey: ["industries"] }),
      ]);
      setSelected(null);
      setErrorMessage(null);
      setNotice("Industry deleted.");
    },
    onError: (error: Error) => setErrorMessage(error.message || "Could not delete this industry."),
  });

  const reorderMutation = useMutation({
    mutationFn: async ([first, second]: [Industry, Industry]) => {
      const results = await Promise.all([
        supabase.from("industries").update({ sort_order: second.sort_order }).eq("id", first.id),
        supabase.from("industries").update({ sort_order: first.sort_order }).eq("id", second.id),
      ]);
      const failed = results.find((result) => result.error);
      if (failed?.error) throw failed.error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-industries"] }),
    onError: (error: Error) => setErrorMessage(`Could not update industry order: ${error.message}`),
  });

  const openNew = () => {
    setNotice(null);
    setErrorMessage(null);
    setSelected(emptyIndustry(industries.length ? Math.max(...industries.map((item) => item.sort_order)) + 1 : 0));
  };

  const openEdit = (industry: Industry) => {
    setNotice(null);
    setErrorMessage(null);
    setSelected({
      ...industry,
      challenges: industry.challenges ?? [],
      solutions: industry.solutions ?? [],
      outcomes: industry.outcomes ?? [],
      use_cases: industry.use_cases ?? [],
      faqs: industry.faqs ?? [],
      service_slugs: industry.service_slugs ?? [],
    });
  };

  const moveIndustry = (industry: Industry, direction: -1 | 1) => {
    const index = industries.findIndex((item) => item.id === industry.id);
    const next = industries[index + direction];
    if (!next) return;
    setErrorMessage(null);
    reorderMutation.mutate([industry, next]);
  };

  return (
    <div className="min-w-0 space-y-6">
      <header className="flex flex-col gap-4 border-b border-[#DCD5C9] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#007979]">Website content</p>
          <h1 className="mt-2 font-display text-2xl font-semibold text-[#1A1A16]">Industries</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[#524646]/75">Manage industry profiles shown in the public directory and navigation menu. Add real photography if you have it; no decorative artwork is required.</p>
        </div>
        <button type="button" onClick={openNew} className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-lg bg-[#007979] px-4 text-sm font-semibold text-white transition hover:bg-[#005F5F] sm:self-auto">
          <Plus size={16} /> Add industry
        </button>
      </header>

      {notice && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">{notice}</p>}
      {errorMessage && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">{errorMessage}</p>}

      <div className={`grid min-w-0 gap-6 ${selected ? "xl:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.2fr)]" : "grid-cols-1"}`}>
        <section className="min-w-0 space-y-4">
          <label className="relative block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#524646]/45" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find an industry" className={`${inputClass} pl-9`} />
          </label>
          {industriesQuery.isPending ? (
            <p className="rounded-xl border border-[#E8E2D6] bg-white p-5 text-sm text-[#524646]/70">Loading industries...</p>
          ) : industriesQuery.error ? (
            <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-900">
              Could not load industries: {industriesQuery.error.message}
            </p>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#CFC8BC] bg-white p-8 text-center">
              <p className="font-semibold">{industries.length ? "No matching industries" : "No industries added yet"}</p>
              <p className="mt-1 text-sm text-[#524646]/70">Create an industry profile to publish a directory page.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {filtered.map((industry) => (
                <li key={industry.id} className={`rounded-xl border bg-white p-4 ${selected?.id === industry.id ? "border-[#007979] ring-2 ring-[#007979]/10" : "border-[#E8E2D6]"}`}>
                  <div className="flex items-start gap-3">
                    {industry.hero_image_url ? <img src={industry.hero_image_url} alt="" className="h-14 w-16 shrink-0 rounded-md object-cover" /> : <div aria-hidden="true" className="h-14 w-16 shrink-0 rounded-md bg-[#EFEAE1]" />}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-[#1A1A16]">{industry.name}</p>
                      <p className="truncate text-xs text-[#524646]/60">/industries/{industry.slug}</p>
                      <p className={`mt-1 text-xs font-medium ${industry.published ? "text-emerald-700" : "text-amber-700"}`}>{industry.published ? "Published" : "Draft"}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#E8E2D6] pt-3">
                    <div className="flex gap-1">
                      <button type="button" aria-label={`Move ${industry.name} up`} disabled={industries.indexOf(industry) === 0 || reorderMutation.isPending} onClick={() => moveIndustry(industry, -1)} className="rounded p-2 text-[#524646]/70 hover:bg-[#EFEAE1] disabled:opacity-30"><ArrowUp size={15} /></button>
                      <button type="button" aria-label={`Move ${industry.name} down`} disabled={industries.indexOf(industry) === industries.length - 1 || reorderMutation.isPending} onClick={() => moveIndustry(industry, 1)} className="rounded p-2 text-[#524646]/70 hover:bg-[#EFEAE1] disabled:opacity-30"><ArrowDown size={15} /></button>
                    </div>
                    <div className="flex gap-2">
                      {industry.published && <a href={`/industries/${industry.slug}`} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#DCD5C9] px-3 text-xs font-semibold text-[#524646]"><Eye size={14} /> View</a>}
                      <button type="button" onClick={() => openEdit(industry)} className="min-h-9 rounded-lg bg-[#123B36] px-3 text-xs font-semibold text-white hover:bg-[#007979]">Edit</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {selected && (
          <form
            className="min-w-0 space-y-5 rounded-xl border border-[#E8E2D6] bg-white p-4 sm:p-6"
            onSubmit={(event) => { event.preventDefault(); saveMutation.mutate(selected); }}
          >
            <div className="flex items-start justify-between gap-3 border-b border-[#E8E2D6] pb-4">
              <div>
                <h2 className="font-display text-xl font-semibold">{selected.id ? "Edit industry" : "New industry"}</h2>
                <p className="mt-1 text-xs text-[#524646]/65">Public page: /industries/{slugifyIndustryName(selected.slug) || "your-industry"}</p>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="rounded-lg px-3 py-2 text-sm text-[#524646]/70 hover:bg-[#EFEAE1]">Close</button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Industry name">
                <input required maxLength={120} className={inputClass} value={selected.name} onChange={(event) => {
                  const name = event.target.value;
                  setSelected((current) => current ? { ...current, name, slug: current.slug === slugifyIndustryName(current.name) ? slugifyIndustryName(name) : current.slug } : current);
                }} />
              </Field>
              <Field label="Page slug" hint="Use lowercase letters, numbers and hyphens.">
                <input required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={120} className={inputClass} value={selected.slug} onChange={(event) => setSelected({ ...selected, slug: slugifyIndustryName(event.target.value) })} />
              </Field>
            </div>

            <Field label="Short introduction">
              <input maxLength={220} className={inputClass} value={selected.tagline} onChange={(event) => setSelected({ ...selected, tagline: event.target.value })} placeholder="A short line shown on the directory card and page hero" />
            </Field>
            <Field label="Hero headline" hint="Optional. If left blank, the industry name is used.">
              <input maxLength={180} className={inputClass} value={selected.hero_headline} onChange={(event) => setSelected({ ...selected, hero_headline: event.target.value })} />
            </Field>
            <Field label="Overview" hint="Explain the context and audience. Avoid unsupported results or client claims.">
              <textarea required rows={5} maxLength={3000} className={inputClass} value={selected.description} onChange={(event) => setSelected({ ...selected, description: event.target.value })} />
            </Field>
            <Field label="Detailed overview" hint="Optional longer introduction used on the industry page.">
              <textarea rows={5} maxLength={5000} className={inputClass} value={selected.overview} onChange={(event) => setSelected({ ...selected, overview: event.target.value })} />
            </Field>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#524646]/75">Industry photography <span className="font-normal normal-case tracking-normal">(optional)</span></p>
              <ImageUploader currentUrl={selected.hero_image_url || undefined} onUploadComplete={(url) => setSelected((current) => current ? { ...current, hero_image_url: url } : current)} folderPath="industries" label="Upload a real industry photo" />
              {selected.hero_image_url && <button type="button" onClick={() => setSelected({ ...selected, hero_image_url: "" })} className="mt-2 text-xs font-semibold text-rose-700 underline">Remove image</button>}
            </div>

            <Field label="Common priorities (one per line)">
              <textarea rows={5} className={inputClass} value={listToLines(selected.challenges)} onChange={(event) => setSelected({ ...selected, challenges: linesToList(event.target.value) })} placeholder={"Finding information quickly\nKeeping content up to date"} />
            </Field>
            <Field label="How we help (one per line)">
              <textarea rows={5} className={inputClass} value={listToLines(selected.solutions)} onChange={(event) => setSelected({ ...selected, solutions: linesToList(event.target.value) })} placeholder={"Plan clearer customer journeys\nBuild useful digital workflows"} />
            </Field>
            <Field label="Outcomes (one per line)">
              <textarea rows={4} className={inputClass} value={listToLines(selected.outcomes)} onChange={(event) => setSelected({ ...selected, outcomes: linesToList(event.target.value) })} />
            </Field>
            <Field label="Use cases (one per line: title | description)" hint="Separate each title and description with a vertical bar.">
              <textarea rows={6} className={inputClass} value={formatContentPairs(selected.use_cases)} onChange={(event) => setSelected({ ...selected, use_cases: parseContentPairs(event.target.value) })} placeholder={"Online admissions | Help prospective learners find course information and apply.\nParent communication | Keep common school updates in one clear place."} />
            </Field>
            <Field label="Frequently asked questions (one per line: question | answer)" hint="Separate each question and answer with a vertical bar.">
              <textarea rows={6} className={inputClass} value={formatFaqs(selected.faqs)} onChange={(event) => setSelected({ ...selected, faqs: parseFaqs(event.target.value) })} placeholder={"What can we start with? | We can begin with a focused review of your current website and goals."} />
            </Field>
            <Field label="Related service page IDs (one per line)" hint="Use the service route IDs, for example web-development or digital-consultancy.">
              <textarea rows={3} className={inputClass} value={listToLines(selected.service_slugs)} onChange={(event) => setSelected({ ...selected, service_slugs: linesToList(event.target.value) })} />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Call-to-action label">
                <input maxLength={100} className={inputClass} value={selected.cta_label} onChange={(event) => setSelected({ ...selected, cta_label: event.target.value })} />
              </Field>
              <Field label="Call-to-action link">
                <input maxLength={500} className={inputClass} value={selected.cta_link} onChange={(event) => setSelected({ ...selected, cta_link: event.target.value })} placeholder="/contact" />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="SEO page title">
                <input maxLength={180} className={inputClass} value={selected.seo_title} onChange={(event) => setSelected({ ...selected, seo_title: event.target.value })} />
              </Field>
              <Field label="SEO description">
                <textarea rows={3} maxLength={300} className={inputClass} value={selected.seo_description} onChange={(event) => setSelected({ ...selected, seo_description: event.target.value })} />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Display order">
                <input type="number" min="0" step="1" className={inputClass} value={selected.sort_order} onChange={(event) => setSelected({ ...selected, sort_order: Number(event.target.value) })} />
              </Field>
              <div className="flex items-end">
                <button type="button" onClick={() => setSelected({ ...selected, published: !selected.published })} className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold ${selected.published ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
                  {selected.published ? <Eye size={15} /> : <EyeOff size={15} />}
                  {selected.published ? "Published" : "Draft — not public"}
                </button>
              </div>
            </div>

            {errorMessage && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">{errorMessage}</p>}
            <div className="flex flex-wrap justify-between gap-2 border-t border-[#E8E2D6] pt-4">
              {selected.id ? (
                <button type="button" disabled={deleteMutation.isPending || saveMutation.isPending} onClick={() => {
                  if (window.confirm(`Permanently delete "${selected.name}" and its public detail page?`)) deleteMutation.mutate(selected);
                }} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-rose-200 px-3 text-sm font-semibold text-rose-700 disabled:opacity-50">
                  <Trash2 size={15} /> Delete
                </button>
              ) : <span />}
              <button type="submit" disabled={saveMutation.isPending || !selected.name.trim() || !selected.description.trim()} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#007979] px-5 text-sm font-semibold text-white disabled:opacity-50">
                {saveMutation.isPending ? <span>Saving...</span> : <><Save size={15} /><span>Save industry</span><Check size={14} /></>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
