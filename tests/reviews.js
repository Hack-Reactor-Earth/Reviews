import { sleep } from "k6";
import http from "k6/http";

export const options = {
  stages: [
    { duration: "12s", target: 500 },
    { duration: "12s", target: 500 },
    { duration: "12s", target: 1000 },
    { duration: "12s", target: 1000 },
    { duration: "12s", target: 0 },
  ],
  ext: {
    loadimpact: {
      distribution: {
        "amazon:us:ashburn": { loadZone: "amazon:us:ashburn", percent: 100 },
      },
    },
  },
};

export default function main() {
  http.get(
    'http://127.0.0.1:3000/reviews?product_id=17067&page=1&count=5&sort="newest"'
  );

  sleep(1);
}
