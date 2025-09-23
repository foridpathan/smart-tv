
import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
    FocusContext,
    init,
    useFocusable
} from '@smart-tv/ui';


init({
  debug: false,
  visualDebug: false,
  distanceCalculationMethod: 'center'
});

const rows = [
  { title: 'Recommended' },
  { title: 'Movies' },
  { title: 'Series' },
  { title: 'TV Channels' },
  { title: 'Sport' }
];

const assets = Array.from({ length: 9 }).map((_, i) => {
  const palette = ['#714ADD', '#AB8DFF', '#512EB0'];
  return { title: `Asset ${i + 1}`, color: palette[i % palette.length] };
});

function MenuItem() {
  const { ref, focused } = useFocusable();

  return (
    <div
      ref={ref as any}
      className="w-[171px] h-[51px] mb-[37px] rounded-[7px] box-border"
      style={{ backgroundColor: '#b056ed', borderStyle: 'solid', borderColor: 'white', borderWidth: focused ? 6 : 0 }}
    />
  );
}

function Menu({ focusKey: focusKeyParam }: { focusKey: string }) {
  const { ref, focusSelf, hasFocusedChild, focusKey } = useFocusable({
    focusable: true,
    saveLastFocusedChild: false,
    trackChildren: true,
    autoRestoreFocus: true,
    isFocusBoundary: false,
    focusKey: focusKeyParam,
    preferredChildFocusKey: null,
    onEnterPress: () => { },
    onEnterRelease: () => { },
    onArrowPress: () => true,
    onArrowRelease: () => { },
    onFocus: () => { },
    onBlur: () => { },
    extraProps: { foo: 'bar' }
  });

  return (
    <FocusContext.Provider value={focusKey}>
      <div
        ref={ref as any}
        className={`flex-1 max-w-[246px] flex flex-col items-center pt-[37px] ${hasFocusedChild ? 'bg-[#4e4181]' : 'bg-[#362C56]'}`}
      >
        <img src={''} alt="logo" className="h-[57px] w-[175px] mb-[51px] object-contain" />
        <MenuItem />
        <MenuItem />
        <MenuItem />
        <MenuItem />
        <MenuItem />
      </div>
    </FocusContext.Provider>
  );
}

function Asset({ title, color, onEnterPress, onFocus, isShuffleSize, index }: any) {
  const { ref, focused } = useFocusable({ onEnterPress, onFocus, extraProps: { title, color } });
  const width = isShuffleSize ? 80 + index * 30 : 225;

  return (
    <div ref={ref as any} className="mr-[22px] flex flex-col">
      <div
        className="h-[127px] rounded-[7px] box-border"
        style={{ width: `${width}px`, backgroundColor: color, borderStyle: 'solid', borderColor: 'white', borderWidth: focused ? 6 : 0 }}
      />
      <div className="text-white mt-[10px] text-[24px] font-normal">{title}</div>
    </div>
  );
}

function ContentRow({ isShuffleSize, title: rowTitle, onAssetPress, onFocus }: any) {
  const { ref, focusKey } = useFocusable({ onFocus });
  const scrollingRef = useRef<HTMLDivElement | null>(null);
  

  const onAssetFocus = useCallback(({ x }: { x: number }) => {
    scrollingRef.current?.scrollTo({ left: x, behavior: 'smooth' });
  }, []);

  return (
    <FocusContext.Provider value={focusKey}>
      <div ref={ref as any} className="mb-[37px]">
        <div className="text-white mb-[22px] text-[27px] font-bold pl-[60px]">{rowTitle}</div>
        <div ref={scrollingRef} className="overflow-x-auto overflow-y-hidden flex-shrink flex-grow pl-[60px]">
          <div className="flex flex-row">
            {assets.map(({ title, color }, index) => (
              <Asset
                index={index}
                title={title}
                key={title}
                color={color}
                onEnterPress={onAssetPress}
                onFocus={onAssetFocus}
                isShuffleSize={isShuffleSize}
              />
            ))}
          </div>
        </div>
      </div>
    </FocusContext.Provider>
  );
}

function ProgressBar() {
  const defaultPercent = 10;
  const seekPercent = 10;
  const delayedTime = 100;
  const DIRECTION_RIGHT = 'right';

  const [percent, setPercent] = useState(defaultPercent);
  const timerRef = useRef<any>(null);
  const { ref, focused } = useFocusable({
    onArrowPress: (direction: string) => {
      if (direction === DIRECTION_RIGHT && timerRef.current === null) {
        timerRef.current = setInterval(() => {
          setPercent((prevPercent: number) => (prevPercent >= 100 ? prevPercent : prevPercent + seekPercent));
        }, delayedTime);
        return true;
      }
      return true;
    },
    onArrowRelease: (direction: string) => {
      if (direction === DIRECTION_RIGHT) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  });

  useEffect(() => { if (!focused) setPercent(defaultPercent); }, [focused]);
  useEffect(() => () => { if (timerRef.current !== null) { clearInterval(timerRef.current); timerRef.current = null; } }, []);

  return (
    <div ref={ref as any} className="absolute bottom-[95px] right-[100px] w-[540px] h-[24px] bg-gray-500 rounded-[21px] box-border" style={{ borderStyle: 'solid', borderColor: 'white', borderWidth: focused ? 6 : 0 }}>
      <div className="h-full rounded-[21px]" style={{ width: `${percent}%`, backgroundColor: focused ? 'deepskyblue' : 'dodgerblue' }} />
    </div>
  );
}

function Content() {
  const { ref, focusKey,focusSelf } = useFocusable();
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  useEffect(() => { focusSelf(); }, [focusSelf]);

  const onAssetPress = useCallback((asset: any) => { setSelectedAsset(asset); }, []);

  const onRowFocus = useCallback(({ y }: { y: number }) => { (ref as any).current?.scrollTo({ top: y, behavior: 'smooth' }); }, [ref]);

  return (
    <FocusContext.Provider value={focusKey}>
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="text-white text-[48px] font-semibold text-center mt-[52px] mb-[37px]">Norigin Spatial Navigation</div>
        <div className="relative flex flex-col items-center">
          <div className="mb-[37px] rounded-[7px]" style={{ height: 282, width: 1074, backgroundColor: selectedAsset ? selectedAsset.color : '#565b6b' }} />
          <div className="absolute" style={{ bottom: 75, left: 100 }}>
            <div className="text-white text-[27px] font-normal">{selectedAsset ? selectedAsset.title : 'Press "Enter" to select an asset'}</div>
          </div>
          <ProgressBar />
        </div>
        <div ref={ref as any} className="overflow-y-auto overflow-x-hidden flex-shrink flex-grow">
          <div>
            {rows.map(({ title }) => (
              <ContentRow key={title} title={title} onAssetPress={onAssetPress} onFocus={onRowFocus} isShuffleSize={Math.random() < 0.5} />
            ))}
          </div>
        </div>
      </div>
    </FocusContext.Provider>
  );
}

function App() {
  return (
    <React.StrictMode>
      {/* hide webkit scrollbar globally in this demo */}
      <style>{`::-webkit-scrollbar{display:none}`}</style>
      <div className="bg-[#221c35] w-[1440px] h-[810px] flex flex-row">
        <Menu focusKey="MENU" />
        <Content />
      </div>
    </React.StrictMode>
  );
}

export default App;