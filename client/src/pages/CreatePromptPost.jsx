import { Link, useLocation } from "react-router-dom";

export default function CreatePromptPost() {
  const location = useLocation();
  const { promptId, promptText } = location.state ?? {};

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 text-[#FFFCEF]">
      <Link
        to="/"
        className="mb-6 inline-block text-[#EFB758] underline hover:no-underline"
      >
        ← Back to prompt board
      </Link>
      <h1 className="mb-4 font-poppins text-2xl font-semibold">
        Create your post
      </h1>
      {promptText ? (
        <p className="mb-6 text-[#FBF3E5]">{promptText}</p>
      ) : (
        <p className="mb-6 text-neutral-400">
          No prompt was passed. Open this page from the board using the CTA.
        </p>
      )}
      {promptId != null && (
        <p className="text-sm text-neutral-500">Prompt ID: {promptId}</p>
      )}
    </div>
  );
}
