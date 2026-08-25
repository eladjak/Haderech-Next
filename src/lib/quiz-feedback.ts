export function learnerQuizSubmissionErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("QUIZ_ATTEMPT_COOLDOWN")) {
    return "כדי לשמור על הוגנות הבוחן, יש להמתין דקה בין הגשות.";
  }
  if (message.includes("QUIZ_ATTEMPT_WINDOW_EXHAUSTED")) {
    return "מכסת שלוש ההגשות ב־24 שעות הסתיימה. אפשר לחזור מחר.";
  }
  if (message.includes("QUIZ_ALREADY_PASSED")) {
    return "הבוחן כבר הושלם, ולכן אין צורך בהגשה נוספת.";
  }
  return "לא הצלחנו לבדוק את הבוחן. אפשר לנסות לשלוח שוב.";
}
