import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// In USJ Technologies' B2B model there are no orders — customers submit quote
// requests instead. Redirect admins to the quote requests page.
const OrdersAdminPage = () => {
  const navigate = useNavigate();
  useEffect(() => { navigate('/admin/inquiries', { replace: true }); }, [navigate]);
  return null;
};

export default OrdersAdminPage;
