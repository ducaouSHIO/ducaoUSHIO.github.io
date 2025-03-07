// 页面加载时自动加载文件
window.addEventListener('load', () => {
    loadXLSXFile('阿桃唱过的歌2.0.xlsx');
});

// 加载XLSX文件
function loadXLSXFile(filename) {
    fetch(filename)
        .then(response => {
            if (!response.ok) {
                throw new Error('文件加载失败，状态码：' + response.status);
            }
            return response.arrayBuffer();
        })
        .then(data => {
            console.log('文件加载成功，数据大小：', data.byteLength);
            const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // 调试：打印解析后的数据
            console.log('解析后的数据:', json);

            // 假设第一列是歌名，第二列是歌手
            songs = json
                .filter(row => row[0]) // 过滤掉空行
                .map(row => ({
                    name: String(row[0]), // 确保歌名是字符串
                    artist: String(row[1] || '未知歌手') // 确保歌手是字符串
                }));

            // 调试：打印处理后的歌单
            console.log('处理后的歌单:', songs);

            renderTable(songs);
        })
        .catch(error => {
            console.error('文件加载失败:', error);
            alert('文件加载失败，请确保文件存在且名称正确。');
        });
}

// 渲染表格
function renderTable(songs, page = 1, pageSize = 50) {
    const tableBody = document.querySelector('#playlistTable tbody');
    tableBody.innerHTML = '';

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedSongs = songs.slice(start, end);

    paginatedSongs.forEach(song => {
        const row = document.createElement('tr');
        const nameCell = document.createElement('td');
        const artistCell = document.createElement('td');

        nameCell.textContent = song.name;
        artistCell.textContent = song.artist;

        nameCell.style.cursor = 'pointer';
        nameCell.addEventListener('click', () => {
            navigator.clipboard.writeText(song.name).then(() => {
                alert(`已复制: ${song.name}`);
            });
        });

        row.appendChild(nameCell);
        row.appendChild(artistCell);
        tableBody.appendChild(row);
    });

    renderPaginationControls(songs.length, page, pageSize);
}

// 渲染分页控件
function renderPaginationControls(totalSongs, currentPage, pageSize) {
    const maxPages = 20; // 最多显示20页
    const totalPages = Math.min(Math.ceil(totalSongs / pageSize), maxPages);
    const paginationControls = document.getElementById('paginationControls');
    paginationControls.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.className = 'btn btn-secondary mx-1';
        if (i === currentPage) {
            button.classList.add('active');
        }
        button.addEventListener('click', () => {
            renderTable(songs, i, pageSize);
        });
        paginationControls.appendChild(button);
    }
}

// 搜索功能
document.getElementById('searchInput').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filteredSongs = songs.filter(song => {
        const name = song.name ? song.name.toLowerCase() : '';
        const artist = song.artist ? song.artist.toLowerCase() : '';
        return name.includes(searchTerm) || artist.includes(searchTerm);
    });
    renderTable(filteredSongs, 1, 50); // 搜索后重置到第一页
});

let songs = []; // 用于存储加载的歌单