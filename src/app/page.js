export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      <main className="flex flex-col items-center gap-6 max-w-xl text-center p-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-red-800 dark:text-red-600">
          Parqify
        </h1>
        <p className="text-xl font-medium text-zinc-600 dark:text-zinc-350">
          PUP Manila Community Parking Management System
        </p>
        <div className="mt-4 p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 shadow-sm">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Task 1.1 Project Initialization is complete. Ready to begin development!
          </p>
        </div>
      </main>
    </div>
  );
}
