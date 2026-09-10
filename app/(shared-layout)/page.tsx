import { Sparkles } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NextPro | Ideas worth keeping',
  description: '設計、開發與生活觀察，寫給正在打造東西的人。',
};

export default async function Home() {
  return (
    <div className="pb-20">
      <section className="relative overflow-hidden border-b border-foreground/10 py-16 sm:py-24">
        <div className="relative grid gap-10 lg:grid-cols-[1fr_280px] lg:items-end">
          <div className="max-w-4xl">
            <div className="mb-8 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              <span className="text-blue-500">
                <Sparkles aria-hidden="true" />
              </span>
              Notes from NextPro
            </div>
            <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-tighter  sm:text-7xl lg:text-8xl dark:text-foreground">
              Ideas worth <span className="font-serif font-normal italic">keeping.</span>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-muted-foreground">
              寫給正在打造東西的人。從介面、程式，到每天值得記住的小發現。
            </p>
          </div>
          <div className="border-l-2 border-editorial-yellow pl-5 text-sm leading-6 text-muted-foreground">
            <p className="font-semibold text-foreground">Issue 01 / 2026</p>
            <p className="mt-2">一份不急著更新，卻值得慢慢讀完的數位刊物。</p>
          </div>
        </div>
      </section>
    </div>
  );
}
