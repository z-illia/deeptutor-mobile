import type { Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  FileText,
  Route,
} from 'lucide-react-native';
import { useCopy } from '@/features/entry/copy';
import { useFixtures } from '@/features/entry/FixtureProvider';
import { allowedDestination } from '@/features/entry/model';
import { useDesign } from '@/shared/design/DesignProvider';
import { alpha } from '@/shared/design/tokens';
import { Button } from '@/shared/ui/Controls';
import { InlineAlert } from '@/shared/ui/Feedback';
import { DText } from '@/shared/ui/Text';
import { useLearning } from './LearningProvider';
import {
  visibleLearningSurfaces,
  type LearningKind,
  type LearningSurfaceDefinition,
} from './model';
import {
  PageCustomizeButton,
  PageCustomizeDialog,
} from './PageCustomizeDialog';

function SurfaceIcon({
  kind,
  color,
}: {
  kind: LearningKind;
  color: string;
}) {
  if (kind === 'books') return <BookOpen size={20} color={color} />;
  if (kind === 'mastery') return <Route size={20} color={color} />;
  if (kind === 'practice') return <ClipboardCheck size={20} color={color} />;
  return <FileText size={20} color={color} />;
}

export function NewLearningScreen() {
  const { colors } = useDesign();
  const t = useCopy();
  const { mode: entryMode } = useFixtures();
  const { customization } = useLearning();
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [deferredNotice, setDeferredNotice] = useState<string | null>(null);

  const items = useMemo(
    () =>
      visibleLearningSurfaces(customization, (href) =>
        allowedDestination(entryMode, href),
      ),
    [customization, entryMode],
  );

  const handleSelectSurface = (item: LearningSurfaceDefinition) => {
    if (item.kind === 'mastery') {
      setDeferredNotice(null);
      router.push('/learning/mastery?create=1' as Href);
      return;
    }
    setDeferredNotice(t('This feature is not available yet.'));
  };

  return (
    <View
      testID="new-learning-screen"
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingVertical: 18,
          gap: 18,
          maxWidth: 1080,
          width: '100%',
          alignSelf: 'center',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <View style={{ flex: 1, minWidth: 240, gap: 4 }}>
            <Pressable
              testID="new-learning-back-btn"
              accessibilityRole="button"
              accessibilityLabel={t('Back to Learning Hub')}
              onPress={() => router.push('/learning' as Href)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                marginBottom: 4,
              }}
            >
              <ArrowLeft size={14} color={colors.mutedForeground} />
              <DText role="caption" muted>
                {t('All learning')}
              </DText>
            </Pressable>
            <DText
              role="caption"
              muted
              style={{
                textTransform: 'uppercase',
                letterSpacing: 1.1,
                fontWeight: '600',
              }}
            >
              {t('Learning')}
            </DText>
            <DText role="title" style={{ fontSize: 22, fontWeight: '700' }}>
              {t('Create learning')}
            </DText>
            <DText role="small" muted>
              {t(
                'Choose a learning way to start a new book, mastery path, practice set, or reading collection.',
              )}
            </DText>
          </View>

          <PageCustomizeButton
            testID="new-learning-customize-btn"
            onPress={() => setCustomizeOpen(true)}
          />
        </View>

        {deferredNotice ? (
          <InlineAlert tone="warning">{t(deferredNotice)}</InlineAlert>
        ) : null}

        {items.length === 0 ? (
          <View
            testID="new-learning-empty-custom"
            style={{
              padding: 24,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
              alignItems: 'center',
              gap: 10,
            }}
          >
            <DText style={{ fontWeight: '600' }}>
              {t('All learning ways are hidden on this page.')}
            </DText>
            <Button
              testID="new-learning-recover-btn"
              variant="secondary"
              size="sm"
              onPress={() => setCustomizeOpen(true)}
            >
              {t('Customize page')}
            </Button>
          </View>
        ) : (
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 14,
            }}
          >
            {items.map((item) => (
              <Pressable
                key={item.kind}
                testID={`create-learning-card-${item.kind}`}
                accessibilityRole="button"
                accessibilityLabel={`${t(item.title)} — ${t('Start')}`}
                onPress={() => handleSelectSurface(item)}
                style={({ pressed }) => ({
                  flexGrow: 1,
                  flexBasis: 340,
                  minWidth: 280,
                  padding: 20,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor:
                    item.kind === 'mastery'
                      ? alpha(colors.primary, 0.5)
                      : colors.border,
                  backgroundColor: pressed
                    ? alpha(colors.accent, 0.5)
                    : colors.card,
                  gap: 14,
                })}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                      flex: 1,
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        backgroundColor: alpha(colors.primary, 0.1),
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <SurfaceIcon kind={item.kind} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <DText style={{ fontSize: 16, fontWeight: '600' }}>
                        {t(item.title)}
                      </DText>
                      {item.milestone !== 'M4.1' ? (
                        <DText role="caption" muted>
                          {t('Planned for')} {item.milestone}
                        </DText>
                      ) : null}
                    </View>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <DText
                      role="small"
                      style={{ color: colors.primary, fontWeight: '600' }}
                    >
                      {t('Start')}
                    </DText>
                    <ArrowRight size={14} color={colors.primary} />
                  </View>
                </View>

                <DText role="small" muted style={{ lineHeight: 20 }}>
                  {t(item.intro)}
                </DText>

                <View
                  style={{
                    marginTop: 'auto',
                    borderTopWidth: 1,
                    borderColor: colors.border,
                    paddingTop: 12,
                    gap: 6,
                  }}
                >
                  {item.highlights.map((bullet, idx) => (
                    <View
                      key={idx}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        gap: 8,
                      }}
                    >
                      <View
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: 999,
                          backgroundColor: colors.primary,
                          marginTop: 6,
                        }}
                      />
                      <DText
                        role="caption"
                        muted
                        style={{ flex: 1, lineHeight: 17 }}
                      >
                        {t(bullet)}
                      </DText>
                    </View>
                  ))}
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      <PageCustomizeDialog
        open={customizeOpen}
        page="learning"
        onClose={() => setCustomizeOpen(false)}
      />
    </View>
  );
}
