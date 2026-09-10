import Navbar from '@/components/web/navbar';

export default function SharedLayout({ children }: LayoutProps<'/'>) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
