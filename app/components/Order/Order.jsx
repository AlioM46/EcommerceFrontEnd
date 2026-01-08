"use client";

import Button from "../Button/Button";
import "../Orders/Orders.css";
import { enOrderStatus } from "@/app/utils/roles";

const Order = ({ order }) => {


  return (
    <tr>
      <td>#{order.id}</td>
      <td>{new Date(order.created_at).toLocaleDateString()}</td>
      <td className={enOrderStatus[order.status] || "Unknown"} >{enOrderStatus[order.status] || "Unknown"}</td>
      <td>${order.total_price}</td>
      <td className={enOrderStatus[order.status] || "Unknown"}>{order.payment?.status || "Unknown"}</td>
      <td>

<Button>
          <a href={`/orders/${order.id}`} >
          View Details
        </a>
</Button>
      </td>
    </tr>
  );
};

export default Order;