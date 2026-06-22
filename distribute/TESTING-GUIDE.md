# Test API CCCD - Hướng dẫn Chi tiết

## 🔧 Chuẩn bị

1. Chạy `api-check-cccd.exe` hoặc `run.bat`
2. Đợi message: `Server is running on port 8088`
3. Mở tool test API (Postman, Insomnia, hoặc curl)

---

## ✅ Test Health Check

**Endpoint**: `GET http://localhost:8088/health`

**Response (200 OK)**:
```json
{
  "status": "UP",
  "service": "api-check-cccd",
  "timestamp": "2026-06-22T09:55:00.000Z"
}
```

---

## ✅ Test CCCD Validation

### Request
**Endpoint**: `POST http://localhost:8088/api/cccd/check`

**Headers**:
```
X-API-Key: lora_cccd_2026_secret
Content-Type: application/json
```

**Body** (Example):
```json
{
  "cccd": "092123456789"
}
```

### Success Response (200 OK)
```json
{
  "valid": true,
  "cccd": "092123456789",
  "province": "Hồ Chí Minh",
  "provinceCode": "092",
  "gender": "Female",
  "birthCentury": "1900",
  "birthYear": "21",
  "fullBirthYear": "1921",
  "ageByYear": 105,
  "randomCode": "456789",
  "maskedCCCD": "092*****6789"
}
```

### Error Response (400 Bad Request)
```json
{
  "valid": false,
  "message": "CCCD must be exactly 12 digits",
  "cccd": "123"
}
```

---

## 📝 Test Cases

### Test 1: Valid CCCD - Male (Century 1900)
```json
{
  "cccd": "020101123456"
}
```
**Kỳ vọng**: valid=true, gender=Male, birthYear=01, fullBirthYear=1901

### Test 2: Valid CCCD - Female (Century 1900)
```json
{
  "cccd": "092123456789"
}
```
**Kỳ vọng**: valid=true, gender=Female, birthYear=21

### Test 3: Valid CCCD - Male (Century 2000)
```json
{
  "cccd": "001211234567"
}
```
**Kỳ vọng**: valid=true, gender=Male, birthYear=12, fullBirthYear=2012

### Test 4: Valid CCCD - Female (Century 2000)
```json
{
  "cccd": "003331234567"
}
```
**Kỳ vọng**: valid=true, gender=Female, birthYear=33

### Test 5: Invalid Length
```json
{
  "cccd": "123"
}
```
**Kỳ vọng**: valid=false, message="CCCD must be exactly 12 digits"

### Test 6: Invalid Characters
```json
{
  "cccd": "09212345678A"
}
```
**Kỳ vọng**: valid=false, message="CCCD must contain only digits"

### Test 7: Missing API Key
- **Method**: POST
- **Endpoint**: `http://localhost:8088/api/cccd/check`
- **Headers**: (không gửi X-API-Key)
- **Body**: 
```json
{
  "cccd": "092123456789"
}
```
**Kỳ vọng**: Response 401 Unauthorized

---

## 🔐 Security Testing

### Test Missing API Key
- Gửi request **KHÔNG có** header `X-API-Key`
- **Kỳ vọng**: 401 Unauthorized

### Test Invalid API Key
- Header: `X-API-Key: wrong_key`
- **Kỳ vọng**: 401 Unauthorized

### Test Valid API Key
- Header: `X-API-Key: lora_cccd_2026_secret`
- **Kỳ vọng**: Request được xử lý bình thường

---

## 💡 Tips cho Member

### Dùng cURL (Command Line)
```bash
curl -X POST http://localhost:8088/api/cccd/check \
  -H "Content-Type: application/json" \
  -H "X-API-Key: lora_cccd_2026_secret" \
  -d '{"cccd":"092123456789"}'
```

### Dùng Postman
1. Tạo new **POST** request
2. URL: `http://localhost:8088/api/cccd/check`
3. **Headers** tab:
   - Key: `X-API-Key` | Value: `lora_cccd_2026_secret`
   - Key: `Content-Type` | Value: `application/json`
4. **Body** tab → **raw** → paste JSON
5. Click **Send**

---

## 📊 Province Codes Reference

| Code | Province |
|------|----------|
| 001  | Hà Nội |
| 020  | Hải Phòng |
| 092  | Hồ Chí Minh |
| ... | ... (xem file provinceCodes.js để đầy đủ) |

---

Chúc testing vui vẻ! 🚀
