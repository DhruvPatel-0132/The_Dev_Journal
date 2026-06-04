import { type Editor } from "@tiptap/react"
import {
  Bold,
  Strikethrough,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Quote,
  Code,
  Link as LinkIcon,
} from "lucide-react"

interface EditorToolbarProps {
  editor: Editor | null
}

const EditorToolbar = ({ editor }: EditorToolbarProps) => {
  if (!editor) {
    return null
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href
    const url = window.prompt("URL", previousUrl)

    if (url === null) {
      return
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-[#1A1A1D] border border-white/10 rounded-t-lg">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-2 rounded-md hover:bg-white/10 transition-colors ${
          editor.isActive("bold") ? "bg-white/20 text-white" : "text-gray-400"
        }`}
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-2 rounded-md hover:bg-white/10 transition-colors ${
          editor.isActive("italic") ? "bg-white/20 text-white" : "text-gray-400"
        }`}
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`p-2 rounded-md hover:bg-white/10 transition-colors ${
          editor.isActive("strike") ? "bg-white/20 text-white" : "text-gray-400"
        }`}
        title="Strikethrough"
      >
        <Strikethrough className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-white/10 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-2 rounded-md hover:bg-white/10 transition-colors ${
          editor.isActive("heading", { level: 1 })
            ? "bg-white/20 text-white"
            : "text-gray-400"
        }`}
        title="Heading 1"
      >
        <Heading1 className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded-md hover:bg-white/10 transition-colors ${
          editor.isActive("heading", { level: 2 })
            ? "bg-white/20 text-white"
            : "text-gray-400"
        }`}
        title="Heading 2"
      >
        <Heading2 className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-white/10 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded-md hover:bg-white/10 transition-colors ${
          editor.isActive("bulletList") ? "bg-white/20 text-white" : "text-gray-400"
        }`}
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded-md hover:bg-white/10 transition-colors ${
          editor.isActive("orderedList") ? "bg-white/20 text-white" : "text-gray-400"
        }`}
        title="Ordered List"
      >
        <ListOrdered className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-white/10 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-2 rounded-md hover:bg-white/10 transition-colors ${
          editor.isActive("blockquote") ? "bg-white/20 text-white" : "text-gray-400"
        }`}
        title="Blockquote"
      >
        <Quote className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`p-2 rounded-md hover:bg-white/10 transition-colors ${
          editor.isActive("codeBlock") ? "bg-white/20 text-white" : "text-gray-400"
        }`}
        title="Code Block"
      >
        <Code className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={setLink}
        className={`p-2 rounded-md hover:bg-white/10 transition-colors ${
          editor.isActive("link") ? "bg-white/20 text-white" : "text-gray-400"
        }`}
        title="Link"
      >
        <LinkIcon className="w-4 h-4" />
      </button>
    </div>
  )
}

export default EditorToolbar
