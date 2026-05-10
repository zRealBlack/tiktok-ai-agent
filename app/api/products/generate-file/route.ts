import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { type, filename, data, columns, title } = await request.json();
    // type: "excel" | "csv" | "txt"
    // data: array of objects (rows)
    // columns: optional array of { key, label } for column headers

    if (!type || !data) {
      return NextResponse.json({ ok: false, error: "Missing type or data" }, { status: 400 });
    }

    const safeFilename = (filename || `sarie_file_${Date.now()}`).replace(/[^a-z0-9_\-. ]/gi, "_");

    // ── Excel ──────────────────────────────────────────────────────────────────
    if (type === "excel") {
      const wb = XLSX.utils.book_new();

      // If columns provided, build rows with proper headers
      let rows: any[];
      if (columns && columns.length > 0) {
        const headers = columns.map((c: any) => c.label || c.key);
        const dataRows = (data as any[]).map((row: any) =>
          columns.map((c: any) => row[c.key] ?? "")
        );
        rows = [headers, ...dataRows];
      } else {
        // Auto-detect columns from first row
        const keys = Object.keys(data[0] || {});
        rows = [keys, ...(data as any[]).map((row: any) => keys.map((k) => row[k] ?? ""))];
      }

      const ws = XLSX.utils.aoa_to_sheet(rows);

      // Style the header row (bold)
      const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
        if (ws[cellRef]) {
          ws[cellRef].s = { font: { bold: true } };
        }
      }

      // Auto column widths
      const colWidths = rows[0].map((_: any, colIdx: number) =>
        Math.max(...rows.map((r) => String(r[colIdx] ?? "").length), 10)
      );
      ws["!cols"] = colWidths.map((w: number) => ({ wch: Math.min(w + 2, 50) }));

      XLSX.utils.book_append_sheet(wb, ws, title || "Sheet1");
      const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

      return new NextResponse(buf, {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${safeFilename}.xlsx"`,
        },
      });
    }

    // ── CSV ────────────────────────────────────────────────────────────────────
    if (type === "csv") {
      let csvLines: string[];
      if (columns && columns.length > 0) {
        const headers = columns.map((c: any) => `"${c.label || c.key}"`).join(",");
        const dataRows = (data as any[]).map((row: any) =>
          columns.map((c: any) => `"${String(row[c.key] ?? "").replace(/"/g, '""')}"`).join(",")
        );
        csvLines = [headers, ...dataRows];
      } else {
        const keys = Object.keys(data[0] || {});
        csvLines = [
          keys.map((k) => `"${k}"`).join(","),
          ...(data as any[]).map((row: any) =>
            keys.map((k) => `"${String(row[k] ?? "").replace(/"/g, '""')}"`).join(",")
          ),
        ];
      }

      const csvContent = "\uFEFF" + csvLines.join("\r\n"); // BOM for Excel Arabic support
      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${safeFilename}.csv"`,
        },
      });
    }

    // ── Plain Text ─────────────────────────────────────────────────────────────
    if (type === "txt") {
      const textContent = typeof data === "string" ? data : JSON.stringify(data, null, 2);
      return new NextResponse(textContent, {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Content-Disposition": `attachment; filename="${safeFilename}.txt"`,
        },
      });
    }

    return NextResponse.json({ ok: false, error: `Unsupported file type: ${type}` }, { status: 400 });
  } catch (err: any) {
    console.error("[generate-file]", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
