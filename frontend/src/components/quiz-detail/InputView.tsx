export function InputView({ answer }: { answer: string }) {
  return (
    <div className="rounded-lg bg-paper px-4.5 py-6">
      <p className="text-[9px] font-semibold tracking-wide text-muted uppercase">Expected answer</p>
      <p className="mt-1.5 text-sm font-medium">{answer}</p>
    </div>
  );
}
