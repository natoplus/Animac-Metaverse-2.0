// src/components/TipTapEditor.js
import React, { useEffect, useCallback } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import { CustomImage } from "./CustomImage";
import {
    Bold as BoldIcon,
    Italic as ItalicIcon,
    Underline as UnderlineIcon,
    X as CloseIcon,
    Code as CodeIcon,
    Heading as HeadingIcon,
    List as ListIcon,
    ListOrdered as ListOrderedIcon,
    Quote,
    Image as ImageIcon,
    Link as LinkIcon,
    RotateCcw,
    RotateCw,
    Type
} from "lucide-react";

/**
 * TipTapEditor
 * props:
 *  - content: initial HTML content (string)
 *  - onChange: function(html) called whenever content updates
 *
 * Editor emits HTML; parent should store HTML (this is best for rich content).
 */
export default function TipTapEditor({ content = "<p></p>", onChange }) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Highlight,
            Image,
            CustomImage,
            Link.configure({ openOnClick: true }),
        ],
        content,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onChange && onChange(html);
        },
        editorProps: {
            attributes: {
                class: "tt-editor-content focus:outline-none",
            },
        },
    });

    // If parent content prop changes (editing loaded article), update the editor
    useEffect(() => {
        if (editor && typeof content === "string") {
            // Only set if different to avoid cursor jump
            const existing = editor.getHTML();
            if (content !== existing) editor.commands.setContent(content, false);
        }
    }, [content, editor]);

    const addImage = useCallback(() => {
        const url = window.prompt("Paste Imgur Image URL (direct image link ending with .jpg/.png/.webp):");
        if (!url) return;
        // simple validation: ensure it looks like an image link
        const looksLikeImage = /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(url);
        if (!looksLikeImage) {
            // still allow but warn
            if (!window.confirm("This URL does not look like a direct image file (jpg/png/webp...). Insert anyway?")) return;
        }
        editor.chain().focus().setImage({ src: url }).run();
    }, [editor]);

    const addLink = useCallback(() => {
        const url = window.prompt("Enter the link URL (https://...)");
        if (!url) return;
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    if (!editor) return null;

    return (
        <div className="tt-editor border rounded-lg bg-zinc-900 text-gray-100">
            {/* Fixed toolbar */}
            <div className="tt-toolbar flex flex-wrap gap-2 p-2 border-b border-zinc-800">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    title="Bold"
                    className={`p-2 rounded ${editor.isActive("bold") ? "bg-zinc-700" : "hover:bg-zinc-800"}`}
                >
                    <BoldIcon size={16} />
                </button>

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    title="Italic"
                    className={`p-2 rounded ${editor.isActive("italic") ? "bg-zinc-700" : "hover:bg-zinc-800"}`}
                >
                    <ItalicIcon size={16} />
                </button>

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    title="Underline"
                    className={`p-2 rounded ${editor.isActive("underline") ? "bg-zinc-700" : "hover:bg-zinc-800"}`}
                >
                    <UnderlineIcon size={16} />
                </button>

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    title="Strike"
                    className={`p-2 rounded ${editor.isActive("strike") ? "bg-zinc-700" : "hover:bg-zinc-800"}`}
                >
                    <CodeIcon size={16} />
                </button>

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHighlight().run()}
                    title="Highlight"
                    className={`p-2 rounded ${editor.isActive("highlight") ? "bg-yellow-600 text-black" : "hover:bg-zinc-800"}`}
                >
                    <Type size={16} />
                </button>

                <div className="border-l border-zinc-800 ml-2 pl-2 flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        title="H1"
                        className={`p-2 rounded ${editor.isActive("heading", { level: 1 }) ? "bg-zinc-700" : "hover:bg-zinc-800"}`}
                    >
                        H1
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        title="H2"
                        className={`p-2 rounded ${editor.isActive("heading", { level: 2 }) ? "bg-zinc-700" : "hover:bg-zinc-800"}`}
                    >
                        H2
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        title="H3"
                        className={`p-2 rounded ${editor.isActive("heading", { level: 3 }) ? "bg-zinc-700" : "hover:bg-zinc-800"}`}
                    >
                        H3
                    </button>
                </div>

                <div className="border-l border-zinc-800 ml-2 pl-2 flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        title="Bulleted list"
                        className={`p-2 rounded ${editor.isActive("bulletList") ? "bg-zinc-700" : "hover:bg-zinc-800"}`}
                    >
                        <ListIcon size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        title="Numbered list"
                        className={`p-2 rounded ${editor.isActive("orderedList") ? "bg-zinc-700" : "hover:bg-zinc-800"}`}
                    >
                        <ListOrderedIcon size={16} />
                    </button>
                </div>

                <div className="border-l border-zinc-800 ml-2 pl-2 flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        title="Blockquote"
                        className={`p-2 rounded ${editor.isActive("blockquote") ? "bg-zinc-700" : "hover:bg-zinc-800"}`}
                    >
                        <Quote size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                        title="Code Block"
                        className={`p-2 rounded ${editor.isActive("codeBlock") ? "bg-zinc-700" : "hover:bg-zinc-800"}`}
                    >
                        <CodeIcon size={16} />
                    </button>
                </div>

                <div className="ml-auto flex items-center gap-2">
                    <button
                        type="button"
                        onClick={addLink}
                        title="Insert Link"
                        className="p-2 rounded hover:bg-zinc-800"
                    >
                        <LinkIcon size={16} />
                    </button>

                    <button onClick={() => editor.chain().focus().setImage({ src: prompt("Imgur link:"), width: "50%", alignment: "center" }).run()}>
                        <ImageIcon size={16} />
                    </button>
                    <button onClick={() => editor.chain().focus().updateAttributes("image", { alignment: "left" }).run()}>
                        Align Left
                    </button>
                    <button onClick={() => editor.chain().focus().updateAttributes("image", { alignment: "center" }).run()}>
                        Align Center
                    </button>
                    <button onClick={() => editor.chain().focus().updateAttributes("image", { alignment: "right" }).run()}>
                        Align Right
                    </button>

                    <button onClick={() => editor.chain().focus().updateAttributes("image", { width: "50%" }).run()}>
                        50% Width
                    </button>
                    <button onClick={() => editor.chain().focus().updateAttributes("image", { width: "100%" }).run()}>
                        Full Width
                    </button>

                    <button onClick={() => editor.chain().focus().updateAttributes("image", { style: "border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.3);" }).run()}>
                        Add Style
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().undo().run()}
                        title="Undo"
                        className="p-2 rounded hover:bg-zinc-800"
                    >
                        <RotateCcw size={16} />
                    </button>

                    <button
                        type="button"
                        onClick={() => editor.chain().focus().redo().run()}
                        title="Redo"
                        className="p-2 rounded hover:bg-zinc-800"
                    >
                        <RotateCw size={16} />
                    </button>
                </div>
            </div>

            {/* Editor area */}
            <div className="p-4">
                <EditorContent editor={editor} />
            </div>

            <style jsx>{`
        .tt-editor :global(.ProseMirror) {
          min-height: 220px;
          color: #e6eef8; /* light-gray text for dark theme */
          font-size: 16px;
          line-height: 1.6;
        }
        .tt-editor :global(.ProseMirror h1) {
          font-size: 1.8rem;
          margin: 0.6rem 0;
        }
        .tt-editor :global(.ProseMirror h2) {
          font-size: 1.4rem;
          margin: 0.5rem 0;
        }
        .tt-editor :global(.ProseMirror img) {
          max-width: 100%;
          border-radius: 8px;
          display: block;
          margin: 0.75rem 0;
        }
        .tt-editor :global(.ProseMirror blockquote) {
          border-left: 3px solid #2b2b2b;
          padding-left: 12px;
          color: #cdd6e6;
          background: rgba(255,255,255,0.01);
        }
        .tiptap img[data-align="left"] {
          float: left;
          margin: 0 1rem 1rem 0;
        }
        .tiptap img[data-align="right"] {
          float: right;
          margin: 0 0 1rem 1rem;
        }
        .tiptap img[data-align="center"] {
          display: block;
          margin: 1rem auto;
        }

      `}</style>
        </div>
    );
}
