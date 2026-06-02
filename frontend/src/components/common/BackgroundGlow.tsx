export default function BackgroundGlow() {
    return (
      <>
        <div className="absolute top-[-250px] left-[-180px] w-[550px] h-[550px] rounded-full bg-indigo-500/20 blur-[150px]" />
  
        <div className="absolute bottom-[-250px] right-[-180px] w-[550px] h-[550px] rounded-full bg-violet-500/20 blur-[150px]" />
      </>
    );
  }