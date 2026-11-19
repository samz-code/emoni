// src/lib/contractDocx.ts
import JSZip from "jszip";
import { OWNER, contractRows, fmtDate, kes, type Row, type ServiceContract } from "@/lib/contracts";

/* ───────── palette and page ───────── */
const C = {
  teal: "007979",
  tealDark: "005F5F",
  cream: "FFE2AF",
  creamSoft: "FFF4DC",
  paper: "FBF9F5",
  line: "E8E2D6",
  ink: "1A1A16",
  body: "3A464C",
  muted: "5E6B72",
  orange: "EC5B38",
  sig: "1B2F4A",
  white: "FFFFFF",
};
const W = 9638; // content width in dxa (A4 with 1134 margins)

/* ───────── low-level XML helpers ───────── */
const X = (s: unknown) =>
  String(s ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c] as string));

interface RunOpts { b?: boolean; i?: boolean; c?: string; s?: number; f?: string; shd?: string; sp?: number }
const R = (t: string, o: RunOpts = {}) => {
  const f = o.f || "Calibri";
  return (
    `<w:r><w:rPr><w:rFonts w:ascii="${f}" w:hAnsi="${f}" w:cs="${f}"/>` +
    `${o.b ? "<w:b/>" : ""}${o.i ? "<w:i/>" : ""}<w:color w:val="${o.c || C.body}"/>` +
    `${o.sp ? `<w:spacing w:val="${o.sp}"/>` : ""}<w:sz w:val="${o.s || 21}"/>` +
    `${o.shd ? `<w:shd w:val="clear" w:color="auto" w:fill="${o.shd}"/>` : ""}</w:rPr>` +
    `<w:t xml:space="preserve">${X(t)}</w:t></w:r>`
  );
};
const L = (t: string, o?: RunOpts) =>
  t.split("\n").map((l, i) => (i ? "<w:r><w:br/></w:r>" : "") + R(l, o)).join("");

interface ParaOpts {
  before?: number;
  after?: number;
  align?: "left" | "center" | "right" | "both";
  keepNext?: boolean;
  keepLines?: boolean;
  bottom?: [number, string];
  line?: number;
}
const P = (content: string, o: ParaOpts = {}) =>
  `<w:p><w:pPr>${o.keepNext ? "<w:keepNext/>" : ""}${o.keepLines ? "<w:keepLines/>" : ""}` +
  `${o.bottom ? `<w:pBdr><w:bottom w:val="single" w:sz="${o.bottom[0]}" w:space="4" w:color="${o.bottom[1]}"/></w:pBdr>` : ""}` +
  `<w:spacing w:before="${o.before ?? 0}" w:after="${o.after ?? 100}"${o.line ? ` w:line="${o.line}" w:lineRule="auto"` : ""}/>` +
  `${o.align ? `<w:jc w:val="${o.align}"/>` : ""}</w:pPr>${content}</w:p>`;
const SP = (after: number) => P("", { after });

type Side = "top" | "left" | "bottom" | "right" | "insideH" | "insideV";
type Spec = Partial<Record<Side, [number, string]>>;
const SIDES: Side[] = ["top", "left", "bottom", "right", "insideH", "insideV"];
const bdr = (tag: "w:tblBorders" | "w:tcBorders", spec: Spec) =>
  `<${tag}>` +
  SIDES.filter((s) => tag === "w:tblBorders" || !s.startsWith("inside"))
    .map((s) => {
      const v = spec[s];
      return v ? `<w:${s} w:val="single" w:sz="${v[0]}" w:space="0" w:color="${v[1]}"/>` : `<w:${s} w:val="nil"/>`;
    })
    .join("") +
  `</${tag}>`;
const marXml = (tag: "w:tblCellMar" | "w:tcMar", t: number, l: number, b: number, r: number) =>
  `<${tag}><w:top w:w="${t}" w:type="dxa"/><w:left w:w="${l}" w:type="dxa"/><w:bottom w:w="${b}" w:type="dxa"/><w:right w:w="${r}" w:type="dxa"/></${tag}>`;

interface CellOpts { w: number; fill?: string; v?: "top" | "center" | "bottom"; span?: number; borders?: string; mar?: string }
const TC = (content: string, o: CellOpts) =>
  `<w:tc><w:tcPr><w:tcW w:w="${o.w}" w:type="dxa"/>${o.span ? `<w:gridSpan w:val="${o.span}"/>` : ""}` +
  `${o.borders || ""}${o.fill ? `<w:shd w:val="clear" w:color="auto" w:fill="${o.fill}"/>` : ""}` +
  `${o.mar || ""}<w:vAlign w:val="${o.v || "top"}"/></w:tcPr>${content || "<w:p/>"}</w:tc>`;
const TR = (cells: string[]) => `<w:tr><w:trPr><w:cantSplit/></w:trPr>${cells.join("")}</w:tr>`;
const TBL = (rows: string[], grid: number[], o: { borders?: string; mar?: string } = {}) =>
  `<w:tbl><w:tblPr><w:tblW w:w="${W}" w:type="dxa"/>${o.borders ?? bdr("w:tblBorders", {})}` +
  `<w:tblLayout w:type="fixed"/>${o.mar ?? marXml("w:tblCellMar", 80, 120, 80, 120)}</w:tblPr>` +
  `<w:tblGrid>${grid.map((g) => `<w:gridCol w:w="${g}"/>`).join("")}</w:tblGrid>${rows.join("")}</w:tbl>`;

const IMG = (rid: string, id: number, name: string, cx: number, cy: number) =>
  `<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/>` +
  `<wp:docPr id="${id}" name="${name}"/><wp:cNvGraphicFramePr/>` +
  `<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">` +
  `<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="${id}" name="${name}"/><pic:cNvPicPr/></pic:nvPicPr>` +
  `<pic:blipFill><a:blip r:embed="${rid}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>` +
  `<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>` +
  `</pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`;

/* ───────── layout blocks ───────── */
const H = (n: number, t: string) =>
  P(R(String(n), { b: true, c: C.orange, s: 28 }) + R("   " + t.toUpperCase(), { b: true, c: C.teal, s: 24, sp: 20 }), {
    before: 380,
    after: 160,
    keepNext: true,
    bottom: [8, C.teal],
  });

const SUB = (t: string) => P(R(t.toUpperCase(), { b: true, c: C.muted, s: 17, sp: 30 }), { before: 260, after: 100, keepNext: true });

const KV = (rows: Row[]) =>
  TBL(
    rows.map(([k, v]) =>
      TR([
        TC(P(R(k, { b: true, c: C.tealDark, s: 19 }), { after: 0 }), {
          w: 2700,
          fill: C.paper,
          borders: bdr("w:tcBorders", { left: [18, C.teal], top: [4, C.line], bottom: [4, C.line] }),
        }),
        TC(P(L(v, { s: 21 }), { after: 0 }), {
          w: 6938,
          borders: bdr("w:tcBorders", { top: [4, C.line], bottom: [4, C.line] }),
        }),
      ]),
    ),
    [2700, 6938],
    { mar: marXml("w:tblCellMar", 90, 140, 90, 140) },
  );

function servicesTable(c: ServiceContract) {
  const white: [number, string] = [24, C.white];
  return TBL(
    c.services.map((s, i) =>
      TR([
        TC(P(R(String(i + 1).padStart(2, "0"), { b: true, c: C.white, s: 24 }), { after: 0, align: "center" }), {
          w: 700,
          fill: C.teal,
          v: "center",
        }),
        TC(P(R(s.name, { b: true, c: C.ink, s: 22 }), { after: 0 }), { w: 2900, fill: C.creamSoft, v: "center" }),
        TC(P(R(s.scope, { c: C.body, s: 20 }), { after: 0 }), { w: 6038, fill: C.paper, v: "center" }),
      ]),
    ),
    [700, 2900, 6038],
    {
      borders: bdr("w:tblBorders", { top: white, bottom: white, insideH: white }),
      mar: marXml("w:tblCellMar", 120, 150, 120, 150),
    },
  );
}

function addonChips(addons: string[]) {
  const chips = addons.map((a) => R(`\u00A0\u00A0${a}\u00A0\u00A0`, { b: true, c: C.tealDark, s: 19, shd: C.cream })).join(R("   "));
  return SUB("Add-ons") + P(chips, { line: 400, after: 60 });
}

function feeCards(fee: number, deposit: number, percent: number) {
  const card = (label: string, value: string, fill: string, lc: string, vc: string, line?: string) =>
    TC(
      P(R(label.toUpperCase(), { b: true, c: lc, s: 15, sp: 30 }), { after: 40 }) +
        P(R(value, { b: true, c: vc, s: 34 }), { after: 0 }),
      {
        w: 3200,
        fill,
        v: "center",
        borders: line ? bdr("w:tcBorders", { top: [6, line], left: [6, line], bottom: [6, line], right: [6, line] }) : undefined,
      },
    );
  const gap = TC("<w:p/>", { w: 19 });
  return TBL(
    [
      TR([
        card("Agreed project fee", kes(fee), C.teal, C.cream, C.white),
        gap,
        card(`Deposit on signing (${percent}%)`, kes(deposit), C.cream, C.tealDark, C.ink),
        gap,
        card("Balance before delivery", kes(fee - deposit), C.paper, C.muted, C.ink, C.line),
      ]),
    ],
    [3200, 19, 3200, 19, 3200],
    { mar: marXml("w:tblCellMar", 180, 200, 180, 200) },
  );
}

/* ───────── images ───────── */
function loadImg(src: string) {
  return new Promise<HTMLImageElement>((ok, bad) => {
    const i = new Image();
    i.onload = () => ok(i);
    i.onerror = () => bad(new Error("Could not read image."));
    i.src = src;
  });
}

async function clientSignaturePng(dataUrl: string) {
  const img = await loadImg(dataUrl);
  const k = Math.min(1, 700 / img.naturalWidth);
  const w = Math.max(1, Math.round(img.naturalWidth * k));
  const h = Math.max(1, Math.round(img.naturalHeight * k));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  return { base64: canvas.toDataURL("image/png").split(",")[1], w, h };
}

/** Provider signature, generated automatically from the owner's name. */
function providerSignaturePng(name: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 700;
  canvas.height = 200;
  const ctx = canvas.getContext("2d")!;
  const fam = "'Segoe Script','Brush Script MT','Snell Roundhand','Lucida Handwriting',cursive";
  let size = 76;
  ctx.font = `${size}px ${fam}`;
  while (size > 28 && ctx.measureText(name).width > 640) {
    size -= 4;
    ctx.font = `${size}px ${fam}`;
  }
  ctx.fillStyle = `#${C.sig}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(name, 350, 100);
  return { base64: canvas.toDataURL("image/png").split(",")[1], w: 700, h: 200 };
}

async function loadLogo() {
  try {
    const res = await fetch("/whitelogo.png");
    if (!res.ok) return null;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    let img: HTMLImageElement;
    try {
      img = await loadImg(url);
    } finally {
      URL.revokeObjectURL(url);
    }
    if (!img.naturalWidth || !img.naturalHeight) return null;
    return { data: new Uint8Array(await blob.arrayBuffer()), w: img.naturalWidth, h: img.naturalHeight };
  } catch {
    return null;
  }
}

/* ───────── document ───────── */
export async function buildContractDocx(c: ServiceContract): Promise<Blob> {
  const { parties, project, fees } = contractRows(c);
  const [clientSig, logo] = await Promise.all([clientSignaturePng(c.signature_data), loadLogo()]);
  const providerSig = providerSignaturePng(OWNER.rep);

  const sigH = 640080;
  const clientImg = IMG("rId2", 1, "Client signature", Math.min(2600000, Math.round((sigH * clientSig.w) / clientSig.h)), sigH);
  const providerImg = IMG("rId3", 2, "Provider signature", Math.round((sigH * providerSig.w) / providerSig.h), sigH);

  let logoXml = "";
  if (logo) {
    let cy = 420000;
    let cx = Math.round((cy * logo.w) / logo.h);
    if (cx > 2400000) {
      cx = 2400000;
      cy = Math.round((cx * logo.h) / logo.w);
    }
    logoXml = IMG("rId4", 3, "Logo", cx, cy);
  }

  const fee = Number(c.fee_kes);
  const deposit = Math.round(fee * c.deposit_percent) / 100;
  const status = c.status === "countersigned" ? "Countersigned" : c.status === "cancelled" ? "Cancelled" : "Signed";
  const providerDate = fmtDate((c.countersigned_at || c.signed_at) as string);

  /* banner */
  const banner = TBL(
    [
      TR([
        TC(
          P(logoXml || R(OWNER.company, { b: true, c: C.white, s: 34 }), { after: 0 }) +
            P(R(`${OWNER.site}  ·  ${OWNER.phone}`, { c: C.cream, s: 17 }), { before: 60, after: 0 }),
          { w: 6000, fill: C.teal, v: "center" },
        ),
        TC(
          P(R("AGREEMENT NO.", { c: C.cream, s: 15, sp: 40 }), { align: "right", after: 0 }) +
            P(R(c.reference, { b: true, c: C.white, s: 28 }), { align: "right", after: 0 }) +
            P(R(fmtDate(c.signed_at), { c: C.cream, s: 18 }), { align: "right", after: 0 }),
          { w: 3638, fill: C.teal, v: "center" },
        ),
      ]),
      TR([
        TC(`<w:p><w:pPr><w:spacing w:before="0" w:after="0" w:line="40" w:lineRule="exact"/></w:pPr></w:p>`, {
          w: W,
          span: 2,
          fill: C.orange,
          mar: marXml("w:tcMar", 0, 0, 0, 0),
        }),
      ]),
    ],
    [6000, 3638],
    { mar: marXml("w:tblCellMar", 240, 320, 240, 320) },
  );

  const heading =
    P(R("Client Service Agreement", { b: true, c: C.teal, s: 52 }), { before: 320, after: 40 }) +
    P(
      R(`Between ${OWNER.company} and ${c.company_name || c.client_name}   `, { c: C.muted, s: 21 }) +
        R(`\u00A0${status.toUpperCase()}\u00A0`, { b: true, c: C.tealDark, s: 16, shd: C.cream, sp: 20 }),
      { after: 60 },
    );

  /* project details without the long services / add-ons rows (rendered separately) */
  const projectRows = project.filter(([k]) => k !== "Services" && k !== "Add-ons");
  const feeRows: Row[] = [fees[0], ...fees.slice(4)];

  /* terms */
  const terms = c.terms_snapshot
    .map(
      (t, i) =>
        P(R(`4.${i + 1}   ${t.title}`, { b: true, c: C.tealDark, s: 20 }), { before: 140, after: 20, keepNext: true }) +
        P(R(t.body, { s: 19, c: C.body }), { align: "both", after: 60, line: 264 }),
    )
    .join("");

  /* signatures */
  const box = bdr("w:tcBorders", { top: [6, C.line], left: [6, C.line], bottom: [6, C.line], right: [6, C.line] });
  const sigCell = (label: string, img: string, name: string, role: string, date: string) =>
    TC(
      P(R(label, { b: true, c: C.teal, s: 16, sp: 30 }), { after: 80 }) +
        P(img, { after: 40, bottom: [6, C.muted] }) +
        P(R(name, { b: true, c: C.ink, s: 22 }), { before: 80, after: 0 }) +
        P(R(role, { c: C.muted, s: 19 }), { after: 0 }) +
        P(R(`Signed ${date}`, { c: C.teal, s: 18 }), { before: 20, after: 0 }),
      { w: 4700, borders: box },
    );
  const signatures = TBL(
    [
      TR([
        sigCell("FOR THE PROVIDER", providerImg, OWNER.rep, OWNER.company, providerDate),
        TC("<w:p/>", { w: 238 }),
        sigCell("CLIENT", clientImg, c.signed_name, c.company_name || "Client", fmtDate(c.signed_at)),
      ]),
    ],
    [4700, 238, 4700],
    { mar: marXml("w:tblCellMar", 160, 200, 160, 200) },
  );

  const body =
    banner +
    heading +
    H(1, "Parties") +
    KV(parties) +
    H(2, "Project and scope") +
    KV(projectRows) +
    SUB("Services engaged") +
    servicesTable(c) +
    (c.addons?.length ? addonChips(c.addons) : "") +
    H(3, "Fees, payment and timeline") +
    feeCards(fee, deposit, c.deposit_percent) +
    SP(160) +
    KV(feeRows) +
    H(4, "Terms and conditions") +
    terms +
    H(5, "Signatures") +
    P(R("By signing below, the parties agree to be bound by this agreement."), { keepNext: true, after: 140 }) +
    signatures +
    P(
      R(
        `Electronically signed on ${new Date(c.signed_at).toLocaleString("en-GB")}. Agreement no. ${c.reference}. Signed electronically under the laws of Kenya.`,
        { c: C.muted, s: 17 },
      ),
      { before: 200, align: "center" },
    );

  /* footer */
  const fo: RunOpts = { c: C.muted, s: 16 };
  const footer =
    `<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:pPr>` +
    `<w:pBdr><w:top w:val="single" w:sz="6" w:space="6" w:color="${C.line}"/></w:pBdr>` +
    `<w:tabs><w:tab w:val="right" w:pos="${W}"/></w:tabs><w:spacing w:before="0" w:after="0"/></w:pPr>` +
    R(`${OWNER.company}  ·  ${OWNER.site}  ·  ${OWNER.email}`, fo) +
    `<w:r><w:tab/></w:r>` +
    R(`Agreement no. ${c.reference}  ·  Page `, fo) +
    `<w:fldSimple w:instr=" PAGE ">${R("1", fo)}</w:fldSimple>` +
    R(" of ", fo) +
    `<w:fldSimple w:instr=" NUMPAGES ">${R("1", fo)}</w:fldSimple>` +
    `</w:p></w:ftr>`;

  /* package */
  const hd = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
  const ns =
    'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"';
  const REL = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";

  const z = new JSZip();
  z.file(
    "[Content_Types].xml",
    hd +
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/></Types>',
  );
  z.file(
    "_rels/.rels",
    hd +
      `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${REL}/officeDocument" Target="word/document.xml"/></Relationships>`,
  );
  z.file(
    "word/_rels/document.xml.rels",
    hd +
      `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
      `<Relationship Id="rId2" Type="${REL}/image" Target="media/sig.png"/>` +
      `<Relationship Id="rId3" Type="${REL}/image" Target="media/provider-sig.png"/>` +
      (logo ? `<Relationship Id="rId4" Type="${REL}/image" Target="media/logo.png"/>` : "") +
      `<Relationship Id="rId5" Type="${REL}/footer" Target="footer1.xml"/>` +
      `</Relationships>`,
  );
  z.file(
    "word/document.xml",
    hd +
      `<w:document ${ns}><w:body>${body}<w:sectPr><w:footerReference w:type="default" r:id="rId5"/>` +
      `<w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1300" w:left="1134" w:header="708" w:footer="600" w:gutter="0"/></w:sectPr></w:body></w:document>`,
  );
  z.file("word/footer1.xml", hd + footer);
  z.file("word/media/sig.png", clientSig.base64, { base64: true });
  z.file("word/media/provider-sig.png", providerSig.base64, { base64: true });
  if (logo) z.file("word/media/logo.png", logo.data);

  return z.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}

export async function downloadContractDocx(c: ServiceContract) {
  const blob = await buildContractDocx(c);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Service-Agreement-${c.reference}.docx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}