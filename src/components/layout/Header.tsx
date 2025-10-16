import { useRef } from 'react';

import * as Sentry from '@sentry/react';

import Button from '@components/ui/Button';
import Icon from '@components/ui/Icon';
import { usePatternStore } from '@store/pattern.store';
import { downloadText, readTextFromFile } from '@utils/file';

function Header() {
  const fileRef = useRef<HTMLInputElement>(null);
  const serialize = usePatternStore((s) => s.serialize);
  const deserialize = usePatternStore((s) => s.deserialize);

  // 파일 이름 유틸
  const tsFilename = (prefix = 'pattern') => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${prefix}_${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(
      d.getDate(),
    )}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}.txt`;
  };

  // 내보내기
  const handleExport = () => {
    Sentry.startSpan({ op: 'ui.click', name: 'Export Pattern' }, (span) => {
      try {
        span.setAttribute('page', 'editor');
        span.setAttribute('action', 'export');
        
        const json = serialize();
        let pretty = json;
        try {
          pretty = JSON.stringify(JSON.parse(json), null, 2);
        } catch {
          /* ignore */
        }
        downloadText(tsFilename(), pretty);
      } finally {
        span.end();
      }
    });
  };

  // 불러오기
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await Sentry.startSpan({ op: 'ui.click', name: 'Import Pattern' }, async (span) => {
      try {
        span.setAttribute('page', 'editor');
        span.setAttribute('action', 'import');
        
        const file = e.target.files?.[0];
        if (!file) return;

        try {
          const text = await readTextFromFile(file);
          span.setAttribute('fileSize', file.size);
          span.setAttribute('fileName', file.name);
          
          const parsed = JSON.parse(text);
          const rounds = parsed?.rounds ?? parsed?.state?.rounds ?? null;
          if (!Array.isArray(rounds))
            throw new Error('rounds 배열을 찾을 수 없습니다.');
          
          span.setAttribute('roundsCount', rounds.length);
          
          deserialize(JSON.stringify({ rounds }));
          e.target.value = '';
          alert('패턴이 성공적으로 불러와졌습니다.');
        } catch (err) {
          console.error(err);
          span.setAttribute('error', true);
          Sentry.captureException(err, {
            tags: { module: 'PatternImport' },
            extra: { fileName: file?.name, fileSize: file?.size },
          });
          alert('불러오기 실패: 파일 형식이 올바르지 않습니다.');
          e.target.value = '';
        }
      } finally {
        span.end();
      }
    });
  };

  const openFileDialog = () => fileRef.current?.click();

  return (
    <div className='max-wide:px-10 relative h-20 min-w-[1440px] shadow-[0_1px_4px_0_rgba(0,0,0,0.1)]'>
      <div className='max-wide:w-full mx-auto flex w-[1440px] justify-between'>
        <div>
          <img src='/assets/images/logo.png' alt='logo' className='w-20' />
        </div>

        <div className='flex items-center gap-2'>
          {/* 불러오기 */}
          <Button
            variant='ghost'
            size='sm'
            className='flex items-center justify-center gap-1'
            onClick={openFileDialog}
          >
            <Icon name='Import' className='text-text' width={20} /> 불러오기
          </Button>
          <input
            ref={fileRef}
            type='file'
            accept='.txt,.json,text/plain,application/json'
            className='hidden'
            onChange={handleImport}
          />

          {/* 내보내기 */}
          <Button
            variant='ghost'
            size='sm'
            className='flex items-center justify-center gap-1'
            onClick={handleExport}
          >
            <Icon name='Export' className='text-text' width={20} /> 내보내기
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Header;
