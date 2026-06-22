# API Check CCCD - Hướng dẫn chạy

## 📦 Cách sử dụng

### 1. **Chạy ứng dụng**
- **Windows**: Double-click file `api-check-cccd.exe` hoặc chạy lệnh:
  ```cmd
  api-check-cccd.exe
  ```

- Ứng dụng sẽ chạy trên `http://localhost:8088`

### 2. **Kiểm tra API đang chạy**
Mở browser và truy cập:
- Root: `http://localhost:8088/`
- Health Check: `http://localhost:8088/health`

### 3. **Gửi request đến API**

**Endpoint**: `POST http://localhost:8088/api/cccd/check`

**Headers**:
```
X-API-Key: lora_cccd_2026_secret
Content-Type: application/json
```

**Body** (ví dụ):
```json
{
  "cccd": "092123456789"
}
```

### 4. **Cấu hình**
- Edit file `.env` để thay đổi:
  - `PORT`: Port chạy API (mặc định: 8088)
  - `API_KEY`: API key cho authentication (mặc định: lora_cccd_2026_secret)

### 📋 Tính năng
- ✅ Validate định dạng CCCD
- ✅ Trích xuất thông tin: tỉnh, giới tính, năm sinh, tuổi
- ✅ Mã hóa dữ liệu (masking) CCCD
- ✅ Security: Helmet, CORS, API Key validation

### ⚠️ Lưu ý
- Ứng dụng **CHỈ KIỂM TRA ĐỊNH DẠNG**, không xác thực thông tin thật với CSDL quốc gia
- Cần có internet khi lần đầu chạy (để download dependencies nếu cần)
- Port 8088 phải trống trên máy

### 🆘 Troubleshoot
- **Port đã được sử dụng**: Mở `.env` và đổi `PORT` sang port khác (vd: 8089)
- **API không phản hồi**: Kiểm tra Windows Firewall có block port không

---
Phát triển bởi LoraFilm Team 🎬
