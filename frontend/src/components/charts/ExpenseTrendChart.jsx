import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const ExpenseTrendChart = ({ expenses }) => {
    if (!expenses || expenses.length === 0) {
        return <p style={{ textAlign: 'center', color: 'var(--c-text2)', padding: '1rem' }}>No expense data yet.</p>;
    }

    const byDay = expenses.reduce((acc, e) => {
        const day = new Date(e.date).getDate();
        acc[day] = (acc[day] || 0) + e.amount;
        return acc;
    }, {});

    const sortedDays = Object.keys(byDay).sort((a, b) => Number(a) - Number(b));

    const data = {
        labels: sortedDays.map((d) => `Day ${d}`),
        datasets: [
            {
                label: 'Daily Spend (₹)',
                data: sortedDays.map((d) => byDay[d]),
                fill: true,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99,102,241,0.1)',
                tension: 0.4,
                pointBackgroundColor: '#6366f1',
                pointRadius: 4,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Expense Trend' },
        },
        scales: {
            y: { beginAtZero: true },
        },
    };

    return <Line data={data} options={options} />;
};

export default ExpenseTrendChart;