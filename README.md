# 鲜果优选

基于“鲜果优选”管理员版页面整理的 IntelliJ IDEA Java 项目。HTML、CSS、JavaScript 已拆分，Java 提供本机网页服务入口。

## 用 IntelliJ IDEA 打开和运行

1. 安装 JDK 17 或更高版本。
2. 在 IDEA 中打开本项目文件夹（包含 `pom.xml`）。
3. 打开 `src/main/java/cn/xiangguo/store/FruitStoreApplication.java` 并运行 `main` 方法。
4. 浏览器访问 <http://localhost:8080/>。

项目不依赖外部 Java 库。也可以在项目根目录执行 `mvn package`，再运行 `java -jar target/fruit-store-1.0.0.jar`。

## 主要文件

- `src/main/resources/static/index.html`：页面结构
- `src/main/resources/static/styles.css`：页面样式
- `src/main/resources/static/app.js`：商品、购物车、登录注册和订单交互
- `src/main/java/cn/xiangguo/store/FruitStoreApplication.java`：本地网页服务入口

## 发布到 GitHub Pages

仓库公开后，`.github/workflows/pages.yml` 会在推送到 `main` 分支时自动发布网页。首次发布时，在 GitHub 仓库的 Settings → Pages 中将 Build and deployment 的 Source 设为 GitHub Actions。网页文件取自 `src/main/resources/static`，之后推送到 `main` 会自动更新。

GitHub Pages 发布的是浏览器前端页面；Java 服务入口用于 IDEA 本机开发。账号、购物车和订单保存在访问者自己的浏览器中，不会在不同用户之间共享。老板演示账号为 `admin`，密码为 `123456`；这是原页面中的纯前端演示账号，不适合真实或线上业务。