import './style.css';

const status = document.querySelector('#api-status');

async function checkBackend() {
  try {
    const response = await fetch('/api/health');
    if (!response.ok) throw new Error('Backend response was not OK');
    const health = await response.json();
    status.textContent = health.status === 'ok' ? 'Đang hoạt động' : 'Không khả dụng';
  } catch {
    status.textContent = 'Không kết nối được';
  }
}

checkBackend();