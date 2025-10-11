import { supabase } from '../config/supabase.js';

export const getAllFilieres = async () => {
  console.log('Fetching all filieres');
  const { data, error } = await supabase
    .from('filière')
    .select('*');
  if (error) {
    console.error('Error fetching filieres:', error);
    throw error;
  }
  console.log('Filieres data:', data);
  return data;
};

export const getFiliereById = async (id) => {
  const { data, error } = await supabase
    .from('filière')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
};