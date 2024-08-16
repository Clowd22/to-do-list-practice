// fixedTasks.js
// 固定タスクの追加、表示、編集、削除などを管理するファイルです。

export function addFixedTask() {
    // 固定タスクを追加する処理
    const startDateInput = document.getElementById('fixedTaskStartDate');
    const endDateInput = document.getElementById('fixedTaskEndDate');
    const fixedTaskInput = document.getElementById('fixedTaskInput');

    const startDate = new Date(startDateInput.value); // 開始日を取得
    const endDate = new Date(endDateInput.value); // 終了日を取得
    const taskText = fixedTaskInput.value.trim(); // タスク内容を取得

    if (startDate <= endDate && taskText !== '') {
        // 日付範囲とタスク内容が有効であれば処理を行う
        const fixedTasks = JSON.parse(localStorage.getItem('fixedTasks')) || {}; // ローカルストレージから固定タスクを取得

        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const dateStr = currentDate.toISOString().split('T')[0]; // 日付文字列に変換
            if (!fixedTasks[dateStr]) {
                fixedTasks[dateStr] = []; // 日付ごとのタスクリストが存在しない場合は新規作成
            }
            fixedTasks[dateStr].push({ text: taskText, type: 'fixed', shift: document.getElementById('shiftInput').value });
            currentDate.setDate(currentDate.getDate() + 1); // 次の日付に進む
        }

        localStorage.setItem('fixedTasks', JSON.stringify(fixedTasks)); // ローカルストレージに保存
        startDateInput.value = ''; // 入力フィールドをクリア
        endDateInput.value = '';
        fixedTaskInput.value = '';
        loadFixedTasks(); // 固定タスクを再表示
    } else {
        console.log("固定タスクの追加に失敗しました。日付範囲またはタスク内容が正しくありません。");
    }
}

export function loadFixedTasks() {
    // 固定タスクを表示する処理
    const fixedTasksList = document.getElementById('fixedTasksList');
    fixedTasksList.innerHTML = ''; // 固定タスクリストをクリア

    const fixedTasks = JSON.parse(localStorage.getItem('fixedTasks')) || {}; // ローカルストレージから固定タスクを取得

    const periodTasks = {}; // タスクを期間ごとに分類するためのオブジェクト

    for (const date in fixedTasks) {
        if (fixedTasks.hasOwnProperty(date)) {
            fixedTasks[date].forEach((fixedTask) => {
                if (!periodTasks[fixedTask.text]) {
                    periodTasks[fixedTask.text] = []; // タスク内容ごとに期間を管理
                }
                periodTasks[fixedTask.text].push(date); // タスクの日付を追加
            });
        }
    }

    for (const taskText in periodTasks) {
        // 各タスクの期間を表示
        const period = `[${periodTasks[taskText][0]}] - [${periodTasks[taskText][periodTasks[taskText].length - 1]}]`;
        const fixedTaskItem = document.createElement('li');
        fixedTaskItem.textContent = `${period} : ${taskText}`; // 期間とタスク内容を表示

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container'; // ボタンのコンテナを作成

        // 編集ボタンを作成
        const editButton = document.createElement('button');
        editButton.textContent = '編集';
        editButton.className = 'todo-button';
        editButton.onclick = () => editFixedTaskPeriod(taskText); // 編集処理を設定

        // 削除ボタンを作成
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '削除';
        deleteButton.className = 'todo-button delete-button';
        deleteButton.onclick = () => deleteFixedTaskPeriod(taskText); // 削除処理を設定

        buttonContainer.appendChild(editButton);
        buttonContainer.appendChild(deleteButton);
        fixedTaskItem.appendChild(buttonContainer);
        fixedTasksList.appendChild(fixedTaskItem); // 固定タスクアイテムをリストに追加
    }
}
