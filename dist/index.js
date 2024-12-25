"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const prisma_1 = require("./lib/prisma");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*", // السماح بالوصول من أي مصدر (يمكنك تخصيصه).
    },
});
const PORT = 3000;
// السماح للخادم بقراءة JSON
app.use(express_1.default.json());
// Middleware للوصول لكل طلب
app.use((req, res, next) => {
    console.log(`تم استلام طلب: ${req.method} على الرابط ${req.url}`);
    next();
});
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json(`hello`);
}));
///////////////////////////////
// CRUD Operations for Users //
///////////////////////////////
// إنشاء مستخدم جديد
app.post("/api/users", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma_1.prisma.user.create({
            data: req.body,
        });
        res.json({ message: "تم إضافة المستخدم!", user });
        io.emit("user_created", user); // بث تحديث للمستخدمين
    }
    catch (error) {
        res.status(500).json({ error: "حدث خطأ أثناء إضافة المستخدم." });
    }
}));
// قراءة جميع المستخدمين
app.get("/api/users", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma_1.prisma.user.findMany();
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ error: "حدث خطأ أثناء جلب المستخدمين." });
    }
}));
// قراءة مستخدم واحد
app.get("/api/users/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma_1.prisma.user.findUnique({
            where: { id: parseInt(req.params.id) },
        });
        if (!user)
            return res.status(404).json({ error: "المستخدم غير موجود." });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: "حدث خطأ أثناء جلب المستخدم." });
    }
}));
// تحديث مستخدم
app.put("/api/users/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma_1.prisma.user.update({
            where: { id: parseInt(req.params.id) },
            data: req.body,
        });
        res.json({ message: "تم تحديث المستخدم!", user });
        io.emit("user_updated", user); // بث تحديث للمستخدمين
    }
    catch (error) {
        res.status(500).json({ error: "حدث خطأ أثناء تحديث المستخدم." });
    }
}));
// حذف مستخدم
app.delete("/api/users/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma_1.prisma.user.delete({
            where: { id: parseInt(req.params.id) },
        });
        res.json({ message: "تم حذف المستخدم!" });
        io.emit("user_deleted", req.params.id); // بث حذف للمستخدمين
    }
    catch (error) {
        res.status(500).json({ error: "حدث خطأ أثناء حذف المستخدم." });
    }
}));
/////////////////////////////////
// CRUD Operations for Products //
/////////////////////////////////
app.post("/api/products", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield prisma_1.prisma.product.create({
            data: req.body,
        });
        res.json({ message: "تم إضافة المنتج!", product });
        io.emit("product_created", product);
    }
    catch (error) {
        res.status(500).json({ error: "حدث خطأ أثناء إضافة المنتج." });
    }
}));
app.get("/api/products", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield prisma_1.prisma.product.findMany();
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ error: "حدث خطأ أثناء جلب المنتجات." });
    }
}));
app.get("/api/products/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield prisma_1.prisma.product.findUnique({
            where: { id: parseInt(req.params.id) },
        });
        if (!product)
            return res.status(404).json({ error: "المنتج غير موجود." });
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ error: "حدث خطأ أثناء جلب المنتج." });
    }
}));
app.put("/api/products/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield prisma_1.prisma.product.update({
            where: { id: parseInt(req.params.id) },
            data: req.body,
        });
        res.json({ message: "تم تحديث المنتج!", product });
        io.emit("product_updated", product);
    }
    catch (error) {
        res.status(500).json({ error: "حدث خطأ أثناء تحديث المنتج." });
    }
}));
app.delete("/api/products/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma_1.prisma.product.delete({
            where: { id: parseInt(req.params.id) },
        });
        res.json({ message: "تم حذف المنتج!" });
        io.emit("product_deleted", req.params.id);
    }
    catch (error) {
        res.status(500).json({ error: "حدث خطأ أثناء حذف المنتج." });
    }
}));
// كرر النقاط لـ Order و Review بنفس المنطق.
//////////////////////////
// إعداد Socket.IO
//////////////////////////
io.on("connection", (socket) => {
    console.log("عميل متصل:", socket.id);
    // مثال على رسالة
    socket.on("message", (data) => {
        console.log("الرسالة الواردة:", data);
        socket.emit("response", "تم استقبال الرسالة");
    });
    socket.on("disconnect", () => {
        console.log("تم قطع الاتصال:", socket.id);
    });
});
//////////////////////////
// تشغيل الخادم
//////////////////////////
server.listen(PORT, () => {
    console.log(`الخادم يعمل على http://localhost:${PORT}`);
});
