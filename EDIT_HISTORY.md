# Lịch sử chỉnh sửa — 06/10/2026

Phạm vi: rà soát logic ứng dụng Nuxt, sửa lỗi gallery/thumbnail ở trang chủ và chi tiết sản phẩm, cấu hình SEO và AdSense, bổ sung kiểm thử. Chỉ sửa các lỗi có căn cứ trong code; những quy tắc chưa rõ được ghi ở phần cần xác minh. Không chạy migration/reset database, không triển khai lên production và không gọi thanh toán/gửi email thật.

## 1. Gallery và giao diện

- Thêm `app/components/ProductGallery.vue`, dùng chung ở `app/pages/index.vue` và `app/pages/model/[alias].vue`.
- Giới hạn chiều rộng ở từng tầng grid/card/wrapper/carousel bằng `min-w-0`; sửa grid nội bộ card ở desktop. Đây là nguyên nhân card có nhiều ảnh tự mở rộng ra ngoài cột.
- Trang chủ dùng bộ đếm ảnh và nút trước/sau, thay dãy chấm kéo dài theo số ảnh. Trang detail có dãy thumbnail cuộn ngang riêng, thumbnail không bị co nhỏ, tự cuộn đến ảnh được chọn. Chọn thumbnail nhảy thẳng tới slide để không phải chạy animation qua hàng chục ảnh.
- Chỉ số ảnh lấy từ sự kiện chọn của carousel; bỏ cách tự tăng/giảm có thể lệch khi kéo ảnh hoặc đến đầu/cuối danh sách.
- Ảnh có khung vuông, `object-contain`, kích thước khai báo và alt theo sản phẩm. Hỗ trợ 0 ảnh/1 ảnh/nhiều ảnh; ảnh chưa cần hiển thị dùng lazy loading.
- `app/app.config.ts`: một cột trên điện thoại nhỏ, giữ nhiều cột ở màn hình lớn. Hai cột trước đây làm nút mua hàng tràn ở 360px.
- Trang chủ có link sản phẩm thật, key theo publicId, bỏ lớp phủ chặn thao tác carousel; sửa nhãn “Download free”/“Buy now”.
- `app/layouts/default.vue`, `console.vue`, `console2.vue`: dùng slot nhận nội dung từ `app.vue`, tránh đặt thêm NuxtPage trong layout.

## 2. Giỏ hàng, đơn hàng và thanh toán

- `server/core/service/cart.ts`: xóa giỏ chỉ xóa dòng chưa gắn đơn hàng (`orderId: null`), giữ lịch sử mua hàng và quyền tải file.
- `server/core/service/order.ts`: checkout không nhận danh sách rỗng, sản phẩm không ACTIVE, dòng của người khác hoặc dòng đã thuộc đơn. Dùng transaction và cập nhật có điều kiện để hai checkout không cùng lấy một dòng giỏ. Tổng tiền và giá dòng lấy từ giá hiện tại của sản phẩm trên server.
- Các màn hình/API xem đơn lấy giá đã lưu ở dòng đơn, thay vì giá catalogue có thể đã đổi sau khi mua.
- `server/api/order/cancel.ts`: bắt buộc đăng nhập; chỉ chủ đơn hoặc admin được hủy. Service chỉ hủy đơn PENDING bằng cập nhật có điều kiện.
- `server/api/payment/free.ts`: kiểm tra chủ đơn, giá bằng 0 và trạng thái; hỗ trợ gọi lại đơn đã thanh toán mà không gửi mail lặp. Chỉ chuyển PAID một lần. Lỗi email không xóa trạng thái thanh toán/quyền thư viện.
- `server/core/service/sepay.ts`, `server/api/payment/sepay/bank.get.ts`: kiểm tra chủ đơn và chỉ tạo checkout cho đơn PENDING. Escape các giá trị nhúng trong form HTML.
- `server/utils/payment-redirects.ts`, `shared/schemas/payment.ts`: kiểm tra URL chuyển hướng và giới hạn về origin của website hoặc request.
- `server/api/payment/sepay/ipn.post.ts`: chờ lưu thanh toán trước khi trả thành công, ghi trạng thái và payment trong cùng transaction, cập nhật có điều kiện để callback trùng không ghi/gửi lặp, lưu transactionId, tính SENDING là đã thanh toán. Chưa thay đổi cách xác thực webhook và cách quy đổi tỷ giá; xem phần cần xác minh.
- Gửi email yêu cầu đơn đã thanh toán. SMTP lỗi không còn bị nuốt rồi đánh dấu DELIVERED. Endpoint admin đợi tác vụ gửi hoàn tất. Email FREE không cần file DESIGN; email chứa link ngoài của sản phẩm FREE và link thư viện, thay lời hứa đính kèm file khi code thực tế không đính kèm.
- `app/pages/payment.vue`: bỏ việc dùng `status=success` trong query để tự coi đơn đã trả tiền. Trạng thái lấy từ API server.
- `app/composables/useCart.ts`: chặn request thêm giỏ khi chưa đăng nhập, sửa đường dẫn payment tuyệt đối, bỏ điều hướng dùng sai object response; số lượng giỏ dùng useState riêng cho phiên Nuxt.
- `app/pages/cart.vue`: tổng tiền tính từ lựa chọn thực tế; chọn/bỏ chọn lặp không cộng/trừ sai; chỉ bỏ sản phẩm trên UI sau khi xóa thành công.
- `app/pages/library.vue`: đợi request tải file trước khi bỏ loading; mở link ngoài với noopener/noreferrer.

## 3. Quyền truy cập và lỗi có căn cứ khác

- `server/core/service/product.ts`: thực sự từ chối tải DESIGN khi người dùng chưa mua (trước đây gọi kiểm tra nhưng bỏ kết quả). Cho phép xóa hết category qua mảng rỗng; kiểm tra plan/link mới khi kích hoạt hoặc sửa sản phẩm đang ACTIVE.
- `server/middleware/auth.ts`: request console chưa có cookie không còn đi qua nhánh return sớm; tài khoản LOCKED không được gắn auth context. Luồng đăng nhập Google cũng từ chối user LOCKED.
- `server/utils/event-wrapped.ts`: giữ status của lỗi H3 như 400/401/404/409, thay vì biến tất cả thành 500.
- `server/api/category/add.post.ts`: kiểm tra trùng alias trên bảng category; loại tag trùng trong một request.
- `server/api/summary/index.ts`: tổng doanh thu không bị nhân với số dòng cart. Ví dụ đơn $10 gồm hai sản phẩm trước đây được cộng $20; nay cộng $10, vẫn đếm đủ hai sản phẩm.
- `server/core/service/s3.ts`: chuỗi cấu hình `"false"` không còn bị Boolean(...) chuyển thành true.
- `server/core/service/mail.ts`: parse đúng port dạng chuỗi và boolean secure; bỏ tự kết nối SMTP chỉ vì import module.
- `server/plugins/init.ts`: bỏ in mật khẩu/key/client secret ra log. `server/core/execute/backupsql.ts`: dùng execFile/arguments và PGPASSWORD trong env, bỏ ghép shell và bỏ log command chứa mật khẩu.
- `app/composables/useProductImport/index.ts`: mảng errors rỗng không còn làm import Excel hợp lệ bị từ chối; xử lý objects có thể undefined.
- `app/components/btn/Google.vue`: không khởi tạo SDK khi chưa có Google client ID.
- Các sửa type-only import, type bảng console, khai báo API directory iteration, guard lỗi validation và kiểu response phục vụ typecheck. Client API dùng ofetch trực tiếp để tránh kiểu route Nuxt gây stack depth khi compile TypeScript.

## 4. SEO

- `nuxt.config.ts`, `app/app.vue`: origin production qua `NUXT_PUBLIC_SITE_URL`, canonical tuyệt đối không kèm query, lang=en phù hợp nội dung hiện tại, Open Graph/Twitter metadata và mã xác minh Search Console tùy chọn.
- Home/detail/about có title, mô tả và H1. About bổ sung văn bản render từ server, thay vì chỉ có ảnh ClientOnly.
- Detail fetch theo alias reactive, phân biệt lỗi tải server với 404; ảnh OG dùng URL tuyệt đối và có fallback.
- JSON-LD WebSite trên home, Product/Offer trên detail dựa trên tên/ảnh/giá thực tế; không tạo rating/review giả. Detail không ACTIVE mà người đã mua vẫn xem được sẽ có noindex và không có Product JSON-LD.
- `server/routes/sitemap.xml.get.ts`: sitemap có home/about và sản phẩm ACTIVE, lastmod theo updatedAt, URL/XML được encode/escape.
- Thay `public/robots.txt` bằng route `server/routes/robots.txt.get.ts`: thêm sitemap, loại đường dẫn tài khoản/console/API khỏi crawling. Trang riêng có thêm noindex qua metadata/header; không dùng robots như cơ chế bảo mật.
- Giới hạn sitemap hiện tại: tối đa 49.998 sản phẩm + 2 trang. Nếu catalogue vượt mức này cần sitemap index/phân trang, không nên để bản hiện tại làm sitemap duy nhất.

## 5. AdSense — cấu hình để bạn điền

Trong môi trường chạy ứng dụng:

```dotenv
NUXT_PUBLIC_SITE_URL=https://3d2ds.com
NUXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
NUXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
NUXT_PUBLIC_ADSENSE_ENABLED=true
```

Thay X bằng 16 chữ số publisher ID thực của bạn; không dán nguyên HTML/script vào biến này. Mặc định ID rỗng và ENABLED=false nên chưa tải quảng cáo.

- `app/plugins/adsense.client.ts`: tải script AdSense chính thức dạng async một lần khi vào home/about/detail, kiểm tra ID hợp lệ trước khi tải.
- `server/routes/ads.txt.get.ts`: sinh ads.txt từ cùng publisher ID; trả 404 khi chưa cấu hình ID hợp lệ.
- `env-example.txt`: thêm các biến và hướng dẫn.
- Sau khi cập nhật env, restart container/process. Bật Auto ads và thiết lập page exclusions trong tài khoản AdSense nếu cần; script đã tải có thể tiếp tục tồn tại khi chuyển trang SPA. Chưa thử quảng cáo thật vì chưa có publisher ID/tài khoản AdSense của bạn.

Tài liệu đã đối chiếu: [Google SEO](https://developers.google.com/search/docs/fundamentals/get-started-developers), [canonical](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [Product structured data](https://developers.google.com/search/docs/appearance/structured-data/product-snippet), [sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [AdSense code](https://support.google.com/adsense/answer/9274634?hl=en), [ads.txt](https://support.google.com/adsense/answer/12171612?hl=en).

## 6. Kiểm thử và cách chạy lại

- `pnpm test`: 33/33 đạt, dùng mock cho Prisma/S3/SMTP và tỷ giá. Bao gồm checkout, quyền tải/hủy/thanh toán, callback trùng, email lỗi, giá lịch sử, sitemap/robots/ads.txt. Truy vấn tổng doanh thu chạy với SQLite fixture; chỉ đổi cú pháp EXTRACT/cast của PostgreSQL khi kiểm thử.
- `pnpm typecheck`: đạt, có vue-tsc kiểm tra file Vue và TypeScript.
- `pnpm build`: production build đạt. Nix cần PRISMA_QUERY_ENGINE_LIBRARY trỏ engine trong shell.nix; không đổi Prisma schema/engine architecture. Build có warning dữ liệu Browserslist cũ, sourcemap Tailwind, provider Google Fonts không truy cập được trong môi trường test và nhận diện OpenSSL trên Nix.
- Chrome headless: 16 tổ hợp page/viewport cho index, detail 0/1/60 ảnh ở 360/768/1280/1920px; kiểm tra không tràn ngang, chọn thumbnail cuối, điều hướng carousel và chuyển trang SPA home/detail/home, không có browser exception, HTML SSR canonical/OG/JSON-LD và 404. Dữ liệu/ảnh là fixture, không phải catalogue thật.
- Production Nitro smoke test với env giả, NODE_ENV=test để không chạy backup: robots/ads.txt trả 200; console, giỏ, hủy đơn, thanh toán free/bank và tải DESIGN chưa đăng nhập trả 401.
- `git diff --check`: đạt.

Sau khi cài dependency và generate Prisma client:

```sh
pnpm test
pnpm typecheck
pnpm build
```

Môi trường Nix: chạy trong `nix-shell shell.nix` để có các biến engine. Client có thể generate với DATABASE_URL giả cho build/test; không cần chạy migrate/reset.

Test trình duyệt tách riêng database/backend thật:

```sh
pnpm test:browser:serve
# Ở terminal khác, khởi động Chrome headless với remote-debugging-port=9229.
# Sau đó:
pnpm test:browser
```

Server test dùng port 4012; có thể đổi TEST_ORIGIN và CHROME_DEBUG_ORIGIN trong script browser. Test logic có một trường hợp SQL cần python3 (sqlite3 chuẩn). Không chạy giao dịch thanh toán thật hoặc thao tác database thật trong các test này.

Ảnh và số đo đã lưu: [index desktop](review-artifacts/1280-index.png), [detail 60 ảnh trên mobile](review-artifacts/360-detail.png), [16 bộ số đo](review-artifacts/results.json), [kết quả kiểm thử](review-artifacts/verification.txt).

## 7. Những phần cần xác minh, chưa tự đổi nghiệp vụ

- **Webhook SePay:** chưa thấy bước xác thực sender/chữ ký trong handler hiện tại. Cần đối chiếu cấu hình gateway/proxy và quy tắc secret của tài khoản đang dùng. Đây là điểm ưu tiên xác minh trước production; kiểm thử callback hiện tại chỉ kiểm tra logic bằng payload giả, không chứng minh request đến từ SePay.
- **Tỷ giá thanh toán:** checkout và IPN gọi tỷ giá ở hai thời điểm khác nhau. Chưa có snapshot số VND đã gửi sang gateway trong order/payment; chưa tự chọn cách lưu hoặc xử lý chênh lệch. Chính sách đơn CANCELLED nhưng gateway báo đã trả tiền, TRANSACTION_VOID/refund cũng chưa rõ và chưa đổi.
- **Endpoint legacy `/api/order/create`:** schema truyền product_publicIds nhưng service hiện nhận cart IDs, và không tìm thấy UI đang dùng endpoint này. Chỉ sửa wrapper bắt buộc auth; giữ contract hiện tại, chưa tự chọn giữa tạo giỏ mới hay checkout giỏ có sẵn. Luồng chính `/api/shopping/cart/checkout` đã được sửa và kiểm thử.
- **FREE/PRO/discountPrice/currency:** chưa áp quy tắc giá FREE=0 hay discountPrice vì không có đặc tả giá/giảm giá. Field tiền hiện dùng Float; chưa đổi schema.
- **Soft delete và storage:** code hiện có thể xóa file của sản phẩm đã bán. Chưa tự đổi chính sách giữ file, purge hoặc quyền người đã mua; cần xác nhận trước khi dùng chức năng clean. Việc xóa storage/database chưa có cơ chế bù trừ khi một bên lỗi.
- **Xóa category có tags:** cần kiểm chứng chính sách xóa/reassign tags và FK trên DB thực. Chưa tự xóa tags thay người dùng.
- **Import hàng loạt:** lifecycle upload/retry/rollback còn cần kiểm tra với MinIO thật; chưa tự thiết kế lại việc tạo sản phẩm, trạng thái success và retry upload.
- Không có môi trường DB/Google OAuth/SMTP/MinIO/SePay/AdSense thực được cấu hình trong workspace kiểm thử. Chưa kiểm chứng checkout đồng thời trên PostgreSQL thật, email thật, download presigned URL thật, OAuth thật, Docker build hoặc quảng cáo thật. Mock test không thay thế các integration test này.

## 8. Danh sách file

Danh sách file tại thời điểm chốt thay đổi. Các file chỉ sửa import/type không đổi nghiệp vụ.

- `.gitignore`
- `Dockerfile`
- `EDIT_HISTORY.md`
- `README.md`
- `app/app.config.ts`
- `app/app.vue`
- `app/components/ProductGallery.vue`
- `app/components/btn/Google.vue`
- `app/components/filter/Models.vue`
- `app/components/filter/Plans.vue`
- `app/composables/useCart.ts`
- `app/composables/useProductImport/index.ts`
- `app/layouts/console.vue`
- `app/layouts/console2.vue`
- `app/layouts/default.vue`
- `app/pages/about.vue`
- `app/pages/cart.vue`
- `app/pages/console/index.vue`
- `app/pages/console/orders.vue`
- `app/pages/console/v2/products.vue`
- `app/pages/index.vue`
- `app/pages/library.vue`
- `app/pages/model/[alias].vue`
- `app/pages/payment.vue`
- `app/plugins/adsense.client.ts`
- `app/plugins/api.ts`
- `app/types/file-system.d.ts`
- `env-example.txt`
- `nuxt.config.ts`
- `package.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `public/robots.txt` — thay bằng server route
- `review-artifacts/1280-index.png`
- `review-artifacts/360-detail.png`
- `review-artifacts/results.json`
- `review-artifacts/verification.txt`
- `server/api/auth/google/verify-code.post.ts`
- `server/api/auth/google/verify-id-token.post.ts`
- `server/api/category/add.post.ts`
- `server/api/category/reference.ts`
- `server/api/option/all.ts`
- `server/api/order/cancel.ts`
- `server/api/order/create.post.ts`
- `server/api/order/list.ts`
- `server/api/order/send.post.ts`
- `server/api/payment/free.ts`
- `server/api/payment/sepay/bank.get.ts`
- `server/api/payment/sepay/ipn.post.ts`
- `server/api/product/add.post.ts`
- `server/api/product/file/upload.post.ts`
- `server/api/product/list.ts`
- `server/api/product/purchased-by-user.ts`
- `server/api/shopping/order/[id].get.ts`
- `server/api/storage/all.ts`
- `server/api/summary/index.ts`
- `server/api/user/data.ts`
- `server/core/execute/backupsql.ts`
- `server/core/service/auth.ts`
- `server/core/service/cart.ts`
- `server/core/service/mail.ts`
- `server/core/service/order.ts`
- `server/core/service/product.ts`
- `server/core/service/s3.ts`
- `server/core/service/sepay.ts`
- `server/middleware/auth.ts`
- `server/plugins/init.ts`
- `server/routes/ads.txt.get.ts`
- `server/routes/data/categories.ts`
- `server/routes/data/product/[alias].ts`
- `server/routes/data/products.ts`
- `server/routes/robots.txt.get.ts`
- `server/routes/sitemap.xml.get.ts`
- `server/utils/event-wrapped.ts`
- `server/utils/helpers/validate-request.ts`
- `server/utils/payment-redirects.ts`
- `shared/schemas/cart.ts`
- `shared/schemas/payment.ts`
- `shared/types/product.ts`
- `shared/utils/site.ts`
- `tests/browser-fixture/nuxt.config.ts`
- `tests/browser-fixture/server/routes/data/categories.get.ts`
- `tests/browser-fixture/server/routes/data/product/[alias].get.ts`
- `tests/browser-fixture/server/routes/data/products.get.ts`
- `tests/browser-regression.mjs`
- `tests/logic.test.ts`
- `tests/production-smoke.mjs`
- `tests/tsconfig.json`
