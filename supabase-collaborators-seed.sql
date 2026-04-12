-- Optional: one-time seed for default collaborators (run after supabase-migration-collaborators-fields.sql).
-- Skip or edit if you already manage collaborators in the admin UI.

insert into collaborators (name, title, affiliation, address, sort_order)
values
  (
    'Anantanarayanan Raman',
    'Professor of Ecology',
    'CSIRO (Health & Biosecurity Division)',
    E'Underwood Avenue\nFloreat Park, Western Australia 6014,\nAustralia',
    0
  ),
  (
    'Raman Sukumar',
    'Professor and National Science Chair',
    E'Centre for Ecological Sciences\nIndian Institute of Science',
    E'TE-13, 3rd Floor, Biological Sciences Building\nBengaluru – 560012\nKarnataka, India',
    1
  ),
  (
    'HS Suresh',
    'Professor of Biology',
    'Transdisciplinary University (TDU)',
    E'74/2, Jarakabande Kaval\nAttur Post, Yelahanka\nBengaluru – 560064\nKarnataka, India',
    2
  ),
  (
    'Sudhakar Reddy',
    'Senior Scientist',
    E'Forestry & Ecology Division\nNational Remote Sensing Centre,\nIndian Space Research Organisation\nDepartment of Space, Government of India',
    'Hyderabad – 500 037, India',
    3
  ),
  (
    'Mathew Brolly',
    'Principal Lecturer',
    E'School of Applied Sciences\nCentre for Environment and Society\nUniversity of Brighton, BN2 4GJ',
    'United Kingdom',
    4
  );
