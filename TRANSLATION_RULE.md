# Android Strings Translation Rules

> Bộ rule chuẩn để dịch (localize) `strings.xml` trong dự án Android một cách **an toàn, idempotent và không gây lỗi build**.

---

## 1. Input / Output

### Input
| Thành phần | Mô tả |
|---|---|
| **Base file** | `res/values/strings.xml` (ngôn ngữ gốc, thường là English) — đây là **single source of truth** |
| **Locale folders** | Các thư mục đã tồn tại trong `res/`, ví dụ: `values-es-rES`, `values-fr-rFR`, `values-ja`, `values-vi`, ... |

### Output
- Với **mỗi** thư mục `values-xx[-rYY]` đang tồn tại:
  - Nếu chưa có `strings.xml` → **tạo mới**.
  - Nếu đã có → **chỉ thêm các key còn thiếu** (không động vào key đã dịch).

---

## 2. Core Logic

1. **Tự động phát hiện** tất cả locale folder trong `res/` — **KHÔNG** dùng danh sách hardcode.
   - Quét theo pattern: `values-<lang>` hoặc `values-<lang>-r<REGION>`.
2. Parse `res/values/strings.xml` làm tập key chuẩn (base keys).
3. Với mỗi locale:
   - Đọc `strings.xml` hiện có (nếu có) → lấy danh sách key đã dịch.
   - Tính `missing = base_keys − existing_keys`.
   - Chỉ dịch và ghi các key trong `missing`.

```
base_keys ─┐
           ├─► missing = base_keys − existing_keys ─► translate(missing) ─► merge & write
locale ────┘
```

---

## 3. Translation Rules

### 3.1. Bỏ qua key không dịch
- **Skip** mọi `<string>` có `translatable="false"`.
- Không copy các key này sang file locale.

```xml
<!-- Bỏ qua, không dịch, không copy -->
<string name="app_version" translatable="false">1.0.0</string>
```

### 3.2. Không ghi đè bản dịch sẵn có
- Nếu key đã tồn tại trong file locale → **giữ nguyên**, tuyệt đối không overwrite.

### 3.3. Giữ nguyên placeholder & format
Phải bảo toàn **chính xác** các thành phần sau (không dịch, không đổi thứ tự index):

| Loại | Ví dụ |
|---|---|
| String/Digit format | `%s`, `%d`, `%f` |
| Positional args | `%1$s`, `%2$d` |
| Xuống dòng | `\n`, `\t` |
| HTML tags | `<b>`, `<i>`, `<u>`, `<a href="...">` |
| CDATA | `<![CDATA[ ... ]]>` |

> ⚠️ Với chuỗi có **nhiều** placeholder, BẮT BUỘC dùng dạng positional (`%1$s`, `%2$d`) — vì ngữ pháp các ngôn ngữ khác nhau có thể đảo thứ tự.

### 3.4. Không dịch ký tự đặc biệt
- Giữ nguyên: `%`, `$`, `@`, `#`.

### 3.5. Escape ký tự bắt buộc (Android XML)
| Ký tự gốc | Sau khi escape |
|---|---|
| `'` (single quote) | `\'` |
| `"` (double quote) | `\"` |
| `&` | `&amp;` |
| `<` | `&lt;` |
| `>` | `&gt;` |
| `@` (đầu chuỗi) | `\@` |
| `?` (đầu chuỗi) | `\?` |

> Lưu ý: với chuỗi có dấu `'` mà **không** escape sẽ gây lỗi compile resource.

### 3.6. Giữ nguyên key
- **KHÔNG** đổi tên `name` của bất kỳ `<string>`/`<plurals>`/`<string-array>` nào.

---

## 4. Output Format

- XML hợp lệ cho Android (`<resources>` là root tag).
- Encoding **UTF-8**.
- Indentation nhất quán (4 spaces khuyến nghị).
- Có khai báo header:

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="welcome_message">¡Bienvenido a la aplicación!</string>
    <string name="greeting">Hola, %1$s. Tienes %2$d mensajes nuevos.</string>
    <string name="cant_undo">Esta acción no se puede deshacer</string>
</resources>
```

---

## 5. Translation Quality

- Dịch **tự nhiên, theo ngữ cảnh** — không dịch word-by-word.
- Tone phù hợp **UI ứng dụng mobile**: ngắn gọn, thân thiện, đúng thuật ngữ nền tảng.
- Tôn trọng quy ước ngôn ngữ đích (ví dụ: tiếng Đức thường dài hơn → cân nhắc UI).
- Dùng đúng register: ngôi xưng hô (formal/informal) thống nhất trong toàn app.

---

## 6. Idempotency (QUAN TRỌNG)

Script/process phải **chạy lại nhiều lần an toàn**:

- ✅ Key đã dịch → **không thay đổi** giữa các lần chạy.
- ✅ Chỉ dịch các key **còn thiếu**.
- ✅ Output ổn định (thứ tự key nên bám theo base file để diff sạch).
- ❌ Không re-translate, không sinh nội dung khác nhau giữa 2 lần chạy với cùng input.

---

## 7. Tránh trùng lặp Resource Name

Mỗi `<string name="...">` phải **duy nhất** trong một `strings.xml`.

| Tình huống | Xử lý |
|---|---|
| Key đã có trong base file | KHÔNG tạo lại key mới |
| Update file locale | Chỉ **thêm key thiếu**, không redefine key đã có |
| Phát hiện key trùng | Giữ entry đúng (khớp base), **xóa/merge** entry dư |
| Đồng bộ tập key | Mọi locale phải có **cùng tập key** với base file |

> Resource name trùng → **build error** hoặc **ghi đè giá trị bất ngờ lúc runtime**.

**Mục tiêu:** đảm bảo ánh xạ **1-1** giữa key của tất cả locale và base file.

---

## 8. Pipeline khuyến nghị (pseudo-flow)

```text
1. parse base_strings = parse("res/values/strings.xml")
2. base_keys = { name | translatable != false }
3. locales   = detect_locale_dirs("res/")           # tự động
4. for locale in locales:
5.     existing = parse_if_exists(locale/strings.xml)
6.     dedupe(existing)                              # gộp key trùng
7.     missing  = base_keys − keys(existing)
8.     translated = translate(missing, target=locale)  # natural, giữ placeholder
9.     escape_xml(translated)                         # ', ", &, <, >
10.    merged   = existing ∪ translated               # không overwrite
11.    order_by(base_keys)                            # diff sạch
12.    write_utf8(locale/strings.xml, merged)
```

---

## 9. Checklist trước khi commit

- [ ] Mọi locale có **đủ** key như base (1-1 mapping).
- [ ] Không có key trùng trong từng file.
- [ ] Không overwrite bản dịch cũ.
- [ ] Placeholder `%1$s`, `%2$d`, `\n`, HTML giữ nguyên.
- [ ] Đã escape `'`, `"`, `&`, `<`, `>`.
- [ ] Bỏ qua `translatable="false"`.
- [ ] File UTF-8, `<resources>` root, format nhất quán.
- [ ] Build pass, không cảnh báo "duplicate resources".