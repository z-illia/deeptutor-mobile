import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import {
  Archive,
  ArchiveRestore,
  Bookmark,
  Check,
  Download,
  FolderInput,
  Pencil,
  Pin,
  PinOff,
  Trash2,
} from 'lucide-react-native';
import { useCopy } from '@/features/entry/copy';
import { workspaces } from '@/features/entry/model';
import { useFavorites } from '@/features/favorites/FavoritesProvider';
import {
  buildTranscriptFromMessages,
  buildUserQueryFromMessages,
} from '@/features/favorites/model';
import { useDesign } from '@/shared/design/DesignProvider';
import { alpha, geometry } from '@/shared/design/tokens';
import { Button, Field } from '@/shared/ui/Controls';
import { ConfirmDialog, Dialog } from '@/shared/ui/Dialog';
import { InlineAlert, useFeedback } from '@/shared/ui/Feedback';
import { DText } from '@/shared/ui/Text';
import {
  displaySessionTitle,
  exportSessionMarkdown,
  isPlaceholderSessionTitle,
  type ChatMessageItem,
  type SessionOrganizationPatch,
  type SessionSummary,
} from './model';

export interface SessionActionsSheetProps {
  session: SessionSummary | null;
  open: boolean;
  isRunning?: boolean;
  includeHeaderExtras?: boolean;
  messages?: ChatMessageItem[];
  workspaceOptions?: { id: string; name: string }[];
  onClose: () => void;
  onSave?: () => void;
  onStartInlineRename?: (session: SessionSummary) => void;
  onRename: (
    sessionId: string,
    title: string,
  ) => { ok: boolean; error?: string } | Promise<{ ok: boolean; error?: string }>;
  onOrganize: (
    sessionId: string,
    patch: SessionOrganizationPatch,
  ) => { ok: boolean; error?: string } | Promise<{ ok: boolean; error?: string }>;
  onDelete: (sessionId: string) => { ok: boolean; error?: string } | Promise<{ ok: boolean; error?: string }>;
}

export function SessionActionsSheet({
  session,
  open,
  isRunning = false,
  includeHeaderExtras = false,
  messages = [],
  workspaceOptions,
  onClose,
  onSave,
  onStartInlineRename,
  onRename,
  onOrganize,
  onDelete,
}: SessionActionsSheetProps) {
  const { colors } = useDesign();
  const t = useCopy();
  const { notify } = useFeedback();
  const { openSaveModal } = useFavorites();
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameDraft, setRenameDraft] = useState('');
  const [renameError, setRenameError] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [busy, setBusy] = useState(false);
  const [markdownPreview, setMarkdownPreview] = useState<string | null>(null);
  const availableWorkspaces = workspaceOptions ?? workspaces;

  if (!session) return null;

  const isPinned = Boolean(session.preferences?.pinned);
  const isArchived = Boolean(session.preferences?.archived);
  const currentWorkspaceId = session.workspace_id ?? '';
  const sessionLabel = displaySessionTitle(session.title, t('New chat'));

  const handleRenameTrigger = () => {
    if (onStartInlineRename) {
      onClose();
      onStartInlineRename(session);
      return;
    }
    setRenameDraft(
      isPlaceholderSessionTitle(session.title) ? '' : session.title,
    );
    setRenameError('');
    onClose();
    setRenameOpen(true);
  };

  const handleCommitRename = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await onRename(session.session_id, renameDraft);
      if (!res.ok) {
        setRenameError(t(res.error || 'Rename failed'));
        notify(t(res.error || 'Rename failed'), 'danger');
        return;
      }
      setRenameOpen(false);
      notify(t('Saved'), 'success');
    } finally {
      setBusy(false);
    }
  };

  const handlePinToggle = async () => {
    if (busy) return;
    setBusy(true);
    onClose();
    try {
      const res = await onOrganize(session.session_id, { pinned: !isPinned });
      if (!res.ok) {
        notify(t(res.error || 'Failed to save'), 'danger');
        return;
      }
      notify(isPinned ? t('Unpin') : t('Pin'), 'info');
    } finally {
      setBusy(false);
    }
  };

  const handleArchiveToggle = async () => {
    if (busy) return;
    setBusy(true);
    onClose();
    try {
      const res = await onOrganize(session.session_id, { archived: !isArchived });
      if (!res.ok) {
        notify(t(res.error || 'Failed to save'), 'danger');
        return;
      }
      notify(
        isArchived ? t('Restore from archive') : t('Archived'),
        'info',
      );
    } finally {
      setBusy(false);
    }
  };

  const handleMoveWorkspace = async (targetWorkspaceId: string) => {
    if (busy || isRunning || targetWorkspaceId === currentWorkspaceId) {
      onClose();
      return;
    }
    setBusy(true);
    onClose();
    try {
      const res = await onOrganize(session.session_id, {
        workspace_id: targetWorkspaceId,
      });
      if (!res.ok) {
        notify(t(res.error || 'Failed to save'), 'danger');
        return;
      }
      const targetName =
        availableWorkspaces.find((w) => w.id === targetWorkspaceId)?.name ??
        t('General workspace');
      notify(`${t('Move to workspace')}: ${targetName}`, 'info');
    } finally {
      setBusy(false);
    }
  };

  const handleSaveToNotebook = () => {
    const saveMessages = messages.map((m) => ({
      role: m.role,
      content: m.content,
      capability: m.capability ?? undefined,
    }));
    onClose();
    openSaveModal({
      payload: {
        recordType: 'chat',
        title: sessionLabel,
        userQuery:
          buildUserQueryFromMessages(saveMessages) || session.last_message_preview,
        output:
          buildTranscriptFromMessages(saveMessages) || session.last_message_preview,
        metadata: {
          session_id: session.session_id,
        },
      },
      messages: saveMessages,
    });
  };

  const handleDownloadMarkdown = () => {
    const md = exportSessionMarkdown(session, messages, t('New chat'));
    void Clipboard.setStringAsync(md).catch(() => {});
    onClose();
    setMarkdownPreview(md);
    notify(t('Copied'), 'success');
  };

  const handleConfirmDelete = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await onDelete(session.session_id);
      if (!res.ok) {
        setDeleteError(t(res.error || 'Failed to save'));
        notify(t(res.error || 'Failed to save'), 'danger');
        return;
      }
      setDeleteOpen(false);
      notify(t('Conversation deleted'), 'info');
    } finally {
      setBusy(false);
    }
  };

  const actionButtonStyle = (danger = false, disabled = false) => ({
    minHeight: 42,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: geometry.radius.md,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
    backgroundColor: danger ? alpha(colors.destructive, 0.1) : colors.card,
    borderWidth: 1,
    borderColor: danger ? colors.destructive : colors.border,
    opacity: disabled ? 0.5 : 1,
  });

  return (
    <>
      <Dialog
        open={open}
        title={sessionLabel}
        onClose={onClose}
      >
        <ScrollView style={{ maxHeight: 420 }}>
          <View style={{ gap: 8 }}>
            {onSave && <Pressable accessibilityRole="button" accessibilityLabel={t('Save to Favorites')} disabled={isRunning || busy}
              onPress={() => { onClose(); onSave(); }} style={actionButtonStyle(false, isRunning || busy)}>
              <Bookmark size={16} color={colors.foreground} /><DText role="label">{t('Save to Favorites')}</DText>
            </Pressable>}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('Rename chat')}
              onPress={handleRenameTrigger}
              style={actionButtonStyle()}
            >
              <Pencil size={16} color={colors.foreground} />
              <DText role="label">{t('Rename chat')}</DText>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isPinned ? t('Unpin') : t('Pin')}
              onPress={handlePinToggle}
              style={actionButtonStyle()}
            >
              {isPinned ? (
                <PinOff size={16} color={colors.foreground} />
              ) : (
                <Pin size={16} color={colors.foreground} />
              )}
              <DText role="label">{isPinned ? t('Unpin') : t('Pin')}</DText>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                isArchived ? t('Restore from archive') : t('Archive')
              }
              onPress={handleArchiveToggle}
              style={actionButtonStyle()}
            >
              {isArchived ? (
                <ArchiveRestore size={16} color={colors.foreground} />
              ) : (
                <Archive size={16} color={colors.foreground} />
              )}
              <DText role="label">
                {isArchived ? t('Restore from archive') : t('Archive')}
              </DText>
            </Pressable>

            <View
              style={{
                borderRadius: geometry.radius.md,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 10,
                gap: 6,
                backgroundColor: colors.secondary,
              }}
            >
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
              >
                <FolderInput size={15} color={colors.mutedForeground} />
                <DText role="section" muted>
                  {t('Move to workspace')}
                </DText>
              </View>
              {availableWorkspaces.map((ws) => {
                const selected = ws.id === currentWorkspaceId;
                return (
                  <Pressable
                    key={ws.id || 'general'}
                    disabled={isRunning || busy}
                    accessibilityRole="button"
                    accessibilityLabel={t("Move to {value1}", { value1: String(ws.name) })}
                    accessibilityState={{ selected, disabled: isRunning || busy }}
                    onPress={() => void handleMoveWorkspace(ws.id)}
                    style={{
                      minHeight: 36,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: geometry.radius.sm,
                      backgroundColor: selected ? colors.accent : colors.card,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      opacity: isRunning ? 0.5 : 1,
                    }}
                  >
                    <DText role={selected ? 'section' : 'small'}>
                      {t(ws.name)}
                    </DText>
                    {selected ? (
                      <Check size={14} color={colors.primary} />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>

            {includeHeaderExtras ? (
              <>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('Save to Notebook')}
                  onPress={handleSaveToNotebook}
                  style={actionButtonStyle()}
                >
                  <Bookmark size={16} color={colors.foreground} />
                  <View style={{ flex: 1 }}>
                    <DText role="label">{t('Save to Notebook')}</DText>
                    <DText role="small" muted>
                      {t('Save conversation snapshot to Favorites')}
                    </DText>
                  </View>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('Download Markdown')}
                  onPress={handleDownloadMarkdown}
                  style={actionButtonStyle(false, messages.length === 0)}
                  disabled={messages.length === 0}
                >
                  <Download size={16} color={colors.foreground} />
                  <DText role="label">{t('Download Markdown')}</DText>
                </Pressable>
              </>
            ) : null}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('Delete chat')}
              onPress={() => {
                setDeleteError('');
                onClose();
                setDeleteOpen(true);
              }}
              style={actionButtonStyle(true)}
            >
              <Trash2 size={16} color={colors.destructive} />
              <DText role="section" style={{ color: colors.destructive }}>
                {t('Delete chat')}
              </DText>
            </Pressable>
          </View>
        </ScrollView>
      </Dialog>

      <Dialog
        open={renameOpen}
        title={t('Rename chat')}
        onClose={() => setRenameOpen(false)}
        footer={
          <>
            <Button variant="secondary" disabled={busy} onPress={() => setRenameOpen(false)}>
              {t('Cancel')}
            </Button>
            <Button loading={busy} disabled={busy} onPress={() => void handleCommitRename()}>{t('Save')}</Button>
          </>
        }
      >
        <Field
          label={t('Session title')}
          value={renameDraft}
          onChangeText={setRenameDraft}
          placeholder={t('New chat')}
          error={renameError || undefined}
        />
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        title={t('Delete chat')}
        confirmLabel={t('Delete')}
        busy={busy}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => {
          setDeleteOpen(false);
          setDeleteError('');
        }}
      >
        <DText muted>
          {t(
            'Permanently delete this chat and its tutor threads? This cannot be undone.',
          )}
        </DText>
        {deleteError ? (
          <InlineAlert tone="danger">{t(deleteError)}</InlineAlert>
        ) : null}
      </ConfirmDialog>

      <Dialog
        open={markdownPreview !== null}
        title={t('Download Markdown')}
        onClose={() => setMarkdownPreview(null)}
        footer={
          <Button onPress={() => setMarkdownPreview(null)}>
            {t('Close')}
          </Button>
        }
      >
        <ScrollView style={{ maxHeight: 300 }}>
          <DText role="code">{markdownPreview ?? ''}</DText>
        </ScrollView>
      </Dialog>
    </>
  );
}
