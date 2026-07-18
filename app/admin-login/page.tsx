import Link from "next/link";
import Image from "next/image";

type AdminLoginPageProps = {
  searchParams: Promise<{
    error?: string;
    redirect?: string;
  }>;
};

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const params = await searchParams;

  const redirect =
    typeof params.redirect === "string"
      ? params.redirect
      : "/live-centre";

  const incorrectPassword = params.error === "incorrect";
  const configurationError = params.error === "config";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10 text-slate-900">
      <section className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        <div className="bg-green-950 px-6 py-6 text-center text-white">
          <div className="flex justify-center">
  <Image
    src="/apple-icon.png"
    alt="Swift Tees"
    width={72}
    height={72}
    priority
  />
</div>

          <p className="mt-4 text-xs font-black uppercase tracking-[0.3em] text-green-300">
            Swift Tees
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight">
            Tournament Access
          </h1>

          <p className="mt-3 text-sm font-medium leading-6 text-green-100">
            Live scoring, leaderboards and tournament setup are currently
            restricted while they are being prepared.
          </p>
        </div>

        <div className="p-6">
          <form
            action="/api/admin-login"
            method="POST"
            className="space-y-4"
          >
            <input type="hidden" name="redirect" value={redirect} />

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-black text-slate-800"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                autoFocus
                required
                placeholder="Enter tournament password"
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-base font-semibold outline-none transition placeholder:text-slate-400 focus:border-green-700 focus:bg-white focus:ring-4 focus:ring-green-100"
              />
            </div>

            {incorrectPassword && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                Incorrect password. Please try again.
              </div>
            )}

            {configurationError && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
                The tournament password has not been configured yet.
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-2xl bg-green-900 px-5 py-3.5 text-base font-black text-white shadow-sm transition hover:bg-green-800 active:scale-[0.98]"
            >
              Unlock Tournament Area
            </button>
          </form>

          <Link
            href="/"
            className="mt-5 flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-100"
          >
            ← Return to Home
          </Link>
        </div>
      </section>
    </main>
  );
}