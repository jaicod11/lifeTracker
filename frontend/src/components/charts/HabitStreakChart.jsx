import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const HabitStreakChart = ({ habits }) => {
    if (!habits || habits.length === 0) {
        return <p style={{ textAlign: 'center', color: 'var(--c-text2)', padding: '1rem' }}>No habit data yet.</p>;
    }

    const data = {
        labels: habits.map((h) => h.name),
        datasets: [
            {
                label: 'Current Streak (days)',
                data: habits.map((h) => h.currentStreak || 0),
                backgroundColor: habits.map((h) => h.color || '#6366f1'),
                borderRadius: 6,
                borderSkipped: false,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Habit Streaks' },
        },
        scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1 } },
        },
    };

    return <Bar data={data} options={options} />;
};

export default HabitStreakChart;