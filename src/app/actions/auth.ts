"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";
import { consumeRateLimit } from "@/lib/rate-limit";
import {
  clearSessionCookie,
  createSessionToken,
  setSessionCookie,
} from "@/lib/session";

export type AuthState = {
  error?: string;
};

const GENERIC_AUTH_ERROR = "Não foi possível entrar. Verifique os dados e tente de novo.";

function clientKeyFromHeaders(headerList: Headers) {
  const forwarded = headerList.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return headerList.get("x-real-ip") || "unknown";
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  // Honeypot: bots preenchem campos ocultos
  const honeypot = String(formData.get("company_website") ?? "").trim();
  if (honeypot) {
    return { error: GENERIC_AUTH_ERROR };
  }

  const headerList = await headers();
  const rate = consumeRateLimit(
    `login:${clientKeyFromHeaders(headerList)}`,
    5,
    15 * 60 * 1000,
  );
  if (!rate.ok) {
    return {
      error: `Muitas tentativas. Aguarde cerca de ${rate.retryAfterSec}s e tente novamente.`,
    };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  // Mensagem genérica: não revela se o e-mail existe
  if (!parsed.success) {
    return { error: GENERIC_AUTH_ERROR };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });

  if (!user) {
    return { error: GENERIC_AUTH_ERROR };
  }

  const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!ok) {
    return { error: GENERIC_AUTH_ERROR };
  }

  const token = await createSessionToken({
    id: user.id,
    email: user.email,
    name: user.name,
  });
  await setSessionCookie(token);

  redirect("/admin");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/");
}
