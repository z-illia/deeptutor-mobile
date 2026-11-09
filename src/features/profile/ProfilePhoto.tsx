import { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { View } from 'react-native';
import { useAuth } from '@/features/auth/AuthProvider';
import { useCopy } from '@/features/entry/copy';
import { Button } from '@/shared/ui/Controls';
import { getAvatarImage } from './repository';

export function ProfilePhoto({ userId, marker }: { userId: string; marker: string }) {
  const { serverUrl } = useAuth();
  const t = useCopy();
  const [attempt, setAttempt] = useState(0);
  const key = JSON.stringify([serverUrl, userId, marker, attempt]);
  const [image, setImage] = useState<{ key: string; uri?: string; error?: boolean }>();
  useEffect(() => {
    const controller = new AbortController();
    void getAvatarImage(userId, marker, controller.signal).then(uri => {
      if (!controller.signal.aborted) setImage({ key, uri });
    }).catch(() => { if (!controller.signal.aborted) setImage({ key, error: true }); });
    return () => controller.abort();
  }, [key, userId, marker]);
  return <View>
    {image?.key === key && image.uri && <Image source={{ uri: image.uri }} accessibilityLabel={t('Avatar')} style={{ width: 72, height: 72 }} contentFit="cover" onError={() => setImage({ key, error: true })} />}
    {image?.key === key && image.error && <Button variant="ghost" accessibilityLabel={t('Retry')} onPress={() => setAttempt(old => old + 1)}>{t('Retry')}</Button>}
  </View>;
}
