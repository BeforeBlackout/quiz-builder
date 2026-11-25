import { Icon } from "@/components/Icon";

export function BooleanView({ answer }: { answer: boolean }) {
  return (
    <div className="flex flex-wrap gap-3">
      {[
        { label: "True", value: true },
        { label: "False", value: false },
      ].map((answerOption) => {
        const selected = answerOption.value === answer;
        return (
          <span
            key={answerOption.label}
            className={`inline-flex items-center gap-2 rounded-md px-3.5 py-2.5 text-[13px] font-medium ${
              selected ? "bg-success-soft text-success" : "bg-paper text-muted"
            }`}
          >
            {selected ? (
              <Icon src="/icons/check-green.svg" />
            ) : (
              <Icon src="/icons/radio-empty.svg" />
            )}
            {answerOption.label}
            {selected ? <span className="text-[11px] font-normal">· Correct answer</span> : null}
          </span>
        );
      })}
    </div>
  );
}
