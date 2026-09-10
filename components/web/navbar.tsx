'use client';

import Link from 'next/link';
import { Button, buttonVariants } from '../ui/button';
import { ThemeToggle } from './theme-toggle';
import { useConvexAuth } from 'convex/react';
import { authClient } from '@/lib/auth-client';
import { toast } from '../ui/toast';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import SearchInput from './SearchInput';

export default function Navbar() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <nav className="w-full py-5 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <Link href="/">
          <h1 className="text-3xl font-bold">
            Next<span className="text-primary">Pro</span>
          </h1>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            className={cn(
              buttonVariants({ variant: 'ghost' }),
              'text-lg font-bold',
            )}
            href="/"
          >
            Home
          </Link>
          <Link
            className={cn(
              buttonVariants({ variant: 'ghost' }),
              'text-lg font-bold',
            )}
            href="/blog"
          >
            Blog
          </Link>
          {!isAuthenticated ? null : (
            <Link
              className={cn(
                buttonVariants({ variant: 'ghost' }),
                'text-lg font-bold',
              )}
              href="/create"
            >
              Create
            </Link>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:block mr-2">
          <SearchInput />
        </div>
        {isLoading ? null : isAuthenticated ? (
          <Button
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await authClient.signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      toast.add({
                        type: 'success',
                        description: '登出成功 !',
                      });
                      router.push('/');
                    },
                    onError: (error) => {
                      toast.add({
                        type: 'error',
                        description: error.error.message,
                        priority: 'high',
                      });
                    },
                  },
                });
              })
            }
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>登出中</span>
              </>
            ) : (
              <span>登出</span>
            )}
          </Button>
        ) : (
          <>
            <Link className={buttonVariants()} href="/auth/sign-up">
              Sign up
            </Link>
            <Link
              className={buttonVariants({ variant: 'outline' })}
              href="/auth/login"
            >
              Login
            </Link>
          </>
        )}

        <ThemeToggle />
      </div>
    </nav>
  );
}
