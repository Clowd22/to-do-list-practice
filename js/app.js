// app.js
// アプリケーションのメイン制御を行うファイルです。イベントリスナーの設定や初期化処理を担当します。

import { showView } from './utils.js'; // ビュー切り替えのための共通関数をインポート
import { loadTodos, addTodo } from './tasks.js'; // タスク関連の関数をインポート
import { addShift, loadShift } from './shifts.js'; // シフト関連の関数をインポート
import { addFixedTask, loadFixedTasks } from './fixedTasks.js'; // 固定タスク関連の関数をインポート
import { exportToIcs } from './icsExport.js'; // ICSファイルエクスポート機能をインポート
import { initCalendar } from './calendar.js'; // カレンダーの初期化関数をインポート

document.addEventListener('DOMContentLoaded', () => {
    // DOMが完全に読み込まれた後に実行される初期化処理

    // ビューのDOM要素を取得
    const calendarView = document.getElementById('calendarView');
    const fixedTasksView = document.getElementById('fixedTasksView');
    const completedTasksView = document.getElementById('completedTasksView');

    // その他の必要なDOM要素を取得
    const selectedDateDisplay = document.getElementById('selectedDateDisplay');
    const shiftDisplay = document.getElementById('shiftDisplay');

    // ボタンのDOM要素を取得
    const viewCalendarButton = document.getElementById('viewCalendar');
    const viewFixedTasksButton = document.getElementById('viewFixedTasks');
    const viewCompletedTasksButton = document.getElementById('viewCompletedTasks');
    const addTodoButton = document.getElementById('addTodoButton');
    const addShiftButton = document.getElementById('addShiftButton');
    const addFixedTaskButton = document.getElementById('addFixedTaskButton');
    const exportIcsButton = document.getElementById('exportIcsButton');

    let selectedDate = null; // 選択された日付を管理するための変数

    // カレンダー表示ボタンのクリックイベントを設定
    viewCalendarButton.addEventListener('click', () => {
        showView(calendarView); // カレンダー画面を表示
    });

    // 固定タスク表示ボタンのクリックイベントを設定
    viewFixedTasksButton.addEventListener('click', () => {
        showView(fixedTasksView); // 固定タスク画面を表示
        loadFixedTasks(); // 固定タスクを読み込む
    });

    // 完了したタスク表示ボタンのクリックイベントを設定
    viewCompletedTasksButton.addEventListener('click', () => {
        showView(completedTasksView); // 完了したタスク画面を表示
        loadCompletedTasks(); // 完了したタスクを読み込む（tasks.js内の関数を呼び出す）
    });

    // タスク追加ボタンのクリックイベントを設定
    addTodoButton.addEventListener('click', addTodo); // タスクを追加

    // シフト追加ボタンのクリックイベントを設定
    addShiftButton.addEventListener('click', addShift); // シフトを追加

    // 固定タスク追加ボタンのクリックイベントを設定
    addFixedTaskButton.addEventListener('click', addFixedTask); // 固定タスクを追加

    // ICSファイルエクスポートボタンのクリックイベントを設定
    exportIcsButton.addEventListener('click', exportToIcs); // ICSファイルをエクスポート

    // 初期表示としてカレンダー画面を表示
    showView(calendarView);

    // カレンダーの初期化処理
    initCalendar((dateStr) => {
        // 日付が選択された時のコールバック
        selectedDate = dateStr; // 選択された日付を更新
        loadTodos(selectedDate); // 選択された日付のタスクを読み込む
        selectedDateDisplay.textContent = `選択された日付: ${selectedDate}`; // 選択された日付を表示
        loadShift(selectedDate); // 選択された日付のシフトを読み込む
    });
});
