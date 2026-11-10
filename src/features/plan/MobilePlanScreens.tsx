import { useCallback, useMemo, useRef, useState } from 'react';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useAuth } from '@/features/auth/AuthProvider';
import { useWorkspaces } from '@/features/workspaces/WorkspaceProvider';
import { useCopy } from '@/features/entry/copy';
import { listWorkspaceSessionSummaries } from '@/features/chat/live/repository';
import { displaySessionTitle, type SessionSummary } from '@/features/chat/model';
import { MobileAction, MobileChoice, MobileField, MobilePage, MobileRow, MobileText } from '@/features/mobile/ScreenLayout';
import { useDesign } from '@/shared/design/DesignProvider';
import { ErrorState, InlineAlert, LoadingState } from '@/shared/ui/Feedback';
import {
  createTaskCard,
  dayRangeForDate,
  DEFAULT_TASK_COLORS,
  formatDateKey,
  getActiveTaskId,
  getCalendarLayers,
  getSelectedPlanDate,
  getTaskBoard,
  linkSessionTasks,
  listCalendarOccurrences,
  monthGridForDate,
  parseDateKey,
  planError,
  setActiveTaskId,
  setSelectedPlanDate,
  shiftDateKey,
  shiftMonthDateKey,
  updateTaskCard,
  updateTaskColors,
  weekDatesForDate,
  type CalendarLayers,
  type CalendarOccurrence,
  type TaskBoard,
  type TaskColors,
  type TaskStatus,
} from './repository';

const DAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;

function usePlanScope() {
  const auth = useAuth();
  const workspaces = useWorkspaces();
  const workspace = workspaces.selectedWorkspaceId;
  const workspaceName = workspaces.workspaces.find(w => w.workspace_id === workspace)?.display_name ?? '';
  const scopeKey = JSON.stringify([auth.serverUrl, auth.session?.profile?.id ?? null, workspace]);
  return { workspace, workspaceName, scopeKey, workspaces: workspaces.workspaces };
}

function statusLabel(status: TaskStatus, t: (s: string) => string): string {
  if (status === 'doing') return t('In progress');
  if (status === 'done') return t('Done');
  return t('To do');
}

export function PlanOverviewScreen() {
  const { workspace, workspaceName, scopeKey } = usePlanScope();
  const t = useCopy();
  const [board, setBoard] = useState<TaskBoard | null>(null);
  const [layers, setLayers] = useState<CalendarLayers | null>(null);
  const [occurrences, setOccurrences] = useState<CalendarOccurrence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const selectedDate = getSelectedPlanDate(scopeKey);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError('');
    try {
      const range = dayRangeForDate(selectedDate);
      const [nextBoard, nextLayers, nextOcc] = await Promise.all([
        getTaskBoard(workspace, signal),
        getCalendarLayers(workspace, { start: range.startIso, end: range.endIso }, signal).catch(() => null),
        listCalendarOccurrences(workspace, { start: range.startIso, end: range.endIso }, signal).catch(() => [] as CalendarOccurrence[]),
      ]);
      if (signal?.aborted) return;
      setBoard(nextBoard);
      setLayers(nextLayers);
      setOccurrences(nextOcc);
    } catch (cause) {
      if (!signal?.aborted) setError(planError(cause));
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [selectedDate, workspace]);

  useFocusEffect(useCallback(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]));

  const activeTasks = useMemo(
    () => (board?.cards ?? []).filter(card => !card.archived),
    [board],
  );
  const footprint = layers?.footprints.find(f => f.date === selectedDate);
  const reviewDay = layers?.reviews.find(r => r.date === selectedDate);
  const daySummaryParts = [
    occurrences.length ? `${occurrences.length}` : '',
    footprint?.session_count ? `${footprint.session_count}` : '',
    reviewDay ? `${reviewDay.mastery + reviewDay.practice}` : '',
  ].filter(Boolean);

  return <MobilePage title={t('Plan')} root tab={52}>
    <MobileText muted>{workspaceName || t('General workspace')}</MobileText>
    <MobileText style={{ fontSize: 28, lineHeight: 39, fontWeight: '600' }}>{t('Make room\nfor learning.')}</MobileText>
    {!!error && <ErrorState message={t(error)} onRetry={() => void load()} />}
    <MobileRow
      title={selectedDate}
      description={daySummaryParts.join(' · ') || t('Footprints · 1 conversation')}
      onPress={() => router.push('/calendar/day')}
    />
    <MobileRow
      title={t('Calendar views')}
      description={t('Agenda · Month · Week · Day')}
      onPress={() => router.push('/calendar')}
    />
    <View style={{ gap: 12 }}>
      <MobileText style={{ fontSize: 18, fontWeight: '600' }}>{t('Tasks')}</MobileText>
      {loading && <LoadingState />}
      {!loading && activeTasks.length === 0 && <MobileText>{t('No tasks in progress.')}</MobileText>}
      {activeTasks.map(card => (
        <MobileRow
          key={card.id}
          title={card.title}
          description={[statusLabel(card.status, t), card.due_date ?? ''].filter(Boolean).join(' · ')}
          onPress={() => {
            setActiveTaskId(scopeKey, card.id);
            router.push({ pathname: "/plan/tasks/edit", params: { taskId: card.id } });
          }}
        />
      ))}
      <MobileAction
        onPress={() => {
          setActiveTaskId(scopeKey, null);
          router.push('/plan/tasks/edit');
        }}
      >
        {t('Add a task')}
      </MobileAction>
      <MobileRow
        title={t('Task board')}
        description={t('To do · In progress · Done · Archived')}
        onPress={() => router.push('/kanban')}
      />
    </View>
    <MobileRow
      title={t('Learning progress')}
      description={t('Your own reading and learning activity')}
      onPress={() => router.push('/learning/live?view=progress')}
    />
  </MobilePage>;
}

export function CalendarScreen({ view }: { view: 'month' | 'day' | 'week' }) {
  const { workspace, scopeKey } = usePlanScope();
  const { colors } = useDesign();
  const t = useCopy();
  const [dateKey, setDateKey] = useState(() => getSelectedPlanDate(scopeKey));
  const [board, setBoard] = useState<TaskBoard | null>(null);
  const [layers, setLayers] = useState<CalendarLayers | null>(null);
  const [occurrences, setOccurrences] = useState<CalendarOccurrence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const updateDate = (next: string) => {
    setSelectedPlanDate(scopeKey, next);
    setDateKey(next);
  };

  const range = useMemo(() => {
    if (view === 'month') {
      const m = monthGridForDate(dateKey);
      return { startIso: m.startIso, endIso: m.endIso };
    }
    if (view === 'week') {
      const w = weekDatesForDate(dateKey);
      return { startIso: w.startIso, endIso: w.endIso };
    }
    return dayRangeForDate(dateKey);
  }, [dateKey, view]);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError('');
    try {
      const [nextBoard, nextLayers, nextOcc] = await Promise.all([
        getTaskBoard(workspace, signal),
        getCalendarLayers(workspace, { start: range.startIso, end: range.endIso }, signal).catch(() => null),
        listCalendarOccurrences(workspace, { start: range.startIso, end: range.endIso }, signal).catch(() => [] as CalendarOccurrence[]),
      ]);
      if (signal?.aborted) return;
      setBoard(nextBoard);
      setLayers(nextLayers);
      setOccurrences(nextOcc);
    } catch (cause) {
      if (!signal?.aborted) setError(planError(cause));
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [range.endIso, range.startIso, workspace]);

  useFocusEffect(useCallback(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]));

  const switchView = (nextView: string) => {
    if (nextView === 'month') router.replace('/calendar');
    else if (nextView === 'day') router.replace('/calendar/day');
    else if (nextView === 'week') router.replace('/calendar/week');
  };

  const shiftCurrent = (direction: -1 | 1) => {
    if (view === 'month') updateDate(shiftMonthDateKey(dateKey, direction));
    else if (view === 'week') updateDate(shiftDateKey(dateKey, direction * 7));
    else updateDate(shiftDateKey(dateKey, direction));
  };

  const activeTasks = useMemo(
    () => (board?.cards ?? []).filter(c => !c.archived && c.due_date),
    [board],
  );

  const itemsForDay = useCallback((day: string) => {
    const dayTasks = activeTasks.filter(c => c.due_date === day);
    const dayOccurrences = occurrences.filter(o => o.start.slice(0, 10) === day);
    const review = layers?.reviews.find(r => r.date === day);
    const footprint = layers?.footprints.find(f => f.date === day);
    const automations = (layers?.automations ?? []).filter(a => a.at.slice(0, 10) === day);
    return { dayTasks, dayOccurrences, review, footprint, automations };
  }, [activeTasks, layers, occurrences]);

  if (view === 'month') {
    const grid = monthGridForDate(dateKey);
    const cells: { key: string; label: string; dayKey: string | null }[] = [];
    for (let i = 0; i < grid.firstWeekday; i++) {
      cells.push({ key: `pad-${i}`, label: '', dayKey: null });
    }
    for (let d = 1; d <= grid.daysInMonth; d++) {
      const k = formatDateKey(new Date(grid.year, grid.month, d));
      cells.push({ key: k, label: String(d), dayKey: k });
    }
    const selectedDayItems = itemsForDay(dateKey);

    return <MobilePage title={dateKey.slice(0, 7)} fallback="/plan">
      <MobileText muted>{t('Calendar · Month')}</MobileText>
      {!!error && <ErrorState message={t(error)} onRetry={() => void load()} />}
      <MobileChoice
        label={t('View')}
        value="month"
        options={[
          { value: 'month', label: t('Calendar · Month') },
          { value: 'week', label: t('Calendar · Week') },
          { value: 'day', label: t('Calendar · Day') },
        ]}
        onChange={switchView}
      />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <MobileAction variant="secondary" onPress={() => shiftCurrent(-1)}>{t('Back')}</MobileAction>
        </View>
        <View style={{ flex: 1 }}>
          <MobileAction variant="secondary" onPress={() => shiftCurrent(1)}>{t('Next')}</MobileAction>
        </View>
      </View>
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row' }}>
          {DAY_HEADERS.map(h => (
            <View key={h} style={{ flex: 1, alignItems: 'center', paddingVertical: 6 }}>
              <MobileText muted style={{ fontSize: 13, fontWeight: '600' }}>{t(h)}</MobileText>
            </View>
          ))}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {cells.map(cell => {
            if (!cell.dayKey) {
              return <View key={cell.key} style={{ width: '14.28%', height: 44 }} />;
            }
            const isSelected = cell.dayKey === dateKey;
            const info = itemsForDay(cell.dayKey);
            const hasActivity = Boolean(
              info.dayTasks.length ||
              info.dayOccurrences.length ||
              (info.review && info.review.mastery + info.review.practice > 0) ||
              info.footprint?.session_count,
            );
            return (
              <Pressable
                key={cell.key}
                accessibilityRole="button"
                accessibilityLabel={cell.dayKey}
                onPress={() => updateDate(cell.dayKey!)}
                style={{
                  width: '14.28%',
                  height: 44,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 10,
                  backgroundColor: isSelected ? colors.primary : 'transparent',
                }}
              >
                <MobileText style={{ color: isSelected ? colors.primaryForeground : colors.foreground, fontWeight: isSelected || hasActivity ? '600' : '400' }}>
                  {cell.label}
                </MobileText>
                {hasActivity && (
                  <View
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: 3,
                      backgroundColor: isSelected ? colors.primaryForeground : colors.primary,
                      marginTop: 2,
                    }}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
      {loading && <LoadingState />}
      <MobileRow
        title={dateKey}
        description={
          [
            ...selectedDayItems.dayOccurrences.map(o => o.title),
            ...selectedDayItems.dayTasks.map(c => c.title),
            selectedDayItems.footprint?.session_count ? `${selectedDayItems.footprint.session_count}` : '',
          ]
            .filter(Boolean)
            .join(' · ') || t('No activity')
        }
        onPress={() => router.push('/calendar/day')}
      />
      <MobileRow
        title={t('View options')}
        description={t('Today · previous / next month · Day · Week · Agenda')}
        onPress={() => router.push('/calendar/week')}
      />
    </MobilePage>;
  }

  if (view === 'week') {
    const week = weekDatesForDate(dateKey);
    return <MobilePage title={`${week.dates[0]} – ${week.dates[6]}`} fallback="/plan">
      <MobileText muted>{t('Calendar · Week')}</MobileText>
      {!!error && <ErrorState message={t(error)} onRetry={() => void load()} />}
      <MobileChoice
        label={t('View')}
        value="week"
        options={[
          { value: 'week', label: t('Calendar · Week') },
          { value: 'day', label: t('Calendar · Day') },
          { value: 'month', label: t('Calendar · Month') },
        ]}
        onChange={switchView}
      />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <MobileAction variant="secondary" onPress={() => shiftCurrent(-1)}>{t('Back')}</MobileAction>
        </View>
        <View style={{ flex: 1 }}>
          <MobileAction variant="secondary" onPress={() => shiftCurrent(1)}>{t('Next')}</MobileAction>
        </View>
      </View>
      {loading && <LoadingState />}
      {week.dates.map(day => {
        const info = itemsForDay(day);
        const summary = [
          ...info.dayOccurrences.map(o => o.title),
          ...info.dayTasks.map(c => c.title),
          info.review && info.review.mastery + info.review.practice > 0 ? `${info.review.mastery + info.review.practice}` : '',
          info.footprint?.session_count ? `${info.footprint.session_count}` : '',
        ]
          .filter(Boolean)
          .join(' · ');
        return (
          <MobileRow
            key={day}
            title={day}
            description={summary || t('No activity')}
            onPress={() => {
              updateDate(day);
              router.push('/calendar/day');
            }}
          />
        );
      })}
      <InlineAlert tone="info">
        {`${t('Mobile week overview')} — ${t('A date list replaces seven compressed hourly columns. Open a day for its full timeline.')}`}
      </InlineAlert>
    </MobilePage>;
  }

  const dayItems = itemsForDay(dateKey);
  const allDayEvents = dayItems.dayOccurrences.filter(o => o.all_day);
  const timedEvents = dayItems.dayOccurrences.filter(o => !o.all_day);
  const allDaySummary = [
    ...allDayEvents.map(e => e.title),
    ...dayItems.dayTasks.map(c => c.title),
    ...(dayItems.review?.paths.map(p => `${p.title} (${p.count})`) ?? []),
  ].filter(Boolean);

  return <MobilePage title={dateKey} fallback="/plan">
    <MobileText muted>{t('Calendar · Day')}</MobileText>
    {!!error && <ErrorState message={t(error)} onRetry={() => void load()} />}
    <MobileChoice
      label={t('View')}
      value="day"
      options={[
        { value: 'day', label: t('Calendar · Day') },
        { value: 'week', label: t('Calendar · Week') },
        { value: 'month', label: t('Calendar · Month') },
      ]}
      onChange={switchView}
    />
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <View style={{ flex: 1 }}>
        <MobileAction variant="secondary" onPress={() => shiftCurrent(-1)}>{t('Back')}</MobileAction>
      </View>
      <View style={{ flex: 1 }}>
        <MobileAction variant="secondary" onPress={() => shiftCurrent(1)}>{t('Next')}</MobileAction>
      </View>
    </View>
    {loading && <LoadingState />}
    <MobileRow
      title={t('All day')}
      description={allDaySummary.join(' · ') || t('No all-day items')}
      onPress={() => router.push('/kanban')}
    />
    {dayItems.footprint && dayItems.footprint.sessions.map(session => (
      <MobileRow
        key={session.id}
        title={session.title || t('New chat')}
        description={dateKey}
        onPress={() => router.push(`/chat/${encodeURIComponent(session.id)}`)}
      />
    ))}
    {Array.from({ length: 24 }, (_, hour) => {
      const label = `${String(hour).padStart(2, '0')}:00`;
      const matchingEvents = timedEvents.filter(o => parseDateKey(o.start).getHours() === hour || new Date(o.start).getHours() === hour);
      const matchingAuto = dayItems.automations.filter(a => new Date(a.at).getHours() === hour);
      const slotSummary = [
        ...matchingEvents.map(e => e.title),
        ...matchingAuto.map(a => a.name || a.message),
      ].filter(Boolean);
      return (
        <View key={label} style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 4 }}>
          <MobileText muted style={{ fontSize: 13 }}>{label}</MobileText>
          {slotSummary.map((text, idx) => (
            <MobileText key={idx} style={{ fontWeight: '600' }}>{text}</MobileText>
          ))}
        </View>
      );
    })}
  </MobilePage>;
}

export function TaskBoardScreen() {
  const { workspace, scopeKey } = usePlanScope();
  const t = useCopy();
  const [board, setBoard] = useState<TaskBoard | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError('');
    try {
      const data = await getTaskBoard(workspace, signal);
      if (!signal?.aborted) setBoard(data);
    } catch (cause) {
      if (!signal?.aborted) setError(planError(cause));
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [workspace]);

  useFocusEffect(useCallback(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]));

  const cards = useMemo(() => {
    const list = board?.cards ?? [];
    return list.filter(card => {
      if (showArchived ? !card.archived : card.archived) return false;
      if (statusFilter !== 'all' && card.status !== statusFilter) return false;
      return true;
    });
  }, [board, showArchived, statusFilter]);

  const doingCount = (board?.cards ?? []).filter(c => !c.archived && c.status === 'doing').length;

  return <MobilePage title={t('Task board')} fallback="/plan">
    <MobileText muted>
      {doingCount === 0 ? t('Independent board · 0 in progress') : `${doingCount} · ${t('In progress')}`}
    </MobileText>
    {!!error && <ErrorState message={t(error)} onRetry={() => void load()} />}
    <MobileChoice
      label={t('View status')}
      value={statusFilter}
      options={[
        { value: 'all', label: t('All') },
        { value: 'todo', label: t('To do') },
        { value: 'doing', label: t('In progress') },
        { value: 'done', label: t('Done') },
      ]}
      onChange={setStatusFilter}
    />
    {loading && <LoadingState />}
    {!loading && cards.length === 0 && <>
      <MobileText style={{ fontSize: 28, lineHeight: 39, fontWeight: '600' }}>{t('Start with one\nclear next step.')}</MobileText>
      <MobileText muted>{t('Tasks can be assigned to workspaces and linked to conversations.')}</MobileText>
    </>}
    {cards.map(card => (
      <MobileRow
        key={card.id}
        title={card.title}
        description={[statusLabel(card.status, t), card.due_date ?? '', card.note].filter(Boolean).join(' · ')}
        onPress={() => {
          setActiveTaskId(scopeKey, card.id);
          router.push({ pathname: "/plan/tasks/edit", params: { taskId: card.id } });
        }}
      />
    ))}
    <MobileAction
      onPress={() => {
        setActiveTaskId(scopeKey, null);
        router.push('/plan/tasks/edit');
      }}
    >
      {t('Add a task')}
    </MobileAction>
    <MobileRow
      title={t(showArchived ? 'Archived' : 'Show archived')}
      description={t('Browse tasks you archived')}
      onPress={() => setShowArchived(prev => !prev)}
    />
    <MobileRow
      title={t('Status colors')}
      description={t('Edit status appearance')}
      onPress={() => router.push('/plan/appearance')}
    />
    <MobileRow
      title={t('Open calendar')}
      description={t('View learning activity')}
      onPress={() => router.push('/calendar')}
    />
  </MobilePage>;
}

export function TaskDetailsScreen() {
  const { taskId: paramTaskId } = useLocalSearchParams<{ taskId?: string }>();
  const { workspace, workspaceName, scopeKey, workspaces } = usePlanScope();
  const t = useCopy();
  const initialTaskId = paramTaskId ?? getActiveTaskId(scopeKey);
  const [taskId, setTaskId] = useState<string | null>(initialTaskId);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [archived, setArchived] = useState(false);
  const [targetWorkspace, setTargetWorkspace] = useState(workspace);
  const [linkedSessionId, setLinkedSessionId] = useState('');
  const [initialLinkedSessionId, setInitialLinkedSessionId] = useState('');
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [board, setBoard] = useState<TaskBoard | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const lock = useRef(false);

  useFocusEffect(useCallback(() => {
    const resolvedId = paramTaskId ?? getActiveTaskId(scopeKey);
    setTaskId(resolvedId);
    const controller = new AbortController();
    const signal = controller.signal;
    setLoading(true);
    setError('');
    void Promise.all([
      getTaskBoard(workspace, signal),
      listWorkspaceSessionSummaries(workspace, signal).catch(() => [] as SessionSummary[]),
    ])
      .then(([nextBoard, nextSessions]) => {
        if (signal.aborted) return;
        setBoard(nextBoard);
        setSessions(nextSessions.filter(s => !s.preferences?.archived));
        if (resolvedId) {
          const card = nextBoard.cards.find(c => c.id === resolvedId);
          if (card) {
            setTitle(card.title);
            setNote(card.note);
            setStatus(card.status);
            setArchived(card.archived);
            setTargetWorkspace(card.workspace_id ?? workspace);
          }
          const linked = nextBoard.session_links.find(l => l.task_ids.includes(resolvedId));
          const sid = linked?.session_id ?? '';
          setLinkedSessionId(sid);
          setInitialLinkedSessionId(sid);
        } else {
          setTitle('');
          setNote('');
          setStatus('todo');
          setArchived(false);
          setTargetWorkspace(workspace);
          setLinkedSessionId('');
          setInitialLinkedSessionId('');
        }
      })
      .catch(cause => {
        if (!signal.aborted) setError(planError(cause));
      })
      .finally(() => {
        if (!signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [paramTaskId, scopeKey, workspace]));

  const run = async (work: () => Promise<void>) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      await work();
    } catch (cause) {
      setError(planError(cause));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };

  const workspaceOptions = useMemo(
    () => [
      { value: '', label: t('General workspace') },
      ...workspaces
        .filter(w => Boolean(w.workspace_id))
        .map(w => ({ value: w.workspace_id, label: w.display_name || w.workspace_id })),
    ],
    [t, workspaces],
  );

  const sessionOptions = useMemo(
    () => [
      { value: '', label: t('All') },
      ...sessions.map(s => ({
        value: s.session_id,
        label: displaySessionTitle(s.title, t('New chat')),
      })),
    ],
    [sessions, t],
  );

  const applySessionLink = async (currentBoard: TaskBoard, cardId: string) => {
    if (initialLinkedSessionId && initialLinkedSessionId !== linkedSessionId) {
      const prevLinks = currentBoard.session_links.find(l => l.session_id === initialLinkedSessionId)?.task_ids ?? [];
      await linkSessionTasks(workspace, initialLinkedSessionId, prevLinks.filter(id => id !== cardId));
    }
    if (linkedSessionId && linkedSessionId !== initialLinkedSessionId) {
      const nextLinks = currentBoard.session_links.find(l => l.session_id === linkedSessionId)?.task_ids ?? [];
      if (!nextLinks.includes(cardId)) {
        await linkSessionTasks(workspace, linkedSessionId, [...nextLinks, cardId]);
      }
    }
  };

  return <MobilePage title={t('Task details')} fallback="/kanban">
    <MobileText muted>{workspaceName || t('General workspace')}</MobileText>
    {!!error && <InlineAlert tone="danger">{t(error)}</InlineAlert>}
    {loading ? <LoadingState /> : <>
      <MobileField label={t('Task')} value={title} onChangeText={setTitle} editable={!busy} />
      <MobileField label={t('Note')} value={note} onChangeText={setNote} multiline editable={!busy} />
      <MobileChoice
        label={t('Status')}
        value={status}
        disabled={busy}
        options={[
          { value: 'todo', label: t('To do') },
          { value: 'doing', label: t('In progress') },
          { value: 'done', label: t('Done') },
        ]}
        onChange={setStatus}
      />
      <MobileChoice
        label={t('Workspace')}
        value={targetWorkspace}
        disabled={busy}
        options={workspaceOptions}
        onChange={setTargetWorkspace}
      />
      <MobileChoice
        label={t('Linked conversation')}
        value={linkedSessionId}
        disabled={busy}
        options={sessionOptions}
        onChange={setLinkedSessionId}
      />
      <MobileAction
        disabled={busy}
        loading={busy}
        onPress={() => void run(async () => {
          const cleanTitle = title.trim();
          if (!cleanTitle) throw new Error('Enter a task title.');
          let updatedBoard = board;
          let targetCardId = taskId;
          if (!targetCardId) {
            const createdBoard = await createTaskCard(workspace, cleanTitle);
            updatedBoard = createdBoard;
            const createdCard = createdBoard.cards.find(c => c.title === cleanTitle) ?? createdBoard.cards.at(-1);
            targetCardId = createdCard?.id ?? null;
          }
          if (targetCardId) {
            updatedBoard = await updateTaskCard(workspace, targetCardId, {
              title: cleanTitle,
              note,
              status,
              archived,
              ...(targetWorkspace !== workspace ? { workspace_id: targetWorkspace } : {}),
            });
            if (updatedBoard) {
              await applySessionLink(updatedBoard, targetCardId);
            }
          }
          setActiveTaskId(scopeKey, null);
          router.replace('/kanban');
        })}
      >
        {t('Save task')}
      </MobileAction>
      {taskId && (
        <MobileRow
          title={t('Task actions')}
          description={t('Mark done · Archive · Delete')}
          onPress={() => void run(async () => {
            await updateTaskCard(workspace, taskId, { archived: !archived });
            setActiveTaskId(scopeKey, null);
            router.replace('/kanban');
          })}
        />
      )}
      <InlineAlert tone="info">
        {`${t('Mobile interaction')} — ${t('Change status from this field; dragging is optional.')}`}
      </InlineAlert>
    </>}
  </MobilePage>;
}

const COLOR_PRESETS: Record<TaskStatus, { value: string; label: string }[]> = {
  todo: [
    { value: '#2563eb', label: 'Neutral · label always visible' },
    { value: '#475569', label: '#475569' },
    { value: '#7c3aed', label: '#7c3aed' },
  ],
  doing: [
    { value: '#a16207', label: 'Accent · label always visible' },
    { value: '#d97706', label: '#d97706' },
    { value: '#0284c7', label: '#0284c7' },
  ],
  done: [
    { value: '#15803d', label: 'Success · label always visible' },
    { value: '#0f766e', label: '#0f766e' },
    { value: '#4f46e5', label: '#4f46e5' },
  ],
};

export function TaskAppearanceScreen() {
  const { workspace } = usePlanScope();
  const t = useCopy();
  const [colors, setColors] = useState<TaskColors>(DEFAULT_TASK_COLORS);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const lock = useRef(false);

  useFocusEffect(useCallback(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    setLoading(true);
    setError('');
    void getTaskBoard(workspace, signal)
      .then(board => {
        if (!signal.aborted) setColors(board.colors);
      })
      .catch(cause => {
        if (!signal.aborted) setError(planError(cause));
      })
      .finally(() => {
        if (!signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [workspace]));

  const run = async (work: () => Promise<void>) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    setSaved(false);
    try {
      await work();
      setSaved(true);
    } catch (cause) {
      setError(planError(cause));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };

  return <MobilePage title={t('Task appearance')} fallback="/kanban">
    <MobileText muted>{t('Status color settings')}</MobileText>
    {!!error && <InlineAlert tone="danger">{t(error)}</InlineAlert>}
    {saved && <InlineAlert tone="success">{t('Saved')}</InlineAlert>}
    {loading ? <LoadingState /> : <>
      <MobileChoice
        label={t('To do')}
        value={colors.todo}
        disabled={busy}
        options={COLOR_PRESETS.todo}
        onChange={todo => setColors(prev => ({ ...prev, todo }))}
      />
      <MobileChoice
        label={t('In progress')}
        value={colors.doing}
        disabled={busy}
        options={COLOR_PRESETS.doing}
        onChange={doing => setColors(prev => ({ ...prev, doing }))}
      />
      <MobileChoice
        label={t('Done')}
        value={colors.done}
        disabled={busy}
        options={COLOR_PRESETS.done}
        onChange={done => setColors(prev => ({ ...prev, done }))}
      />
      <MobileAction
        disabled={busy}
        loading={busy}
        onPress={() => void run(async () => {
          const updated = await updateTaskColors(workspace, colors);
          setColors(updated.colors);
        })}
      >
        {t('Save status colors')}
      </MobileAction>
    </>}
  </MobilePage>;
}
