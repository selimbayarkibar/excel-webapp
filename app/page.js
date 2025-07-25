"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [sourceFileName, setSourceFileName] = useState("");
  const [destFileName, setDestFileName] = useState("");
  const [quarter, setQuarter] = useState("Q1");
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setUserEmail(user.email);
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        router.push("/login");
      } else if (session?.user) {
        setUserEmail(session.user.email);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  async function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData();
    const sourceFile = e.target.elements.source.files[0];
    const destinationFile = e.target.elements.destination.files[0];

    formData.append("source_file", sourceFile);
    formData.append("destination_file", destinationFile);
    formData.append("quarter", quarter);

    setLoading(true);
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const blob = await res.blob();
    setLoading(false);

    const baseName = destinationFile.name.replace(/\.xlsx$/, "");
    const downloadName = `processed_${baseName}.xlsx`;

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = downloadName;
    a.click();
  }

  return (
    <main className="min-h-screen bg-white text-black flex items-center justify-center p-4 relative">
      {userEmail && (
        <div className="absolute top-6 right-6 bg-gray-100 shadow px-4 py-2 rounded text-sm text-gray-700">
          Logged in as: <span className="font-semibold">{userEmail}</span>
          <button
            onClick={handleLogout}
            className="ml-2 text-red-600 hover:underline hover:cursor-pointer text-xs"
          >
            Logout
          </button>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-8 max-w-lg w-full">
        <h1 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-2">
          <span>📊</span> <span>P&B Excel Web App</span>
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Source File */}
          <label
            htmlFor="source_file"
            className="text-md font-semibold text-black"
          >
            Select Source File (2025 Nisan, Mayıs, Haziran)
          </label>
          <input
            id="source"
            type="file"
            name="source"
            accept=".xlsx"
            className="hidden"
            onChange={(e) => setSourceFileName(e.target.files[0]?.name || "")}
            required
          />
          <label
            htmlFor="source"
            className="cursor-pointer border border-gray-300 p-2 rounded bg-gray-50 hover:bg-gray-100 transition"
          >
            {sourceFileName || "Choose Source File"}
            {sourceFileName && (
              <button
                type="button"
                onClick={() => setSourceFileName("")}
                className="text-red-600 text-xs hover:underline hover:cursor-pointer ml-2"
              >
                Remove File
              </button>
            )}
          </label>

          {/* Destination File */}
          <label
            htmlFor="destination_file"
            className="text-md font-semibold text-black"
          >
            Select Destination File (Bütçe)
          </label>
          <input
            id="destination"
            type="file"
            name="destination"
            accept=".xlsx"
            className="hidden"
            onChange={(e) => setDestFileName(e.target.files[0]?.name || "")}
            required
          />
          <label
            htmlFor="destination"
            className="cursor-pointer border border-gray-300 p-2 rounded bg-gray-50 hover:bg-gray-100 transition"
          >
            {destFileName || "Choose Destination File"}
            {destFileName && (
              <button
                type="button"
                onClick={() => setDestFileName("")}
                className="text-red-600 text-xs hover:underline hover:cursor-pointer ml-2"
              >
                Remove File
              </button>
            )}
          </label>

          {/* Quarter Dropdown */}
          <label htmlFor="quarter" className="text-md font-semibold text-black">
            Select Quarter
          </label>
          <select
            name="quarter"
            value={quarter}
            onChange={(e) => setQuarter(e.target.value)}
            className="border border-gray-300 p-2 rounded bg-gray-50 hover:bg-gray-100 transition"
            required
          >
            <option value="Q1">Q1</option>
            <option value="Q2">Q2</option>
            <option value="Q3">Q3</option>
            <option value="Q4">Q4</option>
          </select>

          {/* Submit */}
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "Processing..." : "Upload & Process"}
          </button>
        </form>
      </div>
    </main>
  );
}
