// utils.js
// 共通のユーティリティ関数を管理するファイルです。

export function showView(view) {
    // ビューを切り替える関数
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active')); // すべてのビューからアクティブクラスを削除
    view.classList.add('active'); // 指定されたビューにアクティブクラスを追加
}

export function getEndTime(startTime) {
    // シフトの終了時刻を取得する関数
    const [hour, minute] = startTime.split(':').map(Number); // 開始時刻を分解
    const endHour = hour + 1; // シフトは90分続くので1時間加算
    const endMinute = minute + 30; // 30分加算

    // 終了時刻を計算し、フォーマット
    if (endMinute >= 60) {
        return `${String(endHour + 1).padStart(2, '0')}:${String(endMinute - 60).padStart(2, '0')}`;
    }
    return `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
}
