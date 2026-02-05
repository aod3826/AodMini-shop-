export function formatPrice(price: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
  }).format(price);
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatShortDate(date: string): string {
  return new Intl.DateTimeFormat('th-TH', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-blue-100 text-blue-800',
    shipping: 'bg-indigo-100 text-indigo-800',
    completed: 'bg-green-100 text-green-800',
    problem: 'bg-red-100 text-red-800',
  };

  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getStatusText(status: string): string {
  const texts: Record<string, string> = {
    pending: 'รอชำระเงิน',
    paid: 'ชำระเงินแล้ว',
    shipping: 'กำลังจัดส่ง',
    completed: 'สำเร็จ',
    problem: 'มีปัญหา',
  };

  return texts[status] || status;
}
