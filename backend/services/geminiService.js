const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateMonthlySummary = async (data) => {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const spendVerb = data.expenses.percentChange > 0 ? 'more' : 'less';
    const spendAbs = Math.abs(data.expenses.percentChange).toFixed(1);

    const prompt = `
You are a sharp, editorial-style financial and life coach AI embedded in "Life Tracker — The Editorial Ledger", a premium personal analytics app.

Write a concise monthly intelligence report for ${data.userName} for ${data.month}/${data.year}.
Use a confident, editorial tone — like a premium finance letter, not a chatbot.
Maximum 3 paragraphs. No bullet points. No markdown headers.

DATA CONTEXT:
- Total spent: ₹${data.expenses.total.toFixed(2)} (${spendVerb} by ${spendAbs}% than last month)
- Spending breakdown: ${JSON.stringify(data.expenses.byCategory)}
- Habit completions: ${data.habits.totalCompletions} (top habit: "${data.habits.topHabit}")
- Average habit streak: ${data.habits.averageStreak} days, longest: ${data.habits.longestStreak} days
- Goals completed: ${data.goals.completed}, in progress: ${data.goals.inProgress}
- Average goal progress: ${data.goals.averageProgress}%

STRUCTURE (no labels, just 3 natural paragraphs):
1. Opening momentum assessment — reference one specific number that stands out
2. One sharp financial insight with the actual figure (e.g., "You spent 20% more on food this month, representing ₹X of your total outflow")  
3. One concrete, actionable recommendation for next month — specific, not generic

Keep it under 180 words. Sound like you've analyzed the data carefully.
`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
};

module.exports = { generateMonthlySummary };