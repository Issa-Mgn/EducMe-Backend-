-- Créer la table filière
CREATE TABLE filière (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL
);

-- Créer la table documents
CREATE TABLE documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  filiereid uuid REFERENCES filière(id) ON DELETE CASCADE,
  nomdoc text NOT NULL,
  matiere text NOT NULL,
  niveau text,
  annee text,
  description text,
  fichiers jsonb,
  datepublication timestamp with time zone DEFAULT now()
);

-- Insérer des filières d'exemple
INSERT INTO filière (name) VALUES
('Informatique'),
('Mathématiques'),
('Physique'),
('Chimie'),
('Biologie'),
('Économie'),
('Droit'),
('Lettres');