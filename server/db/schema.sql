CREATE DATABASE catwalk_reviews;

--\c into catwalk_reviews

CREATE TABLE reviews (
  review_id SERIAL PRIMARY KEY,
  product_id integer,
  rating integer,
  date text,
  summary text,
  body text,
  recommend boolean,
  reported boolean,
  reviewer_name text,
  reviewer_email text,
  response text,
  helpfulness integer
);

CREATE TABLE reviews_photos (
  id SERIAL PRIMARY KEY,
  review_id integer,
  url text
);

CREATE TABLE characteristics (
  id SERIAL PRIMARY KEY,
  product_id integer,
  name text,
  unique (product_id, name)
);

CREATE TABLE characteristic_reviews (
  id SERIAL PRIMARY KEY,
  characteristic_id integer,
  review_id integer,
  value integer
);

--Imports:

COPY reviews
FROM '/Users/hunterhancock/Downloads/reviews.csv'
DELIMITER ',' CSV HEADER;

COPY reviews_photos
FROM '/Users/hunterhancock/Downloads/reviews_photos.csv'
DELIMITER ',' CSV HEADER;

COPY characteristics
FROM '/Users/hunterhancock/Downloads/characteristics.csv'
DELIMITER ',' CSV HEADER;

COPY characteristic_reviews
FROM '/Users/hunterhancock/Downloads/characteristic_reviews.csv'
DELIMITER ',' CSV HEADER;

--Reset Primary Keys:

SELECT SETVAL((SELECT PG_GET_SERIAL_SEQUENCE('"reviews"', 'review_id')), (SELECT (MAX("review_id") + 1) FROM "reviews"), FALSE);

SELECT SETVAL((SELECT PG_GET_SERIAL_SEQUENCE('"reviews_photos"', 'id')), (SELECT (MAX("id") + 1) FROM "reviews_photos"), FALSE);

SELECT SETVAL((SELECT PG_GET_SERIAL_SEQUENCE('"characteristics"', 'id')), (SELECT (MAX("id") + 1) FROM "characteristics"), FALSE);

SELECT SETVAL((SELECT PG_GET_SERIAL_SEQUENCE('"characteristic_reviews"', 'id')), (SELECT (MAX("id") + 1) FROM "characteristic_reviews"), FALSE);

--Drop all:

DROP TABLE reviews, reviews_photos, characteristics, characteristic_reviews;