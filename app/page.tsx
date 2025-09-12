import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[0px_1fr_60px] items-center justify-items-center min-h-screen p-2 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1>Landing page</h1>
        lorim ipsum Lorem, ipsum dolor sit amet consectetur adipisicing elit.
        Vel harum veritatis enim pariatur quo maiores, qui architecto eos
        consequatur iusto nostrum quae, inventore at impedit, placeat nemo
        cupiditate incidunt non?
        <p>
          <Link href="/home">Go to home</Link>
        </p>
      </main>
    </div>
  );
}
