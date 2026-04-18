import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const GoalCompletionChart = ({ goals }) => {
    if (!goals || goals.length === 0) {
        return <p style={{ textAlign: 'center', color: 'var(--c-text2)', padding: '1rem' }}>No goal data yet.</p>;
    }

    const completed = goals.filter((g) => g.completed).length;
    const inProgress = goals.filter((g) => !g.completed && g.current > 0).length;
    const notStarted = goals.filter((g) => !g.completed && g.current === 0).length;

    const data = {
        labels: ['Completed', 'In Progress', 'Not Started'],
        datasets: [
            {
                data: [completed, inProgress, notStarted],
                backgroundColor: ['#22c55e', '#6366f1', '#e2e8f0'],
                borderWidth: 0,
                hoverOffset: 4,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'bottom' },
            title: { display: true, text: 'Goal Completion' },
        },
        cutout: '65%',
    };

    return <Doughnut data={data} options={options} />;
};

export default GoalCompletionChart;