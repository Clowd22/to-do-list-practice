// calendar.js
// カレンダーの初期化と日付選択処理を管理するファイルです。

export function initCalendar(onDateChange) {
    // カレンダーの初期化処理
    flatpickr("#calendar", {
        inline: true, // カレンダーをインライン表示
        locale: "ja", // カレンダーを日本語ローカライズ
        dateFormat: "Y-m-d", // 日付フォーマットを指定
        onChange: function (selectedDates, dateStr) {
            // 日付が選択されたときに呼び出されるコールバック
            onDateChange(dateStr); // 選択された日付を外部に通知
        }
    });

    // 日付入力用のFlatpickrの初期化
    flatpickr(".flatpickr", {
        locale: "ja", // 日本語ローカライズ
        dateFormat: "Y-m-d" // 日付フォーマットを指定
    });
}
