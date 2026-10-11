// Cross-school isolation check against a real Supabase project.
// Signs in as a School A admin and a School B admin (publishable key only, no secret key)
// and checks that B cannot read or modify A's rows. A creates and deletes its own
// labelled probe rows, so real data is never touched.
//
// Env: SB_URL, SB_KEY (publishable), SCHOOL_A_ID, A_EMAIL, A_PASSWORD, B_EMAIL, B_PASSWORD
import { createClient } from "@supabase/supabase-js";

const env = process.env;
const required = ["SB_URL", "SB_KEY", "SCHOOL_A_ID", "A_EMAIL", "A_PASSWORD", "B_EMAIL", "B_PASSWORD"];
for (const k of required) if (!env[k]) throw new Error(`Missing ${k}`);
const { SB_URL, SB_KEY, SCHOOL_A_ID } = env;

async function signIn(email, password) {
  const c = createClient(SB_URL, SB_KEY, { auth: { persistSession: false } });
  const { error } = await c.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return c;
}
const a = await signIn(env.A_EMAIL, env.A_PASSWORD);
const b = await signIn(env.B_EMAIL, env.B_PASSWORD);

const results = [];
const record = (name, pass, detail) => results.push({ name, pass, detail });
const n = (rows) => (rows ?? []).length;

const PROBES = {
  students: { name: "DEVIN ISOLATION PROBE", student_class: "TEST", parent_phone: "+923000000000" },
  buses: { registration_number: "DEVIN-PROBE" },
  drivers: { driver_name: "DEVIN PROBE DRIVER", phone: "+923000000002", license_number: "DEVIN-PROBE" },
  routes: { route_name: "DEVIN PROBE ROUTE", starting_point: "TEST", destination: "TEST" },
  attendance: { student_name: "DEVIN PROBE", attendance_date: "2000-01-01", status: "Present" },
};
const created = {};

try {
  for (const [t, row] of Object.entries(PROBES)) {
    const { data, error } = await a.from(t).insert({ ...row, school_id: SCHOOL_A_ID }).select("id").single();
    if (error) throw new Error(`A could not create ${t} probe: ${error.message}`);
    created[t] = data.id;
  }

  const { data: aSchool } = await b.from("schools").select("id").eq("id", SCHOOL_A_ID);
  record("B cannot read A school record", n(aSchool) === 0, `${n(aSchool)} rows visible`);
  const { data: aProfiles } = await b.from("profiles").select("user_id").eq("school_id", SCHOOL_A_ID);
  record("B cannot read A profiles", n(aProfiles) === 0, `${n(aProfiles)} rows visible`);

  for (const [t, row] of Object.entries(PROBES)) {
    const { data: own } = await a.from(t).select("id").eq("id", created[t]);
    record(`A can read its own ${t}`, n(own) === 1, `${n(own)} rows visible`);

    const { data: seen } = await b.from(t).select("id").eq("school_id", SCHOOL_A_ID);
    record(`B cannot read A ${t}`, n(seen) === 0, `${n(seen)} rows visible`);

    const field = Object.keys(row)[0];
    const { data: upd } = await b.from(t).update({ [field]: "HACKED" }).eq("id", created[t]).select("id");
    record(`B cannot update A ${t}`, n(upd) === 0, `${n(upd)} rows updated`);

    const { data: del } = await b.from(t).delete().eq("id", created[t]).select("id");
    record(`B cannot delete A ${t}`, n(del) === 0, `${n(del)} rows deleted`);

    const { data: ins, error: insErr } = await b.from(t).insert({ ...row, school_id: SCHOOL_A_ID }).select("id");
    record(`B cannot insert into A ${t} by spoofing school_id`, Boolean(insErr) || n(ins) === 0,
      insErr ? insErr.message : `${n(ins)} rows inserted`);
    if (n(ins)) console.warn(`WARNING: spoofed ${t} rows created: ${ins.map((r) => r.id)}`);
  }

  const { data: me } = await b.auth.getUser();
  const { data: moved, error: moveErr } = await b.from("profiles").update({ school_id: SCHOOL_A_ID }).eq("user_id", me.user.id).select("user_id");
  record("B cannot move itself into School A", Boolean(moveErr) || n(moved) === 0, moveErr ? moveErr.message : `${n(moved)} rows updated`);
  const { data: roleUp, error: roleErr } = await b.from("profiles").update({ role: "super_admin" }).eq("user_id", me.user.id).select("user_id");
  record("B cannot change its own role", Boolean(roleErr) || n(roleUp) === 0, roleErr ? roleErr.message : `${n(roleUp)} rows updated`);
  if (n(moved) || n(roleUp)) console.warn("WARNING: B's profile was modified; restore it manually.");
} finally {
  for (const [t, id] of Object.entries(created)) {
    const { error } = await a.from(t).delete().eq("id", id);
    if (error) console.warn(`Cleanup failed for ${t} ${id}: ${error.message}`);
  }
}

for (const r of results) console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.name}  (${r.detail})`);
const failed = results.filter((r) => !r.pass).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
