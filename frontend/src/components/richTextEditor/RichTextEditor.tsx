"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useCallback, useState } from "react";
import {
  Box,
  IconButton,
  Tooltip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Paper,
  Popper,
  ClickAwayListener,
} from "@mui/material";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import LinkIcon from "@mui/icons-material/Link";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditIcon from "@mui/icons-material/Edit";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
  minHeight?: number;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Digite o conteúdo...",
  error = false,
  helperText,
  minHeight = 180,
}: RichTextEditorProps) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [copied, setCopied] = useState(false);

  // Virtual anchor for the link bubble popper
  const [bubbleAnchor, setBubbleAnchor] = useState<{
    getBoundingClientRect: () => DOMRect;
  } | null>(null);
  const [activeLinkHref, setActiveLinkHref] = useState<string>("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    onSelectionUpdate: ({ editor }) => {
      if (!editor.isActive("link")) {
        setBubbleAnchor(null);
        setActiveLinkHref("");
      }
    },
    editorProps: {
      handleClick(_, __, event) {
        if ((event.target as HTMLElement).closest("a")) {
          event.preventDefault();
          return true;
        }
        return false;
      },
      attributes: {
        style: `min-height: ${minHeight}px; outline: none; padding: 12px; font-size: 14px; font-family: inherit; line-height: 1.6;`,
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  const openLinkDialog = useCallback(
    (prefillUrl = "") => {
      if (!editor) return;
      const { from, to } = editor.state.selection;
      setLinkText(editor.state.doc.textBetween(from, to, ""));
      setLinkUrl(prefillUrl || editor.getAttributes("link").href || "");
      setLinkDialogOpen(true);
    },
    [editor],
  );

  const applyLink = useCallback(() => {
    if (!editor) return;
    const href = linkUrl.trim();
    if (!href) return;
    const url = href.startsWith("http") ? href : `https://${href}`;
    const { from, to } = editor.state.selection;
    if (from !== to) {
      editor.chain().focus().setLink({ href: url }).run();
    } else if (linkText.trim()) {
      editor.chain().focus().insertContent(`<a href="${url}">${linkText}</a>`).run();
    }
    setLinkDialogOpen(false);
    setLinkUrl("");
    setLinkText("");
  }, [editor, linkUrl, linkText]);

  const removeLink = useCallback(() => {
    editor?.chain().focus().unsetLink().run();
    setBubbleAnchor(null);
  }, [editor]);

  const copyLink = useCallback(() => {
    if (!activeLinkHref) return;
    navigator.clipboard.writeText(activeLinkHref);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [activeLinkHref]);

  if (!editor) return null;

  return (
    <Box>
      {/* Link bubble menu */}
      <Popper
        open={!!bubbleAnchor}
        anchorEl={bubbleAnchor}
        placement="bottom-start"
        style={{ zIndex: 1400 }}
      >
        <ClickAwayListener onClickAway={() => setBubbleAnchor(null)}>
          <Paper
            elevation={3}
            onMouseDown={(e) => e.preventDefault()}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              px: 1,
              py: 0.5,
              borderRadius: 1.5,
              mt: 0.5,
            }}
          >
            <Typography
              variant="caption"
              color="primary"
              component="a"
              href={activeLinkHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              sx={{
                maxWidth: 180,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              {activeLinkHref}
            </Typography>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

            <Tooltip title="Abrir link">
              <IconButton
                size="small"
                component="a"
                href={activeLinkHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                <OpenInNewIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title={copied ? "Copiado!" : "Copiar link"}>
              <IconButton size="small" onClick={copyLink}>
                <ContentCopyIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Editar link">
              <IconButton size="small" onClick={() => openLinkDialog(activeLinkHref)}>
                <EditIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Remover link">
              <IconButton size="small" onClick={removeLink} color="error">
                <LinkOffIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Paper>
        </ClickAwayListener>
      </Popper>

      {/* Toolbar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          px: 1,
          py: 0.5,
          border: "1px solid",
          borderColor: error ? "error.main" : "divider",
          borderBottom: "none",
          borderRadius: "4px 4px 0 0",
          bgcolor: "background.paper",
        }}
      >
        <Tooltip title="Negrito">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleBold().run()}
            color={editor.isActive("bold") ? "primary" : "default"}
          >
            <FormatBoldIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Itálico">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            color={editor.isActive("italic") ? "primary" : "default"}
          >
            <FormatItalicIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <Tooltip title="Lista com marcadores">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            color={editor.isActive("bulletList") ? "primary" : "default"}
          >
            <FormatListBulletedIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Lista numerada">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            color={editor.isActive("orderedList") ? "primary" : "default"}
          >
            <FormatListNumberedIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <Tooltip title="Inserir link">
          <IconButton
            size="small"
            onClick={() => openLinkDialog()}
            color={editor.isActive("link") ? "primary" : "default"}
          >
            <LinkIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Editor area */}
      <Box
        sx={{
          border: "1px solid",
          borderColor: error ? "error.main" : "divider",
          borderRadius: "0 0 4px 4px",
          bgcolor: "background.paper",
          cursor: "text",
          "& .tiptap p.is-editor-empty:first-child::before": {
            content: "attr(data-placeholder)",
            color: "text.disabled",
            pointerEvents: "none",
            float: "left",
            height: 0,
          },
          "& .tiptap a": { color: "primary.main", textDecoration: "underline", cursor: "pointer" },
          "& .tiptap ul, & .tiptap ol": { pl: 3 },
          "& .tiptap": { outline: "none" },
        }}
        onClick={(e) => {
          const linkEl = (e.target as HTMLElement).closest("a");
          if (linkEl && editor.isActive("link")) {
            const rect = linkEl.getBoundingClientRect();
            setBubbleAnchor({
              getBoundingClientRect: () => new DOMRect(rect.left, rect.bottom, 0, 0),
            });
            setActiveLinkHref(editor.getAttributes("link").href ?? "");
          } else {
            editor.commands.focus();
          }
        }}
      >
        <EditorContent editor={editor} />
      </Box>

      {helperText && (
        <Typography variant="caption" color={error ? "error" : "text.secondary"} sx={{ mt: 0.5, ml: 1.5, display: "block" }}>
          {helperText}
        </Typography>
      )}

      {/* Link insert/edit dialog */}
      <Dialog open={linkDialogOpen} onClose={() => setLinkDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Inserir link</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}>
          <TextField
            label="Texto do link"
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
            size="small"
            fullWidth
            placeholder="acesse aqui"
            helperText="Deixe em branco para usar o texto selecionado"
          />
          <TextField
            label="URL"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            size="small"
            fullWidth
            placeholder="https://..."
            onKeyDown={(e) => e.key === "Enter" && applyLink()}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLinkDialogOpen(false)} color="inherit">Cancelar</Button>
          <Button onClick={applyLink} variant="contained" disabled={!linkUrl.trim()}>Aplicar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
