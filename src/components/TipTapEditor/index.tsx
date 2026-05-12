import { useEffect, useRef } from 'react'
import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Markdown } from '@tiptap/markdown'
import { Theme } from '../../hooks/useTheme'

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  readOnly?: boolean
  theme: Theme
  minHeight?: number
}

function injectEditorStyles(theme: Theme) {
  const id = 'tiptap-md-styles'
  let el = document.getElementById(id) as HTMLStyleElement | null
  if (!el) {
    el = document.createElement('style')
    el.id = id
    document.head.appendChild(el)
  }
  el.textContent = `
    .tiptap-md .ProseMirror {
      outline: none;
      padding: 14px 16px;
      font-size: 15px;
      line-height: 1.65;
      word-break: break-word;
      color: ${theme.text};
    }
    .tiptap-md .ProseMirror > * + * { margin-top: 0.6em; }
    .tiptap-md .ProseMirror > *:first-child { margin-top: 0; }

    .tiptap-md .ProseMirror h1,
    .tiptap-md .ProseMirror h2,
    .tiptap-md .ProseMirror h3,
    .tiptap-md .ProseMirror h4 {
      font-weight: 700;
      line-height: 1.3;
      color: ${theme.text};
      margin-top: 1em;
    }
    .tiptap-md .ProseMirror h1 { font-size: 1.5em; border-bottom: 1px solid ${theme.divider}; padding-bottom: 0.25em; }
    .tiptap-md .ProseMirror h2 { font-size: 1.25em; }
    .tiptap-md .ProseMirror h3 { font-size: 1.1em; }
    .tiptap-md .ProseMirror h4 { font-size: 1em; }

    .tiptap-md .ProseMirror p { margin: 0; }

    .tiptap-md .ProseMirror strong { font-weight: 700; color: ${theme.text}; }
    .tiptap-md .ProseMirror em { font-style: italic; color: ${theme.textMuted}; }
    .tiptap-md .ProseMirror s { text-decoration: line-through; color: ${theme.textMuted}; }

    .tiptap-md .ProseMirror code {
      font-family: 'SF Mono', 'Menlo', 'Courier New', monospace;
      font-size: 0.88em;
      background: ${theme.chip};
      color: ${theme.accent};
      padding: 0.15em 0.4em;
      border-radius: 5px;
    }
    .tiptap-md .ProseMirror pre {
      background: ${theme.chip};
      border-radius: 10px;
      padding: 12px 14px;
      overflow-x: auto;
    }
    .tiptap-md .ProseMirror pre code {
      background: none;
      padding: 0;
      color: ${theme.text};
      font-size: 13px;
    }

    .tiptap-md .ProseMirror blockquote {
      border-left: 3px solid ${theme.accent};
      margin-left: 0;
      padding-left: 14px;
      color: ${theme.textMuted};
    }

    .tiptap-md .ProseMirror ul,
    .tiptap-md .ProseMirror ol { padding-left: 21px; }
    .tiptap-md .ProseMirror ul { list-style: disc; }
    .tiptap-md .ProseMirror ol { list-style: decimal; }
    .tiptap-md .ProseMirror li { margin-top: 0.2em; }
    .tiptap-md .ProseMirror li > p { margin: 0; }

    .tiptap-md .ProseMirror hr {
      border: none;
      border-top: 1px solid ${theme.divider};
      margin: 0.8em 0;
    }

    .tiptap-md .ProseMirror p.is-empty:first-child::before,
    .tiptap-md .ProseMirror p.is-editor-empty:first-child::before {
      content: attr(data-placeholder);
      color: ${theme.textDim};
      float: left;
      height: 0;
      pointer-events: none;
    }
  `
}

// ── Toolbar ──────────────────────────────────────────────────────────────────

function Toolbar({ editor, theme }: { editor: Editor; theme: Theme }) {
  const btn = (
    active: boolean,
    disabled: boolean,
    onClick: () => void,
    label: React.ReactNode,
    title?: string,
  ) => (
    <button
      title={title}
      onMouseDown={e => { e.preventDefault(); onClick() }}
      disabled={disabled}
      style={{
        width: 34, height: 34, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: active ? `${theme.accent}22` : 'transparent',
        border: 'none', borderRadius: 7,
        cursor: disabled ? 'default' : 'pointer',
        color: active ? theme.accent : disabled ? theme.textDim : theme.textMuted,
        fontFamily: 'inherit',
      }}
    >
      {label}
    </button>
  )

  const sep = () => (
    <div style={{ width: 1, height: 18, background: theme.divider, flexShrink: 0, margin: '0 1px' }} />
  )

  const ic = (d: string, size = 15) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 10,
      display: 'flex', alignItems: 'center', gap: 1,
      padding: '5px 10px',
      background: theme.surface,
      borderBottom: `0.5px solid ${theme.divider}`,
      overflowX: 'auto',
      flexShrink: 0,
      scrollbarWidth: 'none',
    }}>
      {/* Undo / Redo */}
      {btn(false, !editor.can().undo(), () => editor.chain().focus().undo().run(),
        ic('M3 7h10a4 4 0 010 8H9M3 7l4-4M3 7l4 4'), 'Отменить')}
      {btn(false, !editor.can().redo(), () => editor.chain().focus().redo().run(),
        ic('M21 7H11a4 4 0 000 8h4M21 7l-4-4M21 7l-4 4'), 'Повторить')}

      {sep()}

      {/* Headings */}
      {btn(editor.isActive('heading', { level: 1 }), false,
        () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: -0.3 }}>H1</span>, 'Заголовок 1')}
      {btn(editor.isActive('heading', { level: 2 }), false,
        () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: -0.3 }}>H2</span>, 'Заголовок 2')}
      {btn(editor.isActive('heading', { level: 3 }), false,
        () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: -0.3 }}>H3</span>, 'Заголовок 3')}

      {sep()}

      {/* Inline formatting */}
      {btn(editor.isActive('bold'), false,
        () => editor.chain().focus().toggleBold().run(),
        <span style={{ fontSize: 14, fontWeight: 800 }}>B</span>, 'Жирный')}
      {btn(editor.isActive('italic'), false,
        () => editor.chain().focus().toggleItalic().run(),
        <span style={{ fontSize: 14, fontStyle: 'italic', fontWeight: 600 }}>I</span>, 'Курсив')}
      {btn(editor.isActive('strike'), false,
        () => editor.chain().focus().toggleStrike().run(),
        <span style={{ fontSize: 13, textDecoration: 'line-through', fontWeight: 600 }}>S</span>, 'Зачёркнутый')}
      {btn(editor.isActive('code'), false,
        () => editor.chain().focus().toggleCode().run(),
        ic('M9 8l-4 4 4 4M15 8l4 4-4 4', 14), 'Код')}

      {sep()}

      {/* Block formatting */}
      {btn(editor.isActive('blockquote'), false,
        () => editor.chain().focus().toggleBlockquote().run(),
        ic('M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zm12 0c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z', 14),
        'Цитата')}
      {btn(editor.isActive('bulletList'), false,
        () => editor.chain().focus().toggleBulletList().run(),
        ic('M9 6h11M9 12h11M9 18h11M5 6h.01M5 12h.01M5 18h.01', 15), 'Маркированный список')}
      {btn(editor.isActive('orderedList'), false,
        () => editor.chain().focus().toggleOrderedList().run(),
        ic('M10 6h11M10 12h11M10 18h11M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1', 15), 'Нумерованный список')}
      {btn(editor.isActive('codeBlock'), false,
        () => editor.chain().focus().toggleCodeBlock().run(),
        ic('M4 17l6-6-6-6M12 19h8', 15), 'Блок кода')}
    </div>
  )
}

// ── Editor ───────────────────────────────────────────────────────────────────

export function TipTapEditor({ value, onChange, placeholder, readOnly, theme, minHeight = 200 }: Props) {
  const lastEmitted = useRef(value)

  useEffect(() => {
    injectEditorStyles(theme)
  }, [theme])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown,
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    contentType: 'markdown',
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const md = editor.getMarkdown()
      lastEmitted.current = md
      onChange(md)
    },
  })

  useEffect(() => {
    if (editor && value !== lastEmitted.current) {
      editor.commands.setContent(value, { contentType: 'markdown', emitUpdate: false })
      lastEmitted.current = value
    }
  }, [value, editor])

  return (
    <div
      className="tiptap-md"
      style={{
        background: theme.surface,
        borderRadius: 12,
        boxShadow: theme.shadow,
        minHeight,
        overflow: 'clip',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {editor && !readOnly && <Toolbar editor={editor} theme={theme} />}
      <EditorContent editor={editor} style={{ flex: 1 }} />
    </div>
  )
}
