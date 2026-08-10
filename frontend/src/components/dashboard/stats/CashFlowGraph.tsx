'use client';

import { ChartData, Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement } from "chart.js";
import { Chart } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement);
ChartJS.defaults.color = "white";
ChartJS.defaults.scale.grid.color = "rgba(255, 255, 255, 0.2)";

export const options = {
        responsive: true,
        maintainAspectRatio: false,
};


const data: ChartData = {
        labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        datasets: [{
                type: "line",
                label: "Income (in $)",
                data: [200, 80, 160, 130, 60, 198, 200],
                fill: false,
                borderColor: 'rgb(20, 200, 100)',
                tension: 0.1
        }, {
                type: "line",
                label: "Outcome (in $)",
                data: [50, 100, 60, 60, 180, 160, 100],
                fill: false,
                borderColor: 'rgb(220, 20, 90)',
                tension: 0.1
        }, {
                type: "bar",
                label: "Total",
                data: [150, 130, 230, 300, 180, 218, 318],
                backgroundColor: 'rgba(200, 200, 200, 0.2)'
                }],
}

export default function CashflowGraph() {

        return <div className="p-6" id="cashflow-graph">
                <Chart type="bar" data={data} options={options} className="w-full h-full border border-white bg-gray-700 p-4 rounded-2xl" />
        </div>;
}
