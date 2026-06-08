"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import EditorToolbar from "./EditorToolbar"

interface TipTapEditorProps {
  content: string
  onChange: (content: string) => void
}

const TipTapEditor = ({ content, onChange }: TipTapEditorProps) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: "Write your amazing story here...",
        emptyEditorClass:
          "cursor-text before:content-[attr(data-placeholder)] before:absolute before:text-gray-500 before:opacity-50 before:pointer-events-none",
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-400 underline underline-offset-2",
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: "rounded-xl max-w-full mx-auto my-4 border border-white/10",
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-invert prose-p:my-2 prose-headings:my-4 prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-img:rounded-xl prose-img:max-w-full min-h-[300px] w-full max-w-none rounded-b-lg border border-t-0 border-white/10 bg-[#0A0A0B]/50 p-4 focus:outline-none focus:ring-1 focus:ring-white/20",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  return (
    <div className="w-full flex flex-col relative">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}

export default TipTapEditor
