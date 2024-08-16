// icsExport.js
// ICSファイルエクスポートに関する処理を管理するファイルです。

import { getEndTime } from './utils.js'; // 共通関数をインポート

export function exportToIcs() {
    // ICSファイルをエクスポートする処理
    const todos = JSON.parse(localStorage.getItem('todos')) || {}; // ローカルストレージから通常タスクを取得
    const fixedTasks = JSON.parse(localStorage.getItem('fixedTasks')) || {}; // ローカルストレージから固定タスクを取得
    const shifts = JSON.parse(localStorage.getItem('shifts')) || {}; // ローカルストレージからシフトを取得

    let icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nCALSCALE:GREGORIAN\n`; // ICSファイルのヘッダ

    // 通常タスクをICS形式に変換
    for (const date in todos) {
        if (todos.hasOwnProperty(date)) {
            const dateFormatted = date.replace(/-/g, ''); // 日付をICS形式に変換
            todos[date].forEach((task) => {
                const startTime = komaTimes[task.shift] || '09:00'; // シフトに基づいて開始時刻を取得
                const endTime = getEndTime(startTime); // 終了時刻を取得
                icsContent += `BEGIN:VEVENT\nSUMMARY:${task.text}\nDTSTART:${dateFormatted}T${startTime.replace(':', '')}00\nDTEND:${dateFormatted}T${endTime.replace(':', '')}00\nEND:VEVENT\n`;
            });
        }
    }

    // 固定タスクをICS形式に変換
    for (const date in fixedTasks) {
        if (fixedTasks.hasOwnProperty(date)) {
            const dateFormatted = date.replace(/-/g, ''); // 日付をICS形式に変換
            fixedTasks[date].forEach((task) => {
                const startTime = komaTimes[task.shift] || '09:00'; // シフトに基づいて開始時刻を取得
                const endTime = getEndTime(startTime); // 終了時刻を取得
                icsContent += `BEGIN:VEVENT\nSUMMARY:${task.text}\nDTSTART:${dateFormatted}T${startTime.replace(':', '')}00\nDTEND:${dateFormatted}T${endTime.replace(':', '')}00\nEND:VEVENT\n`;
            });
        }
    }

    // シフトをICS形式に変換
    for (const date in shifts) {
        if (shifts.hasOwnProperty(date)) {
            const dateFormatted = date.replace(/-/g, ''); // 日付をICS形式に変換
            shifts[date].forEach((shift) => {
                const startTime = komaTimes[shift] || '09:00'; // シフトに基づいて開始時刻を取得
                const endTime = getEndTime(startTime); // 終了時刻を取得
                icsContent += `BEGIN:VEVENT\nSUMMARY:シフト - ${shift}\nDTSTART:${dateFormatted}T${startTime.replace(':', '')}00\nDTEND:${dateFormatted}T${endTime.replace(':', '')}00\nEND:VEVENT\n`;
            });
        }
    }

    icsContent += `END:VCALENDAR`; // ICSファイルのフッタ

    // ブラウザでファイルをダウンロード
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks.ics'; // ファイル名を指定
    a.click(); // ダウンロードをトリガー
    URL.revokeObjectURL(url); // 一時的なURLを解放
}
