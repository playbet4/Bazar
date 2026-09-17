import { redirect } from "next/navigation";

/** Rota antiga — redireciona para o site público sem revelar o login. */
export default function LegacyLoginPage() {
  redirect("/");
}
