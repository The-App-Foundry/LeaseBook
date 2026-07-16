import { invoke } from '@tauri-apps/api/core';
import { Manager } from '../types/lease';

const getManagers = async (leaseId: number): Promise<Manager[]> => {
  const managers: Manager[] = await invoke('managers', { lease_id: leaseId });

  return managers;
};

export default getManagers;
