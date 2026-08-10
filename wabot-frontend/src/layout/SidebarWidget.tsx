import React from "react";

export default function SidebarWidget({ plan = "STARTER" }: { plan?: string }) {
  return (
    <div
      className={`
        mx-auto mb-10 w-full max-w-60 rounded-2xl bg-gray-50 px-4 py-5 text-center dark:bg-white/[0.03]`}
    >
      <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
        Balasin AI
      </h3>
      <p className="mb-4 text-gray-500 text-theme-sm dark:text-gray-400">
        Asisten AI pintar untuk bantu balas chat tokomu 24/7 otomatis.
      </p>
      <div className="flex items-center justify-center p-3 font-medium text-brand-500 rounded-lg bg-brand-50 dark:bg-brand-500/10 text-theme-sm uppercase tracking-wider">
        Paket {plan}
      </div>
    </div>
  );
}
