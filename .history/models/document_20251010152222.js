import { supabase } from '../config/supabase.js';

export const getAllDocuments = async (filiereId = null) => {
  let query = supabase
    .from('documents')
    .select('*')
    .order('datePublication', { ascending: false });

  if (filiereId) {
    query = query.eq('filiereId', filiereId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getDocumentById = async (id) => {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
};

export const createDocument = async (documentData) => {
  const { data, error } = await supabase
    .from('documents')
    .insert([documentData])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteDocument = async (id) => {
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id);
  if (error) throw error;
};

export const searchDocuments = async (query) => {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .or(`nomDoc.ilike.%${query}%,matiere.ilike.%${query}%,description.ilike.%${query}%`)
    .order('datePublication', { ascending: false });
  if (error) throw error;
  return data;
};