import { client } from "../../utils/client";

export default function handler(req, res) {
  if (req.method === "POST") {
    const doc = req.body;

    client.create(doc).then(() => res.status(200).json("Video Created"));
  }
}
