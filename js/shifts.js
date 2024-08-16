// shifts.js
// シフトの追加、表示、編集、削除などを管理するファイルです。

export function addShift() {
    // シフトを追加する処理
    const shiftInput = document.getElementById('shiftInput');
    const selectedShift = shiftInput.value; // シフト内容を取得
    let selectedDate = window.selectedDate; // グローバル変数から選択された日付を取得

    if (selectedShift && selectedDate) {
        // シフト内容と日付が有効であれば処理を行う
        const shifts = JSON.parse(localStorage.getItem('shifts')) || {}; // ローカルストレージからシフトを取得
        if (!shifts[selectedDate]) {
            shifts[selectedDate] = []; // 日付ごとのシフトリストが存在しない場合は新規作成
        }
        shifts[selectedDate].push(selectedShift);
        localStorage.setItem('shifts', JSON.stringify(shifts)); // ローカルストレージに保存
        loadShift(selectedDate); // シフトを再表示
    } else {
        console.log("シフトの追加に失敗しました。日付が選択されていません。");
    }
}

export function loadShift(date) {
    // 指定された日付のシフトを表示する処理
    const shiftDisplay = document.getElementById('shiftDisplay');
    const shifts = JSON.parse(localStorage.getItem('shifts')) || {}; // ローカルストレージからシフトを取得

    const shiftList = document.createElement('ul');
    shiftList.style.listStyleType = 'none';
    shiftList.style.padding = '0';

    if (shifts.hasOwnProperty(date)) {
        // シフトが存在する場合
        shifts[date].forEach((shift, index) => {
            const shiftItem = document.createElement('li');
            shiftItem.textContent = `シフト: ${shift}`; // シフト内容を表示

            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'button-container'; // ボタンのコンテナを作成

            // 編集ボタンを作成
            const editShiftButton = document.createElement('button');
            editShiftButton.textContent = '編集';
            editShiftButton.className = 'todo-button';
            editShiftButton.onclick = () => editShift(date, index); // 編集処理を設定

            // 削除ボタンを作成
            const deleteShiftButton = document.createElement('button');
            deleteShiftButton.textContent = '削除';
            deleteShiftButton.className = 'todo-button delete-button';
            deleteShiftButton.onclick = () => deleteShift(date, index); // 削除処理を設定

            buttonContainer.appendChild(editShiftButton);
            buttonContainer.appendChild(deleteShiftButton);
            shiftItem.appendChild(buttonContainer);
            shiftList.appendChild(shiftItem); // シフトアイテムをリストに追加
        });

        shiftDisplay.innerHTML = ''; // シフト表示エリアをクリア
        shiftDisplay.appendChild(shiftList); // 新しいシフトリストを追加
    } else {
        shiftDisplay.textContent = "シフト情報: まだ追加されていません"; // シフトが存在しない場合のメッセージ
    }
}
