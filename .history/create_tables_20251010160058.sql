-- Créer la table filiere
CREATE TABLE filiere (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL
);

-- Créer la table documents
CREATE TABLE documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  filiereId uuid REFERENCES filiere(id) ON DELETE CASCADE,
  nomDoc text NOT NULL,
  matiere text NOT NULL,
  niveau text,
  annee text,
  description text,
  fichiers jsonb,
  datePublication timestamp with time zone DEFAULT now()
);