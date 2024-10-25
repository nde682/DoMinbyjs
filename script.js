const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let ROWS = 10;
let COLS = 10;
let MINES_COUNT = 12;
const CELL_SIZE = 30;
// Tải ảnh bomb trước khi sử dụng
const bombImage = new Image();
bombImage.src = 'bomb.png';  // Đảm bảo đường dẫn đúng tới ảnh bomb
const flagImage = new Image();
flagImage.src = 'flag.png';  // Đảm bảo đường dẫn đúng tới ảnh flag

// Xử lý sự kiện thay đổi độ khó
document.getElementById('difficulty').addEventListener('change', function() {
    const difficulty = this.value;
    if (difficulty === 'easy') {
        ROWS = 10;
        COLS = 10;
        MINES_COUNT = 12;
    } else if (difficulty === 'medium') {
        ROWS = 16;
        COLS = 16;
        MINES_COUNT = 40;
    } else if (difficulty === 'hard') {
        ROWS = 24;
        COLS = 24;
        MINES_COUNT = 99;
    } else if (difficulty === 'asian') {
        ROWS = 10;
        COLS = 10;
        MINES_COUNT = 90;
    }
    canvas.width = COLS * CELL_SIZE;
    canvas.height = ROWS * CELL_SIZE;
    resetGame();
});

canvas.width = COLS * CELL_SIZE;
canvas.height = ROWS * CELL_SIZE;

let board = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
let revealed = Array(ROWS).fill(null).map(() => Array(COLS).fill(false));
let isFlag = Array(ROWS).fill(null).map(() => Array(COLS).fill(false));
let mines = [];
let firstClick = true; // Theo dõi lần nhấn đầu tiên

// Đặt mìn ngẫu nhiên
function placeMines() {
    let count = 0;
    while (count < MINES_COUNT) {
        let row = Math.floor(Math.random() * ROWS);
        let col = Math.floor(Math.random() * COLS);
        if (board[row][col] !== 'M') {
            board[row][col] = 'M';
            mines.push([row, col]);
            count++;
        }
    }
}

// Tính số mìn xung quanh
function calculateNumbers() {
    for (let [row, col] of mines) {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                let newRow = row + i;
                let newCol = col + j;
                if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS && board[newRow][newCol] !== 'M') {
                    board[newRow][newCol]++;
                }
            }
        }
    }
}

// Vẽ bảng mìn
function drawBoard() {
    // Xóa tất cả các icon trước khi vẽ lại bảng
    document.querySelectorAll('i').forEach(icon => icon.remove());

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            let x = col * CELL_SIZE;
            let y = row * CELL_SIZE;
            if((row + col) % 2 === 0) {
                ctx.fillStyle = '#4de06d';
                ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
            }else{
                ctx.fillStyle = 'lightgreen';
                ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);               
            }


            
            ctx.strokeStyle = '#333';
            ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);

            if (revealed[row][col]) {
                ctx.fillStyle = '#ddd';
                ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
                ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
                
                let cellValue = board[row][col];
                if (cellValue === 'M') {
                    // Nếu là mìn, vẽ hình ảnh bomb
                    ctx.drawImage(bombImage, x, y, CELL_SIZE, CELL_SIZE);
                }

                else if (cellValue !== 0) {
                    ctx.fillStyle = 'black';
                    ctx.font = '20px Arial';
                    ctx.fillText(cellValue, x + CELL_SIZE / 2 - 5, y + CELL_SIZE / 2 + 5);
                }
            }
        }
    }
}
// Hiệu ứng khi click vào ô
function animateTearCell(row, col) {
    let x = col * CELL_SIZE;
    let y = row * CELL_SIZE;

    let tearProgress = 0;  // Mức độ xé
    const tearSpeed = 10;  // Tốc độ xé

    function tearStep() {
        if (tearProgress <= CELL_SIZE) {
            if((row + col) % 2 === 0) {  // Đặt màu nền tùy thuộc vào ô
                ctx.fillStyle = '#4de06d';
                ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
                ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
            }else{
                ctx.fillStyle = 'lightgreen';
                ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
                ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
            }

            ctx.fillStyle = '#ddd';
            ctx.fillRect(x, y, tearProgress, CELL_SIZE); // Xé từ trái sang phải
            ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);

            tearProgress += tearSpeed;

            requestAnimationFrame(tearStep);
        } else {
            let cellValue = board[row][col];
            if (cellValue > 0) {
                // Chọn màu sắc cho từng giá trị
                let color = '#000';  // Màu mặc định là đen
                switch (cellValue) {
                    case 1:
                        color = 'darkblue';   // Màu xanh dương đậm
                        break;
                    case 2:
                        color = 'green';      // Màu xanh lá
                        break;
                    case 3:
                        color = 'red';        // Màu đỏ
                        break;
                    case 4:
                        color = 'purple';     // Màu tím
                        break;
                    case 5:
                        color = 'orange';     // Màu cam
                        break;
                    case 6:
                        color = 'lightblue';  // Màu dương xanh nhạt
                        break;
                    case 7:
                        color = 'brown';      // Màu nâu
                        break;
                    case 8:
                        color = 'pink';       // Màu hồng
                        break;
                }

                ctx.fillStyle = color;
                ctx.font = `bold ${CELL_SIZE / 2}px Arial`;  // Kích thước font chữ tùy thuộc vào kích thước ô
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(cellValue, x + CELL_SIZE / 2, y + CELL_SIZE / 2);
            }
            revealed[row][col] = true;
        }
    }

    tearStep();
}

// Xử lý sự kiện click
canvas.addEventListener('click', handleClick);

function handleClick(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const col = Math.floor(x / CELL_SIZE);
    const row = Math.floor(y / CELL_SIZE);

    // Kiểm tra nếu ô đã cắm cờ thì không làm gì cả
    if (isFlag[row][col]) {
        return;  // Nếu ô đã cắm cờ, không cho mở ô
    }

    if (firstClick) {
        firstClick = false;

        // Đảm bảo ô đầu tiên không chứa mìn và không hiển thị số
        if (board[row][col] !== 0) {
            regenerateBoard(row, col);  // Tạo lại bảng sao cho ô đầu tiên là trống hoàn toàn
        }

        // Mở ô đầu tiên mà không hiện số
        animateTearCell(row, col);
        revealCell(row, col, false);  // Mở ô đầu tiên mà không hiện số
    } else {
        if (!revealed[row][col]) {
            if (board[row][col] === 'M') {
                endGame(false);  // Nếu là mìn thì kết thúc game
            } else {
                animateTearCell(row, col);
                revealCell(row, col);
                checkWin();  // Kiểm tra chiến thắng sau khi mở ô
            }
        }
    }
}
// Cắm cờ khi nhấn chuột phải
canvas.addEventListener('contextmenu', handleRightClick);

function handleRightClick(event) {
    event.preventDefault();  // Ngăn menu chuột phải xuất hiện

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const col = Math.floor(x / CELL_SIZE);
    const row = Math.floor(y / CELL_SIZE);

    // Nếu ô đã được mở thì không làm gì
    if (revealed[row][col]) return;

    // Đặt hoặc gỡ cờ
    if (isFlag[row][col] !== true) {
        placeFlag(row, col);  // Đặt cờ
    } else {
        removeFlag(row, col);  // Gỡ cờ
    }
}

function placeFlag(row, col) {
    let x = col * CELL_SIZE;
    let y = row * CELL_SIZE;

    // Thay vì tô màu đỏ, vẽ hình ảnh bomb
    ctx.drawImage(flagImage, x, y, CELL_SIZE, CELL_SIZE);

    // Đặt cờ (ký hiệu 'F' cho Flag)
    isFlag[row][col] = true;
}

function removeFlag(row, col) {
    let x = col * CELL_SIZE;
    let y = row * CELL_SIZE;

    if((row + col) % 2 === 0) {  // Đặt màu nền tùy thuộc vào ô
        ctx.fillStyle = '#4de06d';
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
    }else{
        ctx.fillStyle = 'lightgreen';
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
    }

    // Gỡ cờ
    isFlag[row][col] = false; // Trả về trạng thái chưa mở
}

// Mở nhanh khi nhấn con lăn
canvas.addEventListener('mousedown', handleMiddleClick);

function handleMiddleClick(event) {
    if (event.button !== 1) return;  // Chỉ xử lý nếu là chuột giữa

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const col = Math.floor(x / CELL_SIZE);
    const row = Math.floor(y / CELL_SIZE);

    if (!revealed[row][col]) return;  // Chỉ xử lý nếu ô đã mở
    
    const cellValue = board[row][col];
    if (cellValue > 0 && countFlagsAround(row, col) === cellValue) {
        openSurroundingCells(row, col);  // Mở các ô xung quanh nếu cờ đúng
    }
}

// Đếm số cờ xung quanh ô
function countFlagsAround(row, col) {
    let flagCount = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            let newRow = row + i;
            let newCol = col + j;
            if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS) {
                if (isFlag[newRow][newCol]) {
                    flagCount++;
                }
            }
        }
    }
    return flagCount;
}

// Mở các ô xung quanh
function openSurroundingCells(row, col) {
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            let newRow = row + i;
            let newCol = col + j;
            if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS && !revealed[newRow][newCol] && !isFlag[newRow][newCol]) {
                animateTearCell(newRow,newCol);
                revealCell(newRow, newCol);
            }
        }
    }
}



// Mở ô khi nhấn
function revealCell(row, col, showNumber = true) {
    if (revealed[row][col]) return;
    revealed[row][col] = true;

    let x = col * CELL_SIZE;
    let y = row * CELL_SIZE;

    ctx.fillStyle = '#ddd';
    ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
    ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);

    let cellValue = board[row][col];
    
    // Chỉ hiện số nếu showNumber là true
    if (showNumber && cellValue !== 0) {
        // Chọn màu sắc cho từng giá trị
        let color = '#000';  // Màu mặc định là đen
        switch (cellValue) {
            case 1:
                color = 'darkblue';   // Màu xanh dương đậm
                break;
            case 2:
                color = 'green';      // Màu xanh lá
                break;
            case 3:
                color = 'red';        // Màu đỏ
                break;
            case 4:
                color = 'purple';     // Màu tím
                break;
            case 5:
                color = 'orange';     // Màu cam
                break;
            case 6:
                color = 'lightblue';  // Màu dương xanh nhạt
                break;
            case 7:
                color = 'brown';      // Màu nâu
                break;
            case 8:
                color = 'pink';       // Màu hồng
                break;
        }

        ctx.fillStyle = color;
        ctx.font = `bold ${CELL_SIZE / 2}px Arial`;  // Kích thước font chữ tùy thuộc vào kích thước ô
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(cellValue, x + CELL_SIZE / 2, y + CELL_SIZE / 2);
    }

    if (cellValue === 0) {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                let newRow = row + i;
                let newCol = col + j;
                if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS) {
                    animateTearCell(row, col);
                    revealCell(newRow, newCol);
                }
            }
        }
    }
}


// Kết thúc game
function endGame(win) {
    for (let [row, col] of mines) {
        let x = col * CELL_SIZE;
        let y = row * CELL_SIZE;
         // Thay vì tô màu đỏ, vẽ hình ảnh bomb
        ctx.drawImage(bombImage, x, y, CELL_SIZE, CELL_SIZE);
    }

    setTimeout(() => {
        if (win) {
            alert('Chúc mừng! Bạn đã thắng!');
        } else {
            alert('Game Over! Bạn đã nhấn vào mìn.');
        }
        resetGame();
    }, 100);
}

// Kiểm tra chiến thắng
function checkWin() {
    let openedCells = 0;
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (revealed[row][col]) {
                openedCells++;
            }
        }
    }

    if (openedCells === ROWS * COLS - MINES_COUNT) {
        endGame(true);
    }
}

// Đặt lại game
function resetGame() {
    board = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
    revealed = Array(ROWS).fill(null).map(() => Array(COLS).fill(false));
    isFlag = Array(ROWS).fill(null).map(() => Array(COLS).fill(false));
    mines = [];
    firstClick = true; // Đặt lại firstClick
    document.querySelectorAll('i').forEach(icon => icon.remove());
    placeMines();
    calculateNumbers();
    drawBoard();
}

// Tạo lại bảng khi ô đầu tiên không trống
function regenerateBoard(firstRow, firstCol) {
    // Đặt lại bảng và danh sách mìn
    board = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
    mines = [];

    // Đặt mìn, nhưng bỏ qua ô (firstRow, firstCol) và các ô xung quanh nó
    let count = 0;
    while (count < MINES_COUNT) {
        let row = Math.floor(Math.random() * ROWS);
        let col = Math.floor(Math.random() * COLS);

        // Kiểm tra nếu ô đang được chọn nằm trong phạm vi 3x3 xung quanh ô (firstRow, firstCol)
        if (
            board[row][col] !== 'M' &&
            !(row >= firstRow - 1 && row <= firstRow + 1 && col >= firstCol - 1 && col <= firstCol + 1)
        ) {
            board[row][col] = 'M';
            mines.push([row, col]);
            count++;
        }
    }

    // Tính lại số mìn xung quanh
    calculateNumbers();

    // Vẽ lại bảng
    drawBoard();
}

// Xử lý sự kiện nút "Chơi lại"
document.getElementById('restartBtn').addEventListener('click', function() {
    resetGame();
});




// Khởi động game
placeMines();
calculateNumbers();
drawBoard();
