function Header() {
  return (
    <div className='max-wide:px-10 relative h-20 min-w-[1440px] shadow-[0_1px_4px_0_rgba(0,0,0,0.1)]'>
      <div className='max-wide:w-full mx-auto flex w-[1440px] justify-between'>
        <img src='/assets/images/logo.png' alt='logo' className='w-20' />
      </div>
    </div>
  );
}

export default Header;
