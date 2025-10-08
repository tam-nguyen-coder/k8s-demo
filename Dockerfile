# Sử dụng một image Node.js gọn nhẹ làm nền
FROM node:18-alpine

# Tạo thư mục làm việc bên trong container
WORKDIR /app

# Sao chép file package.json và package-lock.json
COPY package*.json ./

# Cài đặt các thư viện cần thiết
RUN npm install

# Sao chép toàn bộ mã nguồn còn lại
COPY . .

# Mở cổng 3000 để bên ngoài có thể truy cập
EXPOSE 3000

# Lệnh để khởi chạy ứng dụng khi container bắt đầu
CMD [ "node", "app.js" ]
