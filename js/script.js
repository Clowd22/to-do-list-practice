document.addEventListener('DOMContentLoaded', () => {
    // ビューの管理 - それぞれのビュー要素を取得
    const calendarView = document.getElementById('calendarView');
    const fixedTasksView = document.getElementById('fixedTasksView');
    const completedTasksView = document.getElementById('completedTasksView');

    // 日付やシフト表示エリアを取得
    const selectedDateDisplay = document.getElementById('selectedDateDisplay');
    const shiftDisplay = document.getElementById('shiftDisplay');

    // ボタンの取得 - ユーザー操作に対応するボタン要素を取得
    const viewCalendarButton = document.getElementById('viewCalendar');
    const viewFixedTasksButton = document.getElementById('viewFixedTasks');
    const viewCompletedTasksButton = document.getElementById('viewCompletedTasks');
    
    const addTodoButton = document.getElementById('addTodoButton');
    const addShiftButton = document.getElementById('addShiftButton');
    const addFixedTaskButton = document.getElementById('addFixedTaskButton');
    
    const exportIcsButton = document.getElementById('exportIcsButton');

    // 現在選択されている日付の初期値をnullに設定
    let selectedDate = null;

    // コマごとの開始時刻を定義 - 各シフト（X, Y, A, B, C, D）の開始時刻を定義
    const komaTimes = {
        X: '09:00',
        Y: '10:35',
        A: '14:55',
        B: '16:30',
        C: '18:05',
        D: '19:40'
    };

    // ビューの切り替えイベント - カレンダー表示をクリックした時
    viewCalendarButton.addEventListener('click', () => {
        showView(calendarView);  // カレンダービューを表示
    });

    // 固定タスク表示をクリックした時
    viewFixedTasksButton.addEventListener('click', () => {
        showView(fixedTasksView);  // 固定タスクビューを表示
        loadFixedTasks();  // 固定タスク情報を読み込む
    });

    // 完了したタスク表示をクリックした時
    viewCompletedTasksButton.addEventListener('click', () => {
        showView(completedTasksView);  // 完了したタスクビューを表示
        loadCompletedTasks();  // 完了したタスク情報を読み込む
    });

    // タスクとシフトの追加ボタンに対するイベントリスナーを設定
    addTodoButton.addEventListener('click', addTodo);  // タスク追加ボタン
    addShiftButton.addEventListener('click', addShift);  // シフト追加ボタン
    addFixedTaskButton.addEventListener('click', addFixedTask);  // 固定タスク追加ボタン

    // ICSファイルエクスポートボタンに対するイベントリスナーを設定
    exportIcsButton.addEventListener('click', exportToIcs);  // ICSファイルエクスポートボタン

    // 初期表示としてカレンダービューを表示
    showView(calendarView);

    // Flatpickrの初期化 - カレンダーを表示し、日付が選択された時にイベントを発生させる
    flatpickr("#calendar", {
        inline: true,  // カレンダーを埋め込む（ポップアップではなく）
        locale: "ja",  // カレンダーの言語設定を日本語にする
        dateFormat: "Y-m-d",  // 日付のフォーマットを指定
        onChange: function (selectedDates, dateStr) {  // 日付が選択された時のイベント
            selectedDate = dateStr;  // 選択された日付を更新
            loadTodos(selectedDate);  // 選択された日付に対応するタスクを読み込む
            displaySelectedDate(dateStr);  // 選択された日付を表示
            loadShift(selectedDate);  // 選択された日付に対応するシフトを読み込む
        }
    });

    // 固定タスクの日付選択用Flatpickrの初期化
    flatpickr(".flatpickr", {
        locale: "ja",  // 言語設定を日本語にする
        dateFormat: "Y-m-d"  // 日付のフォーマットを指定
    });

    // ビューの表示を切り替える関数
    function showView(view) {
        // 全てのビューからactiveクラスを削除
        calendarView.classList.remove('active');
        fixedTasksView.classList.remove('active');
        completedTasksView.classList.remove('active');
        // 表示したいビューにactiveクラスを追加
        view.classList.add('active');
    }

    // タスクを追加する関数
    function addTodo() {
        const todoInput = document.getElementById('todoInput');  // タスク入力フィールドを取得
        const newTodoText = todoInput.value.trim();  // 入力されたタスク内容を取得し、前後の空白を削除
        if (newTodoText !== '' && selectedDate) {  // 入力内容が空でなく、日付が選択されている場合
            const todos = JSON.parse(localStorage.getItem('todos')) || {};  // ローカルストレージから既存のタスクを取得
            if (!todos[selectedDate]) {  // 選択された日付のタスクがまだない場合
                todos[selectedDate] = [];  // 新しい日付のタスクリストを作成
            }
            // 新しいタスクを追加（通常のタスクとして追加、シフトも設定）
            todos[selectedDate].push({ text: newTodoText, type: 'normal', shift: document.getElementById('shiftInput').value });
            localStorage.setItem('todos', JSON.stringify(todos));  // タスク情報をローカルストレージに保存
            todoInput.value = '';  // タスク入力フィールドをクリア
            loadTodos(selectedDate);  // タスクリストを更新
        } else {
            console.log("タスクの追加に失敗しました。入力が空か、日付が選択されていません。");
        }
    }

    // シフトを追加する関数
    function addShift() {
        const shiftInput = document.getElementById('shiftInput');  // シフト選択フィールドを取得
        const selectedShift = shiftInput.value;  // 選択されたシフトを取得
        if (selectedShift && selectedDate) {  // シフトが選択され、日付が選択されている場合
            const shifts = JSON.parse(localStorage.getItem('shifts')) || {};  // ローカルストレージから既存のシフト情報を取得
            if (!shifts[selectedDate]) {  // 選択された日付のシフト情報がまだない場合
                shifts[selectedDate] = [];  // 新しい日付のシフトリストを作成
            }
            shifts[selectedDate].push(selectedShift);  // シフトを追加
            localStorage.setItem('shifts', JSON.stringify(shifts));  // シフト情報をローカルストレージに保存
            loadShift(selectedDate);  // シフトリストを更新
        } else {
            console.log("シフトの追加に失敗しました。日付が選択されていません。");
        }
    }

    // 指定された日付のシフトを読み込む関数
    function loadShift(date) {
        const shifts = JSON.parse(localStorage.getItem('shifts')) || {};  // ローカルストレージからシフト情報を取得
        const shiftList = document.createElement('ul');  // シフトリストのul要素を作成
        shiftList.style.listStyleType = 'none';  // リストスタイルを解除
        shiftList.style.padding = '0';  // パディングを削除

        if (shifts.hasOwnProperty(date)) {  // 選択された日付にシフト情報がある場合
            shifts[date].forEach((shift, index) => {  // 各シフトをリストアイテムとして追加
                const shiftItem = document.createElement('li');  // li要素を作成
                shiftItem.textContent = `シフト: ${shift}`;  // シフト内容を表示
                shiftItem.style.display = 'flex';  // フレックスボックスでレイアウト
                shiftItem.style.justifyContent = 'space-between';  // 両端に配置
                shiftItem.style.alignItems = 'center';  // 中央揃え
                shiftItem.style.marginBottom = '10px';  // 下部にマージンを追加

                const editShiftButton = document.createElement('button');  // 編集ボタンを作成
                editShiftButton.textContent = '編集';  // ボタンテキストを設定
                editShiftButton.className = 'todo-button';  // ボタンクラスを設定
                editShiftButton.onclick = () => editShift(date, index);  // 編集ボタンがクリックされた時のイベントを設定

                const deleteShiftButton = document.createElement('button');  // 削除ボタンを作成
                deleteShiftButton.textContent = '削除';  // ボタンテキストを設定
                deleteShiftButton.className = 'todo-button delete-button';  // 削除ボタンクラスを設定
                deleteShiftButton.onclick = () => deleteShift(date, index);  // 削除ボタンがクリックされた時のイベントを設定

                const buttonContainer = document.createElement('div');  // ボタンをまとめるコンテナを作成
                buttonContainer.className = 'button-container';  // コンテナのクラスを設定
                buttonContainer.appendChild(editShiftButton);  // 編集ボタンをコンテナに追加
                buttonContainer.appendChild(deleteShiftButton);  // 削除ボタンをコンテナに追加

                shiftItem.appendChild(buttonContainer);  // シフトアイテムにボタンコンテナを追加
                shiftList.appendChild(shiftItem);  // シフトリストにシフトアイテムを追加
            });

            shiftDisplay.innerHTML = '';  // シフト表示エリアをクリア
            shiftDisplay.appendChild(shiftList);  // シフトリストを表示エリアに追加
        } else {
            shiftDisplay.textContent = "シフト情報: まだ追加されていません";  // シフトがない場合のメッセージを表示
        }
    }

    // 固定タスクを追加する関数
    function addFixedTask() {
        const startDateInput = document.getElementById('fixedTaskStartDate');  // 固定タスクの開始日入力フィールドを取得
        const endDateInput = document.getElementById('fixedTaskEndDate');  // 固定タスクの終了日入力フィールドを取得
        const fixedTaskInput = document.getElementById('fixedTaskInput');  // 固定タスクの内容入力フィールドを取得

        const startDate = new Date(startDateInput.value);  // 入力された開始日をDateオブジェクトに変換
        const endDate = new Date(endDateInput.value);  // 入力された終了日をDateオブジェクトに変換
        const taskText = fixedTaskInput.value.trim();  // 入力されたタスク内容を取得し、前後の空白を削除

        if (startDate <= endDate && taskText !== '') {  // 開始日が終了日以前であり、タスク内容が空でない場合
            const fixedTasks = JSON.parse(localStorage.getItem('fixedTasks')) || {};  // ローカルストレージから固定タスク情報を取得

            let currentDate = new Date(startDate);  // 現在の日付を開始日に設定
            while (currentDate <= endDate) {  // 現在の日付が終了日まで繰り返し
                const dateStr = currentDate.toISOString().split('T')[0];  // 現在の日付を文字列に変換（YYYY-MM-DD形式）
                if (!fixedTasks[dateStr]) {  // 現在の日付に固定タスクがない場合
                    fixedTasks[dateStr] = [];  // 新しい日付の固定タスクリストを作成
                }
                // 固定タスクを追加
                fixedTasks[dateStr].push({ text: taskText, type: 'fixed', shift: document.getElementById('shiftInput').value });
                currentDate.setDate(currentDate.getDate() + 1);  // 現在の日付を1日進める
            }

            localStorage.setItem('fixedTasks', JSON.stringify(fixedTasks));  // 固定タスク情報をローカルストレージに保存
            startDateInput.value = '';  // 開始日入力フィールドをクリア
            endDateInput.value = '';  // 終了日入力フィールドをクリア
            fixedTaskInput.value = '';  // タスク内容入力フィールドをクリア
            loadFixedTasks();  // 固定タスクリストを更新
        } else {
            console.log("固定タスクの追加に失敗しました。日付範囲またはタスク内容が正しくありません。");
        }
    }

    // 指定された日付のタスクを読み込む関数
    function loadTodos(date) {
        const todoList = document.getElementById('todoList');  // タスクリストのul要素を取得
        todoList.innerHTML = '';  // タスクリストをクリア
        const todos = JSON.parse(localStorage.getItem('todos')) || {};  // ローカルストレージから通常タスクを取得
        const fixedTasks = JSON.parse(localStorage.getItem('fixedTasks')) || {};  // ローカルストレージから固定タスクを取得

        // 通常タスクと固定タスクをまとめて表示
        const allTasks = (todos[date] || []).concat(fixedTasks[date] || []);  // 選択された日付に対応するタスクを結合
        allTasks.forEach((task, index) => {  // 各タスクをリストアイテムとして表示
            const newTodoItem = document.createElement('li');  // li要素を作成
            newTodoItem.textContent = task.text;  // タスク内容を表示

            const buttonContainer = document.createElement('div');  // ボタンをまとめるコンテナを作成
            buttonContainer.className = 'button-container';  // コンテナのクラスを設定

            const editButton = document.createElement('button');  // 編集ボタンを作成
            editButton.textContent = '編集';  // ボタンテキストを設定
            editButton.className = 'todo-button';  // ボタンクラスを設定
            editButton.onclick = () => {  // 編集ボタンがクリックされた時のイベントを設定
                if (task.type === 'normal') {  // 通常タスクの場合
                    editTodo(date, index);  // 通常タスクを編集
                } else {  // 固定タスクの場合
                    editFixedTask(date, index);  // 固定タスクを編集
                }
            };

            const completeButton = document.createElement('button');  // 完了ボタンを作成
            completeButton.textContent = '完了';  // ボタンテキストを設定
            completeButton.className = 'todo-button complete-button';  // 完了ボタンクラスを設定
            completeButton.onclick = () => completeTask(date, index, task.type);  // 完了ボタンがクリックされた時のイベントを設定

            buttonContainer.appendChild(editButton);  // 編集ボタンをコンテナに追加
            buttonContainer.appendChild(completeButton);  // 完了ボタンをコンテナに追加

            newTodoItem.appendChild(buttonContainer);  // タスクアイテムにボタンコンテナを追加
            todoList.appendChild(newTodoItem);  // タスクリストにタスクアイテムを追加
        });
    }

    // 固定タスク情報を読み込む関数
    function loadFixedTasks() {
        const fixedTasksList = document.getElementById('fixedTasksList');  // 固定タスクリストのul要素を取得
        fixedTasksList.innerHTML = '';  // 固定タスクリストをクリア
        const fixedTasks = JSON.parse(localStorage.getItem('fixedTasks')) || {};  // ローカルストレージから固定タスク情報を取得

        // 固定タスク情報を期間別に表示
        const periodTasks = {};  // 固定タスクを期間ごとにまとめるためのオブジェクト

        for (const date in fixedTasks) {  // 各日付ごとの固定タスクを処理
            if (fixedTasks.hasOwnProperty(date)) {  // 固定タスクが存在する場合
                fixedTasks[date].forEach((fixedTask, index) => {  // 各固定タスクを処理
                    if (!periodTasks[fixedTask.text]) {  // このタスクテキストがまだperiodTasksにない場合
                        periodTasks[fixedTask.text] = [];  // 新しいタスクテキストのリストを作成
                    }
                    periodTasks[fixedTask.text].push(date);  // タスクテキストに対応する日付を追加
                });
            }
        }

        for (const taskText in periodTasks) {  // periodTasks内の各タスクテキストを処理
            const period = `[${periodTasks[taskText][0]}] - [${periodTasks[taskText][periodTasks[taskText].length - 1]}]`;  // タスクの期間を表示
            const fixedTaskItem = document.createElement('li');  // li要素を作成
            fixedTaskItem.textContent = `${period} : ${taskText}`;  // タスクの期間と内容を表示

            const buttonContainer = document.createElement('div');  // ボタンをまとめるコンテナを作成
            buttonContainer.className = 'button-container';  // コンテナのクラスを設定

            const editButton = document.createElement('button');  // 編集ボタンを作成
            editButton.textContent = '編集';  // ボタンテキストを設定
            editButton.className = 'todo-button';  // ボタンクラスを設定
            editButton.onclick = () => editFixedTaskPeriod(taskText);  // 編集ボタンがクリックされた時のイベントを設定

            const deleteButton = document.createElement('button');  // 削除ボタンを作成
            deleteButton.textContent = '削除';  // ボタンテキストを設定
            deleteButton.className = 'todo-button delete-button';  // 削除ボタンクラスを設定
            deleteButton.onclick = () => deleteFixedTaskPeriod(taskText);  // 削除ボタンがクリックされた時のイベントを設定

            buttonContainer.appendChild(editButton);  // 編集ボタンをコンテナに追加
            buttonContainer.appendChild(deleteButton);  // 削除ボタンをコンテナに追加
            fixedTaskItem.appendChild(buttonContainer);  // 固定タスクアイテムにボタンコンテナを追加
            fixedTasksList.appendChild(fixedTaskItem);  // 固定タスクリストに固定タスクアイテムを追加
        }
    }

    // 完了したタスクを読み込む関数
    function loadCompletedTasks() {
        const completedTasksList = document.getElementById('completedTasksList');  // 完了したタスクリストのul要素を取得
        completedTasksList.innerHTML = '';  // 完了したタスクリストをクリア
        const completedTasks = JSON.parse(localStorage.getItem('completedTasks')) || {};  // ローカルストレージから完了したタスク情報を取得

        for (const date in completedTasks) {  // 各日付ごとの完了したタスクを処理
            if (completedTasks.hasOwnProperty(date)) {  // 完了したタスクが存在する場合
                const taskGroup = document.createElement('div');  // タスクグループを作成
                const dateHeader = document.createElement('h3');  // 日付見出しを作成
                dateHeader.textContent = `${date} (${completedTasks[date].length}件)`;  // 日付と件数を表示
                taskGroup.appendChild(dateHeader);  // タスクグループに日付見出しを追加

                completedTasks[date].forEach((task, index) => {  // 各完了したタスクを処理
                    const completedTaskItem = document.createElement('li');  // li要素を作成
                    completedTaskItem.textContent = task.text;  // タスク内容を表示

                    const deleteButton = document.createElement('button');  // 削除ボタンを作成
                    deleteButton.textContent = '削除';  // ボタンテキストを設定
                    deleteButton.className = 'todo-button delete-button';  // 削除ボタンクラスを設定
                    deleteButton.onclick = () => deleteCompletedTask(date, index);  // 削除ボタンがクリックされた時のイベントを設定

                    completedTaskItem.appendChild(deleteButton);  // 完了したタスクアイテムに削除ボタンを追加
                    taskGroup.appendChild(completedTaskItem);  // タスクグループに完了したタスクアイテムを追加
                });

                completedTasksList.appendChild(taskGroup);  // 完了したタスクリストにタスクグループを追加
            }
        }
    }

    // タスクを完了する関数
    function completeTask(date, index, taskType) {
        const todos = JSON.parse(localStorage.getItem('todos')) || {};  // ローカルストレージから通常タスクを取得
        const fixedTasks = JSON.parse(localStorage.getItem('fixedTasks')) || {};  // ローカルストレージから固定タスクを取得
        const completedTasks = JSON.parse(localStorage.getItem('completedTasks')) || {};  // ローカルストレージから完了したタスク情報を取得

        // 完了したタスクをcompletedTasksに追加
        const task = taskType === 'normal' ? todos[date][index] : fixedTasks[date][index];  // 通常タスクか固定タスクかで取得するタスクを選択
        if (!completedTasks[date]) {  // 選択された日付に完了したタスクがない場合
            completedTasks[date] = [];  // 新しい日付の完了タスクリストを作成
        }
        completedTasks[date].push(task);  // 完了タスクを追加
        localStorage.setItem('completedTasks', JSON.stringify(completedTasks));  // 完了タスク情報をローカルストレージに保存

        // 完了したタスクを元のリストから削除
        if (taskType === 'normal') {  // 通常タスクの場合
            todos[date].splice(index, 1);  // 通常タスクリストから削除
            if (todos[date].length === 0) {  // 日付に対応するタスクがなくなった場合
                delete todos[date];  // 日付ごと削除
            }
            saveTodos(todos);  // 通常タスクリストを保存
        } else {  // 固定タスクの場合
            fixedTasks[date].splice(index, 1);  // 固定タスクリストから削除
            if (fixedTasks[date].length === 0) {  // 日付に対応する固定タスクがなくなった場合
                delete fixedTasks[date];  // 日付ごと削除
            }
            saveFixedTasks(fixedTasks);  // 固定タスクリストを保存
        }

        loadTodos(date);  // タスクリストを更新
    }

    // 完了したタスクを削除する関数
    function deleteCompletedTask(date, index) {
        const completedTasks = JSON.parse(localStorage.getItem('completedTasks')) || {};  // ローカルストレージから完了したタスク情報を取得
        completedTasks[date].splice(index, 1);  // 完了タスクリストから削除
        if (completedTasks[date].length === 0) {  // 日付に対応する完了タスクがなくなった場合
            delete completedTasks[date];  // 日付ごと削除
        }
        localStorage.setItem('completedTasks', JSON.stringify(completedTasks));  // 完了タスクリストを保存
        loadCompletedTasks();  // 完了タスクリストを更新
    }

    // 固定タスクを編集する関数
    function editFixedTask(date, index) {
        const fixedTasks = JSON.parse(localStorage.getItem('fixedTasks')) || {};  // ローカルストレージから固定タスク情報を取得
        const currentTask = fixedTasks[date][index].text;  // 現在のタスク内容を取得
        const newTask = prompt("固定タスクを編集:", currentTask);  // ユーザーに新しいタスク内容を入力させる
        if (newTask !== null && newTask.trim() !== '') {  // 新しいタスク内容が空でない場合
            fixedTasks[date][index].text = newTask.trim();  // タスク内容を更新
            saveFixedTasks(fixedTasks);  // 固定タスクリストを保存
            loadTodos(date);  // タスクリストを更新
        }
    }

    // 固定タスクの期間とタスクのテキストを編集する関数
    function editFixedTaskPeriod(taskText) {
        const newStartDate = prompt("新しい開始日を入力してください (YYYY-MM-DD):");  // ユーザーに新しい開始日を入力させる
        const newEndDate = prompt("新しい終了日を入力してください (YYYY-MM-DD):");  // ユーザーに新しい終了日を入力させる

        // タスクの新しいテキストを入力
        const newTaskText = prompt("タスク内容を編集:", taskText);  // ユーザーに新しいタスク内容を入力させる

        if (newStartDate && newEndDate && newTaskText) {  // 入力内容が全て有効な場合
            const fixedTasks = JSON.parse(localStorage.getItem('fixedTasks')) || {};  // ローカルストレージから固定タスク情報を取得

            // 現在のタスクのすべての日付を削除
            for (const date in fixedTasks) {  // 各日付ごとの固定タスクを処理
                fixedTasks[date] = fixedTasks[date].filter(task => task.text !== taskText);  // 現在のタスクテキストを削除
                if (fixedTasks[date].length === 0) {  // 日付に対応するタスクがなくなった場合
                    delete fixedTasks[date];  // 日付ごと削除
                }
            }

            // 新しい期間で固定タスクを再作成
            let currentDate = new Date(newStartDate);  // 現在の日付を新しい開始日に設定
            const endDate = new Date(newEndDate);  // 終了日を設定
            while (currentDate <= endDate) {  // 現在の日付が終了日まで繰り返し
                const dateStr = currentDate.toISOString().split('T')[0];  // 現在の日付を文字列に変換（YYYY-MM-DD形式）
                if (!fixedTasks[dateStr]) {  // 現在の日付に固定タスクがない場合
                    fixedTasks[dateStr] = [];  // 新しい日付の固定タスクリストを作成
                }
                fixedTasks[dateStr].push({ text: newTaskText.trim(), type: 'fixed', shift: document.getElementById('shiftInput').value });  // 新しい固定タスクを追加
                currentDate.setDate(currentDate.getDate() + 1);  // 現在の日付を1日進める
            }

            saveFixedTasks(fixedTasks);  // 固定タスクリストを保存
            loadFixedTasks();  // 固定タスクリストを更新
            loadTodos(selectedDate);  // タスクリストを更新
        }
    }

    // 固定タスクの期間を削除する関数
    function deleteFixedTaskPeriod(taskText) {
        const fixedTasks = JSON.parse(localStorage.getItem('fixedTasks')) || {};  // ローカルストレージから固定タスク情報を取得

        // 現在のタスクのすべての日付を削除
        for (const date in fixedTasks) {  // 各日付ごとの固定タスクを処理
            fixedTasks[date] = fixedTasks[date].filter(task => task.text !== taskText);  // 現在のタスクテキストを削除
            if (fixedTasks[date].length === 0) {  // 日付に対応するタスクがなくなった場合
                delete fixedTasks[date];  // 日付ごと削除
            }
        }

        saveFixedTasks(fixedTasks);  // 固定タスクリストを保存
        loadFixedTasks();  // 固定タスクリストを更新
        loadTodos(selectedDate);  // タスクリストを更新
    }

    // シフトを編集する関数
    function editShift(date, index) {
        const shifts = JSON.parse(localStorage.getItem('shifts')) || {};  // ローカルストレージからシフト情報を取得
        const currentShift = shifts[date][index];  // 現在のシフト内容を取得
        const newShift = prompt("シフトを編集:", currentShift);  // ユーザーに新しいシフト内容を入力させる
        if (newShift !== null && newShift.trim() !== '') {  // 新しいシフト内容が空でない場合
            shifts[date][index] = newShift.trim();  // シフト内容を更新
            localStorage.setItem('shifts', JSON.stringify(shifts));  // シフト情報をローカルストレージに保存
            loadShift(date);  // シフトリストを更新
        }
    }

    // シフトを削除する関数
    function deleteShift(date, index) {
        const shifts = JSON.parse(localStorage.getItem('shifts')) || {};  // ローカルストレージからシフト情報を取得
        shifts[date].splice(index, 1);  // シフトリストから削除
        if (shifts[date].length === 0) {  // 日付に対応するシフトがなくなった場合
            delete shifts[date];  // 日付ごと削除
        }
        localStorage.setItem('shifts', JSON.stringify(shifts));  // シフト情報をローカルストレージに保存
        loadShift(date);  // シフトリストを更新
    }

    // 選択された日付を表示する関数
    function displaySelectedDate(dateStr) {
        selectedDateDisplay.textContent = `選択された日付: ${dateStr}`;  // 選択された日付を表示
    }

    // タスクを保存する関数
    function saveTodos(todos) {
        localStorage.setItem('todos', JSON.stringify(todos));  // 通常タスク情報をローカルストレージに保存
    }

    // 固定タスクを保存する関数
    function saveFixedTasks(fixedTasks) {
        localStorage.setItem('fixedTasks', JSON.stringify(fixedTasks));  // 固定タスク情報をローカルストレージに保存
    }

    // ICSファイルをエクスポートする関数
    function exportToIcs() {
        const todos = JSON.parse(localStorage.getItem('todos')) || {};  // ローカルストレージから通常タスクを取得
        const fixedTasks = JSON.parse(localStorage.getItem('fixedTasks')) || {};  // ローカルストレージから固定タスクを取得
        const shifts = JSON.parse(localStorage.getItem('shifts')) || {};  // ローカルストレージからシフト情報を取得
        let icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nCALSCALE:GREGORIAN\n`;  // ICSファイルのヘッダ情報

        // 全ての日付のタスクを処理
        for (const date in todos) {  // 各日付ごとの通常タスクを処理
            if (todos.hasOwnProperty(date)) {  // タスクが存在する場合
                const dateFormatted = date.replace(/-/g, '');  // 日付をYYYYMMDD形式に変換
                todos[date].forEach((task, index) => {  // 各タスクを処理
                    const startTime = komaTimes[task.shift] || '09:00';  // シフトに基づいて開始時刻を取得
                    const endTime = getEndTime(startTime);  // 終了時刻を取得
                    icsContent += `BEGIN:VEVENT\nSUMMARY:${task.text}\nDTSTART:${dateFormatted}T${startTime.replace(':', '')}00\nDTEND:${dateFormatted}T${endTime.replace(':', '')}00\nEND:VEVENT\n`;  // イベント情報を追加
                });
            }
        }

        // 固定タスクを処理
        for (const date in fixedTasks) {  // 各日付ごとの固定タスクを処理
            if (fixedTasks.hasOwnProperty(date)) {  // タスクが存在する場合
                const dateFormatted = date.replace(/-/g, '');  // 日付をYYYYMMDD形式に変換
                fixedTasks[date].forEach((task, index) => {  // 各タスクを処理
                    const startTime = komaTimes[task.shift] || '09:00';  // シフトに基づいて開始時刻を取得
                    const endTime = getEndTime(startTime);  // 終了時刻を取得
                    icsContent += `BEGIN:VEVENT\nSUMMARY:${task.text}\nDTSTART:${dateFormatted}T${startTime.replace(':', '')}00\nDTEND:${dateFormatted}T${endTime.replace(':', '')}00\nEND:VEVENT\n`;  // イベント情報を追加
                });
            }
        }

        // シフトを処理
        for (const date in shifts) {  // 各日付ごとのシフト情報を処理
            if (shifts.hasOwnProperty(date)) {  // シフトが存在する場合
                const dateFormatted = date.replace(/-/g, '');  // 日付をYYYYMMDD形式に変換
                shifts[date].forEach((shift, index) => {  // 各シフトを処理
                    const startTime = komaTimes[shift] || '09:00';  // シフトに基づいて開始時刻を取得
                    const endTime = getEndTime(startTime);  // 終了時刻を取得
                    icsContent += `BEGIN:VEVENT\nSUMMARY:シフト - ${shift}\nDTSTART:${dateFormatted}T${startTime.replace(':', '')}00\nDTEND:${dateFormatted}T${endTime.replace(':', '')}00\nEND:VEVENT\n`;  // イベント情報を追加
                });
            }
        }

        icsContent += `END:VCALENDAR`;  // ICSファイルのフッタ情報
        const blob = new Blob([icsContent], { type: 'text/calendar' });  // ICSファイルの内容をBlobとして作成
        const url = URL.createObjectURL(blob);  // BlobのURLを作成
        const a = document.createElement('a');  // リンク要素を作成
        a.href = url;  // リンクのURLを設定
        a.download = 'tasks.ics';  // ダウンロードファイル名を設定
        a.click();  // リンクをクリックしてファイルをダウンロード
        URL.revokeObjectURL(url);  // 一時的なURLを解放
    }

    // シフトの終了時刻を取得する関数
    function getEndTime(startTime) {
        const [hour, minute] = startTime.split(':').map(Number);  // 開始時刻を時と分に分解
        const endHour = hour + 1;  // シフトは90分続くため1時間後
        const endMinute = minute + 30;  // 30分後
        if (endMinute >= 60) {  // 分が60以上になった場合
            return `${String(endHour + 1).padStart(2, '0')}:${String(endMinute - 60).padStart(2, '0')}`;  // 時を1時間増やし、分を60引く
        }
        return `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;  // 正常な終了時刻を返す
    }
});
