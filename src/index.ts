import express, { Request, Response, NextFunction } from "express";
import { Server } from "socket.io";
import http from "http";
import { prisma } from "./lib/prisma";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // السماح بالوصول من أي مصدر (يمكنك تخصيصه).
  },
});

const PORT = 3000;

// السماح للخادم بقراءة JSON
app.use(express.json());

// Middleware للوصول لكل طلب
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`تم استلام طلب: ${req.method} على الرابط ${req.url}`);
  next();
});

///////////////////////////////
// CRUD Operations for Users //
///////////////////////////////

// إنشاء مستخدم جديد
app.post("/api/users", async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.create({
      data: req.body,
    });
    res.json({ message: "تم إضافة المستخدم!", user });
    io.emit("user_created", user); // بث تحديث للمستخدمين
  } catch (error) {
    res.status(500).json({ error: "حدث خطأ أثناء إضافة المستخدم." });
  }
});

// قراءة جميع المستخدمين
app.get("/api/users", async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "حدث خطأ أثناء جلب المستخدمين." });
  }
});

// قراءة مستخدم واحد
app.get("/api/users/:id", async (req: any, res: any) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!user) return res.status(404).json({ error: "المستخدم غير موجود." });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "حدث خطأ أثناء جلب المستخدم." });
  }
});

// تحديث مستخدم
app.put("/api/users/:id", async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json({ message: "تم تحديث المستخدم!", user });
    io.emit("user_updated", user); // بث تحديث للمستخدمين
  } catch (error) {
    res.status(500).json({ error: "حدث خطأ أثناء تحديث المستخدم." });
  }
});

// حذف مستخدم
app.delete("/api/users/:id", async (req: Request, res: Response) => {
  try {
    await prisma.user.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json({ message: "تم حذف المستخدم!" });
    io.emit("user_deleted", req.params.id); // بث حذف للمستخدمين
  } catch (error) {
    res.status(500).json({ error: "حدث خطأ أثناء حذف المستخدم." });
  }
});

/////////////////////////////////
// CRUD Operations for Products //
/////////////////////////////////

app.post("/api/products", async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.create({
      data: req.body,
    });
    res.json({ message: "تم إضافة المنتج!", product });
    io.emit("product_created", product);
  } catch (error) {
    res.status(500).json({ error: "حدث خطأ أثناء إضافة المنتج." });
  }
});

app.get("/api/products", async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "حدث خطأ أثناء جلب المنتجات." });
  }
});

app.get("/api/products/:id", async (req: any, res: any) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!product) return res.status(404).json({ error: "المنتج غير موجود." });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "حدث خطأ أثناء جلب المنتج." });
  }
});

app.put("/api/products/:id", async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json({ message: "تم تحديث المنتج!", product });
    io.emit("product_updated", product);
  } catch (error) {
    res.status(500).json({ error: "حدث خطأ أثناء تحديث المنتج." });
  }
});

app.delete("/api/products/:id", async (req: Request, res: Response) => {
  try {
    await prisma.product.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json({ message: "تم حذف المنتج!" });
    io.emit("product_deleted", req.params.id);
  } catch (error) {
    res.status(500).json({ error: "حدث خطأ أثناء حذف المنتج." });
  }
});

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
