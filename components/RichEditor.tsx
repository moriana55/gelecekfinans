"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapLink from "@tiptap/extension-link";
import TiptapImage from "@tiptap/extension-image";
import { useEffect } from "react";

interface Props {
  content: string;
  onChange: (html: string) => void;
}

export default function RichEditor({ content, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      TiptapLink.configure({ openOnClick: false }),
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

  if (!editor) return null;

  return (
    <div style={{ border: "1px solid #333", borderRadius: 6, overflow: "hidden" }}>
      {/* Toolbar */}
      <div style={{ display: "flex", gap: 2, padding: "6px 8px", background: "#1a1a1a", borderBottom: "1px solid #333", flexWrap: "wrap" }}>
        <TBtn active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>B</TBtn>
        <TBtn active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>I</TBtn>
        <TBtn active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</TBtn>
        <TBtn active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</TBtn>
        <TBtn active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>• Liste</TBtn>
        <TBtn active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. Liste</TBtn>
        <TBtn active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>Alıntı</TBtn>
        <TBtn active={false} onClick={() => {
          const url = window.prompt("Link URL:");
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }}>Link</TBtn>
        <TBtn active={false} onClick={() => {
          const url = window.prompt("Görsel URL:");
          if (url) editor.chain().focus().setImage({ src: url }).run();
        }}>Görsel</TBtn>
        <TBtn active={false} onClick={() => editor.chain().focus().setHorizontalRule().run()}>—</TBtn>
      </div>
      {/* Editor */}
      <EditorContent editor={editor} style={{ padding: 16, minHeight: 350, color: "#ddd", fontSize: 14, lineHeight: 1.7 }} />
      <style>{`
        .tiptap { outline: none; }
        .tiptap h2 { font-size: 20px; font-weight: 700; margin: 20px 0 8px; color: #fff; }
        .tiptap h3 { font-size: 16px; font-weight: 600; margin: 16px 0 6px; color: #eee; }
        .tiptap p { margin-bottom: 12px; color: #ccc; }
        .tiptap strong { color: #fff; }
        .tiptap a { color: #60a5fa; text-decoration: underline; }
        .tiptap ul, .tiptap ol { padding-left: 20px; margin-bottom: 12px; }
        .tiptap li { margin-bottom: 4px; color: #ccc; }
        .tiptap blockquote { border-left: 3px solid #444; padding-left: 16px; color: #888; margin: 12px 0; }
        .tiptap img { max-width: 100%; border-radius: 4px; margin: 12px 0; }
        .tiptap hr { border: none; border-top: 1px solid #333; margin: 20px 0; }
      `}</style>
    </div>
  );
}

function TBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} type="button"
      style={{
        padding: "4px 8px", fontSize: 11, fontWeight: 600, borderRadius: 3, cursor: "pointer",
        background: active ? "#fff" : "#333", color: active ? "#000" : "#aaa", border: "none",
      }}>
      {children}
    </button>
  );
}
