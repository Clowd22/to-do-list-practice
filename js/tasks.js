// tasks.js
// タスクの追加、表示、編集、削除などを管理するファイルです。

export function addTodo() {
    // タスクを追加する処理
    const todoInput = document.getElementById('todoInput');
    const newTodoText = todoInput.value.trim(); // タスク内容を取得
    let selectedDate = window.selectedDate; // グローバル変数から選択された日付を取得

    if (newTodoText !== '' && selectedDate) {
        // タスク内容と日付が有効であれば処理を行う
        const todos = JSON.parse(localStorage.getItem('todos')) || {}; // ローカルストレージからタスクを取得
        if (!todos[selectedDate]) {
            todos[selectedDate] = []; // 日付ごとのタスクリストが存在しない場合は新規作成
        }
        todos[selectedDate].push({ text: newTodoText, type: 'normal', shift: document.getElementById('shiftInput').value });
        localStorage.setItem('todos', JSON.stringify(todos)); // ローカルストレージに保存
        todoInput.value = ''; // 入力フィールドをクリア
        loadTodos(selectedDate); // タスクを再表示
    } else {
        console.log("タスクの追加に失敗しました。入力が空か、日付が選択されていません。");
    }
}

export function loadTodos(date) {
    // 指定された日付のタスクを表示する処理
    const todoList = document.getElementById('todoList');
    todoList.innerHTML = ''; // タスクリストをクリア

    const todos = JSON.parse(localStorage.getItem('todos')) || {}; // ローカルストレージから通常タスクを取得
    const fixedTasks = JSON.parse(localStorage.getItem('fixedTasks')) || {}; // ローカルストレージから固定タスクを取得

    const allTasks = (todos[date] || []).concat(fixedTasks[date] || []); // 通常タスクと固定タスクを結合
    allTasks.forEach((task, index) => {
        const newTodoItem = document.createElement('li');
        newTodoItem.textContent = task.text; // タスク内容を表示

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container'; // ボタンのコンテナを作成

        // 編集ボタンを作成
        const editButton = document.createElement('button');
        editButton.textContent = '編集';
        editButton.className = 'todo-button';
        editButton.onclick = () => editTodo(date, index); // 編集処理を設定

        // 完了ボタンを作成
        const completeButton = document.createElement('button');
        completeButton.textContent = '完了';
        completeButton.className = 'todo-button complete-button';
        completeButton.onclick = () => completeTask(date, index, task.type); // 完了処理を設定

        buttonContainer.appendChild(editButton);
        buttonContainer.appendChild(completeButton);
        newTodoItem.appendChild(buttonContainer);
        todoList.appendChild(newTodoItem); // タスクアイテムをリストに追加
    });
}
