import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ExternalLink, Image as ImageIcon, Pencil, Plus, Save, Trash2, UploadCloud, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

const BUCKET = "site-assets";
const MAX_UPLOAD_MB = 5;

type AboutPerson = {
  id: string;
  name: string;
  role: string | null;
  information: string | null;
  profile_url: string | null;
  image_url: string | null;
  published: boolean;
  sort_order: number;
};

type SoftwareTool = {
  id: string;
  icon_url: string;
};

type PersonForm = Omit<AboutPerson, "id"> & { id?: string };

const emptyPerson = (): PersonForm => ({
  name: "",
  role: "",
  information: "",
  profile_url: "",
  image_url: "",
  published: true,
  sort_order: 0,
});

const linesToArray = (value: string) => value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

const normalizeUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const parsed = new URL(withProtocol);
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") throw new Error("Enter a valid http or https link.");
  return parsed.href;
};

export default function ManageAbout() {
  const queryClient = useQueryClient();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const aboutImageInputRef = useRef<HTMLInputElement>(null);
  const [background, setBackground] = useState("");
  const [education, setEducation] = useState("");
  const [softSkills, setSoftSkills] = useState("");
  const [hardSkills, setHardSkills] = useState("");
  const [software, setSoftware] = useState<SoftwareTool[]>([]);
  const [aboutImageUrl, setAboutImageUrl] = useState("");
  const [personForm, setPersonForm] = useState<PersonForm | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingAboutImage, setUploadingAboutImage] = useState(false);
  const [uploadingSoftwareIconId, setUploadingSoftwareIconId] = useState<string | null>(null);
  const [imageDropActive, setImageDropActive] = useState(false);

  const aboutQuery = useQuery({
    queryKey: ["admin-home-about"],
    queryFn: async () => {
      const { data, error } = await supabase.from("homepage_about").select("*").eq("id", 1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const peopleQuery = useQuery({
    queryKey: ["admin-home-about-shoutouts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("homepage_shoutouts").select("*").order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as AboutPerson[];
    },
  });

  useEffect(() => {
    if (!aboutQuery.data) return;
    setBackground(aboutQuery.data.background ?? "");
    setEducation(Array.isArray(aboutQuery.data.education) ? aboutQuery.data.education.join("\n") : "");
    setSoftSkills(Array.isArray(aboutQuery.data.soft_skills) ? aboutQuery.data.soft_skills.join("\n") : "");
    setHardSkills(Array.isArray(aboutQuery.data.hard_skills) ? aboutQuery.data.hard_skills.join("\n") : "");
    setSoftware(Array.isArray(aboutQuery.data.software)
      ? aboutQuery.data.software.map((tool: { id?: string; icon_url?: string }, index: number) => ({
          id: tool.id || `software-${index}`,
          icon_url: tool.icon_url || "",
        }))
      : []);
    setAboutImageUrl(aboutQuery.data.profile_image_url ?? "");
  }, [aboutQuery.data]);

  const saveAbout = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("homepage_about").upsert({
        id: 1,
        background: background.trim(),
        education: linesToArray(education),
        soft_skills: linesToArray(softSkills),
        hard_skills: linesToArray(hardSkills),
        software: software
          .filter((tool) => tool.icon_url.trim())
          .map((tool) => ({ id: tool.id, icon_url: tool.icon_url.trim() })),
        profile_image_url: aboutImageUrl.trim() || null,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setErrorMessage("");
      void queryClient.invalidateQueries({ queryKey: ["admin-home-about"] });
      void queryClient.invalidateQueries({ queryKey: ["home-about"] });
    },
    onError: (error: Error) => setErrorMessage(error.message || "Could not save About content."),
  });

  const savePerson = useMutation({
    mutationFn: async (form: PersonForm) => {
      if (!form.name.trim()) throw new Error("Name is required.");
      const payload = {
        name: form.name.trim(),
        role: form.role?.trim() || null,
        information: form.information?.trim() || null,
        profile_url: normalizeUrl(form.profile_url ?? ""),
        image_url: normalizeUrl(form.image_url ?? ""),
        published: form.published,
        sort_order: Number(form.sort_order) || 0,
      };
      const result = form.id
        ? await supabase.from("homepage_shoutouts").update(payload).eq("id", form.id)
        : await supabase.from("homepage_shoutouts").insert(payload);
      if (result.error) throw result.error;
    },
    onSuccess: () => {
      setErrorMessage("");
      setPersonForm(null);
      void queryClient.invalidateQueries({ queryKey: ["admin-home-about-shoutouts"] });
      void queryClient.invalidateQueries({ queryKey: ["home-about-shoutouts"] });
    },
    onError: (error: Error) => setErrorMessage(error.message || "Could not save profile."),
  });

  const deletePerson = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("homepage_shoutouts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      setErrorMessage("");
      void queryClient.invalidateQueries({ queryKey: ["admin-home-about-shoutouts"] });
      void queryClient.invalidateQueries({ queryKey: ["home-about-shoutouts"] });
    },
    onError: (error: Error) => setErrorMessage(error.message || "Could not delete profile."),
  });

  const people = peopleQuery.data ?? [];

  const uploadPersonImage = async (file?: File) => {
    if (!file || !personForm) return;
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Choose an image file.");
      return;
    }
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setErrorMessage(`Image must be ${MAX_UPLOAD_MB}MB or smaller.`);
      return;
    }

    setErrorMessage("");
    setUploadingImage(true);
    try {
      const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
      const path = `about-shoutouts/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: "31536000",
        contentType: file.type,
      });
      if (error) throw error;
      const imageUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
      if (!imageUrl) throw new Error("Image uploaded but no public URL was returned.");
      setPersonForm((current) => current ? { ...current, image_url: imageUrl } : current);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not upload profile image.");
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const uploadAboutImage = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Choose an image file.");
      return;
    }
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setErrorMessage(`Image must be ${MAX_UPLOAD_MB}MB or smaller.`);
      return;
    }

    setErrorMessage("");
    setUploadingAboutImage(true);
    try {
      const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
      const path = `about-profile/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: "31536000",
        contentType: file.type,
      });
      if (error) throw error;
      const imageUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
      if (!imageUrl) throw new Error("Image uploaded but no public URL was returned.");
      setAboutImageUrl(imageUrl);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not upload About profile image.");
    } finally {
      setUploadingAboutImage(false);
      if (aboutImageInputRef.current) aboutImageInputRef.current.value = "";
    }
  };

  const uploadSoftwareIcon = async (toolId: string, file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Choose an image file for the software logo.");
      return;
    }
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setErrorMessage(`Software logo must be ${MAX_UPLOAD_MB}MB or smaller.`);
      return;
    }

    setErrorMessage("");
    setUploadingSoftwareIconId(toolId);
    try {
      const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
      const path = `about-software/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: "31536000",
        contentType: file.type,
      });
      if (error) throw error;
      const iconUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
      if (!iconUrl) throw new Error("Logo uploaded but no public URL was returned.");
      setSoftware((current) => current.map((tool) => tool.id === toolId ? { ...tool, icon_url: iconUrl } : tool));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not upload software logo.");
    } finally {
      setUploadingSoftwareIconId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#FBF9F5] px-4 py-8 text-[#524646] sm:px-6">
      <div className="mx-auto max-w-5xl space-y-8">
        <header>
          <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-[#EC5B38]">Homepage content</p>
          <h1 className="mt-2 font-display text-2xl font-bold text-[#007979] sm:text-3xl">About & acknowledgements</h1>
          <p className="mt-2 max-w-2xl font-body text-sm text-[#524646]/70">Manage the About profile, education, hard and soft skills, software logos, and people featured on the homepage.</p>
        </header>

        {errorMessage && (
          <p className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert">
            <AlertCircle size={16} className="mt-0.5 shrink-0" /> {errorMessage}
          </p>
        )}

        {aboutQuery.isError || peopleQuery.isError ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700" role="alert">
            Could not load About content. Confirm the homepage About migration has been applied.{" "}
            {aboutQuery.error instanceof Error ? aboutQuery.error.message : peopleQuery.error instanceof Error ? peopleQuery.error.message : ""}
          </p>
        ) : null}

        <section className="rounded-xl border border-[#524646]/10 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="font-display text-lg font-bold text-[#007979]">Background & qualifications</h2>
          <p className="mt-1 text-xs text-[#524646]/60">Manage your profile and credentials. Enter one skill per line, and upload a logo for each software tool.</p>
          <form
            className="mt-5 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              saveAbout.mutate();
            }}
          >
            <div>
              <span className="block text-sm font-semibold">About profile photo</span>
              <div
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  void uploadAboutImage(event.dataTransfer.files[0]);
                }}
                className="mt-1.5 flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-[#524646]/20 bg-[#FBF9F5] p-4 sm:flex-row"
              >
                <input
                  ref={aboutImageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => void uploadAboutImage(event.target.files?.[0])}
                />
                {aboutImageUrl ? (
                  <img src={aboutImageUrl} alt="About profile preview" className="h-28 w-28 rounded-full border-2 border-[#007979]/20 object-cover" />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[#007979]/10 font-display text-sm text-[#007979]">Profile photo</div>
                )}
                <div className="text-center sm:text-left">
                  <p className="text-xs text-[#524646]/70">Drag and drop a photo here, or select one from your device.</p>
                  <p className="mt-1 text-[11px] text-[#524646]/55">Image files only, maximum {MAX_UPLOAD_MB}MB. Displayed as a circle.</p>
                  <button
                    type="button"
                    onClick={() => aboutImageInputRef.current?.click()}
                    disabled={uploadingAboutImage}
                    className="mt-2 inline-flex min-h-9 items-center gap-2 rounded-lg bg-[#007979] px-3 py-2 text-xs font-bold text-white hover:bg-[#005e5e] disabled:opacity-50"
                  >
                    <UploadCloud size={14} /> {uploadingAboutImage ? "Uploading…" : "Upload profile photo"}
                  </button>
                  {aboutImageUrl && (
                    <button type="button" onClick={() => setAboutImageUrl("")} className="ml-2 inline-flex min-h-9 items-center gap-1 rounded-lg px-3 py-2 text-xs text-rose-600 hover:bg-rose-50">
                      <Trash2 size={13} /> Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
            <label className="block text-sm font-semibold">
              Short background
              <textarea value={background} onChange={(event) => setBackground(event.target.value)} rows={5} className="mt-1.5 w-full rounded-lg border border-[#524646]/20 bg-[#FBF9F5] p-3 font-normal" placeholder="A brief professional background and approach." />
            </label>
            <label className="block text-sm font-semibold">
              Education & qualifications (one per line)
              <textarea value={education} onChange={(event) => setEducation(event.target.value)} rows={4} className="mt-1.5 w-full rounded-lg border border-[#524646]/20 bg-[#FBF9F5] p-3 font-normal" placeholder={"Qualification — Institution — Year\nCertification — Provider — Year"} />
            </label>
            <label className="block text-sm font-semibold">
              Soft skills (one per line)
              <textarea value={softSkills} onChange={(event) => setSoftSkills(event.target.value)} rows={3} className="mt-1.5 w-full rounded-lg border border-[#524646]/20 bg-[#FBF9F5] p-3 font-normal" placeholder={"Communication\nProblem solving\nCollaboration"} />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-semibold">
                Hard skills (one per line)
                <textarea value={hardSkills} onChange={(event) => setHardSkills(event.target.value)} rows={5} className="mt-1.5 w-full rounded-lg border border-[#524646]/20 bg-[#FBF9F5] p-3 font-normal" placeholder={"Web development\nSystem architecture\nDatabase design\nGraphic design"} />
              </label>
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold">Software & tools</h3>
                  <p className="mt-1 text-xs text-[#524646]/60">Upload a logo or icon for each software tool. Only the icons appear on the homepage.</p>
                </div>
                {software.map((tool) => (
                  <div key={tool.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-[#524646]/10 bg-[#FBF9F5] p-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#524646]/10 bg-white">
                      {tool.icon_url ? <img src={tool.icon_url} alt="Software logo preview" className="h-full w-full object-contain p-1" /> : <ImageIcon size={18} className="text-[#007979]/60" />}
                    </div>
                    <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border border-[#007979]/30 px-3 py-2 text-xs font-semibold text-[#007979] hover:bg-[#007979]/5">
                      <UploadCloud size={14} /> {uploadingSoftwareIconId === tool.id ? "Uploading…" : "Upload logo"}
                      <input type="file" accept="image/*" className="hidden" disabled={uploadingSoftwareIconId === tool.id} onChange={(event) => void uploadSoftwareIcon(tool.id, event.target.files?.[0])} />
                    </label>
                    <button
                      type="button"
                      onClick={() => setSoftware((current) => current.filter((entry) => entry.id !== tool.id))}
                      className="inline-flex min-h-10 items-center gap-1 rounded-lg px-3 py-2 text-xs text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setSoftware((current) => [...current, { id: crypto.randomUUID(), icon_url: "" }])}
                  className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-dashed border-[#007979]/40 px-4 py-2 text-xs font-semibold text-[#007979] hover:bg-[#007979]/5"
                >
                  <Plus size={14} /> Add software logo
                </button>
              </div>
            </div>
            <button type="submit" disabled={saveAbout.isPending || aboutQuery.isLoading || uploadingAboutImage || uploadingSoftwareIconId !== null} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#007979] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#005e5e] disabled:opacity-50">
              <Save size={16} /> {saveAbout.isPending ? "Saving…" : "Save About content"}
            </button>
          </form>
        </section>

        <section className="rounded-xl border border-[#524646]/10 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-[#007979]">People to acknowledge</h2>
              <p className="mt-1 text-xs text-[#524646]/60">Add profile cards with their role, a short note, photo URL, and website or profile link.</p>
            </div>
            <button type="button" onClick={() => { setErrorMessage(""); setPersonForm({ ...emptyPerson(), sort_order: people.length }); }} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#EC5B38] px-4 py-2 text-xs font-bold text-white hover:bg-[#d94a27]">
              <Plus size={15} /> Add person
            </button>
          </div>

          {peopleQuery.isLoading ? <p className="py-8 text-center text-sm text-[#524646]/60">Loading profiles…</p> : null}
          {!peopleQuery.isLoading && people.length === 0 ? <p className="py-8 text-center text-sm text-[#524646]/60">No acknowledgement profiles yet.</p> : null}
          <div className="mt-5 divide-y divide-[#524646]/10">
            {people.map((person) => (
              <div key={person.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  {person.image_url ? <img src={person.image_url} alt="" className="h-12 w-16 rounded-lg object-cover" /> : <div className="flex h-12 w-16 items-center justify-center rounded-lg bg-[#007979]/10 font-display text-[#007979]">{person.name.slice(0, 1)}</div>}
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{person.name}</p>
                    <p className="text-xs text-[#524646]/65">{person.role || "No role added"} · {person.published ? "Published" : "Hidden"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {person.profile_url && <a href={person.profile_url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${person.name}'s profile`} className="rounded-md p-2 text-[#007979] hover:bg-[#007979]/10"><ExternalLink size={16} /></a>}
                  <button type="button" onClick={() => { setErrorMessage(""); setPersonForm({ ...person }); }} aria-label={`Edit ${person.name}`} className="rounded-md p-2 text-[#007979] hover:bg-[#007979]/10"><Pencil size={16} /></button>
                  <button type="button" onClick={() => { if (window.confirm(`Delete ${person.name} from the homepage?`)) deletePerson.mutate(person.id); }} aria-label={`Delete ${person.name}`} className="rounded-md p-2 text-rose-600 hover:bg-rose-50"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {personForm && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
            <section className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-7" role="dialog" aria-modal="true" aria-labelledby="about-person-form-heading">
              <div className="flex items-center justify-between gap-4">
                <h2 id="about-person-form-heading" className="font-display text-lg font-bold text-[#007979]">{personForm.id ? "Edit profile card" : "Add profile card"}</h2>
                <button type="button" onClick={() => setPersonForm(null)} aria-label="Close profile editor" className="rounded-md p-2 hover:bg-stone-100"><X size={18} /></button>
              </div>
              <form
                className="mt-5 space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  savePerson.mutate(personForm);
                }}
              >
                <Field label="Name" value={personForm.name} onChange={(value) => setPersonForm({ ...personForm, name: value })} required />
                <Field label="Role / connection" value={personForm.role ?? ""} onChange={(value) => setPersonForm({ ...personForm, role: value })} placeholder="Mentor, collaborator, colleague…" />
                <Field label="Short information or shout-out" value={personForm.information ?? ""} onChange={(value) => setPersonForm({ ...personForm, information: value })} multiline />
                <Field label="Website or social media link" value={personForm.profile_url ?? ""} onChange={(value) => setPersonForm({ ...personForm, profile_url: value })} placeholder="https://website.com or social profile URL" />
                <div>
                  <span className="block text-sm font-semibold">Profile photo</span>
                  <div
                    onDragOver={(event) => { event.preventDefault(); setImageDropActive(true); }}
                    onDragLeave={(event) => {
                      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setImageDropActive(false);
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      setImageDropActive(false);
                      void uploadPersonImage(event.dataTransfer.files[0]);
                    }}
                    className={`mt-1.5 rounded-xl border-2 border-dashed p-4 transition-colors ${imageDropActive ? "border-[#EC5B38] bg-[#EC5B38]/5" : "border-[#524646]/20 bg-[#FBF9F5]"}`}
                  >
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => void uploadPersonImage(event.target.files?.[0])}
                    />
                    <div className="flex flex-col items-center gap-3 sm:flex-row">
                      {personForm.image_url ? (
                        <img src={personForm.image_url} alt="Profile photo preview" className="h-20 w-28 rounded-lg border border-[#524646]/10 object-cover" />
                      ) : (
                        <div className="flex h-20 w-28 items-center justify-center rounded-lg bg-[#007979]/10 text-[#007979]">
                          <ImageIcon size={24} />
                        </div>
                      )}
                      <div className="text-center sm:text-left">
                        <p className="text-xs text-[#524646]/70">Drag and drop a photo here, or choose one from your device.</p>
                        <p className="mt-1 text-[11px] text-[#524646]/55">Images only, maximum {MAX_UPLOAD_MB}MB.</p>
                        <button
                          type="button"
                          onClick={() => imageInputRef.current?.click()}
                          disabled={uploadingImage}
                          className="mt-2 inline-flex min-h-9 items-center gap-2 rounded-lg bg-[#007979] px-3 py-2 text-xs font-bold text-white hover:bg-[#005e5e] disabled:opacity-50"
                        >
                          <UploadCloud size={14} /> {uploadingImage ? "Uploading…" : "Choose image"}
                        </button>
                        {personForm.image_url && (
                          <button
                            type="button"
                            onClick={() => setPersonForm({ ...personForm, image_url: "" })}
                            className="ml-2 inline-flex min-h-9 items-center gap-1 rounded-lg px-3 py-2 text-xs text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 size={13} /> Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <Field label="Display order" value={String(personForm.sort_order)} onChange={(value) => setPersonForm({ ...personForm, sort_order: Number(value) || 0 })} type="number" />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={personForm.published} onChange={(event) => setPersonForm({ ...personForm, published: event.target.checked })} />
                  Show this card on the homepage
                </label>
                <div className="flex justify-end gap-3 border-t border-stone-100 pt-4">
                  <button type="button" onClick={() => setPersonForm(null)} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-stone-100 px-4 py-2 text-sm hover:bg-stone-200"><X size={14} /> Cancel</button>
                  <button type="submit" disabled={savePerson.isPending || uploadingImage} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#007979] px-4 py-2 text-sm font-bold text-white hover:bg-[#005e5e] disabled:opacity-50"><Save size={14} /> {savePerson.isPending ? "Saving…" : "Save profile"}</button>
                </div>
              </form>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  multiline = false,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
  type?: string;
}) {
  const className = "mt-1.5 w-full rounded-lg border border-[#524646]/20 bg-[#FBF9F5] p-3 font-normal focus:border-[#007979] focus:outline-none";
  return (
    <label className="block text-sm font-semibold">
      {label}
      {multiline ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} rows={4} className={className} />
      ) : (
        <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} className={className} />
      )}
    </label>
  );
}
