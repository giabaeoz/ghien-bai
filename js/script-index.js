document.addEventListener('DOMContentLoaded', function() {
    // Lấy đối tượng nút cuộn và khu vực chứa danh sách game
    const btnScrollDown = document.getElementById('btnScrollDown');
    const gameListSection = document.getElementById('game-list');

    // Thêm sự kiện click cho nút "Xem trò chơi"
    if (btnScrollDown && gameListSection) {
        btnScrollDown.addEventListener('click', function() {
            // Cuộn mượt mà xuống Section 2 (game-list)
            gameListSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start' 
            });
        });
    }
});
