const express = require("express");
const crypto = require("crypto");

const KEY = crypto.randomBytes(32);
const IV = crypto.randomBytes(16);

const app = express();

app.listen(5000, () => console.log(`Server is listening on port 5000`));

app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  const { redirect } = req.query;
  if (!redirect || redirect?.trim().length === 0) res.render("index");
  else {
    // decrypt
    let encryptedText = Buffer.from(redirect, "hex");
    let decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(KEY), IV);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    res.status(301).redirect(decrypted.toString());
  }
});

app.post("/", (req, res) => {
  if (req.body.input?.trim().length === 0) {
    res.status(400).json({ error: "Enter url before submitting" });
  }

  let cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(KEY), IV);
  let encrypted = cipher.update(req.body.input.trim());
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  res.json({ encryptedData: encrypted.toString("hex") });
});
