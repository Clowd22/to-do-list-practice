document.addEventListener('DOMContentLoaded', () => {
    const closeButton = document.getElementById('closeDescription');
    const descriptionContainer = document.getElementById('descriptionContainer');
    const showDescriptionButton = document.getElementById('showDescription');

    // 説明文を閉じる処理
    closeButton.addEventListener('click', () => {
        descriptionContainer.style.display = 'none';
        showDescriptionButton.style.display = 'block'; // 「説明文を表示」ボタンを表示
    });

    // 説明文を再度表示する処理
    showDescriptionButton.addEventListener('click', () => {
        descriptionContainer.style.display = 'block';
        showDescriptionButton.style.display = 'none'; // 「説明文を表示」ボタンを非表示
    });
});
