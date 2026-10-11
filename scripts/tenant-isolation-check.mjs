// Cross-school isolation check against a real Supabase project.
// Signs in as a School B user and tries to read/modify School A rows.
// Uses the secret key ONLY to create and clean up one labelled probe row.
//
// Env: SB_URL, SB_KEY (publishable), SB_SECRET, SCHOOL_A_ID,
//      B_EMAIL, B_PASSWORD
import { createClient } from "@supabase/supabase-js";

const { SB_URL, SB_KEY, SB_SECRET, SCHOOL_A_ID, B_EMAIL, B_PASSWORD } = process.env;
for (const [k, v] of Object.entries({ SB_URL, SB_KEY, SB_SECRET, SCHOOL_A_ID, B_EMAIL, B_PASSWORD })) {
  if (!v) throw new Error(`Missing ${k}`);
}

const admin = createClient(SB_URL, SB_SECRET, { auth: { persistSession: false } });
const b = createClient(SB_URL, SB_KEY, { auth: { persistSession: false } });

const results = [];
const record = (name, pass, detail) => results.push({ name, pass, detail });

const { error: signInError } = await b.auth.signInWithPassword({ email: B_EMAIL, password: B_PASSWORD });
if (signInError) throw signInError;

// Probe row owned by School A, used for write tests so real data is never touched.
const { data: probe, error: probeError } = await admin
  .from("students")
  .insert({ name: "DEVIN ISOLATION PROBE", student_class: "TEST", parent_phone: "+923000000000", school_id: SCHOOL_A_ID })
  .select("id")
  .single();
if (probeError) throw probeError;

try {
  const { data: aStudents } = await b.from("students").select("id").eq("school_id", SCHOOL_A_ID);
  record("B cannot read A students", (aStudents ?? []).length === 0, `${aStudents?.length ?? 0} rows visible`);

  const { data: aSchool } = await b.from("schools").select("id").eq("id", SCHOOL_A_ID);
  record("B cannot read A school record", (aSchool ?? []).length === 0, `${aSchool?.length ?? 0} rows visible`);

  const { data: aProfiles } = await b.from("profiles").select("user_id").eq("school_id", SCHOOL_A_ID);
  record("B cannot read A profiles", (aProfiles ?? []).length === 0, `${aProfiles?.length ?? 0} rows visible`);

  for (const t of ["buses", "drivers", "routes", "attendance"]) {
    const { data } = await b.from(t).select("id");
    record(`B cannot read A ${t}`, (data ?? []).length === 0, `${data?.length ?? 0} rows visible`);
  }

  const { data: updated } = await b.from("students").update({ name: "HACKED" }).eq("id", probe.id).select("id");
  record("B cannot update A student", (updated ?? []).length === 0, `${updated?.length ?? 0} rows updated`);

  const { data: deleted } = await b.from("students").delete().eq("id", probe.id).select("id");
  record("B cannot delete A student", (deleted ?? []).length === 0, `${deleted?.length ?? 0} rows deleted`);

  const { data: inserted, error: insertErr } = await b
    .from("students")
    .insert({ name: "DEVIN SPOOF PROBE", student_class: "TEST", parent_phone: "+923000000001", school_id: SCHOOL_A_ID })
    .select("id");
  record("B cannot insert into A by spoofing school_id", Boolean(insertErr) || (inserted ?? []).length === 0, insertErr ? insertErr.message : `${inserted?.length} rows inserted`);
  if (inserted?.length) await admin.from("students").delete().in("id", inserted.map((r) => r.id));

  const { data: me } = await b.auth.getUser();
  const { data: escalated, error: escErr } = await b.from("profiles").update({ school_id: SCHOOL_A_ID }).eq("user_id", me.user.id).select("user_id");
  record("B cannot move itself into School A", Boolean(escErr) || (escalated ?? []).length === 0, escErr ? escErr.message : `${escalated?.length} rows updated`);
  if (escalated?.length) console.warn("WARNING: profile school_id was changed; restore it manually.");

  const { data: roleUp, error: roleErr } = await b.from("profiles").update({ role: "super_admin" }).eq("user_id", me.user.id).select("user_id");
  record("B cannot change its own role", Boolean(roleErr) || (roleUp ?? []).length === 0, roleErr ? roleErr.message : `${roleUp?.length} rows updated`);
  if (roleUp?.length) await admin.from("profiles").update({ role: "admin" }).eq("user_id", me.user.id);
} finally {
  await admin.from("students").delete().eq("id", probe.id);
  await admin.from("students").delete().eq("name", "HACKED").eq("school_id", SCHOOL_A_ID);
}

for (const r of results) console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.name}  (${r.detail})`);
const failed = results.filter((r) => !r.pass).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
