'use server';

import { Player } from '@/lib/match/types';
import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

type PlayerRow = Omit<Player, 'preferredHeroes'> & { preferred_heroes: string[] };

export async function getPlayers(): Promise<Player[]> {
  try {
    const { data, error } = await supabase.from('players').select('*').order('name');
    if (error) {
      console.error('Error fetching players:', error);
      return [];
    }
    return ((data ?? []) as PlayerRow[]).map((p) => ({
      ...p,
      preferredHeroes: p.preferred_heroes
    })) as Player[];
  } catch (error) {
    console.error('Unexpected error fetching players:', error);
    return [];
  }
}

export async function createPlayer(player: Player): Promise<void> {
  const { preferredHeroes, ...rest } = player;
  const playerData = { ...rest, preferred_heroes: preferredHeroes };

  try {
    const { error } = await supabase.from('players').insert([playerData]);
    if (error) {
      console.error('Error creating player:', error);
      throw new Error('Failed to create player');
    }
  } catch (error) {
    console.error('Unexpected error creating player:', error);
    throw error;
  }

  revalidatePath('/manage');
  revalidatePath('/scrim');
}

export async function updatePlayer(updatedPlayer: Player): Promise<void> {
  const { id, preferredHeroes, ...rest } = updatedPlayer;
  const playerData = { ...rest, preferred_heroes: preferredHeroes };

  try {
    const { error } = await supabase
      .from('players')
      .update(playerData)
      .eq('id', id);

    if (error) {
      console.error('Error updating player:', error);
      throw new Error('Failed to update player');
    }
  } catch (error) {
    console.error('Unexpected error updating player:', error);
    throw error;
  }

  revalidatePath('/manage');
  revalidatePath('/scrim');
}

export async function deletePlayer(playerId: string): Promise<void> {
  try {
    const { error } = await supabase.from('players').delete().eq('id', playerId);
    if (error) {
      console.error('Error deleting player:', error);
      throw new Error('Failed to delete player');
    }
  } catch (error) {
    console.error('Unexpected error deleting player:', error);
    throw error;
  }

  revalidatePath('/manage');
  revalidatePath('/scrim');
}
