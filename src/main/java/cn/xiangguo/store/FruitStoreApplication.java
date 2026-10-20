package cn.xiangguo.store;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.io.InputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.Map;

/** Starts a local web server for the fruit store demo. */
public final class FruitStoreApplication {
    private static final int PORT = 8080;
    private static final Map<String, String> CONTENT_TYPES = Map.of(
            ".html", "text/html; charset=utf-8", ".css", "text/css; charset=utf-8",
            ".js", "text/javascript; charset=utf-8", ".json", "application/json; charset=utf-8",
            ".png", "image/png", ".ico", "image/x-icon");

    private FruitStoreApplication() { }

    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", PORT), 0);
        server.createContext("/", FruitStoreApplication::serveStaticResource);
        server.start();
        System.out.printf("鲜果优选已启动：http://localhost:%d/%n按 Ctrl+C 停止服务。%n", PORT);
    }

    private static void serveStaticResource(HttpExchange exchange) throws IOException {
        if (!"GET".equalsIgnoreCase(exchange.getRequestMethod()) && !"HEAD".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.getResponseHeaders().set("Allow", "GET, HEAD");
            sendText(exchange, 405, "Method Not Allowed");
            return;
        }
        String path = exchange.getRequestURI().getPath();
        if (path == null || path.equals("/")) path = "/index.html";
        if (path.contains("..") || path.contains("\\")) {
            sendText(exchange, 400, "Bad Request");
            return;
        }
        final String resourcePath = path;
        try (InputStream resource = FruitStoreApplication.class.getResourceAsStream("/static" + resourcePath)) {
            if (resource == null) {
                sendText(exchange, 404, "Not Found");
                return;
            }
            byte[] body = resource.readAllBytes();
            String contentType = CONTENT_TYPES.entrySet().stream()
                    .filter(entry -> resourcePath.endsWith(entry.getKey()))
                    .map(Map.Entry::getValue).findFirst().orElse("application/octet-stream");
            exchange.getResponseHeaders().set("Content-Type", contentType);
            exchange.getResponseHeaders().set("X-Content-Type-Options", "nosniff");
            if ("HEAD".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.getResponseHeaders().set("Content-Length", Integer.toString(body.length));
                exchange.sendResponseHeaders(200, -1);
            } else {
                exchange.sendResponseHeaders(200, body.length);
                exchange.getResponseBody().write(body);
            }
        } finally {
            exchange.close();
        }
    }

    private static void sendText(HttpExchange exchange, int status, String message) throws IOException {
        byte[] body = message.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "text/plain; charset=utf-8");
        exchange.sendResponseHeaders(status, body.length);
        exchange.getResponseBody().write(body);
        exchange.close();
    }
}