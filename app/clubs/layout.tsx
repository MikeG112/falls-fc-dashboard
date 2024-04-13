import Nav from './nav';
import { Suspense } from 'react';
import {Toaster} from 'react-hot-toast'
import { Analytics } from '@vercel/analytics/react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section>
      <Suspense>
        <Nav />
      </Suspense>
      <Toaster/>
      {children}
      <Analytics />
    </section>
  );
}
