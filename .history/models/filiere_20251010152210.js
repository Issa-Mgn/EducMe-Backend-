import { supabase } from '../config/supabase.js';

export const getAllFilieres = async () => {
  const { data, error } = await supabase
    .from('filiere')
    .select('*');
  if (error) throw error;
  return data;
};

export const getFiliereById = async (id) => {
  const { data, error } = await supabase
    .from('filiere')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
};