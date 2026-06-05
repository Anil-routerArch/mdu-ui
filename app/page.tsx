import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans text-4xl dark:bg-black">
        new project 
        <Link href="/test-endpoint">
        <button className="border-2 rounded-2xl p-2 cursor-pointer"> go to end point </button>

        </Link>
    </div>
  );
}
