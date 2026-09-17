import { logoutAction } from "@/app/actions/auth";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="rounded-md px-3 py-1.5 text-sm text-stone-300 hover:bg-stone-800 hover:text-white"
      >
        Sair
      </button>
    </form>
  );
}
