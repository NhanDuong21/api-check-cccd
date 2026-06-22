# api-check-cccd

A lightweight, high-performance Node.js API service designed to validate the format of Vietnamese Citizen Identity Cards (Căn cước công dân - CCCD). This service is developed for integration with the **LoraFilm** movie ticket booking platform.

> [!WARNING]
> **IMPORTANT LIMITATION:** This API **does not** verify whether a CCCD actually exists in the official Vietnamese national database of citizens. It only validates the structural format of the number and extracts encoded data (province, gender, birth year, age, etc.) based on public government rules.

---

## Features

- **Structural Validation:** Verifies length, character composition, and logical rules.
- **Province Extraction:** Resolves the first 3 digits to the corresponding Vietnamese province/city name.
- **Gender & Century Decryption:** Extracts birth century, birth year, and gender.
- **Age Calculation:** Calculates age by year based on the current calendar year.
- **Random Code Identification:** Extracts the last 6 random identifier digits.
- **Data Masking:** Returns a masked version of the CCCD (e.g., `092******456`) to protect citizen privacy.
- **Security Protections:** Includes basic security features using `helmet`, `cors`, and API Key header validation.

---

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Module System:** CommonJS (require/module.exports)
- **Security:** Helmet, CORS, API Key Middleware
- **Environment Management:** dotenv
- **Development Tooling:** nodemon

---

## Project Structure

```text
api-check-cccd/
├── src/
│   ├── server.js               # Entry point of the Express application
│   ├── routes/
│   │   └── cccd.route.js       # Routes for CCCD operations
│   ├── services/
│   │   └── cccd.service.js     # CCCD validation logic & decryption service
│   ├── middlewares/
│   │   └── apiKey.middleware.js # API security handler
│   └── data/
│       └── provinceCodes.js    # Mapping data for Vietnamese province codes
├── .env.example                # Sample environment variables
├── .gitignore                  # Git excluded paths
├── package.json                # Project dependencies and run scripts
└── README.md                   # Project documentation (this file)
```

---

## Installation & Setup

### 1. Clone & Install Dependencies
First, install the application dependencies:
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Open `.env` and set your desired port and API Key:
```env
PORT=8088
API_KEY=your-secret-api-key
```
> [!NOTE]
> If `API_KEY` is not defined in your `.env` file, the API Key security middleware will permit all requests (highly recommended for local development).

### 3. Run the Application

#### Development Mode (with hot-reload)
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

---

## API Endpoints

### 1. Root Endpoint
Checks the general status of the API.
- **URL:** `GET /`
- **Headers:** None
- **Response:**
  ```json
  {
    "service": "api-check-cccd",
    "status": "running",
    "description": "Vietnamese CCCD format validation API"
  }
  ```

### 2. Health Check
Retrieves the service health status.
- **URL:** `GET /health`
- **Headers:** None
- **Response:**
  ```json
  {
    "status": "UP",
    "service": "api-check-cccd",
    "timestamp": "2026-06-09T04:00:00.000Z"
  }
  ```

### 3. Validate CCCD
Checks CCCD format, masks the identifier, and extracts metadata.
- **URL:** `POST /api/cccd/check`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: your-secret-api-key` *(Only required if API_KEY is set in `.env`)*
- **Request Body:**
  ```json
  {
    "cccd": "092205123456"
  }
  ```
- **Example Success Response:**
  ```json
  {
    "valid": true,
    "cccdMasked": "092******456",
    "provinceCode": "092",
    "provinceName": "Cần Thơ",
    "gender": "MALE",
    "genderLabel": "Nam",
    "birthYear": 2005,
    "ageByYear": 21,
    "randomCode": "123456",
    "message": "CCCD format is valid",
    "note": "This API only checks CCCD format. It does not verify whether the CCCD exists in the national citizen database."
  }
  ```

---

## Example cURL Commands

**Health Check:**
```bash
curl -X GET http://localhost:8088/health
```

**Check Valid CCCD:**
```bash
curl -X POST http://localhost:8088/api/cccd/check \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-api-key" \
  -d '{"cccd": "092205123456"}'
```

**Check Invalid CCCD (Missing field):**
```bash
curl -X POST http://localhost:8088/api/cccd/check \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-api-key" \
  -d '{}'
```

---

## Deployment & Hosting

The suggested production API URL is: **`https://api-check-cccd.lorafilm.xyz`**

### PM2 Deployment
Deploy and manage the backend process on your Linux VM using PM2:
```bash
pm2 start src/server.js --name api-check-cccd
pm2 save
pm2 list
```

### Nginx Reverse Proxy Config
Create or edit your site configuration (e.g., `/etc/nginx/sites-available/api-check-cccd`):
```nginx
server {
    listen 80;
    server_name api-check-cccd.lorafilm.xyz;

    location / {
        proxy_pass http://localhost:8088;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```
Enable the site and reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/api-check-cccd /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### SSL Security Configuration
Secure the connection using Let's Encrypt Certbot:
```bash
sudo certbot --nginx -d api-check-cccd.lorafilm.xyz
```

---

## Client Integration Example
Here is how you can consume this API from the **LoraFilm** frontend (React/Next.js/HTML):

```javascript
async function verifyCccdFormat(cccdNumber) {
  const url = "https://api-check-cccd.lorafilm.xyz/api/cccd/check";
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "your-secret-api-key" // Ensure this matches production ENV
      },
      body: JSON.stringify({ cccd: cccdNumber })
    });

    const data = await response.json();
    if (response.ok && data.valid) {
      console.log("Valid CCCD! Decoded Info:", data);
      return data;
    } else {
      console.error("Validation Failed:", data.message);
      alert(`CCCD is invalid: ${data.message}`);
      return null;
    }
  } catch (error) {
    console.error("Network / Connection error:", error);
    return null;
  }
}
```

---

## License
This project is licensed under the MIT License.

# Quy luật dãy số CCCD Việt Nam

Tài liệu này mô tả quy luật cơ bản của dãy số CCCD/định danh cá nhân Việt Nam để người dùng hiểu API đang kiểm tra dựa trên cơ sở nào.

> Lưu ý: API chỉ kiểm tra **định dạng và quy luật cấu trúc số CCCD**.  
> API **không xác minh** CCCD có tồn tại thật trong Cơ sở dữ liệu quốc gia về dân cư hay không.

---

## 1. CCCD có bao nhiêu số?

Số CCCD hiện nay gồm **12 chữ số**.

Cấu trúc tổng quát:

```txt
AAA B YY RRRRRR
```

Trong đó:

| Phần | Vị trí | Ý nghĩa |
|---|---|---|
| `AAA` | 3 số đầu | Mã tỉnh/thành phố hoặc mã nơi đăng ký khai sinh |
| `B` | Số thứ 4 | Mã giới tính và thế kỷ sinh |
| `YY` | Số thứ 5 và 6 | Hai số cuối của năm sinh |
| `RRRRRR` | 6 số cuối | Dãy số ngẫu nhiên |

---

## 2. Ví dụ phân tích CCCD

Ví dụ:

```txt
092205006384
```

Có thể tách thành:

```txt
092 2 05 006384
```

Ý nghĩa:

| Thành phần | Giá trị | Ý nghĩa |
|---|---:|---|
| Mã tỉnh/thành phố | `092` | Cần Thơ |
| Mã giới tính/thế kỷ | `2` | Nam, sinh trong thế kỷ 21 |
| Năm sinh rút gọn | `05` | Sinh năm 2005 |
| Dãy số ngẫu nhiên | `006384` | Mã ngẫu nhiên |

Vậy số CCCD `092205006384` có thể hiểu là:

```txt
Công dân có mã nơi đăng ký khai sinh là Cần Thơ,
giới tính Nam,
sinh năm 2005,
và có dãy số ngẫu nhiên là 006384.
```

---

## 3. Ba số đầu: mã tỉnh/thành phố

Ba chữ số đầu tiên thể hiện mã tỉnh/thành phố hoặc mã nơi công dân đăng ký khai sinh.

Ví dụ:

| Mã | Tỉnh/Thành phố |
|---:|---|
| `001` | Hà Nội |
| `031` | Hải Phòng |
| `048` | Đà Nẵng |
| `079` | TP. Hồ Chí Minh |
| `092` | Cần Thơ |

Ví dụ:

```txt
079305123456
```

Ba số đầu là `079`, tương ứng với **TP. Hồ Chí Minh**.

---

## 4. Số thứ 4: mã giới tính và thế kỷ sinh

Số thứ 4 trong CCCD cho biết **giới tính** và **thế kỷ sinh**.

| Mã | Khoảng năm sinh | Giới tính |
|---:|---|---|
| `0` | 1900 - 1999 | Nam |
| `1` | 1900 - 1999 | Nữ |
| `2` | 2000 - 2099 | Nam |
| `3` | 2000 - 2099 | Nữ |
| `4` | 2100 - 2199 | Nam |
| `5` | 2100 - 2199 | Nữ |
| `6` | 2200 - 2299 | Nam |
| `7` | 2200 - 2299 | Nữ |
| `8` | 2300 - 2399 | Nam |
| `9` | 2300 - 2399 | Nữ |

Ví dụ:

```txt
092205006384
   ^
   |
   số thứ 4 là 2
```

Mã `2` nghĩa là:

```txt
Nam, sinh trong giai đoạn 2000 - 2099
```

---

## 5. Số thứ 5 và 6: năm sinh

Hai số tiếp theo là **hai số cuối của năm sinh**.

Ví dụ:

```txt
092205006384
    ^^
    |
    05
```

Kết hợp với số thứ 4 là `2`, ta suy ra:

```txt
Mã 2  => sinh trong giai đoạn 2000 - 2099
05    => năm sinh có hai số cuối là 05
=> Năm sinh: 2005
```

Một số ví dụ khác:

| CCCD mẫu | Mã giới tính/thế kỷ | Năm rút gọn | Năm sinh suy ra |
|---|---:|---:|---:|
| `001099123456` | `0` | `99` | 1999 |
| `001199123456` | `1` | `99` | 1999 |
| `079200123456` | `2` | `00` | 2000 |
| `079305123456` | `3` | `05` | 2005 |

---

## 6. Sáu số cuối: dãy số ngẫu nhiên

Sáu chữ số cuối là dãy số ngẫu nhiên.

Ví dụ:

```txt
092205006384
      ^^^^^^
      |
      006384
```

Dãy `006384` chỉ là phần số ngẫu nhiên trong CCCD.

API chỉ tách và hiển thị phần này, không dùng nó để xác minh CCCD có thật hay không.

---

## 7. Điều kiện CCCD hợp lệ theo API

Một số CCCD được xem là hợp lệ về mặt định dạng khi thỏa các điều kiện sau:

1. Có đúng **12 chữ số**.
2. Chỉ chứa ký tự số từ `0` đến `9`.
3. Ba số đầu là mã tỉnh/thành phố hợp lệ.
4. Số thứ 4 là mã giới tính/thế kỷ hợp lệ.
5. Hai số tiếp theo có thể suy ra năm sinh.
6. Sáu số cuối là chữ số.

Ví dụ hợp lệ:

```txt
092205006384
```

Phân tích:

```txt
092    => Cần Thơ
2      => Nam, sinh trong thế kỷ 21
05     => Sinh năm 2005
006384 => Dãy số ngẫu nhiên
```

---

## 8. Ví dụ CCCD không hợp lệ

### Sai vì không đủ 12 số

```txt
09220500638
```

Số này chỉ có 11 chữ số nên không hợp lệ.

---

### Sai vì chứa ký tự không phải số

```txt
09220500A384
```

Số này có ký tự `A`, nên không hợp lệ.

---

### Sai vì mã tỉnh không tồn tại trong danh sách

```txt
999205006384
```

Nếu `999` không nằm trong danh sách mã tỉnh/thành phố được hỗ trợ, API sẽ trả về không hợp lệ.

---

## 9. API có thể suy ra thông tin gì?

Từ một số CCCD hợp lệ về mặt cấu trúc, API có thể suy ra:

| Thông tin | Có thể suy ra không? |
|---|---|
| Mã tỉnh/thành phố | Có |
| Tên tỉnh/thành phố | Có |
| Giới tính | Có |
| Năm sinh | Có |
| Tuổi theo năm hiện tại | Có |
| Sáu số cuối | Có |
| CCCD có tồn tại thật không | Không |
| Họ tên chủ CCCD | Không |
| Địa chỉ thường trú | Không |
| Ngày/tháng sinh chính xác | Không |

---

## 10. Giới hạn quan trọng

API này **không phải hệ thống xác minh danh tính chính thức**.

API không thể kiểm tra:

- CCCD có tồn tại thật hay không.
- CCCD có thuộc về đúng người đang nhập hay không.
- Họ tên của chủ CCCD.
- Ngày sinh đầy đủ.
- Địa chỉ, quê quán, nơi thường trú.
- Trạng thái còn hiệu lực của CCCD.
- Dữ liệu từ Cơ sở dữ liệu quốc gia về dân cư.

API chỉ giúp kiểm tra nhanh CCCD có đúng **cấu trúc 12 số** và có thể suy ra một số thông tin cơ bản từ quy luật của dãy số.

---

## 11. Mục đích sử dụng

API kiểm tra CCCD phù hợp cho các trường hợp:

- Kiểm tra nhanh định dạng CCCD trong form đăng ký.
- Tự động suy ra tỉnh/thành phố.
- Tự động suy ra giới tính.
- Tự động suy ra năm sinh.
- Giảm số lượng thông tin người dùng phải nhập thủ công.

Ví dụ trong hệ thống đặt vé xem phim, khi người dùng nhập CCCD, hệ thống có thể tự động suy ra:

```txt
Tỉnh/Thành phố: Cần Thơ
Giới tính: Nam
Năm sinh: 2005
```

Từ đó form đăng ký có thể gọn hơn và hạn chế nhập sai dữ liệu cơ bản.

---

## 12. Kết luận

Dãy số CCCD Việt Nam không phải là dãy số ngẫu nhiên hoàn toàn.  
Nó có cấu trúc gồm:

```txt
Mã tỉnh/thành phố + Mã giới tính/thế kỷ + Năm sinh + Dãy số ngẫu nhiên
```

Ví dụ:

```txt
092205006384
```

Có thể hiểu là:

```txt
092    => Cần Thơ
2      => Nam, sinh trong thế kỷ 21
05     => Sinh năm 2005
006384 => Dãy số ngẫu nhiên
```

API `api-check-cccd` dựa trên quy luật này để kiểm tra định dạng và suy ra thông tin cơ bản từ số CCCD.

