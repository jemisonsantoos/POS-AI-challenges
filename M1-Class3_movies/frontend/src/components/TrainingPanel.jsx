import { useState, useRef, useEffect } from 'react';

const EPOCHS = 30;

function simulateTraining(epochs) {
    const history = { loss: [], accuracy: [], valLoss: [], valAccuracy: [] };
    let loss = 0.7 + Math.random() * 0.2;
    let acc = 0.45 + Math.random() * 0.1;

    for (let i = 0; i < epochs; i++) {
        const decay = 0.85 + Math.random() * 0.1;
        loss *= decay;
        acc += (1 - acc) * (0.06 + Math.random() * 0.04);

        const noise = () => (Math.random() - 0.5) * 0.03;
        history.loss.push(Math.max(0.01, loss + noise()));
        history.accuracy.push(Math.min(0.99, acc + noise()));
        history.valLoss.push(Math.max(0.02, loss * 1.15 + noise() * 2));
        history.valAccuracy.push(Math.min(0.98, acc * 0.95 + noise()));
    }
    return history;
}

const LOSS_COLOR = '#d9534f';
const LOSS_VAL_COLOR = 'rgba(217,83,79,0.35)';
const ACC_COLOR = '#48bb78';
const ACC_VAL_COLOR = 'rgba(72,187,120,0.35)';

function drawChart(canvas, history) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const pad = { top: 10, right: 10, bottom: 24, left: 38 };
    const cw = w - pad.left - pad.right;
    const ch = h - pad.top - pad.bottom;

    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = '#f0f0ec';
    ctx.fillRect(pad.left, pad.top, cw, ch);

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.8;
    for (let i = 0; i <= 4; i++) {
        const y = pad.top + (ch / 4) * i;
        ctx.beginPath();
        ctx.moveTo(pad.left, y);
        ctx.lineTo(w - pad.right, y);
        ctx.stroke();

        ctx.fillStyle = '#a0aec0';
        ctx.font = '9px system-ui';
        ctx.textAlign = 'right';
        ctx.fillText((1 - i / 4).toFixed(2), pad.left - 4, y + 3);
    }

    const n = history.loss.length;
    for (let i = 0; i < n; i += 5) {
        const x = pad.left + (i / (n - 1)) * cw;
        ctx.fillStyle = '#a0aec0';
        ctx.font = '8px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(i + 1, x, h - 6);
    }

    function drawLine(data, color, maxVal = 1) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.8;
        for (let i = 0; i < data.length; i++) {
            const x = pad.left + (i / (data.length - 1)) * cw;
            const y = pad.top + (1 - data[i] / maxVal) * ch;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    drawLine(history.loss, LOSS_COLOR);
    drawLine(history.valLoss, LOSS_VAL_COLOR);
    drawLine(history.accuracy, ACC_COLOR);
    drawLine(history.valAccuracy, ACC_VAL_COLOR);
}

function initialHistory() {
    return simulateTraining(30);
}

export default function TrainingPanel({ stats }) {
    const [training, setTraining] = useState(false);
    const [epoch, setEpoch] = useState(0);
    const [done, setDone] = useState(true);
    const [history, setHistory] = useState(initialHistory);
    const canvasRef = useRef();

    useEffect(() => {
        if (history && canvasRef.current) drawChart(canvasRef.current, history);
    }, [history]);

    async function handleTrain() {
        setTraining(true);
        setDone(false);
        setEpoch(0);

        const h = simulateTraining(EPOCHS);

        for (let i = 0; i < EPOCHS; i++) {
            setEpoch(i + 1);
            setHistory({
                loss: h.loss.slice(0, i + 1),
                accuracy: h.accuracy.slice(0, i + 1),
                valLoss: h.valLoss.slice(0, i + 1),
                valAccuracy: h.valAccuracy.slice(0, i + 1),
            });
            await new Promise(r => setTimeout(r, 120));
        }

        setTraining(false);
        setDone(true);
    }

    const progress = training ? Math.round((epoch / EPOCHS) * 100) : done ? 100 : 0;

    return (
        <div className="panel training-panel">
            <div className="panel-header">
                AI Training
                {done && !training && <span className="status-badge ready">Ready</span>}
                {training && <span className="status-badge active">Epoch {epoch}/{EPOCHS}</span>}
            </div>

            <div className="training-bar-track">
                <div className="training-bar-fill" style={{ width: `${progress}%` }} />
            </div>

            <div className="chart-container">
                <div className="chart-legend">
                    <span><i style={{ background: LOSS_COLOR }} /> Loss</span>
                    <span><i style={{ background: LOSS_VAL_COLOR }} /> Val Loss</span>
                    <span><i style={{ background: ACC_COLOR }} /> Accuracy</span>
                    <span><i style={{ background: ACC_VAL_COLOR }} /> Val Acc</span>
                </div>
                <canvas ref={canvasRef} className="training-chart" />
                {done && history && (
                    <div className="chart-summary">
                        <span>Loss: <b>{history.loss.at(-1).toFixed(4)}</b></span>
                        <span>Accuracy: <b>{(history.accuracy.at(-1) * 100).toFixed(1)}%</b></span>
                        <span>Val Loss: <b>{history.valLoss.at(-1).toFixed(4)}</b></span>
                        <span>Val Acc: <b>{(history.valAccuracy.at(-1) * 100).toFixed(1)}%</b></span>
                    </div>
                )}
            </div>

            <button className="btn-panel btn-accent" onClick={handleTrain} disabled={training}>
                {training ? <><span className="mini-spinner" /> Training...</> : 'Re-train Model'}
            </button>
        </div>
    );
}
