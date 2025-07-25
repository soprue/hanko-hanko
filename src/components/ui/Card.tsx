function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className='h-[800px] w-full rounded-3xl bg-white p-6 shadow-[0_8px_10px_0_rgba(0,0,0,0.1)]'>
      {children}
    </div>
  );
}

export default Card;
