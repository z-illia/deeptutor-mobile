import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  BookMarked,
  Database,
  FileText,
  History,
  X,
} from 'lucide-react-native';
import { useTheme } from '../../theme';
import { type ContextReferenceItem, type ContextReferenceKind } from './model';

function iconForReferenceKind(kind: ContextReferenceKind, color: string) {
  if (kind === 'kb') return <Database size={12} color={color} />;
  if (kind === 'favorite') return <BookMarked size={12} color={color} />;
  if (kind === 'history') return <History size={12} color={color} />;
  return <FileText size={12} color={color} />;
}

const KIND_BADGE_MAP: Record<ContextReferenceKind, string> = {
  kb: 'KB',
  favorite: 'Favorite',
  note: 'Note',
  history: 'History',
};

export function ContextReferenceTree({
  items,
  direction = 'up',
  onRemove,
  onSelect,
}: {
  items: readonly ContextReferenceItem[];
  direction?: 'up' | 'down';
  onRemove?: (id: string) => void;
  onSelect?: (item: ContextReferenceItem) => void;
}) {
  const { colors } = useTheme();
  if (!items || items.length === 0) return null;

  return (
    <View
      style={[
        styles.container,
        direction === 'down' ? styles.containerDown : styles.containerUp,
      ]}
    >
      <View
        style={[
          styles.connectorRail,
          { borderColor: colors.border },
          direction === 'down' ? styles.connectorDown : styles.connectorUp,
        ]}
      />
      <View style={styles.chipList}>
        {items.map((item) => (
          <View
            key={item.id}
            style={[
              styles.chip,
              {
                backgroundColor: colors.secondary,
                borderColor: colors.border,
              },
            ]}
          >
            <Pressable
              disabled={!onSelect}
              onPress={() => onSelect?.(item)}
              style={styles.chipMain}
            >
              {iconForReferenceKind(item.kind, colors.primary)}
              <Text
                style={[styles.kindTag, { color: colors.mutedForeground }]}
              >
                {KIND_BADGE_MAP[item.kind]}
              </Text>
              <Text
                numberOfLines={1}
                style={[styles.chipLabel, { color: colors.foreground }]}
              >
                {item.label}
              </Text>
            </Pressable>
            {onRemove ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove reference ${item.label}`}
                onPress={() => onRemove(item.id)}
                style={styles.removeBtn}
              >
                <X size={12} color={colors.mutedForeground} />
              </Pressable>
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingHorizontal: 4,
  },
  containerUp: {
    marginBottom: 6,
  },
  containerDown: {
    marginTop: 6,
  },
  connectorRail: {
    width: 10,
    height: 16,
    borderLeftWidth: 1.5,
  },
  connectorUp: {
    borderTopWidth: 1.5,
    borderTopLeftRadius: 6,
    marginTop: 6,
  },
  connectorDown: {
    borderBottomWidth: 1.5,
    borderBottomLeftRadius: 6,
    marginBottom: 6,
  },
  chipList: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    maxWidth: 280,
  },
  chipMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexShrink: 1,
  },
  kindTag: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: '500',
    flexShrink: 1,
  },
  removeBtn: {
    padding: 2,
  },
});
