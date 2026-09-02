import { storage } from '#imports';
import type { Loop, LoopStatus } from '@/types/loop';

export const loopsStorage = storage.defineItem<Loop[]>('local:loops', {
  fallback: [],
  version: 1,
});

export async function saveLoop(loop: Loop) {
  const existingLoops = await loopsStorage.getValue();

  await loopsStorage.setValue([...existingLoops, loop]);
}

export async function getLoops(): Promise<Loop[]> {
  return loopsStorage.getValue();
}

export async function getWaitingLoops(): Promise<Loop[]> {
  const loops = await loopsStorage.getValue();

  return loops.filter((loop) => loop.status === 'waiting');
}

export async function getActiveLoops(): Promise<Loop[]> {
  const loops = await loopsStorage.getValue();

  return loops.filter((loop) => loop.status === 'active');
}

export async function getArchivedLoops(): Promise<Loop[]> {
  const loops = await loopsStorage.getValue();

  return loops.filter((loop) => loop.status === 'archived');
}

export async function deleteLoop(id: string): Promise<boolean> {
  const loops = await loopsStorage.getValue();

  const updatedLoops = loops.filter((loop) => loop.id !== id);

  if(updatedLoops.length === loops.length) {
    return false;
  }

  await loopsStorage.setValue(updatedLoops);

  return true;
}

export async function getLoopById(id: string): Promise<Loop | undefined> {
  const loops = await loopsStorage.getValue();

  return loops.find((loop) => loop.id === id);
}

export async function updateLoop(
  id: string,
  updates: Partial<Loop>,
): Promise<Loop | undefined> {
  const loops = await loopsStorage.getValue();

  let updatedLoop: Loop | undefined;

  const updatedLoops = loops.map((loop) => {
    if (loop.id !== id) {
      return loop;
    }

    updatedLoop = {
      ...loop,
      ...updates,
    };

    return updatedLoop;
  });

  await loopsStorage.setValue(updatedLoops);

  return updatedLoop;
}

export async function updateLoopStatus(id: string, status: LoopStatus) {
  await updateLoop(id, {
    status,
  });
}