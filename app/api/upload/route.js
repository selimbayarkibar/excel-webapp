export async function POST(req) {
  try {
    console.log("Route handler started");

    const formData = await req.formData();

    const sourceFile = formData.get("source_file");
    const destinationFile = formData.get("destination_file");
    const quarter = formData.get("quarter");

    console.log("Files received:", {
      sourceFile: sourceFile?.name,
      destinationFile: destinationFile?.name,
      quarter,
      sourceSize: sourceFile?.size,
      destSize: destinationFile?.size,
    });

    if (!sourceFile || !destinationFile || !quarter) {
      console.error("Missing required fields");
      return new Response("Missing required fields", { status: 400 });
    }

    // Check file sizes (Vercel limit is ~4.5MB)
    const maxSize = 4 * 1024 * 1024; // 4MB
    if (sourceFile.size > maxSize || destinationFile.size > maxSize) {
      console.error("File too large:", {
        sourceSize: sourceFile.size,
        destSize: destinationFile.size,
      });
      return new Response(
        "File too large. Please use files smaller than 4MB.",
        { status: 413 }
      );
    }

    const forward = new FormData();
    forward.append("source_file", sourceFile, sourceFile.name);
    forward.append("destination_file", destinationFile, destinationFile.name);
    forward.append("quarter", quarter);

    console.log("Sending to backend:", process.env.NEXT_PUBLIC_BACKEND_URL);

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/upload/`, {
      method: "POST",
      body: forward,
    });

    console.log("Backend response status:", res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Backend error:", errorText);
      return new Response(`Backend processing failed: ${errorText}`, {
        status: 500,
      });
    }

    const blob = await res.blob();
    console.log("Blob size:", blob.size);

    if (blob.size === 0) {
      console.error("Empty blob received from backend");
      return new Response("Empty file received from backend", { status: 500 });
    }

    return new Response(blob, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=processed_budget.xlsx",
      },
    });
  } catch (error) {
    console.error("Route handler error:", error);
    return new Response(`Server error: ${error.message}`, { status: 500 });
  }
}
