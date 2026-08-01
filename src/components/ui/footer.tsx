export default function Footer() {
  return (
    <footer className="mt-auto border-t py-6">
      <div className="container flex flex-col items-center justify-center gap-1 px-4 text-center text-sm text-muted-foreground">
        <p>
          Made with <span className="text-red-500">&hearts;</span> by{' '}
          <a 
            href="https://github.com/Rohan-KV-2806" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Rohan
          </a>
        </p>
      </div>
    </footer>
  );
}