# Bazar Moda Sustentável

Plataforma com vitrine pública e painel administrativo para personalizar logo, cores, rodapé e redes sociais em tempo real.

## Stack

- **Front-end e back-end:** Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- **Banco:** SQLite via Prisma (`SiteSettings` + `User`)
- **Auth:** sessão JWT em cookie HTTP-only (`jose` + `bcryptjs`)
- **Validação:** Zod (cores, e-mails, URLs e upload PNG/SVG)

## Requisitos

- Node.js 22+
- npm 11+

## Setup local

```bash
copy .env.example .env
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

Acesse:

- Site público: [http://localhost:3000](http://localhost:3000)
- Painel (URL oculta, não aparece no site): [http://localhost:3000/acesso](http://localhost:3000/acesso)

Credenciais padrão (altere em produção; **nunca** publique no frontend):

- E-mail: `admin@bazar.local`
- Senha: `admin123`

O link `/login` antigo redireciona para a home. Não há atalhos de admin na vitrine pública.

## O que o painel altera

Os dados ficam na tabela `site_settings` (registro único `id = 1`):

- logomarca (PNG/SVG até 2 MB)
- paleta (`--primary-color`, `--secondary-color`, `--background-color`, `--text-color`)
- endereço, CNPJ, telefones e e-mail do rodapé
- URLs de Instagram, WhatsApp, Facebook e TikTok, com opção de ocultar cada uma

O site público só renderiza um ícone/link de rede se a URL não estiver vazia **e** a rede estiver marcada como visível.

## Catálogo e reservas (Fase 2)

- Categorias: Feminino, Masculino, Utensílios
- Produtos com 1–3 fotos, tags, status `AVAILABLE` / `RESERVED` / `SOLD`
- Admin: `/admin/products`, `/admin/products/new`, `/admin/products/[id]/edit`, `/admin/reservas`
- Vitrine na home (filtro por categoria sem reload) + sacola no navegador
- Checkout: reserva 48h + redirecionamento `https://wa.me/...`

Número do WhatsApp da loja: `CHECKOUT_WHATSAPP` no `.env` **ou** URL do WhatsApp em Personalização.

### Expiração das 48h (para revisão)

Não há cron. `releaseExpiredReservations()` roda ao abrir a vitrine, o checkout e a lista de reservas: se `expiresAt` já passou, a reserva vira `EXPIRED` e as peças `RESERVED` voltam para `AVAILABLE`.

## Testes

```bash
npm run test:validations
npm run lint
```

Checklist manual (homologação):

1. Entrar no admin e trocar a logo (desktop e mobile).
2. Alterar as quatro cores e recarregar a home.
3. Atualizar rodapé e conferir CNPJ/telefone/e-mail.
4. Preencher, editar e ocultar cada rede social.
5. Tentar URL inválida e arquivo que não seja PNG/SVG.

## Staging (Docker)

```bash
docker compose up --build
```

Defina `AUTH_SECRET` e `ADMIN_PASSWORD` no ambiente antes de expor o serviço.
