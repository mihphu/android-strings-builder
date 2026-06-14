# Android Strings Builder Web Tool

Mục tiêu: Xây dựng một ứng dụng web không cần backend, tối ưu để deploy lên GitHub Pages. Ứng dụng này giúp các lập trình viên Android dễ dàng chọn danh sách ngôn ngữ cần dịch, tự động tạo cấu trúc thư mục resource (ví dụ `values-es-rES` kèm file `strings.xml` rỗng) dồn vào một file ZIP, và sinh ra Prompt chuẩn để nhờ AI thực hiện dịch thuật.

## User Review Required

> [!IMPORTANT]
> - Framework: **Không sử dụng framework**. Toàn bộ dự án sẽ dùng **thuần HTML, CSS và JavaScript (Vanilla)** theo đúng yêu cầu mới nhất của bạn. Cách này siêu nhẹ và không cần chạy bất kỳ lệnh `npm` hay `npx` nào. Bạn chỉ việc mở file `index.html` là chạy được luôn.
> - Styling: Sử dụng **Tailwind CSS qua CDN** (để thiết kế nhanh như yêu cầu ban đầu) kết hợp với **Vanilla CSS** (`style.css`) để làm các hiệu ứng animation/glassmorphism xịn xò.
> - Thư viện phụ trợ: **JSZip** và **FileSaver.js** sẽ được nhúng trực tiếp qua link CDN.

Vui lòng xác nhận bản kế hoạch dùng thuần HTML/JS này để tôi tiến hành tạo file.

## Open Questions

> [!WARNING]
> 1. **Nội dung của file `TRANSLATION_RULE.md`**: Vui lòng cung cấp nội dung bạn muốn chèn vào file này để tool có thể inject tự động vào file ZIP tải về. (Nếu chưa có tôi sẽ để nội dung mẫu).
> 2. **Hiển thị cờ (Flags)**: Tôi sẽ dùng Emoji cờ quốc gia tích hợp sẵn (ví dụ: 🇻🇳, 🇪🇸) để ứng dụng nhẹ nhất có thể và không cần nhúng thêm thư viện ngoài. Bạn có đồng ý không?

## Proposed Changes

Dự án sẽ được thiết lập trực tiếp tại `d:\WorkSpace\WebTools\android-strings-builder`. Không cần lệnh cài đặt, tôi sẽ tạo trực tiếp các file sau:

### [NEW] `index.html`
- File gốc của giao diện.
- Nhúng Tailwind CSS CDN (`https://cdn.tailwindcss.com`).
- Nhúng JSZip và FileSaver CDN.
- Chứa toàn bộ cấu trúc UI: Thanh tìm kiếm ngôn ngữ, danh sách checkbox, Textarea nhập strings, và khu vực Preview & Download.

### [NEW] `style.css`
- Định dạng các style tuỳ chỉnh không có sẵn trong Tailwind.
- Thêm hiệu ứng hover, scrollbar đẹp mắt, và micro-animations giúp giao diện "chuẩn xịn" và cao cấp.

### [NEW] `js/data.js`
- File chứa dữ liệu mảng các quốc gia chuẩn:
  `const LANGUAGES = [{ id: 'vi-rVN', code: 'vi', region: 'VN', name: 'Vietnamese', flag: '🇻🇳' }, ...]`

### [NEW] `js/app.js`
- File chứa toàn bộ logic xử lý:
  - Logic render danh sách ngôn ngữ ra HTML.
  - Logic tìm kiếm, lọc (filter) ngôn ngữ.
  - Logic ghép chuỗi Prompt: Dựa vào template + dữ liệu locale user đã chọn + text strings user nhập.
  - Logic nén file ZIP: Gọi API của `JSZip`, tạo các thư mục `values-[locale]`, tạo file `strings.xml`, tạo file `TRANSLATION_RULE.md`, rồi dùng `saveAs` tải về.

## Verification Plan

### Manual Verification
1. Mở trực tiếp file `index.html` bằng trình duyệt (không cần dev server).
2. Tương tác với giao diện: Tìm và chọn ngôn ngữ.
3. Nhập strings và kiểm tra đoạn Prompt sinh ra.
4. Nhấn "Download ZIP" và mở file nén tải về để xác minh cấu trúc thư mục (`values-es-rES/strings.xml`) và file `TRANSLATION_RULE.md`.
5. Đẩy toàn bộ các file này lên GitHub Repo và bật GitHub Pages để test live.
