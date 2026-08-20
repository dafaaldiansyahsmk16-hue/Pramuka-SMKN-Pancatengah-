// Key Sandi Master Khusus Pembina/Admin (Bisa Menghapus Postingan Siapa Saja)
const ADMIN_MASTER_PIN = "0000"; 

// Data Artikel Awal
let articles = JSON.parse(localStorage.getItem('pramuka_free_articles')) || [
  {
    id: 1,
    authorName: 'Budi Santoso',
    pin: '1234',
    title: 'Juara 1 Lomba LKBB Tingkat Kabupaten',
    category: 'Pencapaian',
    excerpt: 'Tim Ambalan SMKN Pancatengah berhasil memenangkan piala utama.',
    content: 'Alhamdulillah, berkat latihan rutin dan disiplin tinggi, regu Pramuka SMKN Pancatengah berhasil menyabet Juara 1 pada Lomba Keterampilan Baris Berbaris.',
    photo: '🏆',
    createdAt: new Date().getTime()
  }
];

let currentEditingId = null;
let currentFilter = 'semua';

function openWriteModal() {
  currentEditingId = null;
  document.getElementById('modalTitle').textContent = 'Tulis Artikel Baru';
  document.getElementById('writeModal').classList.add('active');
  document.querySelector('#writeModal form').reset();
  document.getElementById('photoPreview').style.display = 'none';
}

function closeWriteModal() {
  document.getElementById('writeModal').classList.remove('active');
}

function previewPhoto(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(evt) {
      document.getElementById('photoPreview').src = evt.target.result;
      document.getElementById('photoPreview').style.display = 'block';
      document.getElementById('photoData').value = evt.target.result;
    };
    reader.readAsDataURL(file);
  }
}

function submitArticle(e) {
  e.preventDefault();
  const photoData = document.getElementById('photoData').value;

  if (currentEditingId) {
    articles = articles.map(a => {
      if (a.id === currentEditingId) {
        return {
          ...a,
          authorName: document.getElementById('authorName').value,
          pin: document.getElementById('postPin').value,
          title: document.getElementById('title').value,
          category: document.getElementById('category').value,
          excerpt: document.getElementById('excerpt').value,
          content: document.getElementById('content').value,
          photo: photoData || a.photo
        };
      }
      return a;
    });
  } else {
    const newArticle = {
      id: Date.now(),
      authorName: document.getElementById('authorName').value,
      pin: document.getElementById('postPin').value,
      title: document.getElementById('title').value,
      category: document.getElementById('category').value,
      excerpt: document.getElementById('excerpt').value,
      content: document.getElementById('content').value,
      photo: photoData || '📌',
      createdAt: Date.now()
    };
    articles.unshift(newArticle);
  }

  localStorage.setItem('pramuka_free_articles', JSON.stringify(articles));
  closeWriteModal();
  renderFeed();
}

function renderFeed() {
  const container = document.getElementById('feedContainer');
  let filtered = articles;

  if (currentFilter !== 'semua') {
    filtered = filtered.filter(a => a.category === currentFilter);
  }

  const query = document.getElementById('searchInput').value.toLowerCase();
  if (query) {
    filtered = filtered.filter(a => a.title.toLowerCase().includes(query) || a.excerpt.toLowerCase().includes(query));
  }

  if (filtered.length === 0) {
    container.innerHTML = '<div style="text-align:center; padding:30px; background:white; border-radius:8px; color:#65676b;">Belum ada artikel.</div>';
    return;
  }

  container.innerHTML = filtered.sort((a,b) => b.createdAt - a.createdAt).map(article => {
    const firstLetter = article.authorName ? article.authorName.charAt(0) : '?';

    return `
      <div class="article-card" onclick="openReadModal(${article.id})">
        <div class="post-author-bar">
          <div class="author-avatar">${firstLetter}</div>
          <div class="author-details">
            <span class="author-name">${article.authorName}</span>
            <span class="post-time">${new Date(article.createdAt).toLocaleDateString('id-ID')}</span>
          </div>
        </div>

        <span class="article-category">${article.category}</span>
        <h3 class="article-title">${article.title}</h3>
        <p class="article-excerpt">${article.excerpt}</p>

        <div class="article-thumb">
          ${article.photo.startsWith('data:') ? `<img src="${article.photo}">` : `<span>${article.photo}</span>`}
        </div>

        <div class="article-actions" onclick="event.stopPropagation();">
          <button class="btn-secondary-fb" onclick="editArticle(${article.id})">Ubah</button>
          <button class="btn-secondary-fb" style="color:red;" onclick="deleteArticle(${article.id})">Hapus</button>
        </div>
      </div>
    `;
  }).join('');
}

function openReadModal(id) {
  const article = articles.find(a => a.id === id);
  if (!article) return;

  const firstLetter = article.authorName ? article.authorName.charAt(0) : '?';

  document.getElementById('readAuthorArea').innerHTML = `
    <div class="author-avatar">${firstLetter}</div>
    <div class="author-details">
      <span class="author-name">${article.authorName}</span>
      <span class="post-time">${new Date(article.createdAt).toLocaleString('id-ID')}</span>
    </div>
  `;

  document.getElementById('readCategory').textContent = article.category;
  document.getElementById('readTitle').textContent = article.title;
  document.getElementById('readBody').textContent = article.content;

  const imgContainer = document.getElementById('readImgContainer');
  if (article.photo.startsWith('data:')) {
    document.getElementById('readImg').src = article.photo;
    imgContainer.style.display = 'flex';
  } else {
    imgContainer.style.display = 'none';
  }

  document.getElementById('readActions').innerHTML = `
    <button class="btn-secondary-fb" onclick="editArticle(${article.id})">Ubah</button>
    <button class="btn-secondary-fb" style="color:red;" onclick="deleteArticle(${article.id})">Hapus</button>
  `;

  document.getElementById('readModal').classList.add('active');
}

function closeReadModal() {
  document.getElementById('readModal').classList.remove('active');
}

function deleteArticle(id) {
  const article = articles.find(a => a.id === id);
  if (!article) return;

  const inputPin = prompt(`Masukkan PIN 4 angka postingan ini (atau PIN Pembina):`);
  
  if (inputPin === article.pin || inputPin === ADMIN_MASTER_PIN) {
    if (confirm('Yakin ingin menghapus artikel ini?')) {
      articles = articles.filter(a => a.id !== id);
      localStorage.setItem('pramuka_free_articles', JSON.stringify(articles));
      closeReadModal();
      renderFeed();
    }
  } else if (inputPin !== null) {
    alert('PIN salah! Anda tidak bisa menghapus artikel ini.');
  }
}

function editArticle(id) {
  const article = articles.find(a => a.id === id);
  if (!article) return;

  const inputPin = prompt(`Masukkan PIN 4 angka postingan ini (atau PIN Pembina):`);

  if (inputPin === article.pin || inputPin === ADMIN_MASTER_PIN) {
    currentEditingId = id;
    document.getElementById('modalTitle').textContent = 'Ubah Artikel';
    document.getElementById('authorName').value = article.authorName;
    document.getElementById('postPin').value = article.pin;
    document.getElementById('title').value = article.title;
    document.getElementById('category').value = article.category;
    document.getElementById('excerpt').value = article.excerpt;
    document.getElementById('content').value = article.content;

    document.getElementById('writeModal').classList.add('active');
    closeReadModal();
  } else if (inputPin !== null) {
    alert('PIN salah! Anda tidak bisa mengubah artikel ini.');
  }
}

function filterByCategory(cat) {
  currentFilter = cat;
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  renderFeed();
}

function filterArticles() {
  renderFeed();
}

// Jalankan sistem feed saat pertama dibuka
renderFeed();
                                      
