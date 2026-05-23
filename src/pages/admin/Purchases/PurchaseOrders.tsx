import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import AcceptDialog from "@/components/AcceptDialog";

const BASE_API = import.meta.env.VITE_BASE_API;

type Order = {
  userId: string;
  userName: string;
  phoneNumber: string;
  courseId: number;
  courseName: string;
  startTime: string;
  endTime: string;
};

const PurchaseOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const token = localStorage.getItem("adminToken");

  // fetch orders
  useEffect(() => {
    if (!token) {
      toast.error("لا يوجد صلاحيات للدخول (token مفقود)");
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch(`${BASE_API}/UserCourse/GetAllUserCourse`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("فشل في جلب الطلبات");

        const data = await res.json();
        setOrders(data);
      } catch (err: any) {
        toast.error(err.message);
      }
    };

    fetchOrders();
  }, [token]);

  const handleOpenDialog = (order: Order) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  const handleConfirmDialog = async (dates: { startDate: string; endDate: string }) => {
    if (!selectedOrder) return;

    try {
      const res = await fetch(`${BASE_API}/UserCourse/ConfirmUserCourse`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: selectedOrder.userId,
          courseId: selectedOrder.courseId,
          startTime: dates.startDate,
          endTime: dates.endDate,
        }),
      });

      if (!res.ok) throw new Error("فشل في تأكيد الطلب");

      toast.success(`تم قبول ${selectedOrder.userName} في كورس ${selectedOrder.courseName}`);
      setOrders((prev) =>
        prev.filter(
          (order) =>
            !(order.userId === selectedOrder.userId && order.courseId === selectedOrder.courseId)
        )
      );
      setSelectedOrder(null);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // رفض الطلب
  const handleReject = async (order: Order) => {
    try {
      const res = await fetch(`${BASE_API}/UserCourse/RejectUserCourse`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: order.userId,
          courseId: order.courseId,
        }),
      });

      if (!res.ok) throw new Error("فشل في رفض الطلب");

      toast.error(`تم رفض ${order.userName} في كورس ${order.courseName}`);
      setOrders((prev) =>
        prev.filter(
          (o) => !(o.userId === order.userId && o.courseId === order.courseId)
        )
      );
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="container-custom section-padding p-8 mt-16 lg:mt-0 ">
      <h1 className="text-2xl font-arabic-bold text-white pt-8 mb-6 text-right">
        طلبات الشراء
      </h1>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="card-dark max-w-6xl mx-auto"
      >
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-primary text-white">
                <th className="p-3">#</th>
                <th className="p-3">الاسم</th>
                <th className="p-3">الرقم</th>
                <th className="p-3">اسم الكورس</th>
                <th className="p-3">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr
                  key={`${order.userId}-${order.courseId}`}
                  className="border-b border-gray-300 hover:bg-gray-100/10 transition"
                >
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">{order.userName}</td>
                  <td className="p-3">{order.phoneNumber}</td>
                  <td className="p-3">{order.courseName}</td>
                  <td className="p-3 flex justify-center gap-3">
                    <Button
                      onClick={() => handleOpenDialog(order)}
                      className="bg-[#00E632] text-black font-bold flex items-center gap-2 hover:text-white"
                    >
                      <CheckCircle className="w-5 h-5" /> قبول
                    </Button>
                    <Button
                      onClick={() => handleReject(order)}
                      className="bg-[#C30005] text-white font-bold flex items-center gap-2"
                    >
                      <XCircle className="w-5 h-5" /> رفض
                    </Button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-gray-400">
                    لا توجد طلبات شراء حالياً
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {orders.map((order, index) => (
            <div
              key={`${order.userId}-${order.courseId}`}
              className="border border-gray-700 rounded-xl p-4 bg-gray-900 text-white"
            >
              <div className="flex justify-between mb-2">
                <span className="font-bold text-white">#{index + 1}</span>
              </div>
              <p className="mb-1">👤 {order.userName}</p>
              <p className="mb-1">📞 {order.phoneNumber}</p>
              <p className="mb-3">📘 {order.courseName}</p>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleOpenDialog(order)}
                  className="bg-[#00E632] text-black flex-1 "
                >
                  <CheckCircle className="w-4 h-4 mr-1" /> قبول
                </Button>
                <Button
                  onClick={() => handleReject(order)}
                  className="bg-[#C30005] text-white flex-1"
                >
                  <XCircle className="w-4 h-4 mr-1" /> رفض
                </Button>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <p className="text-gray-400 text-center">لا توجد طلبات شراء حالياً</p>
          )}
        </div>
      </motion.div>

      {/* Accept Dialog */}
      <AcceptDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleConfirmDialog}
      />
    </div>
  );
};

export default PurchaseOrders;
