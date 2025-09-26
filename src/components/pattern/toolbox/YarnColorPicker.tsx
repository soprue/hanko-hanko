import SectionTitle from '@components/pattern/toolbox/SectionTitle';
import ColorPicker from '@components/ui/ColorPicker';
import { useEditorStore } from '@store/editor.store';

function YarnColorPicker() {
  // const [color, setColor] = useState<RGBA>({ r: 67, g: 151, b: 235, a: 1 });

  const rgba = useEditorStore((s) => s.draft.color);
  const setColor = useEditorStore((s) => s.setColor);

  return (
    <div>
      <SectionTitle title='실 설정' />
      <ColorPicker value={rgba} onChange={setColor} showAlpha={false} />
    </div>
  );
}

export default YarnColorPicker;
