"use client";

import { useActionState } from "react";
import { login } from "./actions";
import Link from "next/link";

const initialState = { error: null };

export default function LoginPage() {
  const next = "/";
  const [state, formAction] = useActionState(login, initialState);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-black">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-xl font-semibold mb-4 text-center">
          P&B Excel Web App Admin Login
        </h1>

        <form action={formAction} className="flex flex-col gap-3">
          <input type="hidden" name="next" value={next} />
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            className="border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            className="border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-200 hover:cursor-pointer"
          >
            Log in
          </button>
        </form>

        {state.error && (
          <p className="mt-4 text-sm text-center text-red-600">{state.error}</p>
        )}
      </div>
    </main>
  );
}
