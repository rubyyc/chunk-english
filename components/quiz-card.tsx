"use client";

import { FormEvent, useState } from "react";

type QuizCardProps = {
  number: number;
  prompt: string;
  answer: string;
};

function normalize(value: string): string {
  return value.toLowerCase().replace(/[?.!,]/g, "").replace(/\s+/g, " ").trim();
}

export function QuizCard({ number, prompt, answer }: QuizCardProps) {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<"correct" | "retry" | null>(null);

  function checkAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(normalize(value) === normalize(answer) ? "correct" : "retry");
  }

  return (
    <article className="quiz-card">
      <div className="quiz-prompt"><span>Q{number}</span>{prompt}</div>
      <form onSubmit={checkAnswer}>
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="输入完整英文句子"
          aria-label={`${prompt} 的英文答案`}
        />
        <button className="button button-primary" type="submit">检查</button>
      </form>
      {result && (
        <p className={result === "correct" ? "quiz-result correct" : "quiz-result retry"}>
          {result === "correct" ? "答对了。" : "再试一次，答案是："}
          {result === "retry" && <strong>{answer}</strong>}
        </p>
      )}
    </article>
  );
}
