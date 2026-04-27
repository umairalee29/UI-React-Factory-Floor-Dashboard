import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getSocket } from '../services/socket.js';
import { updateMachinesFromSocket } from '../store/slices/machinesSlice.js';
import type { AppDispatch } from '../store/index.js';
import type { Machine } from '../types.js';
import useAuth from './useAuth.js';

export default function useSocket(): void {
  const dispatch = useDispatch<AppDispatch>();
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    const socket = getSocket(token);

    const handleMachineUpdate = (machines: Machine[]): void => {
      dispatch(updateMachinesFromSocket(machines));
    };

    socket.on('machine:update', handleMachineUpdate);

    return () => {
      socket.off('machine:update', handleMachineUpdate);
    };
  }, [token, dispatch]);
}
