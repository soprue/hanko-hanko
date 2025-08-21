import Icon from '@/components/ui/Icon';

function Pattern3DCanvas() {
  return (
    <>
      <div className='mb-2 flex h-[660px] flex-col items-center gap-5 rounded-xl border-2 border-dotted border-[#DBD7D1]/50 bg-linear-to-r from-[#FAFAF9] to-[#F8F6F1] pt-[200px]'>
        <Icon name='Cube' width={60} color='#EBE6D8' />
        <p className='text-text-muted text-center'>
          패턴이 추가되면 3D 모델이 표시됩니다
        </p>
      </div>

      <p className='text-text-muted text-center'>
        마우스로 회전하고, 휠로 확대/축소할 수 있어요
      </p>
    </>
  );
}

export default Pattern3DCanvas;
