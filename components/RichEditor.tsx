"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapLink from "@tiptap/extension-link";
import TiptapImage from "@tiptap/extension-image";
import { useEffect, useState, useRef, useCallback } from "react";

interface Props {
  content: string;
  onChange: (html: string) => void;
}

interface ArticleResult {
  id: string;
  title: string;
  slug: string;
  category: string;
}

export default function RichEditor({ content, onChange }: Props) {
  const [linkModal, setLinkModal] = useState<"internal" | "external" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ArticleResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [extUrl, setExtUrl] = useState("");
  const [extNofollow, setExtNofollow] = useState(true);
  const [extNewTab, setExtNewTab] = useState(true);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: {},
      }),
      TiptapImage,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const searchArticles = useCallback((q: string) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!q.trim()) { setSearchResults([]); return; }
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/admin/articles?q=${encodeURIComponent(q)}&status=PUBLISHED`);
        const data = await res.json();
        setSearchResults(data.articles || []);
      } catch { setSearchResults([]); }
      setSearching(false);
    }, 300);
  }, []);

  function insertInternalLink(article: ArticleResult) {
    if (!editor) return;
    const href = `/${article.slug}`;
    const { from, to } = editor.state.selection;
    if (from === to) {
      editor.chain().focus().insertContent(`<a href="${href}">${article.title}</a>`).run();
    } else {
      editor.chain().focus().setLink({ href }).run();
    }
    closeModal();
  }

  function insertExternalLink() {
    if (!editor || !extUrl.trim()) return;
    let url = extUrl.trim();
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;

    const rel = extNofollow ? "nofollow noopener noreferrer" : extNewTab ? "noopener noreferrer" : null;
    const target = extNewTab ? "_blank" : null;

    const { from, to } = editor.state.selection;
    if (from === to) {
      const domain = new URL(url).hostname.replace("www.", "");
      editor.chain().focus().insertContent(`<a href="${url}"${target ? ` target="${target}"` : ""}${rel ? ` rel="${rel}"` : ""}>${domain}</a>`).run();
    } else {
      editor.chain().focus().setLink({ href: url, target, rel }).run();
    }
    closeModal();
  }

  function closeModal() {
    setLinkModal(null);
    setSearchQuery("");
    setSearchResults([]);
    setExtUrl("");
    setExtNofollow(true);
    setExtNewTab(true);
  }

  if (!editor) return null;

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, overflow: "hidden", position: "relative" }}>
      <div style={{ display: "flex", gap: 2, padding: "6px 8px", background: "#fafafa", borderBottom: "1px solid #e5e5e5", flexWrap: "wrap" }}>
        <TBtn active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>B</TBtn>
        <TBtn active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>I</TBtn>
        <TBtn active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</TBtn>
        <TBtn active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</TBtn>
        <TBtn active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>• Liste</TBtn>
        <TBtn active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. Liste</TBtn>
        <TBtn active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>Alıntı</TBtn>
        <div style={{ width: 1, background: "#ddd", margin: "0 4px" }} />
        <TBtn active={linkModal === "internal"} onClick={() => setLinkModal("internal")} color="#16a34a">İç Link</TBtn>
        <TBtn active={linkModal === "external"} onClick={() => setLinkModal("external")} color="#2563eb">Dış Link</TBtn>
        {editor.isActive("link") && (
          <TBtn active={false} onClick={() => editor.chain().focus().unsetLink().run()} color="#dc2626">Link Kaldır</TBtn>
        )}
        <div style={{ width: 1, background: "#ddd", margin: "0 4px" }} />
        <TBtn active={false} onClick={() => {
          const url = window.prompt("Görsel URL:");
          if (url) editor.chain().focus().setImage({ src: url }).run();
        }}>Görsel</TBtn>
        <TBtn active={false} onClick={() => editor.chain().focus().setHorizontalRule().run()}>—</TBtn>
      </div>

      {linkModal === "internal" && (
        <div style={{ padding: 16, background: "#f0fdf4", borderBottom: "1px solid #bbf7d0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#16a34a" }}>İç Link — Site İçi Makale</span>
            <button onClick={closeModal} style={{ background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: 16 }}>✕</button>
          </div>
          <input
            type="text"
            placeholder="Makale ara..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); searchArticles(e.target.value); }}
            autoFocus
            style={{ width: "100%", padding: "8px 12px", border: "1px solid #bbf7d0", borderRadius: 6, fontSize: 13, marginBottom: 8, color: "#111" }}
          />
          {searching && <p style={{ fontSize: 11, color: "#888" }}>Aranıyor...</p>}
          {searchResults.length > 0 && (
            <div style={{ maxHeight: 200, overflowY: "auto" }}>
              {searchResults.map(a => (
                <button key={a.id} onClick={() => insertInternalLink(a)}
                  style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 10px", background: "#fff", border: "1px solid #e5e5e5", borderRadius: 4, marginBottom: 4, cursor: "pointer", fontSize: 12, color: "#111" }}>
                  <span style={{ fontWeight: 600 }}>{a.title}</span>
                  <span style={{ color: "#888", marginLeft: 8, fontSize: 10 }}>/{a.slug}</span>
                </button>
              ))}
            </div>
          )}
          {searchQuery && !searching && searchResults.length === 0 && (
            <p style={{ fontSize: 11, color: "#888" }}>Sonuç bulunamadı</p>
          )}
        </div>
      )}

      {linkModal === "external" && (
        <div style={{ padding: 16, background: "#eff6ff", borderBottom: "1px solid #bfdbfe" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#2563eb" }}>Dış Link — Harici URL</span>
            <button onClick={closeModal} style={{ background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: 16 }}>✕</button>
          </div>
          <input
            type="text"
            placeholder="https://ornek.com/sayfa"
            value={extUrl}
            onChange={e => setExtUrl(e.target.value)}
            autoFocus
            style={{ width: "100%", padding: "8px 12px", border: "1px solid #bfdbfe", borderRadius: 6, fontSize: 13, marginBottom: 10, color: "#111" }}
          />
          <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: "#555", display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
              <input type="checkbox" checked={extNofollow} onChange={e => setExtNofollow(e.target.checked)} />
              nofollow
            </label>
            <label style={{ fontSize: 12, color: "#555", display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
              <input type="checkbox" checked={extNewTab} onChange={e => setExtNewTab(e.target.checked)} />
              Yeni sekmede aç
            </label>
          </div>
          <button onClick={insertExternalLink}
            style={{ padding: "6px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            Ekle
          </button>
        </div>
      )}

      <EditorContent editor={editor} style={{ padding: 16, minHeight: 350, color: "#333", fontSize: 14, lineHeight: 1.7 }} />
      <style>{`
        .tiptap { outline: none; }
        .tiptap h2 { font-size: 20px; font-weight: 700; margin: 20px 0 8px; color: #111; }
        .tiptap h3 { font-size: 16px; font-weight: 600; margin: 16px 0 6px; color: #222; }
        .tiptap p { margin-bottom: 12px; color: #444; }
        .tiptap strong { color: #111; }
        .tiptap a { color: #2563eb; text-decoration: underline; }
        .tiptap ul, .tiptap ol { padding-left: 20px; margin-bottom: 12px; }
        .tiptap li { margin-bottom: 4px; color: #444; }
        .tiptap blockquote { border-left: 3px solid #ddd; padding-left: 16px; color: #888; margin: 12px 0; }
        .tiptap img { max-width: 100%; border-radius: 4px; margin: 12px 0; }
        .tiptap hr { border: none; border-top: 1px solid #e5e5e5; margin: 20px 0; }
      `}</style>
    </div>
  );
}

function TBtn({ active, onClick, children, color }: { active: boolean; onClick: () => void; children: React.ReactNode; color?: string }) {
  return (
    <button onClick={onClick} type="button"
      style={{
        padding: "4px 8px", fontSize: 11, fontWeight: 600, borderRadius: 4, cursor: "pointer",
        background: active ? (color || "#111") : "#e5e5e5", color: active ? "#fff" : (color || "#666"), border: "none",
      }}>
      {children}
    </button>
  );
}
