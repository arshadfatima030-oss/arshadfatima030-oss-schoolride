import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/session";

export default async function Home() {
  redirect((await getSessionContext()) ? "/dashboard" : "/login");
}
