import arcjet, { tokenBucket } from "@arcjet/next";


const aj = arcjet({
  key: String(process.env.ARCJET_KEY),
  characteristics: ["userId"],
  rules: [
    tokenBucket({ // can't req more than 10 in 1 hr
      mode: "LIVE",
      refillRate: 10,
      interval: 3600, // 3600sec -> 1hr
      capacity: 10,
    }),
  ],
});


export default aj;