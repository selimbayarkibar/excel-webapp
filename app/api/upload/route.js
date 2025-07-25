export async function POST(req) {
  const formData = await req.formData();

  const sourceFile = formData.get("source_file");
  const destinationFile = formData.get("destination_file");
  const quarter = formData.get("quarter");

  if (!sourceFile || !destinationFile || !quarter) {
    return new Response("Missing required fields", { status: 400 });
  }

  const forward = new FormData();
  forward.append("source_file", sourceFile, sourceFile.name);
  forward.append("destination_file", destinationFile, destinationFile.name);
  forward.append("quarter", quarter);

  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/upload/`, {
    method: "POST",
    body: forward,
  });

  if (!res.ok) {
    return new Response("Backend processing failed", { status: 500 });
  }

  const blob = await res.blob();

  return new Response(blob, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  });
}
