const express = require("express");
const app = express();
const db = require("./db/db.js");
// const config = require('../config.js');

app.use(express.json());

app.listen(5000, () => {
  console.log("Server is listening on port 5000");
});

//ROUTES//

app.get("/reviews", async (req, res) => {
  try {
    const { product_id, page = 1, count = 5, sort = "relevant" } = req.query;

    let result = {
      product: product_id,
      page: page - 1,
      count: count,
      results: [],
    };

    let offset = (page - 1) * count;

    // let orderBy = new Promise((resolve, reject) => {
    //   if (sort === "newest") return 'id';
    //   if (sort === "helpful") return 'helpfulness';
    //   if (sort === "relevant") return 'helpfulness';
    // })

    // await orderBy;

    const reviewsQuery = await db.query(
      "SELECT review_id, rating, summary, recommend, response, body, date, reviewer_name, helpfulness FROM reviews WHERE product_id=" +
        product_id +
        " ORDER BY review_id" +
        // orderBy +
        " DESC LIMIT " +
        count +
        " OFFSET " +
        offset
    );

    let reviewIdArr = [];
    reviewsQuery.rows.map((x, i) => {
      reviewIdArr.push(x.review_id);
      x["photos"] = [];
      result.results.push(x);
    });

    const reviewsPhotosQuery = await db.query(
      "select id, url, review_id from reviews_photos where review_id in (" +
        reviewIdArr.join(", ") +
        ")"
    );

    reviewsPhotosQuery.rows.map((x, i) => {
      result.results.map((item, index) => {
        if (item.review_id === x.review_id) {
          let newPhoto = { id: x.id, url: x.url };
          result.results[index].photos.push(newPhoto);
        }
      });
    });

    res.status(200).send(result);
  } catch (err) {
    console.error(err);
    res.send(err);
  }
});

app.get("/reviews/meta", async (req, res) => {
  try {
    const { product_id } = req.query;

    let result = {
      product_id: product_id,
      ratings: {},
      recommended: {},
      characteristics: {},
    };

    let ratingsQuery = await db.query(
      "select rating, count(*) from reviews where product_id=" +
        product_id +
        " group by rating"
    );

    let recommendedQuery = await db.query(
      "select recommend, count(*) from reviews where product_id=" +
        product_id +
        " group by recommend"
    );

    let characteristicsQuery = await db.query(
      "select id, name from characteristics where product_id=" + product_id
    );

    ratingsQuery.rows.map((x, i) => {
      result.ratings[x.rating] = x.count;
    });

    recommendedQuery.rows.map((x, i) => {
      result.recommended[i] = x.count;
    });

    let characteristicsIdArr = [];
    let characteristicsNameArr = [];
    characteristicsQuery.rows.map((x, i) => {
      characteristicsIdArr.push(x.id);
      characteristicsNameArr.push(x.name);
      result.characteristics[x.name] = { id: x.id, value: "" };
    });

    let characteristicReviewsQuery = await db.query(
      "select characteristic_id, avg(value) from characteristic_reviews where characteristic_id in (" +
        characteristicsIdArr.join(", ") +
        ") group by characteristic_id"
    );

    characteristicReviewsQuery.rows.map((x, i) => {
      result.characteristics[characteristicsNameArr[i]].value = x.avg;
    });

    res.status(200).send(result);
  } catch (err) {
    console.error(err);
    res.send(err);
  }
});

app.post("/reviews", async (req, res) => {
  try {
    const {
      product_id,
      rating,
      summary,
      body,
      recommend,
      name,
      email,
      photos,
      characteristics,
    } = req.body;

    let today = new Date();
    let date =
      today.getFullYear() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      today.getDate();
    date = date.toString();

    const newReview = await db.query(
      "INSERT INTO reviews(product_id, rating, date, summary, body, recommend, reviewer_name, reviewer_email) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING review_id",
      [product_id, rating, date, summary, body, recommend, name, email]
    );

    await photos.map((x, i) => {
      db.query("INSERT INTO reviews_photos(review_id, url) VALUES ($1, $2)", [
        newReview.rows[0].review_id,
        x,
      ]);
    });

    await Object.keys(characteristics).map((x, i) => {
      db.query(
        "INSERT INTO characteristics(product_id, name) VALUES ($1, $2) RETURNING id",
        [product_id, x]
      ).then((result) => {
        db.query(
          "INSERT INTO characteristic_reviews(characteristic_id, review_id, value) VALUES ($1, $2, $3)",
          [result.rows[0].id, newReview.rows[0].review_id, characteristics[x]]
        );
      });
    });

    res.status(201).send();
  } catch (err) {
    console.error(err);
    res.send(err);
  }
});

app.put("/reviews/:review_id/helpful", async (req, res) => {
  try {
    const { review_id } = req.params;
    let reviewsQuery = await db.query(
      "update reviews set helpfulness = helpfulness + 1 where review_id=" +
        review_id
    );
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.send(err);
  }
});

app.put("/reviews/:review_id/report", async (req, res) => {
  try {
    const { review_id } = req.params;
    let reviewsQuery = await db.query(
      "update reviews set reported = true where review_id=" + review_id
    );
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.send(err);
  }
});
