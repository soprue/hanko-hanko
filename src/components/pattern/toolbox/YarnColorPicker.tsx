import SectionTitle from '@components/pattern/toolbox/SectionTitle';
import ColorPicker from '@components/ui/ColorPicker';
import { useEditorStore } from '@store/editor.store';

function YarnColorPicker() {
  const color = useEditorStore((s) => s.draft.color)!;
  const setColor = useEditorStore((s) => s.setColor);

  const swatches = useEditorStore((s) => s.swatches);
  const addSwatch = useEditorStore((s) => s.addSwatch);
  const clearSwatches = useEditorStore((s) => s.clearSwatches);

  return (
    <div>
      <SectionTitle title='실 설정' />
      <ColorPicker
        value={color}
        onChange={setColor}
        swatches={swatches}
        onAddSwatch={addSwatch}
        onClearSwatches={clearSwatches}
        showAlpha={false}
      />
    </div>
  );
}

export default YarnColorPicker;
