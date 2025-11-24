import React, { useEffect, useState } from "react";
import axios from "axios";

const FinancialReport = () => {
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get("/api/admin/report");
        setStats(res.data.stats);
        setTransactions(res.data.transactions);
      } catch (err) {
        setError("Failed to load report");
      }
    };

    fetchReport();
  }, []);

  const currentMonthYear = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    });

  if (error) return <div>{error}</div>;
  if (!stats) return <div>Loading report...</div>;

  return (
    <div style={{ whiteSpace: "pre-wrap", fontFamily: "monospace", padding: "20px" }}>
      <h2>Financial Report: {currentMonthYear}</h2>

      <div>
        <strong>Total Users:</strong> {stats.users}{"\n"}
        <strong>Total Customers:</strong> {stats.total_customers}{"\n"}
        <strong>Total Staff:</strong> {stats.total_staff}{"\n"}
        <strong>Total Rooms:</strong> {stats.total_rooms}{"\n"}
        <strong>Total Bookings:</strong> {stats.total_bookings}{"\n"}
        <strong>Total Completed Transactions:</strong> {stats.total_transactions}{"\n"}
        <strong>Total Revenue:</strong> {stats.total_revenue || 0}{"\n"}
      </div>

      <hr />

      <h3>Transactions</h3>

      {transactions.length === 0 ? (
        <p>No transactions this month.</p>
      ) : (
        <div>
          {transactions.map((t, index) => (
            <div key={index} style={{ marginBottom: "15px" }}>
              {`
              Transaction ID: ${t.id}
              Booking ID: ${t.booking_id}
              Amount: ${t.amount}
              Payment Method: ${t.payment_method}
              Reference: ${t.transaction_ref || "N/A"}
              Date:  ${new Date(t.created_at).toLocaleString()}
              `}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FinancialReport;
