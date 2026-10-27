import { useEffect, useState } from 'react';
import {
  Building2,
  Check,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserRoundPlus,
  UsersRound,
  X,
} from 'lucide-react';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
const EMPTY_EMPLOYEE = {
  employeeCode: '',
  fullName: '',
  department: '',
  position: '',
  email: '',
  phone: '',
  employmentStatus: 'Đang làm việc',
};

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'Không thể xử lý yêu cầu.');
  return payload;
}

function EmployeeDialog({ employee, onClose, onSaved }) {
  const [form, setForm] = useState(() => employee ? { ...EMPTY_EMPLOYEE, ...employee } : EMPTY_EMPLOYEE);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const editing = Boolean(employee);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submitForm(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await apiRequest(editing ? `/employees/${employee._id}` : '/employees', {
        method: editing ? 'PUT' : 'POST',
        body: JSON.stringify(form),
      });
      onSaved(editing ? 'Đã cập nhật hồ sơ nhân viên.' : 'Đã thêm nhân viên mới.');
    } catch (requestError) {
      setError(requestError.message);
      setSaving(false);
    }
  }

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="employee-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <div className="dialog-heading">
          <div>
            <p className="eyebrow">HỒ SƠ NHÂN SỰ</p>
            <h2 id="dialog-title">{editing ? 'Cập nhật nhân viên' : 'Thêm nhân viên'}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Đóng biểu mẫu"><X size={19} /></button>
        </div>

        <form onSubmit={submitForm}>
          <div className="form-grid">
            <label>Mã nhân viên <span>*</span><input name="employeeCode" value={form.employeeCode} onChange={updateField} required maxLength={40} /></label>
            <label>Họ và tên <span>*</span><input name="fullName" value={form.fullName} onChange={updateField} required maxLength={120} /></label>
            <label>Phòng ban<input name="department" value={form.department || ''} onChange={updateField} maxLength={100} /></label>
            <label>Chức vụ<input name="position" value={form.position || ''} onChange={updateField} maxLength={100} /></label>
            <label>Email <span>*</span><input name="email" type="email" value={form.email} onChange={updateField} required maxLength={160} /></label>
            <label>Số điện thoại<input name="phone" type="tel" value={form.phone || ''} onChange={updateField} maxLength={30} /></label>
            <label className="form-span">Trạng thái làm việc
              <select name="employmentStatus" value={form.employmentStatus || 'Đang làm việc'} onChange={updateField}>
                <option>Đang làm việc</option><option>Tạm nghỉ</option><option>Đã nghỉ việc</option>
              </select>
            </label>
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="dialog-actions">
            <button className="button button-quiet" type="button" onClick={onClose}>Hủy</button>
            <button className="button button-primary" type="submit" disabled={saving}>
              {saving ? <LoaderCircle className="spin" size={17} /> : <Check size={17} />}
              {saving ? 'Đang lưu' : editing ? 'Lưu thay đổi' : 'Tạo hồ sơ'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function StatusBadge({ status }) {
  const value = status || 'Đang làm việc';
  const kind = value === 'Đang làm việc' ? 'active' : value === 'Tạm nghỉ' ? 'leave' : 'inactive';
  return <span className={`status-badge status-${kind}`}><i />{value}</span>;
}

export default function App() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [dialogEmployee, setDialogEmployee] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setApiError('');
      try {
        const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
        const result = await apiRequest(`/employees${query}`, { signal: controller.signal });
        setEmployees(result.data || []);
      } catch (error) {
        if (error.name !== 'AbortError') setApiError(error.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 180);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [search, refreshKey]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(''), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  function handleSaved(message) {
    setDialogOpen(false);
    setNotice(message);
    setRefreshKey((key) => key + 1);
  }

  async function deleteEmployee(employee) {
    if (!window.confirm(`Xóa hồ sơ ${employee.fullName} (${employee.employeeCode})? Thao tác này không thể hoàn tác.`)) return;
    try {
      await apiRequest(`/employees/${employee._id}`, { method: 'DELETE' });
      setNotice(`Đã xóa hồ sơ ${employee.employeeCode}.`);
      setRefreshKey((key) => key + 1);
    } catch (error) {
      setApiError(error.message);
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Bảng điều khiển nhân sự">
          <span className="brand-mark"><UsersRound size={19} /></span><span>NHÂN SỰ <b>/</b> NỘI BỘ</span>
        </a>
        <div className="topbar-meta"><span className="online-dot" /> Hệ thống quản lý</div>
      </header>

      <main className="workspace" id="top">
        <section className="page-heading">
          <div><p className="eyebrow">DANH BẠ TỔ CHỨC</p><h1>Quản lý nhân viên</h1><p className="page-subtitle">Thông tin nhân sự và hồ sơ làm việc</p></div>
          <button className="button button-primary add-button" type="button" onClick={() => { setDialogEmployee(null); setDialogOpen(true); }}><Plus size={18} /> Thêm nhân viên</button>
        </section>

        <section className="directory" aria-label="Danh sách nhân viên">
          <div className="directory-toolbar">
            <div className="directory-title"><span className="directory-icon"><Building2 size={18} /></span><div><h2>Danh sách nhân viên</h2><p>{loading ? 'Đang tải dữ liệu' : `${employees.length} hồ sơ`}</p></div></div>
            <label className="search-box"><Search size={17} aria-hidden="true" /><input type="search" placeholder="Tìm mã nhân viên, họ tên..." value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Tìm theo mã nhân viên hoặc họ tên" />{search && <button type="button" onClick={() => setSearch('')} aria-label="Xóa nội dung tìm kiếm"><X size={15} /></button>}</label>
          </div>
          {apiError && <div className="error-banner" role="alert">{apiError}</div>}
          <div className="table-scroll">
            <table>
              <thead><tr><th>Mã nhân viên</th><th>Họ và tên</th><th>Phòng ban</th><th>Chức vụ</th><th>Email</th><th>Số điện thoại</th><th>Trạng thái</th><th><span className="sr-only">Thao tác</span></th></tr></thead>
              <tbody>
                {loading ? <tr><td className="table-message" colSpan="8"><LoaderCircle className="spin" size={20} /> Đang tải danh sách nhân viên...</td></tr>
                  : employees.length ? employees.map((employee) => (
                    <tr key={employee._id}>
                      <td className="code-cell">{employee.employeeCode}</td>
                      <td><button className="name-link" type="button" onClick={() => { setDialogEmployee(employee); setDialogOpen(true); }}>{employee.fullName}</button></td>
                      <td>{employee.department || <span className="muted">Chưa cập nhật</span>}</td>
                      <td>{employee.position || <span className="muted">Chưa cập nhật</span>}</td>
                      <td><a className="email-link" href={`mailto:${employee.email}`}>{employee.email}</a></td>
                      <td>{employee.phone || <span className="muted">Chưa cập nhật</span>}</td>
                      <td><StatusBadge status={employee.employmentStatus} /></td>
                      <td><div className="row-actions"><button className="icon-button" type="button" onClick={() => { setDialogEmployee(employee); setDialogOpen(true); }} aria-label={`Sửa ${employee.fullName}`} title="Sửa hồ sơ"><Pencil size={16} /></button><button className="icon-button danger-action" type="button" onClick={() => deleteEmployee(employee)} aria-label={`Xóa ${employee.fullName}`} title="Xóa hồ sơ"><Trash2 size={16} /></button></div></td>
                    </tr>
                  )) : <tr><td className="empty-state" colSpan="8"><span className="empty-icon"><UserRoundPlus size={22} /></span><strong>{search ? 'Không tìm thấy nhân viên' : 'Chưa có hồ sơ nhân viên'}</strong><span>{search ? 'Thử từ khóa khác hoặc xóa nội dung tìm kiếm.' : 'Thêm hồ sơ đầu tiên để bắt đầu quản lý.'}</span></td></tr>}
              </tbody>
            </table>
          </div>
          <footer className="directory-footer"><span><i className="footer-dot" /> Dữ liệu được lưu trên hệ thống</span><span>Hiển thị {loading ? '—' : employees.length} hồ sơ</span></footer>
        </section>
      </main>

      {notice && <div className="toast" role="status"><Check size={17} />{notice}<button type="button" onClick={() => setNotice('')} aria-label="Đóng thông báo"><X size={15} /></button></div>}
      {dialogOpen && <EmployeeDialog key={dialogEmployee?._id || 'new'} employee={dialogEmployee} onClose={() => setDialogOpen(false)} onSaved={handleSaved} />}
    </div>
  );
}