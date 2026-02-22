import { useEffect, useState } from 'react';

type SevenTvEmote = {
  id: string;
  name: string;
  data: {
    host: {
      url: string;
      files: Array<{
        name: string;
        format: string;
        width: number;
        height: number;
        size: number;
      }>;
    };
  };
};

const SEVEN_TV_PUBLIC_ENDPOINT = 'https://7tv.io/v3/emote-sets/global';

function pickBestImage(emote: SevenTvEmote): string | null {
  const file = emote.data.host.files
    .filter((entry: SevenTvEmote['data']['host']['files'][number]) => entry.format === 'WEBP')
    .sort(
      (a: SevenTvEmote['data']['host']['files'][number], b: SevenTvEmote['data']['host']['files'][number]) =>
        b.width - a.width,
    )[0];

  if (!file) {
    return null;
  }

  return `https:${emote.data.host.url}/${file.name}`;
}

export default function SevenTvEmoteTest() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [emoteName, setEmoteName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isActive = true;

    async function loadEmote() {
      try {
        const response = await fetch(SEVEN_TV_PUBLIC_ENDPOINT);
        if (!response.ok) {
          throw new Error(`SevenTV request failed: ${response.status}`);
        }

        const data = (await response.json()) as { emotes?: SevenTvEmote[] };
        if (!data.emotes || data.emotes.length === 0) {
          throw new Error('No emotes returned from SevenTV.');
        }

        const emote = data.emotes[Math.floor(Math.random() * data.emotes.length)];
        const url = pickBestImage(emote);
        if (!url) {
          throw new Error('No WEBP assets available for emote.');
        }

        if (isActive) {
          setImageUrl(url);
          setEmoteName(emote.name);
        }
      } catch (caught) {
        if (isActive) {
          setError(caught instanceof Error ? caught.message : 'Unknown error');
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadEmote();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div className="rounded-lg border border-white/10 bg-black/40 p-4 text-white/90">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-white/60">SevenTV Emote Test</h2>
      {loading ? (
        <p className="mt-3 text-sm text-white/60">Cargando emote público...</p>
      ) : error ? (
        <p className="mt-3 text-sm text-red-400">{error}</p>
      ) : (
        <div className="mt-4 flex items-center gap-3">
          <img src={imageUrl ?? ''} alt={emoteName} className="h-14 w-14" loading="lazy" />
          <div>
            <p className="text-sm font-semibold">{emoteName}</p>
            <p className="text-xs text-white/50">{SEVEN_TV_PUBLIC_ENDPOINT}</p>
          </div>
        </div>
      )}
    </div>
  );
}
