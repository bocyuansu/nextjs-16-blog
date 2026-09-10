import { Loader2, Search } from 'lucide-react';
import { Input } from '../ui/input';
import { useEffect, useRef, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Link from 'next/link';
import { searchResultTypes } from '@/convex/posts';
import useDebounce from '@/hooks/useDebounce';

export default function SearchInput() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [isOpen, setIsOpen] = useState(false);

  // 建立 useRef 綁定選單最外層
  const searchResultsRef = useRef<HTMLDivElement>(null);
  // skip 代表直接跳過查詢
  const results = useQuery(
    api.posts.searchPosts,
    debouncedSearchTerm.length >= 2 ? { term: debouncedSearchTerm, limit: 5 } : 'skip',
  );

  useEffect(() => {
    // 判斷點擊目標是否在選單外部
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchResultsRef.current &&
        e.target instanceof Node &&
        !searchResultsRef.current.contains(e.target)
      ) {
        setSearchTerm('');
        setIsOpen(false); // 點擊外部，關閉選單
      }
    };

    // 只有在選單開啟時才綁定全域事件，優化效能
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // 清除函數：組件卸載或狀態改變時移除監聽器，防止記憶體洩漏
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  function handleInputSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  }

  function handleSelect() {
    setSearchTerm('');
    setIsOpen(false);
  }

  return (
    <div className="relative w-full max-w-sm z-10">
      <div className="w-full relative">
        <Search className="absolute left-2 top-2 size-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search Posts"
          className="w-full pl-8 bg-background"
          value={searchTerm}
          onChange={handleInputSearch}
        />
      </div>

      {isOpen && debouncedSearchTerm.length >= 2 && (
        <div
          ref={searchResultsRef}
          className="w-full absolute mt-2 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95"
        >
          <SearchResults results={results} onSelect={handleSelect} />
        </div>
      )}
    </div>
  );
}

type SearchResultsType = {
  results: searchResultTypes[] | undefined;
  onSelect: () => void;
};

function SearchResults({ results, onSelect }: SearchResultsType) {
  if (results === undefined) {
    return (
      <div className="flex items-center text-sm text-muted-foreground px-3 py-2">
        <Loader2 className="mr-2 size-4 animate-spin" />
        Searching...
      </div>
    );
  }

  if (results.length === 0) {
    return <p className="text-sm text-muted-foreground px-3 py-2">No results found!</p>;
  }

  return (
    <div className="py-1">
      {results.map((post) => (
        <Link
          onClick={onSelect}
          key={post._id}
          href={`/blog/${post._id}`}
          className="flex flex-col px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
        >
          <p className="font-medium truncate">{post.title}</p>
          <p className="wrap-break-word pt-1 text-xs text-muted-foreground">
            {post.body.substring(0, 60)}
          </p>
        </Link>
      ))}
    </div>
  );
}
