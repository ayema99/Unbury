"use client";

import { useCallback, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import AppShell from "@/components/AppShell";

const MAX_FILE_BYTES = 25 * 1024 * 1024;

export default function DocumentsPage() {
  return (
    <AppShell>
      <DocumentsView />
    </AppShell>
  );
}

function DocumentsView() {
  const documents = useQuery(api.documents.list);
  const generateUploadUrl = useMutation(api.documents.generateUploadUrl);
  const createDocument = useMutation(api.documents.create);
  const removeDocument = useMutation(api.documents.remove);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      setUploadError(null);
      const pdfs = Array.from(files);
      for (const file of pdfs) {
        if (file.type !== "application/pdf") {
          setUploadError(`"${file.name}" is not a PDF.`);
          return;
        }
        if (file.size > MAX_FILE_BYTES) {
          setUploadError(`"${file.name}" is larger than 25 MB.`);
          return;
        }
      }
      setUploading(true);
      try {
        for (const file of pdfs) {
          const url = await generateUploadUrl();
          const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": file.type },
            body: file,
          });
          if (!response.ok) throw new Error("Upload failed");
          const { storageId } = await response.json();
          await createDocument({ storageId, filename: file.name });
        }
      } catch (error) {
        setUploadError(
          error instanceof Error ? error.message : "Upload failed"
        );
      } finally {
        setUploading(false);
      }
    },
    [generateUploadUrl, createDocument]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Your documents</h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload PDFs with selectable text — insurance policies, tax forms,
          leases, medical statements. They are encrypted at rest and only you
          can query them.
        </p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-colors ${
          dragging
            ? "border-slate-500 bg-slate-100"
            : "border-slate-300 bg-white hover:border-slate-400"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <p className="font-medium text-slate-700">
          {uploading ? "Uploading…" : "Drop PDFs here or click to browse"}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          PDF only · up to 25 MB per file
        </p>
      </div>

      {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}

      <DocumentList
        documents={documents}
        onDelete={(documentId) => removeDocument({ documentId })}
      />
    </div>
  );
}

type DocumentRow = {
  _id: Id<"documents">;
  _creationTime: number;
  filename: string;
  pageCount?: number;
  status: "pending" | "processing" | "ready" | "failed";
  errorMessage?: string;
};

function DocumentList({
  documents,
  onDelete,
}: {
  documents: DocumentRow[] | undefined;
  onDelete: (id: Id<"documents">) => void;
}) {
  if (documents === undefined) {
    return <p className="text-sm text-slate-400">Loading documents…</p>;
  }
  if (documents.length === 0) {
    return (
      <p className="text-sm text-slate-400">
        No documents yet. Upload a PDF above to get started.
      </p>
    );
  }
  return (
    <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
      {documents.map((doc) => (
        <div key={doc._id} className="flex items-center gap-4 px-4 py-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{doc.filename}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {doc.pageCount ? `${doc.pageCount} pages · ` : ""}
              {new Date(doc._creationTime).toLocaleDateString()}
              {doc.status === "failed" && doc.errorMessage && (
                <span className="text-red-500"> — {doc.errorMessage}</span>
              )}
            </p>
          </div>
          <StatusBadge status={doc.status} />
          <button
            onClick={() => {
              if (
                confirm(
                  `Delete "${doc.filename}"? This permanently removes the file and everything indexed from it.`
                )
              ) {
                onDelete(doc._id);
              }
            }}
            className="text-xs text-slate-400 hover:text-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: DocumentRow["status"] }) {
  const styles: Record<DocumentRow["status"], string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    processing: "bg-blue-50 text-blue-700 border-blue-200",
    ready: "bg-emerald-50 text-emerald-700 border-emerald-200",
    failed: "bg-red-50 text-red-700 border-red-200",
  };
  const labels: Record<DocumentRow["status"], string> = {
    pending: "Queued",
    processing: "Processing…",
    ready: "Ready",
    failed: "Failed",
  };
  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-full border ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
