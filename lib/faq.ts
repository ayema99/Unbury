export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqGroup = {
  id: string;
  title: string;
  items: FaqItem[];
};

export const faqGroups: FaqGroup[] = [
  {
    id: "getting-started",
    title: "Getting started",
    items: [
      {
        question: "What is Unbury?",
        answer:
          "Unbury is a private question-answering tool for your own PDFs. Upload insurance policies, leases, tax forms, medical statements, or contracts, then ask in plain English. Answers come from your files — with a page number and the exact quoted passage — not from generic internet knowledge. If the answer isn’t in what you uploaded, Unbury says so instead of guessing.",
      },
      {
        question: "Is Unbury free?",
        answer:
          "Yes. You can create an account and start uploading documents at no charge. No credit card is required to try it.",
      },
      {
        question: "Do I need an account?",
        answer:
          "Yes. An account keeps your documents private to you. Sign up with an email address and password, then upload files and ask questions from your own workspace.",
      },
      {
        question: "How do I get started?",
        answer:
          "Create a free account, upload a PDF with selectable text, wait until it shows as ready, then open Chat and ask a question. A typical first question is something you would otherwise hunt for in the fine print — a deductible, a notice period, a tax figure, or an exclusion.",
      },
    ],
  },
  {
    id: "documents",
    title: "Documents and uploads",
    items: [
      {
        question: "What file types can I upload?",
        answer:
          "PDF files only, and they must contain selectable text. Unbury reads the words on each page to build a private search index. Scanned images, photos of documents, and handwritten PDFs are not supported yet.",
      },
      {
        question: "Is there a file size limit?",
        answer:
          "Yes. Each PDF can be up to 25 MB. If a file is larger, compress it or split it into smaller PDFs before uploading.",
      },
      {
        question: "Why did my PDF fail to process?",
        answer:
          "The most common reason is that the PDF is a scan without selectable text — Unbury cannot read it yet. Other failures include non-PDF files, files over 25 MB, or a PDF with no readable pages. The document list shows an error message when processing fails.",
      },
      {
        question: "Can I upload more than one document?",
        answer:
          "Yes. You can upload multiple PDFs, including several at once. Questions search across all of the documents in your account, not just the last file you added.",
      },
      {
        question: "Can I share a document with someone else?",
        answer:
          "Not yet. Accounts are single-user: only you can see, search, and delete your files. There is no sharing or team workspace.",
      },
      {
        question: "How do I delete a document?",
        answer:
          "Open Documents and use the delete control on that file. Unbury immediately removes the encrypted file and every indexed excerpt created from it. Deleted documents cannot be queried afterwards.",
      },
    ],
  },
  {
    id: "asking",
    title: "Asking questions",
    items: [
      {
        question: "How does Unbury come up with answers?",
        answer:
          "When you ask a question, Unbury searches the private index of your documents for the most relevant passages. A language model then answers using only those excerpts. It is instructed not to use outside knowledge or fill in gaps. Every claim should be tied to a citation you can open and check.",
      },
      {
        question: "Why do answers include page numbers and quotes?",
        answer:
          "So you can verify the answer against the real document. Each citation shows the filename, page number, and a short quoted snippet. You should still read the surrounding pages if a decision depends on the wording.",
      },
      {
        question: "What if Unbury can’t find the answer?",
        answer:
          "It will tell you it couldn’t find that in your uploaded documents (and, for UK tax questions, in current GOV.UK guidance). That is intentional. A missing answer usually means the fact isn’t in the files you uploaded — for example a flood rider that lives in a separate PDF.",
      },
      {
        question: "Can I ask follow-up questions?",
        answer:
          "Yes. Chat keeps recent turns in the conversation, so you can ask “what about flood damage?” after a deductible question. Follow-ups still have to be grounded in retrieved excerpts; Unbury will not invent a clause to keep the conversation going.",
      },
      {
        question: "Does Unbury search all of my files at once?",
        answer:
          "Yes. A question searches every ready document in your account. If you have both a lease and an insurance policy uploaded, Unbury can pull from either, and citations show which file a quote came from.",
      },
    ],
  },
  {
    id: "uk-tax",
    title: "UK tax",
    items: [
      {
        question: "Can Unbury help with UK tax documents?",
        answer:
          "Yes. If you upload a tax PDF — for example a P60, Self Assessment form, or accountant letter — and ask a tax-related question, Unbury searches your file and official UK guidance together. Answers distinguish what your document says from what current HMRC/GOV.UK guidance says, and cite both.",
      },
      {
        question: "Where does the UK tax guidance come from?",
        answer:
          "From official GOV.UK pages only — such as Income Tax rates, National Insurance, VAT, Capital Gains Tax, dividends, savings, Self Assessment, and HMRC employer threshold guides. Unbury does not use tax blogs, forums, or the model’s memorised training data for rates.",
      },
      {
        question: "How up to date is the tax information?",
        answer:
          "GOV.UK pages are re-fetched weekly. Pages that have not changed are left as they are. Rolling guidance is tagged with the current UK tax year (6 April to 5 April). Employer rates pages are kept for the current year and the previous year.",
      },
      {
        question: "Is Unbury a tax adviser or accountant?",
        answer:
          "No. Tax answers are informational only. Unbury will not tell you what you should file, claim, or pay. For a filing or a personal tax position, speak to a qualified adviser or HMRC.",
      },
    ],
  },
  {
    id: "privacy",
    title: "Privacy and security",
    items: [
      {
        question: "Who can see my documents?",
        answer:
          "Only you, while you are signed in to your account. Files are not given public URLs, and there is no sharing. Other Unbury users cannot search your documents.",
      },
      {
        question: "How are my files stored?",
        answer:
          "After upload, each PDF is encrypted at rest with AES-256-GCM. The original unencrypted upload is discarded. Indexed text is stored privately and tied to your user id so search never crosses accounts.",
      },
      {
        question: "Are my documents used to train AI models?",
        answer:
          "No. Your files are used only to answer your questions. They are not used to train models.",
      },
      {
        question: "What happens when I delete a document?",
        answer:
          "The encrypted file and all indexed excerpts from it are removed immediately. That document can no longer appear in answers or citations.",
      },
    ],
  },
  {
    id: "limitations",
    title: "Limitations and advice",
    items: [
      {
        question: "Is Unbury legal, financial, or medical advice?",
        answer:
          "No. Answers are generated from your uploaded documents (and, for tax questions, official GOV.UK guidance) for information only. They are not a substitute for a solicitor, accountant, tax adviser, insurer, or clinician. Always check the original document — and a professional — before you act.",
      },
      {
        question: "What can’t Unbury do yet?",
        answer:
          "It cannot read scanned or handwritten PDFs (no OCR yet). It does not accept Word, images, or other non-PDF files. Citations show a quoted snippet rather than an embedded page viewer. Documents cannot be shared between accounts. Search is keyword-based, so unusual wording in your question can miss a relevant passage — try the terms used in the document if an answer looks thin.",
      },
      {
        question: "How do I sign out?",
        answer:
          "While you are signed in, use Sign out in the app header. You will return to the Unbury home page and need to log in again to see your documents.",
      },
    ],
  },
];

const featuredQuestions = new Set([
  "What is Unbury?",
  "What file types can I upload?",
  "What if Unbury can’t find the answer?",
  "Who can see my documents?",
  "Is Unbury legal, financial, or medical advice?",
]);

export const featuredFaqs: FaqItem[] = faqGroups
  .flatMap((group) => group.items)
  .filter((item) => featuredQuestions.has(item.question));
