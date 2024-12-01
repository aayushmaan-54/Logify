

const authLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <>
      <div className="flex justify-center pt-20">
        { children }
      </div>
    </>
  );
}

export default authLayout;