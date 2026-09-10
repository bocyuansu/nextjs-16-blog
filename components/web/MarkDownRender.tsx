'use client';

import { Streamdown } from 'streamdown';
import { code } from '@streamdown/code';
import type { CustomRendererProps } from 'streamdown';
import { CodeBlockContainer, CodeBlockCopyButton } from 'streamdown';
import { useEffect, useState } from 'react';
import { codeToHtml } from 'shiki';
import { useTheme } from 'next-themes';

export default function MarkDownRender({ markdown }: { markdown: string }) {
  return (
    <Streamdown
      plugins={{
        code: code,
        renderers: [
          {
            language: ['typescript-noheader', 'tsx-noheader', 'bash-noheader'],
            component: CustomCodeBlock,
          },
        ],
      }}
      shikiTheme={['github-light', 'github-dark']}
      controls={{ code: { download: false } }}
      lineNumbers={true}
    >
      {markdown}
    </Streamdown>
  );
}

function CustomCodeBlock({
  code,
  language,
  isIncomplete,
}: CustomRendererProps) {
  const { resolvedTheme } = useTheme();
  const [highlightedCode, setHighlightedCode] = useState('');

  useEffect(() => {
    const highlight = async () => {
      try {
        const lang = language.split('-').at(0);

        const html = await codeToHtml(code, {
          lang: lang || 'typescript',
          themes: {
            light: 'github-light',
            dark: 'github-dark',
          },
          defaultColor: resolvedTheme === 'dark' ? 'dark' : 'light',
          rootStyle: `
            background-color: transparent !important;
            color: var(--foreground) !important;
          `,
        });
        setHighlightedCode(html);
      } catch (error) {
        console.error('Highlight error:', error);
        setHighlightedCode(`<pre>${code}</pre>`);
      }
    };
    highlight();
  }, [code, language, resolvedTheme]);

  return (
    <CodeBlockContainer isIncomplete={isIncomplete} language={language}>
      <div
        className="overflow-y-auto overflow-x-auto rounded-md border border-border bg-background p-4 text-sm"
        dangerouslySetInnerHTML={{ __html: highlightedCode }}
      />
      <CodeBlockCopyButton code={code} className="absolute right-5 top-5" />
    </CodeBlockContainer>
  );
}
