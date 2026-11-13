import Link from 'next/link';
import {
  getNotFoundTitle,
  getNotFoundMessage,
  getNotFoundBackActionText,
  getNotFoundContainerClass,
  getNotFoundButtonClass,
} from '@/utils/notFoundViewUtils';

export default function NotFound() {
  return (
    <main className={getNotFoundContainerClass()}>
      <h1 className="text-4xl font-extrabold text-fg">{getNotFoundTitle()}</h1>
      <p className="mt-2 text-sm text-muted">{getNotFoundMessage()}</p>
      <Link href="/" className={getNotFoundButtonClass()}>
        {getNotFoundBackActionText()}
      </Link>
    </main>
  );
}
