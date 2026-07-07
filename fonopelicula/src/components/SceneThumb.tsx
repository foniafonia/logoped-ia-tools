import { useState } from 'react';
import SceneArt from './SceneArt';

/**
 * Captura real de la película para cada capítulo (public/scenes/<id>.jpg).
 * Si la imagen no existe (p. ej. película nueva sin capturas todavía),
 * cae a la ilustración SVG como respaldo.
 *
 * Para regenerar las capturas con otra película: extraer un fotograma por
 * fragmento (ffmpeg) y guardarlo como public/scenes/escena-N.jpg (636×360).
 */

interface Props {
  sceneId: string;
  className?: string;
}

export default function SceneThumb({ sceneId, className = '' }: Props) {
  const [failed, setFailed] = useState(false);
  if (failed) return <SceneArt sceneId={sceneId} />;
  return (
    <img
      src={`${import.meta.env.BASE_URL}scenes/${sceneId}.jpg`}
      alt=""
      draggable={false}
      onError={() => setFailed(true)}
      className={`h-full w-full select-none object-cover ${className}`}
    />
  );
}
