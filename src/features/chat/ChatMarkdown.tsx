import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Check, Copy } from 'lucide-react-native';
import { useDesign } from '@/shared/design/DesignProvider';

type MarkdownSegment =
  | { kind: 'code'; language: string; code: string }
  | { kind: 'text'; lines: string[] };

function parseSegments(raw: string): MarkdownSegment[] {
  const lines = raw.split('\n');
  const segments: MarkdownSegment[] = [];
  let inCode = false;
  let codeLang = '';
  let codeLines: string[] = [];
  let textLines: string[] = [];

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      if (!inCode) {
        if (textLines.length > 0) {
          segments.push({ kind: 'text', lines: textLines });
          textLines = [];
        }
        inCode = true;
        codeLang = line.trim().slice(3).trim() || 'code';
        codeLines = [];
      } else {
        segments.push({
          kind: 'code',
          language: codeLang,
          code: codeLines.join('\n'),
        });
        inCode = false;
        codeLang = '';
        codeLines = [];
      }
    } else if (inCode) {
      codeLines.push(line);
    } else {
      textLines.push(line);
    }
  }

  if (inCode) {
    segments.push({
      kind: 'code',
      language: codeLang || 'code',
      code: codeLines.join('\n'),
    });
  } else if (textLines.length > 0) {
    segments.push({ kind: 'text', lines: textLines });
  }

  return segments;
}

export function ChatMarkdown({ content }: { content: string }) {
  const { colors } = useDesign();
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const segments = parseSegments(content);

  return (
    <View style={styles.container}>
      {segments.map((seg, idx) => {
        if (seg.kind === 'code') {
          const isCopied = copiedIdx === idx;
          return (
            <View
              key={`md-code-${idx}`}
              style={[
                styles.codeBox,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.secondary,
                },
              ]}
            >
              <View
                style={[
                  styles.codeHeader,
                  {
                    borderBottomColor: colors.border,
                    backgroundColor: colors.card,
                  },
                ]}
              >
                <Text
                  style={[styles.codeLang, { color: colors.mutedForeground }]}
                >
                  {seg.language}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Copy code block"
                  onPress={async () => {
                    await Clipboard.setStringAsync(seg.code);
                    setCopiedIdx(idx);
                    setTimeout(() => setCopiedIdx(null), 1200);
                  }}
                  style={styles.copyBtn}
                >
                  {isCopied ? (
                    <Check size={12} color={colors.primary} />
                  ) : (
                    <Copy size={12} color={colors.mutedForeground} />
                  )}
                  <Text
                    style={[
                      styles.copyBtnText,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    {isCopied ? 'Copied' : 'Copy'}
                  </Text>
                </Pressable>
              </View>
              <Text style={[styles.codeBody, { color: colors.foreground }]}>
                {seg.code}
              </Text>
            </View>
          );
        }

        return (
          <View key={`md-txt-${idx}`} style={styles.textBlock}>
            {seg.lines.map((line, lIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return null;
              if (trimmed.startsWith('#### ')) {
                return (
                  <Text
                    key={`l-${lIdx}`}
                    style={[styles.h4, { color: colors.foreground }]}
                  >
                    {trimmed.slice(5)}
                  </Text>
                );
              }
              if (trimmed.startsWith('### ')) {
                return (
                  <Text
                    key={`l-${lIdx}`}
                    style={[styles.h3, { color: colors.foreground }]}
                  >
                    {trimmed.slice(4)}
                  </Text>
                );
              }
              if (trimmed.startsWith('## ')) {
                return (
                  <Text
                    key={`l-${lIdx}`}
                    style={[styles.h2, { color: colors.foreground }]}
                  >
                    {trimmed.slice(3)}
                  </Text>
                );
              }
              if (trimmed.startsWith('# ')) {
                return (
                  <Text
                    key={`l-${lIdx}`}
                    style={[styles.h1, { color: colors.foreground }]}
                  >
                    {trimmed.slice(2)}
                  </Text>
                );
              }
              return (
                <Text
                  key={`l-${lIdx}`}
                  style={[styles.paragraph, { color: colors.foreground }]}
                >
                  {trimmed}
                </Text>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  textBlock: {
    gap: 5,
  },
  h1: {
    fontSize: 16,
    fontWeight: '700',
  },
  h2: {
    fontSize: 15,
    fontWeight: '700',
  },
  h3: {
    fontSize: 14,
    fontWeight: '700',
  },
  h4: {
    fontSize: 13,
    fontWeight: '600',
  },
  paragraph: {
    fontSize: 13,
    lineHeight: 19,
  },
  codeBox: {
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  codeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  codeLang: {
    fontSize: 11,
    fontFamily: 'monospace',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  copyBtnText: {
    fontSize: 11,
  },
  codeBody: {
    padding: 10,
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 17,
  },
});
