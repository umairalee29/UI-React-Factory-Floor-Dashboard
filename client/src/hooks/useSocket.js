import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getSocket } from '../services/socket.js';
import { updateMachinesFromSocket } from '../store/slices/machinesSlice.js';
import useAuth from './useAuth.js';

export default function useSocket() {
  const dispatch = useDispatch();
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    const socket = getSocket(token);

    const handleMachineUpdate = (machines) => {
      dispatch(updateMachinesFromSocket(machines));
    };

    socket.on('machine:update', handleMachineUpdate);

    return () => {
      socket.off('machine:update', handleMachineUpdate);
    };
  }, [token, dispatch]);
}
