import React, {useEffect, useState} from 'react';
import {Composition, continueRender, delayRender} from 'remotion';
import '@fontsource/lilita-one';
import '@fontsource/nunito/900.css';
import '@fontsource/jetbrains-mono/700.css';
import {Sheet} from './Sheet';
import {Demo3, TOTAL} from './Demo3';

const Fonts: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all([
      document.fonts.load("100px 'Lilita One'"),
      document.fonts.load("900 100px 'Nunito'"),
      document.fonts.load("700 100px 'JetBrains Mono'"),
    ]).then(() => document.fonts.ready).then(() => continueRender(h));
  }, [h]);
  return <>{children}</>;
};
const D: React.FC = () => <Fonts><Demo3 /></Fonts>;
export const Root: React.FC = () => (<>
  <Composition id="sheet" component={Sheet} durationInFrames={60} fps={30} width={1080} height={1920} />
  <Composition id="nodo3" component={D} durationInFrames={TOTAL} fps={30} width={1080} height={1920} />
</>);
