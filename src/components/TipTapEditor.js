// src/components/TipTapEditor.js
import React, { useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import Quote from "@tiptap/extension-blockquote";
import { CustomImage } from "./CustomImage";

import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Code as CodeIcon,
  Square,
  Maximize2,
  Minimize2,
  Heading1,
  Heading2,
  Heading3,
  List as ListIcon,
  ListOrdered as ListOrderedIcon,
  Quote,
  Image as ImageIcon,
  Link as LinkIcon,
  RotateCcw,
  RotateCw,
  Type,
} from "lucide-react";

/**
 * TipTapEditor (forwardRef)
 * props:
 *  - initialContent: string HTML
 */
const TipTapEditor = forwardRef(({ initialContent = "<p></p>" }, ref) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight,
      CustomImage,
      Link.configure({ openOnClick: true }),
    ],
    content: initialContent,
    editorProps: { attributes: { class: "tt-editor-content focus:outline-none" } },
  });

  // Expose editor instance to parent via ref
  useImperativeHandle(ref, () => ({
    getHTML: () => editor?.getHTML() || "",
  }));

  // Update editor if initialContent changes
  useEffect(() => {
    if (editor && typeof initialContent === "string") {
      const existing = editor.getHTML();
      if (initialContent !== existing) editor.commands.setContent(initialContent, false);
    }
  }, [initialContent, editor]);

  // Image insertion
  const addImage = useCallback(() => {
    const url = window.prompt("Paste Imgur Image URL (direct .jpg/.png/.webp):");
    if (!url) return;
    const looksLikeImage = /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(url);
    if (!looksLikeImage && !window.confirm("This URL does not look like a direct image. Insert anyway?")) return;
    editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  // Link insertion
  const addLink = useCallback(() => {
    const url = window.prompt("Enter the link URL (https://...)");
    if (!url) return;
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="tt-editor border rounded-lg bg-zinc-900 text-gray-100">
      {/* Toolbar */}
      <div className="tt-toolbar flex flex-wrap gap-2 p-2 border-b border-zinc-800">
        {/* Bold / Italic / Underline / Strike / Code / Highlight */}
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} title="Bold" className={`p-2 rounded ${editor.isActive("bold") ? "bg-zinc-700" : "hover:bg-zinc-800"}`}><BoldIcon size={14} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic" className={`p-2 rounded ${editor.isActive("italic") ? "bg-zinc-700" : "hover:bg-zinc-800"}`}><ItalicIcon size={14} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline" className={`p-2 rounded ${editor.isActive("underline") ? "bg-zinc-700" : "hover:bg-zinc-800"}`}><UnderlineIcon size={14} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough" className={`p-2 rounded ${editor.isActive("strike") ? "bg-zinc-700" : "hover:bg-zinc-800"}`}><Strikethrough size={14} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleCode().run()} title="Inline Code" className={`p-2 rounded ${editor.isActive("code") ? "bg-zinc-700" : "hover:bg-zinc-800"}`}><CodeIcon size={14} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleHighlight().run()} title="Highlight" className={`p-2 rounded ${editor.isActive("highlight") ? "bg-yellow-600 text-black" : "hover:bg-zinc-800"}`}><Type size={14} /></button>

        {/* Headings */}
        <div className="border-l border-zinc-800 ml-2 pl-2 flex items-center gap-2">
          <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`p-2 rounded ${editor.isActive("heading", { level: 1 }) ? "bg-zinc-700" : "hover:bg-zinc-800"}`}><Heading1 size={14} /></button>
          <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-2 rounded ${editor.isActive("heading", { level: 2 }) ? "bg-zinc-700" : "hover:bg-zinc-800"}`}><Heading2 size={14} /></button>
          <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`p-2 rounded ${editor.isActive("heading", { level: 3 }) ? "bg-zinc-700" : "hover:bg-zinc-800"}`}><Heading3 size={14} /></button>
        </div>

        {/* Lists / Blockquote */}
        <div className="border-l border-zinc-800 ml-2 pl-2 flex items-center gap-2">
          <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bulleted list" className={`p-2 rounded ${editor.isActive("bulletList") ? "bg-zinc-700" : "hover:bg-zinc-800"}`}><ListIcon size={14} /></button>
          <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered list" className={`p-2 rounded ${editor.isActive("orderedList") ? "bg-zinc-700" : "hover:bg-zinc-800"}`}><ListOrderedIcon size={14} /></button>
          <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Blockquote" className={`p-2 rounded ${editor.isActive("blockquote") ? "bg-zinc-700" : "hover:bg-zinc-800"}`}><Quote size={14} /></button>
        </div>

        {/* Links / Images */}
        <div className="border-l border-zinc-800 ml-2 pl-2 flex items-center gap-2">
          <button type="button" onClick={addLink} title="Insert Link" className="p-2 rounded hover:bg-zinc-800"><LinkIcon size={14} /></button>
          <button type="button" onClick={addImage} title="Insert Image" className="p-2 rounded hover:bg-zinc-800"><ImageIcon size={14} /></button>

          {/* Image alignment */}
          <button type="button" onClick={() => editor.chain().focus().updateAttributes("image", { alignment: "left" }).run()} title="Align Left" className="p-2 rounded hover:bg-zinc-800"><AlignLeft size={14} /></button>
          <button type="button" onClick={() => editor.chain().focus().updateAttributes("image", { alignment: "center" }).run()} title="Align Center" className="p-2 rounded hover:bg-zinc-800"><AlignCenter size={14} /></button>
          <button type="button" onClick={() => editor.chain().focus().updateAttributes("image", { alignment: "right" }).run()} title="Align Right" className="p-2 rounded hover:bg-zinc-800"><AlignRight size={14} /></button>

          {/* Image size */}
          <button type="button" onClick={() => editor.chain().focus().updateAttributes("image", { size: "small" }).run()} title="Small" className="p-2 rounded hover:bg-zinc-800"><Minimize2 size={14} /></button>
          <button type="button" onClick={() => editor.chain().focus().updateAttributes("image", { size: "medium" }).run()} title="Medium" className="p-2 rounded hover:bg-zinc-800"><Square size={14} /></button>
          <button type="button" onClick={() => editor.chain().focus().updateAttributes("image", { size: "large" }).run()} title="Large" className="p-2 rounded hover:bg-zinc-800"><Maximize2 size={14} /></button>
        </div>

        {/* Undo / Redo */}
        <div className="ml-auto flex items-center gap-2">
          <button type="button" onClick={() => editor.chain().focus().undo().run()} title="Undo" className="p-2 rounded hover:bg-zinc-800"><RotateCcw size={14} /></button>
          <button type="button" onClick={() => editor.chain().focus().redo().run()} title="Redo" className="p-2 rounded hover:bg-zinc-800"><RotateCw size={14} /></button>
        </div>
      </div>

      {/* Editor area */}
      <div className="p-4">
        <EditorContent editor={editor} />
      </div>

      <style jsx>{`
        .tt-editor :global(.ProseMirror) { min-height: 220px; color: #e6eef8; font-size: 14px; line-height: 1.6; }
        .tt-editor :global(.ProseMirror h1) { font-size: 1.8rem; margin: 0.6rem 0; }
        .tt-editor :global(.ProseMirror h2) { font-size: 1.4rem; margin: 0.5rem 0; }
        .tt-editor :global(.ProseMirror h3) { font-size: 1.2rem; margin: 0.4rem 0; }
        .tt-editor :global(.ProseMirror img) { max-width: 100%; border-radius: 8px; display: block; margin: 0.75rem 0; }
        .tt-editor :global(.ProseMirror blockquote) { border-left: 3px solid #2b2b2b; padding-left: 12px; color: #cdd6e6; background: rgba(255,255,255,0.02); }
      `}</style>
    </div>
  );
});

export default TipTapEditor;
