import { create } from 'zustand';
import { Order, DeliveryLocation } from '../types';

interface OrderState {
  currentOrder: Order | null;
  orders: Order[];
  deliveryLocation: DeliveryLocation | null;
  shippingFee: number;
  useManualAddress: boolean;
  setCurrentOrder: (order: Order | null) => void;
  setOrders: (orders: Order[]) => void;
  setDeliveryLocation: (location: DeliveryLocation | null) => void;
  setShippingFee: (fee: number) => void;
  setUseManualAddress: (useManual: boolean) => void;
  resetCheckout: () => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  currentOrder: null,
  orders: [],
  deliveryLocation: null,
  shippingFee: 0,
  useManualAddress: false,

  setCurrentOrder: (order) => set({ currentOrder: order }),
  setOrders: (orders) => set({ orders }),
  setDeliveryLocation: (location) => set({ deliveryLocation: location }),
  setShippingFee: (fee) => set({ shippingFee: fee }),
  setUseManualAddress: (useManual) => set({ useManualAddress: useManual }),

  resetCheckout: () =>
    set({
      deliveryLocation: null,
      shippingFee: 0,
      useManualAddress: false,
    }),
}));
