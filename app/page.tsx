import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex h-screen bg-black">
      <div className="w-screen h-screen flex flex-col justify-center items-center">
        <Image
          width={512}
          height={512}
          src="/logo.png"
          alt="Platforms on Vercel"
          className="w-48 h-48"
        />
        <div className="text-center max-w-screen-sm mb-10">
          <h1 className="text-stone-200 font-bold text-2xl">
            East Falls Football Club
          </h1>
          <p className="text-stone-400 mt-5">
            A football community in {' '}
            <a
              href="https://en.wikipedia.org/wiki/East_Falls,_Philadelphia"
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-400 underline hover:text-stone-200 transition-all"
            >
              East Falls
            </a>,{' '}
            Philadelphia.
          </p>
        </div>
        <div className="flex space-x-3">
          <p className="text-white">·</p>
          <Link
            href="/clubs"
            className="text-stone-400 underline hover:text-stone-200 transition-all"
          >
            Club Login
          </Link>
          <p className="text-white">·</p>
        </div>
      </div>
      i
    </div>
  );
}
